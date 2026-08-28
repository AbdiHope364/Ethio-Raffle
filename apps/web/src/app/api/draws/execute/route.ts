import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveWinningTicketNumber } from "@raffle/shared";

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
          where: { status: "CONFIRMED" },
          include: { user: true },
        },
      },
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
        status: "CONFIRMED",
      },
      include: { user: true, soldByAgent: true },
    });

    const now = new Date();

    const updatedRaffle = await prisma.raffle.update({
      where: { id: raffle.id },
      data: {
        status: "DRAWN",
        drawnAt: now,
        revealedSeed: raffle.secretSeed,
        winningTicketNumber,
        winnerUserId: winningTicket?.userId || null,
        winnerTicketId: winningTicket?.id || null,
      },
    });

    const drawAudit = await prisma.drawAudit.upsert({
      where: { raffleId: raffle.id },
      update: {
        revealedAt: now,
        winningTicketNumber,
      },
      create: {
        raffleId: raffle.id,
        commitHash: raffle.commitHash!,
        secretSeed: raffle.secretSeed!,
        revealedAt: now,
        totalSoldTickets: raffle.soldTickets,
        winningTicketNumber,
        formulaDescription: "SHA256(secretSeed) % totalSoldTickets + 1",
        verifiedBy: "Admin Operations Console (NLA-ETH-2026)",
      },
    });

    // Group buyers by customerPhone to create in-app notifications
    const buyerMap = new Map<string, { userId?: string | null; phones: string[] }>();
    raffle.tickets.forEach((t) => {
      const phone = t.customerPhone || t.user?.phone;
      if (phone) {
        buyerMap.set(phone, {
          userId: t.userId,
          phones: [phone],
        });
      }
    });

    const notificationsToCreate = [];

    for (const [phone, info] of buyerMap.entries()) {
      const isWinner =
        winningTicket &&
        (winningTicket.customerPhone === phone || winningTicket.user?.phone === phone);

      if (isWinner) {
        notificationsToCreate.push({
          userId: info.userId || undefined,
          customerPhone: phone,
          raffleId: raffle.id,
          title: `🎉 CONGRATULATIONS! You Won ${raffle.prizeName}!`,
          titleAm: `🎉 እንኳን ደስ አሎት! ${raffle.prizeNameAm || raffle.prizeName} አሸንፈዋል!`,
          message: `Your Ticket #${winningTicketNumber} matched the official Provably Fair draw! Contact LuckyEthio support or visit our office with verification code ${winningTicket.verificationCode}.`,
          messageAm: `የእርስዎ ቲኬት ቁጥር #${winningTicketNumber} በይፋዊው ዕጣ አሸናፊ ሆኗል! በማረጋገጫ ኮድዎ ${winningTicket.verificationCode} ሽልማትዎን ይረከቡ።`,
          type: "WINNER_ANNOUNCEMENT",
        });
      } else {
        notificationsToCreate.push({
          userId: info.userId || undefined,
          customerPhone: phone,
          raffleId: raffle.id,
          title: `Draw Completed: ${raffle.title}`,
          titleAm: `የዕጣ ውጤት ይፋ ሆነ: ${raffle.titleAm || raffle.title}`,
          message: `Winning Ticket #${winningTicketNumber} was drawn. Check your ticket numbers or verify the cryptographic proof on the public verifier.`,
          messageAm: `አሸናፊ ቲኬት ቁጥር #${winningTicketNumber} ወጥቷል። ቲኬቶችዎን ያረጋግጡ።`,
          type: "WINNER_ANNOUNCEMENT",
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
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
