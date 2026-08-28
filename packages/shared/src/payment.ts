import * as crypto from "crypto";
import { prisma } from "@raffle/database";
import { executeAtomicTicketPurchase } from "./concurrency";

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
}

/**
 * Initiates payment session with transaction reference
 */
export async function initiatePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
  const raffle = await prisma.raffle.findUnique({
    where: { id: params.raffleId },
  });

  if (!raffle) throw new Error("Raffle not found");
  if (raffle.status !== "ACTIVE") throw new Error("Raffle is not currently active");

  const amount = raffle.ticketPrice * params.ticketCount;
  const txRef = "TX-" + crypto.randomBytes(6).toString("hex").toUpperCase();

  // Create PENDING transaction
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
      rawPayload: JSON.stringify({
        specificNumbers: params.specificNumbers,
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
 * Process a successful payment (idempotent) and mint the tickets
 */
export async function processPaymentSuccess(txRef: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { txRef },
  });

  if (!transaction) throw new Error("Transaction not found");

  // Idempotency check: if already processed, return existing tickets
  if (transaction.status === "SUCCESS") {
    const existingTickets = await prisma.ticket.findMany({
      where: { transactionId: transaction.id },
    });
    return {
      success: true,
      alreadyProcessed: true,
      tickets: existingTickets,
      transaction,
    };
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

  return {
    success: true,
    alreadyProcessed: false,
    tickets: result.tickets,
    transaction: result.transaction,
  };
}

