import * as crypto from "crypto";

export interface AllocateTicketsInput {
  raffleId: string;
  purchaseOrderId?: string;
  transactionId?: string;
  customerPhone: string;
  userId?: string | null;
  quantity: number;
  unitPrice: number;
  purchaseMethod: "ONLINE" | "AGENT_CASH" | "USSD";
  soldByAgentId?: string | null;
}

export interface AllocatedTicketResult {
  ticketId: string;
  ticketNumber: number;
  verificationCode: string;
  qrVerificationUrl: string;
  vatDeductedAmount: number;
  netEscrowAmount: number;
}

export async function allocateTicketsAtomically(
  prisma: any,
  input: AllocateTicketsInput
): Promise<{ success: boolean; tickets: AllocatedTicketResult[]; updatedSoldTickets: number }> {
  const { raffleId, purchaseOrderId, transactionId, customerPhone, userId, quantity, unitPrice, purchaseMethod, soldByAgentId } = input;

  return await prisma.$transaction(async (tx: any) => {
    // 1. Fetch current raffle state with concurrency check
    const raffle = await tx.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      throw new Error("Raffle not found");
    }

    if (raffle.status !== "OPEN" && raffle.status !== "ACTIVE") {
      throw new Error(`Raffle is not open for ticket sales (Current status: ${raffle.status})`);
    }

    if (raffle.soldTickets + quantity > raffle.totalTickets) {
      throw new Error(`Insufficient inventory: Only ${raffle.totalTickets - raffle.soldTickets} tickets remaining, requested ${quantity}`);
    }

    const currentSold = raffle.soldTickets;
    const allocatedTickets: AllocatedTicketResult[] = [];
    const ticketCreateData = [];

    // Calculate statutory splits (15% Ethiopian VAT, 85% Net Escrow)
    const vatPerTicket = Number((unitPrice * 0.15).toFixed(2));
    const escrowPerTicket = Number((unitPrice - vatPerTicket).toFixed(2));

    for (let i = 1; i <= quantity; i++) {
      const ticketNumber = currentSold + i;
      const verificationCode = "TKT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
      const qrVerificationUrl = `/verifier?ref=${verificationCode}&raffle=${raffleId}&num=${ticketNumber}`;

      allocatedTickets.push({
        ticketId: "", // Will be assigned on insert
        ticketNumber,
        verificationCode,
        qrVerificationUrl,
        vatDeductedAmount: vatPerTicket,
        netEscrowAmount: escrowPerTicket,
      });

      ticketCreateData.push({
        raffleId,
        purchaseOrderId: purchaseOrderId || null,
        transactionId: transactionId || null,
        customerPhone,
        userId: userId || null,
        ticketNumber,
        soldByAgentId: soldByAgentId || null,
        purchaseMethod,
        verificationCode,
        qrVerificationUrl,
        vatDeductedAmount: vatPerTicket,
        netEscrowAmount: escrowPerTicket,
        status: "ACTIVE",
      });
    }

    // 2. Batch create tickets with unique constraint enforcement
    for (const t of ticketCreateData) {
      const created = await tx.ticket.create({
        data: t,
      });
      const match = allocatedTickets.find((at) => at.ticketNumber === t.ticketNumber);
      if (match) match.ticketId = created.id;
    }

    const newSoldTickets = currentSold + quantity;

    // 3. Update raffle sold count and check if 100% capacity reached
    const isSoldOut = newSoldTickets >= raffle.totalTickets;
    await tx.raffle.update({
      where: { id: raffleId },
      data: {
        soldTickets: newSoldTickets,
        status: isSoldOut ? "SALES_CLOSED" : raffle.status,
      },
    });

    return {
      success: true,
      tickets: allocatedTickets,
      updatedSoldTickets: newSoldTickets,
    };
  });
}

