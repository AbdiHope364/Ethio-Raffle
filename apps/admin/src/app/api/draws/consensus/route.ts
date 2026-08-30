import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { deriveWinningTicketNumber } from "@raffle/shared";

export async function POST(req: NextRequest) {
  try {
    const { raffleId, action, extensionDays = 7 } = await req.json();

    if (!raffleId || !action) {
      return NextResponse.json({ error: "raffleId and action are required." }, { status: 400 });
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        tickets: { where: { status: "CONFIRMED" }, include: { user: true } },
      },
    });

    if (!raffle) return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    if (raffle.status === "DRAWN") return NextResponse.json({ error: "Raffle already drawn" }, { status: 400 });

    if (action === "GRANT_CONSENT") {
      const bothConsenting = raffle.sellerDrawConsent;

      if (bothConsenting && raffle.soldTickets > 0) {
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
          include: { user: true },
        });

        const now = new Date();
        const updated = await prisma.raffle.update({
          where: { id: raffle.id },
          data: {
            adminDrawConsent: true,
            adminConsentAt: now,
            dualConsentFlag: true,
            status: "DRAWN",
            drawnAt: now,
            revealedSeed: raffle.secretSeed,
            winningTicketNumber,
            winnerUserId: winningTicket?.userId || null,
            winnerTicketId: winningTicket?.id || null,
          },
        });

        await prisma.drawAudit.upsert({
          where: { raffleId: raffle.id },
          update: { revealedAt: now, winningTicketNumber },
          create: {
            raffleId: raffle.id,
            commitHash: raffle.commitHash!,
            secretSeed: raffle.secretSeed!,
            revealedAt: now,
            totalSoldTickets: raffle.soldTickets,
            winningTicketNumber,
            formulaDescription: "SHA256(secretSeed) % soldTickets + 1 (Dual Consent Consensus Execution)",
            verifiedBy: "Admin Operations Console (Dual Consent)",
          },
        });

        return NextResponse.json({
          success: true,
          raffle: updated,
          drawExecuted: true,
          message: "Dual consent achieved! Provably fair draw executed.",
        });
      } else {
        const updated = await prisma.raffle.update({
          where: { id: raffle.id },
          data: { adminDrawConsent: true, adminConsentAt: new Date() },
        });
        return NextResponse.json({
          success: true,
          raffle: updated,
          drawExecuted: false,
          message: "Admin consent granted. Awaiting seller confirmation.",
        });
      }
    }

    if (action === "EXTEND_TIMER") {
      const currentDraw = new Date(raffle.drawDate);
      const newDrawDate = new Date(currentDraw.getTime() + extensionDays * 24 * 60 * 60 * 1000);

      const updated = await prisma.raffle.update({
        where: { id: raffle.id },
        data: {
          drawDate: newDrawDate,
          adminDrawConsent: false,
          sellerDrawConsent: false,
          fallbackPolicy: "EXTENDED",
          extendedUntil: newDrawDate,
        },
      });

      return NextResponse.json({
        success: true,
        raffle: updated,
        message: `Raffle timer extended by ${extensionDays} days.`,
      });
    }

    if (action === "REFUND_BUYERS") {
      await prisma.$transaction([
        prisma.raffle.update({
          where: { id: raffle.id },
          data: {
            status: "CANCELLED",
            fallbackPolicy: "REFUNDED",
            adminDrawConsent: false,
            sellerDrawConsent: false,
          },
        }),
        prisma.ticket.updateMany({
          where: { raffleId: raffle.id },
          data: { status: "REFUNDED" },
        }),
        prisma.transaction.updateMany({
          where: { raffleId: raffle.id, status: "SUCCESS" },
          data: { status: "REFUNDED" },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Raffle cancelled. Automated refunds issued to ticket holders.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

