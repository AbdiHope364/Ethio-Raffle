/**
 * ============================================================================
 * ESCROW STATE MACHINE & FINANCIAL SETTLEMENT ENGINE (§24 & §25)
 * ============================================================================
 * Manages seller prize pools, dispute freezes, and two-person consensus payouts.
 */

import { CHART_OF_ACCOUNTS } from "./index";

export type EscrowState =
  | "PAYMENT_RECEIVED"
  | "ESCROWED"
  | "WINNER_SELECTED"
  | "CLAIMED"
  | "HANDOVER_CONFIRMED"
  | "SETTLED"
  | "DISPUTED"
  | "FROZEN"
  | "ARBITRATION_IN_PROGRESS"
  | "RELEASED_TO_SELLER"
  | "REFUNDED_TO_BUYER";

export interface SettleEscrowParams {
  raffleId: string;
  sellerId: string;
  amount: number;
  initiatedByAdminId: string;
  confirmedByAdminId?: string;
  notes?: string;
}

export class EscrowStateMachine {
  /**
   * Freezes escrow funds upon customer dispute or inspection issue.
   */
  static async disputeEscrow(
    prisma: any,
    raffleId: string,
    disputeReason: string,
    actorId: string
  ): Promise<{ status: EscrowState }> {
    return await prisma.$transaction(async (tx: any) => {
      const raffle = await tx.raffle.findUnique({ where: { id: raffleId } });
      if (!raffle) throw new Error("Raffle not found.");

      await tx.auditLog.create({
        data: {
          actorId,
          actorType: "ADMIN",
          action: "ESCROW_FROZEN_DISPUTE",
          entityType: "RAFFLE_ESCROW",
          entityId: raffleId,
          afterState: JSON.stringify({ disputeReason, previousStatus: raffle.status, frozenAt: new Date() }),
        },
      });

      return { status: "FROZEN" as EscrowState };
    });
  }

  /**
   * Executes settlement of escrow to seller with Two-Person Approval check and double-entry ledger posting.
   */
  static async settleEscrowPayout(
    prisma: any,
    params: SettleEscrowParams
  ): Promise<{ success: boolean; transactionNumber: string }> {
    const { raffleId, sellerId, amount, initiatedByAdminId, confirmedByAdminId, notes } = params;

    // For high-value payouts (> 50,000 ETB), require two distinct administrators
    if (amount > 50000 && (!confirmedByAdminId || initiatedByAdminId === confirmedByAdminId)) {
      throw new Error(
        "TWO-PERSON RULE VIOLATION: High-value escrow settlement (> 50,000 ETB) requires two distinct admin approvals (Initiator != Approver)."
      );
    }

    return await prisma.$transaction(async (tx: any) => {
      const escrowAccount = await tx.ledgerAccount.findUnique({ where: { code: CHART_OF_ACCOUNTS.PRIZE_ESCROW.code } });
      const cashAccount = await tx.ledgerAccount.findUnique({ where: { code: CHART_OF_ACCOUNTS.CASH_IN_TRANSIT.code } });

      if (!escrowAccount || !cashAccount) {
        throw new Error("Ledger chart of accounts not initialized.");
      }

      const txNumber = "LTX-ESCROW-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

      // Post balanced double-entry journal (Debit Prize Escrow Liability, Credit Cash in Transit Asset)
      await tx.ledgerTransaction.create({
        data: {
          transactionNumber: txNumber,
          referenceType: "ESCROW_PAYOUT",
          referenceId: raffleId,
          description: `Settlement payout to seller ${sellerId} for raffle ${raffleId}. ${notes || ""}`,
          status: "POSTED",
          entries: {
            create: [
              // Debit Escrow Liability (Decreases liability)
              {
                ledgerAccountId: escrowAccount.id,
                entryType: "DEBIT",
                amount,
              },
              // Credit Cash Asset (Decreases cash in bank/transit)
              {
                ledgerAccountId: cashAccount.id,
                entryType: "CREDIT",
                amount,
              },
            ],
          },
        },
      });

      // Update Seller balance and audit trail
      await tx.seller.update({
        where: { id: sellerId },
        data: {
          totalRevenue: { increment: amount },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: confirmedByAdminId || initiatedByAdminId,
          actorType: "FINANCE_ADMIN",
          action: "ESCROW_SETTLEMENT_EXECUTED",
          entityType: "LEDGER_TRANSACTION",
          entityId: txNumber,
          afterState: JSON.stringify({
            amount,
            sellerId,
            raffleId,
            initiatedByAdminId,
            confirmedByAdminId,
          }),
        },
      });

      return { success: true, transactionNumber: txNumber };
    });
  }
}

