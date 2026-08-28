import { prisma } from "@raffle/database";
import * as crypto from "crypto";

export interface TicketPurchaseInput {
  raffleId: string;
  userId?: string | null;
  customerPhone?: string | null;
  ticketCount: number;
  specificNumbers?: number[];
  paymentMethod: "CHAPA" | "SANTIMPAY" | "TELEBIRR" | "CBE_BIRR" | "AGENT_CASH";
  soldByAgentId?: string | null;
  purchaseMethod?: "ONLINE" | "AGENT_CASH" | "USSD";
  transactionId?: string | null;
}

export interface TicketReserveInput {
  raffleId: string;
  userId?: string | null;
  customerPhone: string;
  ticketCount: number;
  specificNumbers?: number[];
  holdMinutes?: number; // Defaults to 60 minutes
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  tickets?: Array<{
    id: string;
    ticketNumber: number;
    verificationCode: string;
  }>;
  transaction?: any;
}

export interface ReserveResult {
  success: boolean;
  message: string;
  expiresAt?: Date;
  reservedNumbers?: number[];
  tickets?: Array<{
    id: string;
    ticketNumber: number;
  }>;
}

function generateVerificationCode(): string {
  return "TKT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

// In-memory sequential queue per raffle to prevent race conditions
class ConcurrencyQueue {
  private queue: Promise<any> = Promise.resolve();

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.queue.then(fn, fn);
    this.queue = result.then(() => {}, () => {});
    return result;
  }
}

const raffleQueues = new Map<string, ConcurrencyQueue>();

function getRaffleQueue(raffleId: string): ConcurrencyQueue {
  if (!raffleQueues.has(raffleId)) {
    raffleQueues.set(raffleId, new ConcurrencyQueue());
  }
  return raffleQueues.get(raffleId)!;
}

/**
 * Automatically cleans up expired reservations across a raffle or the whole database.
 * If reservedUntil < now and status === 'RESERVED', tickets are purged and returned to the pool.
 */
export async function cleanupExpiredReservations(raffleId?: string): Promise<number> {
  const now = new Date();
  const where: any = {
    status: "RESERVED",
    reservedUntil: { lt: now },
  };
  if (raffleId) {
    where.raffleId = raffleId;
  }

  const deleted = await prisma.ticket.deleteMany({
    where,
  });

  return deleted.count;
}

/**
 * Atomically reserves tickets for 1 hour (60 minutes).
 * No verification code is issued until payment is completed!
 */
export async function reserveTicketsForOneHour(
  input: TicketReserveInput
): Promise<ReserveResult> {
  const { raffleId } = input;
  const queue = getRaffleQueue(raffleId);

  return queue.run(async () => {
    // 1. First cleanup expired reservations
    await cleanupExpiredReservations(raffleId);

    const {
      userId,
      customerPhone,
      ticketCount,
      specificNumbers,
      holdMinutes = 60,
    } = input;

    if (ticketCount <= 0) {
      return { success: false, message: "Ticket count must be at least 1." };
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
        });

        if (!raffle) throw new Error("Raffle not found.");
        if (raffle.status !== "ACTIVE") throw new Error("Raffle is not active.");

        // Fetch active tickets (CONFIRMED or non-expired RESERVED)
        const now = new Date();
        const activeTickets = await tx.ticket.findMany({
          where: {
            raffleId,
            OR: [
              { status: "CONFIRMED" },
              {
                status: "RESERVED",
                reservedUntil: { gt: now },
              },
            ],
          },
          select: { ticketNumber: true, status: true, customerPhone: true },
        });

        const takenSet = new Set(activeTickets.map((t) => t.ticketNumber));
        const availableTicketsCount = raffle.totalTickets - activeTickets.length;

        if (ticketCount > availableTicketsCount) {
          throw new Error(
            `Not enough tickets available. Only ${availableTicketsCount} remaining.`
          );
        }

        let assignedNumbers: number[] = [];

        if (specificNumbers && specificNumbers.length > 0) {
          if (specificNumbers.length !== ticketCount) {
            throw new Error("Specified numbers count does not match ticket count.");
          }

          for (const num of specificNumbers) {
            if (num < 1 || num > raffle.totalTickets) {
              throw new Error(`Ticket #${num} is out of bounds (1 to ${raffle.totalTickets}).`);
            }
            if (takenSet.has(num)) {
              throw new Error(`Ticket #${num} is already booked or sold. Please select another number.`);
            }
            takenSet.add(num);
            assignedNumbers.push(num);
          }
        } else {
          // Quick Pick
          let candidate = 1;
          while (assignedNumbers.length < ticketCount && candidate <= raffle.totalTickets) {
            if (!takenSet.has(candidate)) {
              assignedNumbers.push(candidate);
              takenSet.add(candidate);
            }
            candidate++;
          }

          if (assignedNumbers.length < ticketCount) {
            throw new Error("Could not find enough vacant ticket numbers.");
          }
        }

        const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);
        const createdReservations = [];

        for (const num of assignedNumbers) {
          // Temporary 1-hour reservation: verificationCode is NULL until payment is completed!
          const tkt = await tx.ticket.create({
            data: {
              raffleId,
              userId: userId || undefined,
              customerPhone,
              ticketNumber: num,
              status: "RESERVED",
              reservedUntil: expiresAt,
              reservedByPhone: customerPhone,
              verificationCode: null, // Issued only upon payment confirmation!
            },
          });
          createdReservations.push({
            id: tkt.id,
            ticketNumber: tkt.ticketNumber,
          });
        }

        return {
          success: true,
          message: `Reserved ${ticketCount} ticket(s) for 1 hour. Verification code will be issued upon payment completion.`,
          expiresAt,
          reservedNumbers: assignedNumbers,
          tickets: createdReservations,
        };
      });

      return result;
    } catch (error: any) {
      return { success: false, message: error.message || "Reservation failed." };
    }
  });
}

