import * as crypto from "crypto";
import { prisma } from "@raffle/database";
import { executeAtomicTicketPurchase, reserveTicketsForOneHour } from "./concurrency";

export interface InitPaymentParams {
  raffleId: string;
  userId?: string | null;
  customerPhone: string;
  ticketCount: number;
  specificNumbers?: number[];
  paymentMethod: "CHAPA" | "SANTIMPAY" | "TELEBIRR" | "CBE_BIRR" | "AGENT_CASH";
  soldByAgentId?: string | null;
}

export interface InitPaymentResult {
  txRef: string;
  amount: number;
  raffleTitle: string;
  checkoutUrl: string;
  paymentMethod: string;
  expiresAt: Date;
  reservedNumbers?: number[];
}

/**
 * Initiates payment session with 1-hour ticket reservation hold
 */
export async function initiatePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
  const raffle = await prisma.raffle.findUnique({
    where: { id: params.raffleId },
  });

  if (!raffle) throw new Error("Raffle not found");
  if (raffle.status !== "ACTIVE") throw new Error("Raffle is not currently active");

  // 1. Place a 1-hour reservation on the requested ticket numbers
  const reservation = await reserveTicketsForOneHour({
    raffleId: params.raffleId,
    userId: params.userId,
    customerPhone: params.customerPhone,
    ticketCount: params.ticketCount,
    specificNumbers: params.specificNumbers,
    holdMinutes: 60, // 1 hour hold window
  });

  if (!reservation.success) {
    throw new Error(reservation.message || "Failed to reserve ticket numbers.");
  }

  const amount = raffle.ticketPrice * params.ticketCount;
  const txRef = "TX-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  const expiresAt = reservation.expiresAt || new Date(Date.now() + 60 * 60 * 1000);

  // 2. Create PENDING transaction with expiresAt timestamp
  await prisma.transaction.create({
    data: {
      userId: params.userId || undefined,
      raffleId: params.raffleId,
      customerPhone: params.customerPhone,
      txRef,
      amount,
      ticketCount: params.ticketCount,
      paymentMethod: params.paymentMethod,
      status: "PENDING",
      expiresAt,
      rawPayload: JSON.stringify({
        specificNumbers: reservation.reservedNumbers || params.specificNumbers,
        soldByAgentId: params.soldByAgentId,
      }),
    },
  });

  return {
    txRef,
    amount,
    raffleTitle: raffle.title,
    checkoutUrl: `/checkout?tx_ref=${txRef}`,
    paymentMethod: params.paymentMethod,
    expiresAt,
    reservedNumbers: reservation.reservedNumbers,
  };
}

/**
 * Validates HMAC SHA256 webhook signature from Chapa / SantimPay
 */
export function verifyWebhookSignature(payload: string, signature: string, secretKey: string): boolean {
  if (!signature) return false;
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("hex");
  return computedHash === signature;
}

/**
 * Process a successful payment (idempotent), confirm reserved tickets
 */
export async function processPaymentSuccess(txRef: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { txRef },
  });

  if (!transaction) throw new Error("Transaction not found");

  // Idempotency check: if already processed, return existing tickets
  if (transaction.status === "SUCCESS") {
    const existingTickets = await prisma.ticket.findMany({
      where: { transactionId: transaction.id, status: "CONFIRMED" },
    });
    return {
      success: true,
      alreadyProcessed: true,
      tickets: existingTickets,
      transaction,
    };
  }

  // 1-Hour Expiry Validation
  if (transaction.expiresAt && transaction.expiresAt < new Date()) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "EXPIRED" },
    });
    throw new Error(
      "Payment session has expired (1-hour limit exceeded). Ticket reservations were released."
    );
  }

  let specificNumbers: number[] | undefined = undefined;
  let soldByAgentId: string | undefined = undefined;

  if (transaction.rawPayload) {
    try {
      const parsed = JSON.parse(transaction.rawPayload);
      specificNumbers = parsed.specificNumbers;
      soldByAgentId = parsed.soldByAgentId;
    } catch (e) {
      console.warn("Could not parse transaction rawPayload", e);
    }
  }

  const result = await executeAtomicTicketPurchase({
    raffleId: transaction.raffleId,
    userId: transaction.userId,
    customerPhone: transaction.customerPhone,
    ticketCount: transaction.ticketCount,
    specificNumbers,
    paymentMethod: transaction.paymentMethod as any,
    soldByAgentId,
    purchaseMethod: soldByAgentId ? "AGENT_CASH" : "ONLINE",
    transactionId: transaction.id,
  });

  if (!result.success) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED" },
    });
    throw new Error(result.message);
  }

  const updatedTx = await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: "SUCCESS" },
  });

  return {
    success: true,
    alreadyProcessed: false,
    tickets: result.tickets,
    transaction: updatedTx,
  };
}
