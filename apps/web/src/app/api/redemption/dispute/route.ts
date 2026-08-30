import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { redemptionId, winnerPhone, disputeReason } = await req.json();

    if (!redemptionId || !disputeReason) {
      return NextResponse.json(
        { error: "redemptionId and disputeReason are required" },
        { status: 400 }
      );
    }

    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: { raffle: true },
    });

    if (!redemption) {
      return NextResponse.json({ error: "Redemption record not found" }, { status: 404 });
    }

    if (redemption.deliveryStatus === "VERIFIED_COMPLETE") {
      return NextResponse.json(
        { error: "Delivery was already verified as complete." },
        { status: 400 }
      );
    }

    const updated = await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        deliveryStatus: "DISPUTED",
        disputeReason,
        disputedAt: new Date(),
      },
    });

    // Create system notification for Admin Arbitration
    await prisma.notification.create({
      data: {
        customerPhone: redemption.winnerPhone,
        raffleId: redemption.raffleId,
        title: "Item Delivery Disputed by Winner",
        titleAm: "የሽልማት ርክክብ በዕጣ አሸናፊው ተቃውሞ ቀርቦበታል",
        message: `Winner has filed a non-receipt dispute for ${redemption.raffle.title}: "${disputeReason}". Escrow payout halted pending Admin arbitration.`,
        messageAm: `አሸናፊው ለ${redemption.raffle.titleAm || redemption.raffle.title} የርክክብ ቅሬታ አቅርቧል። የአስተዳዳሪ ውሳኔ እስኪሰጥ ድረስ ገንዘቡ ታግዷል።`,
        type: "SYSTEM",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Formal non-receipt dispute logged. Escrow payout halted and routed to Admin Arbitration Console.",
      redemption: updated,
    });
  } catch (error: any) {
    console.error("Dispute error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

