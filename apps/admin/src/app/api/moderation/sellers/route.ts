import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET(req: NextRequest) {
  try {
    const sellers = await prisma.seller.findMany({
      include: {
        user: true,
        raffles: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sellers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sellerId, status, rejectionReason, commissionRate } = await req.json();

    if (!sellerId || !status) {
      return NextResponse.json({ error: "sellerId and status are required." }, { status: 400 });
    }

    const data: any = { status };
    if (rejectionReason) data.rejectionReason = rejectionReason;
    if (commissionRate !== undefined) data.commissionRate = parseFloat(commissionRate);

    const seller = await prisma.seller.update({
      where: { id: sellerId },
      data,
      include: { user: true },
    });

    return NextResponse.json({
      success: true,
      seller,
      message: `Seller application status updated to ${status}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

