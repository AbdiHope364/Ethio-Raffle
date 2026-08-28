import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: params.id },
      include: {
        winnerUser: {
          select: { fullName: true, phone: true },
        },
        drawAudit: true,
      },
    });

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    // Get all taken ticket numbers for visual grid
    const takenTickets = await prisma.ticket.findMany({
      where: { raffleId: raffle.id },
      select: { ticketNumber: true },
    });

    const takenNumbers = takenTickets.map((t) => t.ticketNumber);

    return NextResponse.json({
      raffle,
      takenNumbers,
      availableCount: raffle.totalTickets - raffle.soldTickets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

