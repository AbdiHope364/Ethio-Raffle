import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import {
  createImmutableDrawSnapshot,
  deriveMultiEntropyWinnerTicketNumber,
  logAuditEvent,
} from "@raffle/shared";

export async function POST(req: NextRequest) {
  try {
    const { raffleId } = await req.json();
    if (!raffleId) {
      return NextResponse.json({ error: "raffleId is required" }, { status: 400 });
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        tickets: {
          where: { status: "ACTIVE" },
          include: { user: true },
        },
      },
    });

    if (!raffle) return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    if (raffle.status === "COMPLETED" || raffle.status === "DRAWN") {
      return NextResponse.json({ error: "Raffle is already drawn and completed" }, { status: 400 });
    }
    if (raffle.soldTickets <= 0) {
      return NextResponse.json({ error: "Cannot execute draw with 0 tickets sold" }, { status: 400 });
    }

    // 1. Create Immutable Cryptographic Draw Snapshot (Freezes ticket universe)
    const snapshot = await createImmutableDrawSnapshot(prisma, raffle.id);

    // 2. Derive Winning Ticket Number using Multi-Entropy formula
    const publicEntropy = raffle.publicEntropy || "ETHIO-TELECOM-NLA-CONSENSUS";
    const { winningTicketNumber, drawHash } = deriveMultiEntropyWinnerTicketNumber(
      raffle.secretSeed!,
      raffle.id,
      raffle.soldTickets,
      publicEntropy
    );

    const winningTicket = await prisma.ticket.findFirst({
      where: {
        raffleId: raffle.id,
        ticketNumber: winningTicketNumber,
      },
      include: { user: true, soldByAgent: true },
    });

    const now = new Date();

    // 3. Update Raffle Status to WINNER_SELECTED
    const updatedRaffle = await prisma.raffle.update({
      where: { id: raffle.id },
      data: {
        status: "WINNER_SELECTED",
        drawnAt: now,
        revealedSeed: raffle.secretSeed,
        winningTicketNumber,
        winnerUserId: winningTicket?.userId || null,
        winnerTicketId: winningTicket?.id || null,
      },
    });

    // 4. Update Draw Audit
    const drawAudit = await prisma.drawAudit.upsert({
      where: { raffleId: raffle.id },
      update: {
        revealedAt: now,
        winningTicketNumber,
        formulaDescription: "SHA256(version:raffleId:secretSeed:soldTickets:publicEntropy:algorithm) % soldTickets + 1",
      },
      create: {
        raffleId: raffle.id,
        commitHash: raffle.commitHash!,
        secretSeed: raffle.secretSeed!,
        publicEntropy,
        revealedAt: now,
        totalSoldTickets: raffle.soldTickets,
        winningTicketNumber,
        formulaDescription: "SHA256(version:raffleId:secretSeed:soldTickets:publicEntropy:algorithm) % soldTickets + 1",
        verifiedBy: "Two-Person Consensus & Cryptographic Snapshot",
      },
    });

    // 5. Append Immutable Audit Log
    await logAuditEvent(prisma, {
      actorType: "ADMIN",
      action: "DRAW_EXECUTED_SNAPSHOT_VERIFIED",
      entityType: "RAFFLE",
      entityId: raffle.id,
      afterState: {
        winningTicketNumber,
        snapshotNumber: snapshot.snapshotNumber,
        drawHash,
      },
    });

    // 6. Send Notifications
    if (winningTicket?.customerPhone) {
      await prisma.notification.create({
        data: {
          userId: winningTicket.userId || null,
          customerPhone: winningTicket.customerPhone,
          raffleId: raffle.id,
          title: `🎉 CONGRATULATIONS! You Won ${raffle.prizeName}!`,
          titleAm: `🎉 እንኳን ደስ አሎት! ${raffle.prizeNameAm || raffle.prizeName} አሸንፈዋል!`,
          message: `Your Ticket #${winningTicketNumber} matched the official Provably Fair draw! Access your claim QR code in your dashboard.`,
          messageAm: `የእርስዎ ቲኬት ቁጥር #${winningTicketNumber} በይፋዊው ዕጣ አሸናፊ ሆኗል! የመረከቢያ QR ኮድዎን ዳሽቦርድ ላይ ያግኙ።`,
          type: "WINNER_ANNOUNCEMENT",
        },
      });
    }

    return NextResponse.json({
      success: true,
      raffle: updatedRaffle,
      winningTicketNumber,
      winner: winningTicket
        ? {
            ticketNumber: winningTicket.ticketNumber,
            customerPhone: winningTicket.customerPhone || winningTicket.user?.phone,
            winnerName: winningTicket.user?.fullName || "Verified Buyer",
            verificationCode: winningTicket.verificationCode,
          }
        : null,
      snapshot,
      drawAudit,
    });
  } catch (error: any) {
    console.error("Draw execution error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
