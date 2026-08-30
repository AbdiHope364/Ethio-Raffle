import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const raffleId = searchParams.get("raffleId");
    const phone = searchParams.get("phone");

    if (!raffleId) {
      return NextResponse.json({ error: "raffleId is required" }, { status: 400 });
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        seller: {
          select: {
            id: true,
            businessName: true,
            contactPerson: true,
            phone: true,
            region: true,
            rating: true,
          },
        },
        redemption: true,
        winnerUser: true,
      },
    });

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    return NextResponse.json({ raffle, redemption: raffle.redemption });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { raffleId, winnerPhone, choice } = body;

    if (!raffleId || !winnerPhone || !choice) {
      return NextResponse.json(
        { error: "raffleId, winnerPhone, and choice (ITEM or CASH) are required" },
        { status: 400 }
      );
    }

    if (choice !== "ITEM" && choice !== "CASH") {
      return NextResponse.json(
        { error: "Choice must be ITEM or CASH" },
        { status: 400 }
      );
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        seller: true,
        redemption: true,
      },
    });

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    if (raffle.status !== "DRAWN") {
      return NextResponse.json(
        { error: "Raffle draw has not concluded yet." },
        { status: 400 }
      );
    }

    // Verify winner phone
    const winningTicket = await prisma.ticket.findFirst({
      where: {
        raffleId,
        ticketNumber: raffle.winningTicketNumber!,
        status: "CONFIRMED",
      },
      include: { user: true },
    });

    if (!winningTicket) {
      return NextResponse.json(
        { error: "Winning ticket record not found." },
        { status: 404 }
      );
    }

    const registeredWinnerPhone = winningTicket.customerPhone || winningTicket.user?.phone;
    if (
      registeredWinnerPhone &&
      !registeredWinnerPhone.includes(winnerPhone.replace("+251", "").replace("09", "9"))
    ) {
      return NextResponse.json(
        { error: "Provided phone does not match the certified winner ticket." },
        { status: 403 }
      );
    }

    const autoReleaseDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day rule

    if (choice === "ITEM") {
      // Generate secure random dynamic QR token & hash
      const rawToken = "CLAIM-QR-" + crypto.randomBytes(16).toString("hex").toUpperCase();
      const qrHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      const redemption = await prisma.redemption.upsert({
        where: { raffleId },
        create: {
          raffleId,
          winnerUserId: winningTicket.userId || undefined,
          winnerPhone: registeredWinnerPhone || winnerPhone,
          choice: "ITEM",
          claimQrCode: rawToken,
          claimQrHash: qrHash,
          autoReleaseDeadline,
          deliveryStatus: "QR_GENERATED",
        },
        update: {
          choice: "ITEM",
          claimQrCode: rawToken,
          claimQrHash: qrHash,
          autoReleaseDeadline,
          deliveryStatus: "QR_GENERATED",
        },
      });

      await prisma.raffle.update({
        where: { id: raffleId },
        data: { winnerChoice: "ITEM" },
      });

      return NextResponse.json({
        success: true,
        choice: "ITEM",
        message: "Winner selected Physical Item. Dynamic Claim QR code generated.",
        redemption,
      });
    } else {
      // Option 2: Cash Equivalent
      const cashVal = raffle.cashEquivalentAmount > 0 ? raffle.cashEquivalentAmount : raffle.prizeValue * 0.9;

      const rawToken = "CASH-SETTLED-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      const qrHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      const redemption = await prisma.redemption.upsert({
        where: { raffleId },
        create: {
          raffleId,
          winnerUserId: winningTicket.userId || undefined,
          winnerPhone: registeredWinnerPhone || winnerPhone,
          choice: "CASH",
          claimQrCode: rawToken,
          claimQrHash: qrHash,
          autoReleaseDeadline: new Date(),
          deliveryStatus: "VERIFIED_COMPLETE",
        },
        update: {
          choice: "CASH",
          claimQrCode: rawToken,
          claimQrHash: qrHash,
          deliveryStatus: "VERIFIED_COMPLETE",
        },
      });

      await prisma.raffle.update({
        where: { id: raffleId },
        data: {
          winnerChoice: "CASH",
        },
      });

      // Credit cash equivalent to winner if user account exists
      if (winningTicket.userId) {
        await prisma.user.update({
          where: { id: winningTicket.userId },
          data: {
            walletBalance: { increment: cashVal },
          },
        });
      }

      return NextResponse.json({
        success: true,
        choice: "CASH",
        cashAmount: cashVal,
        message: `Winner selected Cash Equivalent (${cashVal.toLocaleString()} ETB). Credited to winner wallet. Item remains with seller.`,
        redemption,
      });
    }
  } catch (error: any) {
    console.error("Winner claim error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

