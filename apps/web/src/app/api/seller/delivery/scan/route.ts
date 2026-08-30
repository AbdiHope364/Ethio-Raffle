import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { claimQrCode, sellerId } = await req.json();

    if (!claimQrCode) {
      return NextResponse.json({ error: "claimQrCode is required" }, { status: 400 });
    }

    const redemption = await prisma.redemption.findUnique({
      where: { claimQrCode },
      include: {
        raffle: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!redemption) {
      return NextResponse.json(
        { error: "Invalid or expired Winner Claim QR code." },
        { status: 404 }
      );
    }

    if (redemption.deliveryStatus === "VERIFIED_COMPLETE") {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Delivery was already verified and escrow funds unfrozen.",
        redemption,
      });
    }

    if (redemption.deliveryStatus === "DISPUTED") {
      return NextResponse.json(
        { error: "This handover is currently flagged under Dispute Arbitration. Escrow is frozen." },
        { status: 403 }
      );
    }

    const raffle = redemption.raffle;
    const now = new Date();

    // Mark delivery as Verified_Complete
    const updatedRedemption = await prisma.redemption.update({
      where: { id: redemption.id },
      data: {
        deliveryStatus: "VERIFIED_COMPLETE",
        qrScannedTimestamp: now,
      },
    });

    // Unfreeze Escrow to Seller Payout Balance
    if (raffle.seller) {
      const totalGrossPool = raffle.ticketPrice * raffle.soldTickets;
      const vatDeduction = totalGrossPool * 0.15; // 15% VAT
      const netPool = totalGrossPool - vatDeduction;
      const platformFee = (netPool * raffle.seller.commissionRate) / 100;
      const sellerNetProceeds = netPool - platformFee;

      // Transfer from escrowBalance to payoutBalance
      await prisma.seller.update({
        where: { id: raffle.seller.id },
        data: {
          escrowBalance: { decrement: Math.min(raffle.seller.escrowBalance, netPool) },
          payoutBalance: { increment: sellerNetProceeds },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Delivery QR Code verified successfully! Item marked as Verified_Complete and escrow funds unfrozen.",
      redemption: updatedRedemption,
    });
  } catch (error: any) {
    console.error("Delivery scan error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

