import { NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { getPaymentAdapter, evaluateTransactionRisk, logAuditEvent } from "@raffle/shared";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { raffleId, customerPhone, quantity, paymentMethod } = body;

    if (!raffleId || !customerPhone || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid order request. raffleId, customerPhone, and positive quantity are required." },
        { status: 400 }
      );
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    if (raffle.status !== "OPEN" && raffle.status !== "ACTIVE") {
      return NextResponse.json({ error: `Raffle is not open for ticket sales (Status: ${raffle.status})` }, { status: 400 });
    }

    if (raffle.soldTickets + quantity > raffle.totalTickets) {
      return NextResponse.json(
        { error: `Only ${raffle.totalTickets - raffle.soldTickets} tickets remaining.` },
        { status: 400 }
      );
    }

    const totalAmount = Number((raffle.ticketPrice * quantity).toFixed(2));
    const orderNumber = `PUR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10000 + Math.random() * 90000)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute reservation

    // 1. Evaluate Transaction Risk
    const risk = await evaluateTransactionRisk(prisma, {
      customerPhone,
      amount: totalAmount,
      quantity,
      paymentMethod: paymentMethod || "CHAPA",
    });

    if (risk.level === "BLOCK") {
      await prisma.riskEvent.create({
        data: {
          customerPhone,
          riskScore: risk.score,
          riskLevel: risk.level,
          reasonCode: risk.reasonCodes.join(", "),
          details: JSON.stringify({ amount: totalAmount, quantity, blocked: true }),
        },
      });
      return NextResponse.json(
        { error: "Transaction flagged by risk engine. Please contact support." },
        { status: 403 }
      );
    }

    // 2. Create Decoupled Purchase Order
    const order = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        customerPhone,
        raffleId,
        quantity,
        unitPrice: raffle.ticketPrice,
        totalAmount,
        status: "PENDING",
        expiresAt,
      },
    });

    // 3. Initialize Payment via Adapter
    const adapter = getPaymentAdapter(paymentMethod || "CHAPA");
    const paymentInit = await adapter.initializePayment({
      orderNumber,
      amount: totalAmount,
      currency: "ETB",
      customerPhone,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?order=${orderNumber}`,
    });

    // 4. Create Payment Attempt Record with Idempotency Key
    const idempotencyKey = `idemp_${orderNumber}_${Date.now()}`;
    const paymentAttempt = await prisma.paymentAttempt.create({
      data: {
        purchaseOrderId: order.id,
        provider: adapter.providerName,
        providerReference: paymentInit.providerReference,
        amount: totalAmount,
        status: "PENDING",
        idempotencyKey,
      },
    });

    // 5. Append Audit Log
    await logAuditEvent(prisma, {
      actorType: "BUYER",
      action: "PURCHASE_ORDER_CREATED",
      entityType: "PURCHASE_ORDER",
      entityId: order.id,
      afterState: { orderNumber, totalAmount, quantity, provider: adapter.providerName },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        quantity: order.quantity,
        expiresAt: order.expiresAt,
      },
      payment: {
        attemptId: paymentAttempt.id,
        provider: adapter.providerName,
        providerReference: paymentInit.providerReference,
        checkoutUrl: paymentInit.checkoutUrl,
      },
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

