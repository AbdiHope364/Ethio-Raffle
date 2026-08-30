import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSecretSeed, generateCommitHash } from "@/lib/provably-fair";
import * as crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const sellerId = req.nextUrl.searchParams.get("sellerId");

    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const raffles = await prisma.raffle.findMany({
      where,
      include: {
        seller: true,
        winnerUser: { select: { fullName: true, phone: true } },
        drawAudit: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ raffles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sellerId,
      title,
      titleAm,
      description,
      descriptionAm,
      category = "VEHICLE",
      prizeName,
      prizeNameAm,
      prizeImage,
      photo1,
      photo2,
      photo3,
      declaredMarketValue,
      prizeValue,
      ticketPrice,
      totalTickets,
      maxTicketsPerUser = 100,
      drawDays = 7,
    } = body;

    if (!title || !prizeName || !ticketPrice || !totalTickets) {
      return NextResponse.json({ error: "Missing required raffle listing fields." }, { status: 400 });
    }

    // Verify seller is approved
    let seller = null;
    if (sellerId) {
      seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    } else {
      seller = await prisma.seller.findFirst({ where: { status: "APPROVED" } });
    }

    if (!seller || seller.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved sellers can submit items for raffle. Your account is under moderation." },
        { status: 403 }
      );
    }

    const raffleId = crypto.randomUUID();
    const secretSeed = generateSecretSeed();
    const totalTixInt = parseInt(totalTickets, 10);
    const commitHash = generateCommitHash(secretSeed, raffleId, totalTixInt);
    const drawDate = new Date(Date.now() + parseInt(drawDays, 10) * 24 * 60 * 60 * 1000);
    const declaredVal = parseFloat(declaredMarketValue || prizeValue || "100000");
    const tktPrice = parseFloat(ticketPrice);
    const totalPool = tktPrice * totalTixInt;
    const cashEquivalent = Math.round(declaredVal * 0.9); // 90% of declared valuation

    const primaryImg = prizeImage || photo1 || "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80";

    const raffle = await prisma.raffle.create({
      data: {
        id: raffleId,
        sellerId: seller.id,
        title,
        titleAm: titleAm || undefined,
        description: description || "Merchant raffle listing on Lucky Ticket infrastructure",
        descriptionAm: descriptionAm || undefined,
        category,
        prizeName,
        prizeNameAm: prizeNameAm || undefined,
        prizeImage: primaryImg,
        photo1: photo1 || primaryImg,
        photo2: photo2 || undefined,
        photo3: photo3 || undefined,
        declaredMarketValue: declaredVal,
        prizeValue: declaredVal,
        cashEquivalentAmount: cashEquivalent,
        ticketPrice: tktPrice,
        totalTickets: totalTixInt,
        soldTickets: 0,
        maxTicketsPerUser: parseInt(maxTicketsPerUser, 10),
        status: "ACTIVE",
        moderationStatus: "PENDING_APPROVAL", // Gate 2: Moderation Queue
        appraisalStatus: "PENDING_REVIEW",
        drawDate,
        commitHash,
        secretSeed,
      },
    });

    return NextResponse.json({
      success: true,
      raffle,
      message: "Raffle item submitted successfully. It is now in the Administrative Moderation Queue for review.",
    });
  } catch (error: any) {
    console.error("Seller create raffle error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

