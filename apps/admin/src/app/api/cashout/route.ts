import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cashouts = await prisma.cashoutRequest.findMany({
      include: {
        seller: {
          select: {
            id: true,
            businessName: true,
            contactPerson: true,
            phone: true,
            payoutAccount: true,
            payoutBalance: true,
            escrowBalance: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cashouts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cashoutId, action, adminNote } = await req.json();

    if (!cashoutId || !action) {
      return NextResponse.json(
        { error: "cashoutId and action (APPROVE or REJECT) are required." },
        { status: 400 }
      );
    }

    const cashout = await prisma.cashoutRequest.findUnique({
      where: { id: cashoutId },
      include: { seller: true },
    });

    if (!cashout) {
      return NextResponse.json({ error: "Cashout request not found." }, { status: 404 });
    }

    if (cashout.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        { error: `Cashout request is already in ${cashout.status} status.` },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      if (cashout.seller.payoutBalance < cashout.amount) {
        return NextResponse.json(
          { error: "Seller's unfrozen payout balance is less than the requested disbursement amount." },
          { status: 400 }
        );
      }

      // Deduct from seller payout balance & mark APPROVED
      await prisma.$transaction([
        prisma.seller.update({
          where: { id: cashout.sellerId },
          data: {
            payoutBalance: { decrement: cashout.amount },
          },
        }),
        prisma.cashoutRequest.update({
          where: { id: cashoutId },
          data: {
            status: "APPROVED",
            adminNote: adminNote || "Disbursement authorized by Admin.",
            reviewedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Cashout of ${cashout.amount.toLocaleString()} ETB approved and disbursed to ${cashout.payoutAccount}.`,
      });
    } else if (action === "REJECT") {
      await prisma.cashoutRequest.update({
        where: { id: cashoutId },
        data: {
          status: "REJECTED",
          adminNote: adminNote || "Rejected by Admin.",
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Cashout request rejected.",
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Use APPROVE or REJECT." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin cashout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

