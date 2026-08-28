import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET() {
  try {
    const [transactions, agentLedgers, agents, raffles] = await Promise.all([
      prisma.transaction.findMany({
        include: { user: true, raffle: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.agentLedger.findMany({
        include: { agent: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.agent.findMany({}),
      prisma.raffle.findMany({}),
    ]);

    let totalGrossRevenue = 0;
    transactions.forEach((tx) => {
      if (tx.status === "SUCCESS") totalGrossRevenue += tx.amount;
    });

    let totalCommissionLiabilities = 0;
    agentLedgers.forEach((entry) => {
      if (entry.entryType === "COMMISSION_ACCRUED") {
        totalCommissionLiabilities += entry.amount;
      }
    });

    let totalFloatInCirculation = 0;
    agents.forEach((ag) => {
      totalFloatInCirculation += ag.floatBalance;
    });

    return NextResponse.json({
      summary: {
        totalGrossRevenue,
        totalCommissionLiabilities,
        totalFloatInCirculation,
        netPlatformProfit: totalGrossRevenue - totalCommissionLiabilities,
      },
      transactions,
      agentLedgers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

