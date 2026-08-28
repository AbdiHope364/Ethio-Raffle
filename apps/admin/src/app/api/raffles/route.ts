import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { generateSecretSeed, generateCommitHash } from "@raffle/shared";
import * as crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const raffles = await prisma.raffle.findMany({
      where,
      include: {
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
      title,
      titleAm,
      description,
      descriptionAm,
      category = "VEHICLE",
      prizeName,
      prizeNameAm,
      prizeImage,
      prizeValue,
      ticketPrice,
      totalTickets,
      maxTicketsPerUser = 100,
      drawDays = 7,
    } = body;

    if (!title || !prizeName || !ticketPrice || !totalTickets) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const raffleId = crypto.randomUUID();
    const secretSeed = generateSecretSeed();
    const commitHash = generateCommitHash(secretSeed, raffleId, parseInt(totalTickets, 10));
    const drawDate = new Date(Date.now() + parseInt(drawDays, 10) * 24 * 60 * 60 * 1000);

    const raffle = await prisma.raffle.create({
      data: {
        id: raffleId,
        title,
        titleAm: titleAm || undefined,
        description: description || "Exciting raffle by LuckyEthio",
        descriptionAm: descriptionAm || undefined,
        category,
        prizeName,
        prizeNameAm: prizeNameAm || undefined,
        prizeImage: prizeImage || "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
        prizeValue: parseFloat(prizeValue || "100000"),
        ticketPrice: parseFloat(ticketPrice),
        totalTickets: parseInt(totalTickets, 10),
        soldTickets: 0,
        maxTicketsPerUser: parseInt(maxTicketsPerUser, 10),
        status: "ACTIVE",
        drawDate,
        commitHash,
        secretSeed,
      },
    });

    return NextResponse.json({
      success: true,
      raffle,
      message: "Raffle created with SHA-256 commitment.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

