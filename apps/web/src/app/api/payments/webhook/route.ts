import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import {
  getPaymentAdapter,
  allocateTicketsAtomically,
  postTicketSaleLedgerTransaction,
  logAuditEvent,
} from "@raffle/shared";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-chapa-signature") || req.headers.get("x-signature") || "";

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const providerRef = payload.tx_ref || payload.providerReference || payload.reference;
    const status = payload.status || "SUCCESS";

    if (!providerRef) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    // 1. Verify Webhook Signature via Adapter
    const providerName = payload.provider || "CHAPA";
    const adapter = getPaymentAdapter(providerName);
    const isSignatureValid = adapter.verifyWebhookSignature(rawBody, signature);

    if (!isSignatureValid && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    // 2. Lookup Payment Attempt
    let paymentAttempt = await prisma.paymentAttempt.findFirst({
      where: { providerReference: providerRef },
      include: {
        purchaseOrder: {
          include: { raffle: true },
        },
      },
    });

    // Fallback: lookup by legacy Transaction txRef
    if (!paymentAttempt) {
      const legacyTx = await prisma.transaction.findUnique({
        where: { txRef: providerRef },
        include: { raffle: true },
      });

      if (legacyTx) {
        // Idempotency check on legacy transaction
        if (legacyTx.status === "SUCCESS") {
          return NextResponse.json({ success: true, message: "Transaction already processed (Idempotency Hit)" });
        }

        // Allocate tickets atomically
        const allocation = await allocateTicketsAtomically(prisma, {
          raffleId: legacyTx.raffleId,
          transactionId: legacyTx.id,
          customerPhone: legacyTx.customerPhone || "+251900000000",
          userId: legacyTx.userId,
          quantity: legacyTx.ticketCount,
          unitPrice: legacyTx.amount / legacyTx.ticketCount,
          purchaseMethod: "ONLINE",
        });

        // Update legacy tx status
        await prisma.transaction.update({
          where: { id: legacyTx.id },
          data: { status: "SUCCESS" },
        });

        // Post Double-Entry Ledger Journal
        const vatAmount = Number((legacyTx.amount * 0.15).toFixed(2));
        const sellerEscrow = Number((legacyTx.amount * 0.77).toFixed(2));
        const platformFee = Number((legacyTx.amount - vatAmount - sellerEscrow).toFixed(2));

        await postTicketSaleLedgerTransaction(prisma, {
          transactionId: legacyTx.id,
          orderNumber: legacyTx.txRef,
          totalAmount: legacyTx.amount,
          vatAmount,
          sellerEscrowAmount: sellerEscrow,
          agentCommissionAmount: 0,
          platformFeeAmount: platformFee,
          description: `Online ticket purchase for ${legacyTx.raffle.title} (${legacyTx.ticketCount} tickets)`,
        });

        return NextResponse.json({
          success: true,
          message: "Legacy transaction processed successfully",
          tickets: allocation.tickets,
        });
      }

      return NextResponse.json({ error: "Order not found for reference" }, { status: 404 });
    }

    // 3. Direct Server-to-Server Verification Lookup with Provider
    const directVerification = await adapter.verifyPayment(providerRef);
    if (!directVerification.success) {
      await prisma.paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: { status: "FAILED", rawWebhookPayload: rawBody },
      });
      return NextResponse.json({ error: "Direct provider verification lookup failed" }, { status: 400 });
    }

    // 4. Idempotency Guard on Payment Attempt
    if (paymentAttempt.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Payment attempt already processed (Idempotent response)",
        purchaseOrderId: paymentAttempt.purchaseOrderId,
      });
    }

    if (status.toUpperCase() !== "SUCCESS") {
      await prisma.paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: { status: "FAILED", rawWebhookPayload: rawBody },
      });
      return NextResponse.json({ success: false, message: `Payment failed with status: ${status}` });
    }

    const order = paymentAttempt.purchaseOrder;
    const raffle = order.raffle;

    // Validate Amount & Currency
    if (directVerification.amount > 0 && Math.abs(directVerification.amount - order.totalAmount) > 0.01) {
      return NextResponse.json({
        error: `Security Violation: Amount mismatch. Expected ${order.totalAmount} ETB, got ${directVerification.amount} ETB`
      }, { status: 400 });
    }

    // 5. Atomic Ticket Allocation inside DB Transaction
    const allocation = await allocateTicketsAtomically(prisma, {
      raffleId: raffle.id,
      purchaseOrderId: order.id,
      customerPhone: order.customerPhone,
      userId: order.userId,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      purchaseMethod: "ONLINE",
    });

    // 6. Update Order, Payment Attempt, and PaymentEvent to PAID & PROCESSED
    await prisma.$transaction([
      prisma.paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: { status: "SUCCESS", rawWebhookPayload: rawBody },
      }),
      prisma.purchaseOrder.update({
        where: { id: order.id },
        data: { status: "PAID" },
      }),
      prisma.paymentEvent.upsert({
        where: { providerEventId: providerRef },
        update: { status: "PROCESSED", processedAt: new Date() },
        create: {
          provider: payload.provider || "CHAPA",
          providerEventId: providerRef,
          providerRef,
          status: "PROCESSED",
          payload: rawBody,
          processedAt: new Date(),
        },
      }),
    ]);

    // 6. Post Double-Entry General Ledger Journal
    const totalAmount = order.totalAmount;
    const vatAmount = Number((totalAmount * 0.15).toFixed(2));
    const sellerEscrow = Number((totalAmount * 0.77).toFixed(2));
    const platformFee = Number((totalAmount - vatAmount - sellerEscrow).toFixed(2));

    await postTicketSaleLedgerTransaction(prisma, {
      transactionId: paymentAttempt.id,
      orderNumber: order.orderNumber,
      totalAmount,
      vatAmount,
      sellerEscrowAmount: sellerEscrow,
      agentCommissionAmount: 0,
      platformFeeAmount: platformFee,
      description: `Purchase order ${order.orderNumber} for ${raffle.title} (${order.quantity} tickets)`,
    });

    // 7. Append Immutable Audit Log
    await logAuditEvent(prisma, {
      actorType: "SYSTEM",
      action: "PAYMENT_WEBHOOK_PROCESSED",
      entityType: "PURCHASE_ORDER",
      entityId: order.id,
      afterState: {
        orderNumber: order.orderNumber,
        allocatedTicketsCount: allocation.tickets.length,
        totalAmount,
      },
    });

    // 8. Create Customer Notification
    await prisma.notification.create({
      data: {
        userId: order.userId || null,
        customerPhone: order.customerPhone,
        raffleId: raffle.id,
        title: "Tickets Issued Successfully!",
        titleAm: "የዕጣ ቲኬቶችዎ በተሳካ ሁኔታ ተሰጥተዋል!",
        message: `Your payment of ${totalAmount} ETB was confirmed. ${allocation.tickets.length} tickets minted for ${raffle.title}.`,
        messageAm: `የ ${totalAmount} ብር ክፍያዎ ተረጋግጧል። ለ ${raffle.titleAm || raffle.title} ${allocation.tickets.length} ቲኬቶች ተሰጥተዋል።`,
        type: "TICKET_MINTED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment processed, tickets minted atomically, and double-entry ledger posted.",
      orderNumber: order.orderNumber,
      tickets: allocation.tickets,
    });
  } catch (error: any) {
    console.error("Webhook processing failure:", error);
    return NextResponse.json({ error: error.message || "Failed to process webhook" }, { status: 500 });
  }
}
