import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET(req: NextRequest) {
  try {
    const raffles = await prisma.raffle.findMany({
      include: {
        seller: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ raffles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const {
      raffleId,
      moderationStatus,
      moderationNotes,
      rejectionReasonCode,
      counterOfferPrice,
      appraisalStatus,
    } = await req.json();

    if (!raffleId) {
      return NextResponse.json({ error: "raffleId is required." }, { status: 400 });
    }

    const data: any = {};
    if (moderationStatus !== undefined) data.moderationStatus = moderationStatus;
    if (moderationNotes !== undefined) data.moderationNotes = moderationNotes;
    if (rejectionReasonCode !== undefined) data.rejectionReasonCode = rejectionReasonCode;
    if (counterOfferPrice !== undefined) data.counterOfferPrice = parseFloat(counterOfferPrice);
    if (appraisalStatus !== undefined) data.appraisalStatus = appraisalStatus;

    if (counterOfferPrice && counterOfferPrice > 0) {
      data.appraisalStatus = "COUNTER_OFFER_ISSUED";
      data.moderationStatus = "PENDING_APPROVAL";
    }

    const raffle = await prisma.raffle.update({
      where: { id: raffleId },
      data,
      include: { seller: true },
    });

    return NextResponse.json({
      success: true,
      raffle,
      message: `Raffle listing updated successfully (Status: ${raffle.moderationStatus}, Appraisal: ${raffle.appraisalStatus}).`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

