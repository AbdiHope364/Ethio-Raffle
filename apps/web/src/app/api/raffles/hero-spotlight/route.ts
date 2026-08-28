import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const latestDrawn = await prisma.raffle.findFirst({
      where: {
        status: "DRAWN",
        winningTicketNumber: { not: null },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        winnerUser: {
          select: { fullName: true, phone: true },
        },
        drawAudit: true,
      },
    });

    if (!latestDrawn) {
      return NextResponse.json({ spotlight: null });
    }

    // Determine draw timestamp
    const drawTimestamp = latestDrawn.drawnAt || latestDrawn.drawAudit?.revealedAt || latestDrawn.updatedAt;
    const drawTime = new Date(drawTimestamp).getTime();
    const now = Date.now();
    const ageMs = now - drawTime;
    const dayMs = 24 * 60 * 60 * 1000;

    // Check if within 24-hour spotlight window (or if none other exists, show latest within active window)
    const isWithin24Hours = ageMs <= dayMs;
    const remainingMs = Math.max(0, dayMs - ageMs);
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    // Fetch the winning ticket details
    let winningTicket = null;
    if (latestDrawn.winningTicketNumber) {
      winningTicket = await prisma.ticket.findFirst({
        where: {
          raffleId: latestDrawn.id,
          ticketNumber: latestDrawn.winningTicketNumber,
        },
        include: {
          soldByAgent: { select: { fullName: true, businessName: true, region: true } },
        },
      });
    }

    // Mask phone number for public privacy (e.g. +251912***678)
    const rawPhone = winningTicket?.customerPhone || latestDrawn.winnerUser?.phone || "+251912345678";
    const maskedPhone =
      rawPhone.length > 7
        ? rawPhone.substring(0, 6) + "***" + rawPhone.substring(rawPhone.length - 3)
        : rawPhone;

    const winnerName =
      latestDrawn.winnerUser?.fullName ||
      (winningTicket?.soldByAgent ? `Customer (via ${winningTicket.soldByAgent.fullName})` : "Lucky Winner");

    return NextResponse.json({
      spotlight: {
        id: latestDrawn.id,
        title: latestDrawn.title,
        titleAm: latestDrawn.titleAm,
        prizeName: latestDrawn.prizeName,
        prizeNameAm: latestDrawn.prizeNameAm,
        prizeImage: latestDrawn.prizeImage,
        prizeValue: latestDrawn.prizeValue,
        ticketPrice: latestDrawn.ticketPrice,
        totalTickets: latestDrawn.totalTickets,
        soldTickets: latestDrawn.soldTickets,
        winningTicketNumber: latestDrawn.winningTicketNumber,
        winnerName,
        maskedPhone,
        verificationCode: winningTicket?.verificationCode || "TKT-VERIFIED",
        soldBy: winningTicket?.soldByAgent?.fullName || "Online Checkout",
        revealedSeed: latestDrawn.revealedSeed,
        commitHash: latestDrawn.commitHash,
        drawnAt: drawTimestamp,
        isWithin24Hours,
        remainingHours,
        remainingMinutes,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

