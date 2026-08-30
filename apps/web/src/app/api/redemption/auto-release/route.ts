import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Evaluates pending item redemptions that have crossed the 7-Day grace period without a dispute.
 * Automatically marks them as AUTO_APPROVED and unfreezes escrow to the seller.
 */
export async function POST(req: NextRequest) {
  try {
    const now = new Date();

    const expiredRedemptions = await prisma.redemption.findMany({
      where: {
        deliveryStatus: "QR_GENERATED",
        autoReleaseDeadline: { lte: now },
      },
      include: {
        raffle: {
          include: { seller: true },
        },
      },
    });

    const settled = [];

    for (const r of expiredRedemptions) {
      // Mark as AUTO_APPROVED
      const updated = await prisma.redemption.update({
        where: { id: r.id },
        data: {
          deliveryStatus: "AUTO_APPROVED",
        },
      });

      // Unfreeze escrow to seller
      if (r.raffle.seller) {
        const totalGrossPool = r.raffle.ticketPrice * r.raffle.soldTickets;
        const vatDeduction = totalGrossPool * 0.15;
        const netPool = totalGrossPool - vatDeduction;
        const platformFee = (netPool * r.raffle.seller.commissionRate) / 100;
        const sellerNetProceeds = netPool - platformFee;

        await prisma.seller.update({
          where: { id: r.raffle.seller.id },
          data: {
            escrowBalance: { decrement: Math.min(r.raffle.seller.escrowBalance, netPool) },
            payoutBalance: { increment: sellerNetProceeds },
          },
        });
      }

      settled.push(updated.id);
    }

    return NextResponse.json({
      success: true,
      processedCount: settled.length,
      settledRedemptionIds: settled,
      message: `Processed ${settled.length} auto-settlement(s) via 7-day fallback rule.`,
    });
  } catch (error: any) {
    console.error("Auto-release error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

