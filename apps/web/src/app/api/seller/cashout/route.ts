import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { sellerId, amount, payoutAccount } = await req.json();

    if (!sellerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "sellerId and a valid positive amount are required." },
        { status: 400 }
      );
    }

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found." }, { status: 404 });
    }

    if (seller.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Seller account must be in APPROVED state to request cashouts." },
        { status: 403 }
      );
    }

    if (seller.payoutBalance < amount) {
      return NextResponse.json(
        {
          error: `Insufficient unfrozen payout balance. Available: ${seller.payoutBalance.toLocaleString()} ETB, Requested: ${amount.toLocaleString()} ETB.`,
        },
        { status: 400 }
      );
    }

    const targetAccount = payoutAccount || seller.payoutAccount;
    if (!targetAccount) {
      return NextResponse.json(
        { error: "Please provide a valid Telebirr or CBE payout account." },
        { status: 400 }
      );
    }

    // Create Cashout Request in PENDING_REVIEW state (Admin authorization required)
    const cashout = await prisma.cashoutRequest.create({
      data: {
        sellerId,
        amount,
        payoutAccount: targetAccount,
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cashout withdrawal request submitted! Awaiting manual administrative review & disbursement authorization.",
      cashout,
    });
  } catch (error: any) {
    console.error("Cashout request error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

