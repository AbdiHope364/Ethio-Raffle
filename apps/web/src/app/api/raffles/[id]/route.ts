import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupExpiredReservations } from "@raffle/shared";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auto-cleanup any expired 1-hour ticket reservations
    await cleanupExpiredReservations(params.id);

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

    const now = new Date();

    // 2. Fetch all active tickets (Confirmed and active Reserved)
    const tickets = await prisma.ticket.findMany({
      where: { raffleId: raffle.id },
      select: {
        ticketNumber: true,
        status: true,
        reservedUntil: true,
        customerPhone: true,
      },
    });

    const soldNumbers: number[] = [];
    const bookedNumbers: Array<{ number: number; expiresAt: string }> = [];

    tickets.forEach((t) => {
      if (t.status === "CONFIRMED") {
        soldNumbers.push(t.ticketNumber);
      } else if (t.status === "RESERVED" && t.reservedUntil && t.reservedUntil > now) {
        bookedNumbers.push({
          number: t.ticketNumber,
          expiresAt: t.reservedUntil.toISOString(),
        });
      }
    });

    const bookedNumberList = bookedNumbers.map((b) => b.number);
    const takenNumbers = Array.from(new Set([...soldNumbers, ...bookedNumberList]));
    const availableCount = raffle.totalTickets - (soldNumbers.length + bookedNumbers.length);

    return NextResponse.json({
      raffle: {
        ...raffle,
        soldTickets: soldNumbers.length,
      },
      soldNumbers,
      bookedNumbers,
      takenNumbers,
      availableCount: Math.max(0, availableCount),
      soldCount: soldNumbers.length,
      bookedCount: bookedNumbers.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