/**
 * Executes an atomic, concurrency-safe ticket purchase and minting inside a database transaction.
 * Issues official unique Verification Code upon confirming payment.
 */
export async function executeAtomicTicketPurchase(
  input: TicketPurchaseInput
): Promise<PurchaseResult> {
  const { raffleId } = input;
  const queue = getRaffleQueue(raffleId);

  return queue.run(async () => {
    // 1. Cleanup expired holds first
    await cleanupExpiredReservations(raffleId);
    return internalAtomicPurchase(input);
  });
}

async function internalAtomicPurchase(
  input: TicketPurchaseInput
): Promise<PurchaseResult> {
  const {
    raffleId,
    userId,
    customerPhone,
    ticketCount,
    specificNumbers,
    paymentMethod,
    soldByAgentId,
    purchaseMethod = "ONLINE",
    transactionId,
  } = input;

  if (ticketCount <= 0) {
    return { success: false, message: "Ticket count must be at least 1." };
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
        });

        if (!raffle) throw new Error("Raffle not found.");
        if (raffle.status !== "ACTIVE") {
          throw new Error(`Raffle is not active (Status: ${raffle.status}).`);
        }

        const totalCost = raffle.ticketPrice * ticketCount;

        // If Agent sale, validate float
        let agent = null;
        if (soldByAgentId) {
          agent = await tx.agent.findUnique({ where: { id: soldByAgentId } });
          if (!agent) throw new Error("Agent account not found.");
          if (agent.status !== "ACTIVE") throw new Error("Agent is not active.");
          if (agent.walletMode === "PREPAID" && agent.floatBalance < totalCost) {
            throw new Error(`Insufficient agent float. Required: ${totalCost} ETB, Balance: ${agent.floatBalance} ETB.`);
          }
        }

        // Check if there are already RESERVED tickets by this customer/transaction
        const now = new Date();
        const existingReserved = await tx.ticket.findMany({
          where: {
            raffleId,
            status: "RESERVED",
            customerPhone: customerPhone || undefined,
            reservedUntil: { gt: now },
            ...(specificNumbers && specificNumbers.length > 0
              ? { ticketNumber: { in: specificNumbers } }
              : {}),
          },
        });

        let assignedNumbers: number[] = [];
        let createdTickets: Array<{ id: string; ticketNumber: number; verificationCode: string }> = [];

        if (existingReserved.length === ticketCount) {
          // Payment Complete: Upgrade existing reservations to CONFIRMED and issue official verification codes!
          for (const tkt of existingReserved) {
            const officialVerificationCode = generateVerificationCode();
            const updated = await tx.ticket.update({
              where: { id: tkt.id },
              data: {
                status: "CONFIRMED",
                verificationCode: officialVerificationCode, // Minted official code!
                reservedUntil: null,
                reservedByPhone: null,
                transactionId: transactionId || undefined,
                soldByAgentId: soldByAgentId || undefined,
                purchaseMethod,
                userId: userId || tkt.userId || undefined,
              },
            });
            createdTickets.push({
              id: updated.id,
              ticketNumber: updated.ticketNumber,
              verificationCode: officialVerificationCode,
            });
            assignedNumbers.push(updated.ticketNumber);
          }
        } else {
          // Direct purchase without prior reservation (e.g. Agent POS cash sale)
          const allActive = await tx.ticket.findMany({
            where: {
              raffleId,
              OR: [
                { status: "CONFIRMED" },
                { status: "RESERVED", reservedUntil: { gt: now } },
              ],
            },
            select: { ticketNumber: true },
          });

          const takenSet = new Set(allActive.map((t) => t.ticketNumber));

          if (specificNumbers && specificNumbers.length > 0) {
            for (const num of specificNumbers) {
              if (num < 1 || num > raffle.totalTickets) {
                throw new Error(`Ticket #${num} is out of bounds.`);
              }
              if (takenSet.has(num)) {
                throw new Error(`Ticket #${num} is already sold or booked.`);
              }
              takenSet.add(num);
              assignedNumbers.push(num);
            }
          } else {
            let candidate = 1;
            while (assignedNumbers.length < ticketCount && candidate <= raffle.totalTickets) {
              if (!takenSet.has(candidate)) {
                assignedNumbers.push(candidate);
                takenSet.add(candidate);
              }
              candidate++;
            }
            if (assignedNumbers.length < ticketCount) {
              throw new Error("Not enough tickets available.");
            }
          }

          // Mint confirmed tickets with official verification codes
          for (const num of assignedNumbers) {
            const officialCode = generateVerificationCode();
            const ticket = await tx.ticket.create({
              data: {
                raffleId,
                userId: userId || undefined,
                customerPhone: customerPhone || undefined,
                ticketNumber: num,
                transactionId: transactionId || undefined,
                soldByAgentId: soldByAgentId || undefined,
                purchaseMethod,
                verificationCode: officialCode,
                status: "CONFIRMED",
              },
            });
            createdTickets.push({
              id: ticket.id,
              ticketNumber: ticket.ticketNumber,
              verificationCode: officialCode,
            });
          }
        }

        // Update Raffle sold count
        const confirmedTicketsCount = await tx.ticket.count({
          where: { raffleId, status: "CONFIRMED" },
        });

        await tx.raffle.update({
          where: { id: raffleId },
          data: {
            soldTickets: confirmedTicketsCount,
            status: confirmedTicketsCount >= raffle.totalTickets ? "CLOSED" : raffle.status,
          },
        });

        // If Agent sale, deduct float & record commission
        if (agent && soldByAgentId) {
          const commissionAmount = (totalCost * agent.commissionRate) / 100;
          const newFloatBalance = agent.floatBalance - totalCost;

          await tx.agent.update({
            where: { id: agent.id },
            data: { floatBalance: newFloatBalance },
          });

          await tx.agentLedger.create({
            data: {
              agentId: agent.id,
              entryType: "SALE_DEDUCTION",
              amount: -totalCost,
              balanceAfter: newFloatBalance,
              referenceId: transactionId || undefined,
              note: `Sold ${ticketCount} ticket(s) for ${raffle.title}`,
            },
          });

          await tx.agentLedger.create({
            data: {
              agentId: agent.id,
              entryType: "COMMISSION_ACCRUED",
              amount: commissionAmount,
              balanceAfter: newFloatBalance,
              referenceId: transactionId || undefined,
              note: `Accrued ${agent.commissionRate}% commission on sale (${commissionAmount} ETB)`,
            },
          });
        }

        return {
          success: true,
          message: `Payment verified! Successfully confirmed and minted ${ticketCount} official ticket(s).`,
          tickets: createdTickets,
        };
      },
      { timeout: 15000, maxWait: 10000 }
    );

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to process ticket allocation.",
    };
  }
}
