import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { deriveWinningTicketNumber } from "@/lib/provably-fair";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin role required to trigger draw." }, { status: 403 });
    }

    const { raffleId } = await req.json();
    if (!raffleId) {
      return NextResponse.json({ error: "raffleId is required" }, { status: 400 });
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { tickets: true },
    });

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    if (raffle.status === "DRAWN") {
      return NextResponse.json({ error: "This raffle has already been drawn." }, { status: 400 });
    }

    if (raffle.soldTickets <= 0) {
      return NextResponse.json(
        { error: "Cannot execute draw with 0 sold tickets." },
        { status: 400 }
      );
    }

    if (!raffle.secretSeed || !raffle.commitHash) {
      return NextResponse.json(
        { error: "Missing secret commitment seed on this raffle." },
        { status: 400 }
      );
    }

    // 1. Derive winning ticket number using deterministic cryptographic formula
    const winningTicketNumber = deriveWinningTicketNumber(
      raffle.secretSeed,
      raffle.soldTickets
    );

    // 2. Locate winning ticket in database
    const winningTicket = await prisma.ticket.findFirst({
      where: {
        raffleId: raffle.id,
        ticketNumber: winningTicketNumber,
      },
      include: {
        user: true,
        soldByAgent: true,
      },
    });

    // 3. Update Raffle to DRAWN state
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

    // 4. Create immutable DrawAudit record
    const drawAudit = await prisma.drawAudit.upsert({
      where: { raffleId: raffle.id },
      update: {
        revealedAt: new Date(),
        winningTicketNumber,
      },
      create: {
        raffleId: raffle.id,
        commitHash: raffle.commitHash,
        secretSeed: raffle.secretSeed,
        revealedAt: new Date(),
        totalSoldTickets: raffle.soldTickets,
        winningTicketNumber,
        formulaDescription: "SHA256(secretSeed) % totalSoldTickets + 1",
        verifiedBy: `Executed by ${session.fullName} (${session.role})`,
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
    console.error("Execute draw error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
