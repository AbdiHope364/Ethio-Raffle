import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveWinningTicketNumber } from "@raffle/shared";

export async function POST(req: NextRequest) {
  try {
    const { raffleId, action, extensionDays = 7, note } = await req.json();

    if (!raffleId || !action) {
      return NextResponse.json({ error: "raffleId and action are required." }, { status: 400 });
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        tickets: { where: { status: "CONFIRMED" }, include: { user: true } },
      },
    });

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    if (raffle.status === "DRAWN") {
      return NextResponse.json({ error: "Raffle is already drawn." }, { status: 400 });
    }

    // Handle Seller Action
    if (action === "GRANT_CONSENT") {
      // Check if Admin has already given consent
      const bothConsenting = raffle.adminDrawConsent;

      if (bothConsenting && raffle.soldTickets > 0) {
        // Both consented! Execute draw immediately
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
            sellerDrawConsent: true,
            sellerConsentAt: now,
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
            verifiedBy: "Dual-Consent Consensus (Admin + Seller Approval)",
          },
        });

        return NextResponse.json({
          success: true,
          raffle: updated,
          drawExecuted: true,
          message: "Dual consent achieved! Provably fair draw executed successfully.",
        });
      } else {
        // Record seller consent, awaiting admin consent
        const updated = await prisma.raffle.update({
          where: { id: raffle.id },
          data: { sellerDrawConsent: true, sellerConsentAt: new Date() },
        });
        return NextResponse.json({
          success: true,
          raffle: updated,
          drawExecuted: false,
          message: "Seller consent granted. Awaiting administrative confirmation to trigger draw.",
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
          sellerDrawConsent: false,
          adminDrawConsent: false,
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
      // Trigger refund status
      await prisma.$transaction([
        prisma.raffle.update({
          where: { id: raffle.id },
          data: {
            status: "CANCELLED",
            fallbackPolicy: "REFUNDED",
            sellerDrawConsent: false,
            adminDrawConsent: false,
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
        message: "Raffle cancelled. Automated refunds issued to all ticket holders.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Consensus error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

