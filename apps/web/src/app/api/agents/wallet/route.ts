import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const agent = await prisma.agent.findFirst({
      where: { userId: session.userId },
      include: {
        ledgerEntries: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({
      agent,
      ledger: agent.ledgerEntries,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { amount, actionType = "TOPUP", referenceId, note } = body;

    const topupAmount = parseFloat(amount);
    if (isNaN(topupAmount) || topupAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({
      where: { userId: session.userId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const newBalance =
      actionType === "TOPUP"
        ? agent.floatBalance + topupAmount
        : agent.floatBalance - topupAmount;

    if (actionType === "PAYOUT" && agent.floatBalance < topupAmount) {
      return NextResponse.json({ error: "Insufficient balance for payout" }, { status: 400 });
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: { floatBalance: newBalance },
    });

    const ledger = await prisma.agentLedger.create({
      data: {
        agentId: agent.id,
        entryType: actionType,
        amount: actionType === "TOPUP" ? topupAmount : -topupAmount,
        balanceAfter: newBalance,
        referenceId: referenceId || `TX-REQ-${Date.now().toString().slice(-6)}`,
        note: note || (actionType === "TOPUP" ? "Agent float top-up" : "Agent commission payout"),
      },
    });

    return NextResponse.json({
      success: true,
      newBalance: updatedAgent.floatBalance,
      ledger,
    });
  } catch (error: any) {
    console.error("Wallet operation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

