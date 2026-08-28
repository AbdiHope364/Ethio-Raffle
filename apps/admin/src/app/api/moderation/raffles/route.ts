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
    const { raffleId, moderationStatus, moderationNotes } = await req.json();

    if (!raffleId || !moderationStatus) {
      return NextResponse.json({ error: "raffleId and moderationStatus are required." }, { status: 400 });
    }

    const data: any = { moderationStatus };
    if (moderationNotes !== undefined) data.moderationNotes = moderationNotes;

    const raffle = await prisma.raffle.update({
      where: { id: raffleId },
      data,
      include: { seller: true },
    });

    return NextResponse.json({
      success: true,
      raffle,
      message: `Raffle listing status updated to ${moderationStatus}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

