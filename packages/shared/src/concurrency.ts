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

function generateVerificationCode(): string {
  return "TKT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

// In-memory sequential queue per raffle to prevent lock starvation
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
 * Executes an atomic, concurrency-safe ticket purchase and minting inside a database transaction.
 * Guarantees zero duplicate tickets, zero overselling, and updates agent wallet/ledger if applicable.
 */
export async function executeAtomicTicketPurchase(
  input: TicketPurchaseInput
): Promise<PurchaseResult> {
  const { raffleId } = input;
  const queue = getRaffleQueue(raffleId);

  return queue.run(async () => {
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
  } = input;

  if (ticketCount <= 0) {
    return { success: false, message: "Ticket count must be at least 1." };
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Fetch & validate Raffle
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
        });

        if (!raffle) {
          throw new Error("Raffle not found.");
        }

        if (raffle.status !== "ACTIVE") {
          throw new Error(`Raffle is not active (Current status: ${raffle.status}).`);
        }

        const availableTickets = raffle.totalTickets - raffle.soldTickets;
        if (ticketCount > availableTickets) {
          throw new Error(
            `Not enough tickets available. Only ${availableTickets} remaining.`
          );
        }

        const totalCost = raffle.ticketPrice * ticketCount;

        // 2. If sold by Agent, validate agent state and float balance
        let agent = null;
        if (soldByAgentId) {
          agent = await tx.agent.findUnique({
            where: { id: soldByAgentId },
          });

          if (!agent) {
            throw new Error("Agent account not found.");
          }

          if (agent.status !== "ACTIVE") {
            throw new Error(`Agent is not active. Status: ${agent.status}`);
          }

          // Float validation for prepaid agents
          if (agent.walletMode === "PREPAID") {
            if (agent.floatBalance < totalCost) {
              throw new Error(
                `Insufficient agent float balance. Required: ${totalCost} ETB, Current Balance: ${agent.floatBalance} ETB.`
              );
            }
          }
        }

        // 3. Determine Ticket Numbers to Mint
        let assignedNumbers: number[] = [];

        const existingTickets = await tx.ticket.findMany({
          where: { raffleId },
          select: { ticketNumber: true },
        });
        const takenSet = new Set(existingTickets.map((t) => t.ticketNumber));

        if (specificNumbers && specificNumbers.length > 0) {
          if (specificNumbers.length !== ticketCount) {
            throw new Error("Specified numbers count does not match ticket count.");
          }

          for (const num of specificNumbers) {
            if (num < 1 || num > raffle.totalTickets) {
              throw new Error(`Ticket number #${num} is out of bounds (1 to ${raffle.totalTickets}).`);
            }
            if (takenSet.has(num)) {
              throw new Error(`Ticket #${num} is already sold. Please select another number.`);
            }
            takenSet.add(num);
            assignedNumbers.push(num);
          }
        } else {
          // Quick Pick: find vacant ticket numbers
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

        // 4. Create Transaction Record
        const txRef = "TX-" + crypto.randomBytes(6).toString("hex").toUpperCase();
        const transaction = await tx.transaction.create({
          data: {
            userId: userId || undefined,
            raffleId,
            customerPhone: customerPhone || undefined,
            txRef,
            amount: totalCost,
            ticketCount,
            paymentMethod,
            status: "SUCCESS",
          },
        });

        // 5. Mint Tickets
        const createdTickets = [];
        for (const num of assignedNumbers) {
          const ticket = await tx.ticket.create({
            data: {
              raffleId,
              userId: userId || undefined,
              customerPhone: customerPhone || undefined,
              ticketNumber: num,
              transactionId: transaction.id,
              soldByAgentId: soldByAgentId || undefined,
              purchaseMethod,
              verificationCode: generateVerificationCode(),
              status: "CONFIRMED",
            },
          });
          createdTickets.push({
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            verificationCode: ticket.verificationCode,
          });
        }

        // 6. Update Raffle sold count
        const updatedSoldTickets = raffle.soldTickets + ticketCount;
        await tx.raffle.update({
          where: { id: raffleId },
          data: {
            soldTickets: updatedSoldTickets,
            status: updatedSoldTickets >= raffle.totalTickets ? "CLOSED" : raffle.status,
          },
        });

        // 7. If Agent sale, deduct float & record commission
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
              referenceId: transaction.txRef,
              note: `Sold ${ticketCount} ticket(s) for ${raffle.title}`,
            },
          });

          await tx.agentLedger.create({
            data: {
              agentId: agent.id,
              entryType: "COMMISSION_ACCRUED",
              amount: commissionAmount,
              balanceAfter: newFloatBalance,
              referenceId: transaction.txRef,
              note: `Accrued ${agent.commissionRate}% commission on sale (${commissionAmount} ETB)`,
            },
          });
        }

        return {
          success: true,
          message: `Successfully minted ${ticketCount} ticket(s)!`,
          tickets: createdTickets,
          transaction,
        };
      },
      {
        timeout: 15000,
        maxWait: 10000,
      }
    );

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to process ticket allocation.",
    };
  }
}

