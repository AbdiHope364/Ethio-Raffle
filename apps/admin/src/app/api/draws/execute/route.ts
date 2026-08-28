import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { deriveWinningTicketNumber } from "@raffle/shared";

export async function POST(req: NextRequest) {
  try {
    const { raffleId } = await req.json();
    if (!raffleId) {
      return NextResponse.json({ error: "raffleId is required" }, { status: 400 });
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { tickets: true },
    });

    if (!raffle) return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    if (raffle.status === "DRAWN") return NextResponse.json({ error: "Already drawn" }, { status: 400 });
    if (raffle.soldTickets <= 0) return NextResponse.json({ error: "0 tickets sold" }, { status: 400 });

    const winningTicketNumber = deriveWinningTicketNumber(
      raffle.secretSeed!,
      raffle.soldTickets
    );

    const winningTicket = await prisma.ticket.findFirst({
      where: {
        raffleId: raffle.id,
        ticketNumber: winningTicketNumber,
      },
      include: { user: true, soldByAgent: true },
    });

    const updatedRaffle = await prisma.raffle.update({
      where: { id: raffle.id },
      data: {
        status: "DRAWN",
        revealedSeed: raffle.secretSeed,
        winningTicketNumber,
        winnerUserId: winningTicket?.userId || null,
        winnerTicketId: winningTicket?.id || null,
      },
    });

    const drawAudit = await prisma.drawAudit.upsert({
      where: { raffleId: raffle.id },
      update: {
        revealedAt: new Date(),
        winningTicketNumber,
      },
      create: {
        raffleId: raffle.id,
        commitHash: raffle.commitHash!,
        secretSeed: raffle.secretSeed!,
        revealedAt: new Date(),
        totalSoldTickets: raffle.soldTickets,
        winningTicketNumber,
        formulaDescription: "SHA256(secretSeed) % totalSoldTickets + 1",
        verifiedBy: "Admin Operations Console (NLA-ETH-2026)",
      },
    });

    return NextResponse.json({
      success: true,
      raffle: updatedRaffle,
      winningTicketNumber,
      winner: winningTicket
        ? {
            ticketNumber: winningTicket.ticketNumber,
            customerPhone: winningTicket.customerPhone || winningTicket.user?.phone,
            winnerName: winningTicket.user?.fullName || "Walk-in Customer",
            soldByAgent: winningTicket.soldByAgent?.fullName || "Self-Service Online",
            verificationCode: winningTicket.verificationCode,
          }
        : null,
      drawAudit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

