import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET() {
  try {
    const [
      ledgerAccounts,
      ledgerTransactions,
      transactions,
      agentLedgers,
      agents,
      raffles,
      taxLedgers,
      sellers,
      cashoutRequests,
      disputedRedemptions,
    ] = await Promise.all([
      prisma.ledgerAccount.findMany({
        orderBy: { code: "asc" },
      }),
      prisma.ledgerTransaction.findMany({
        include: {
          entries: {
            include: { ledgerAccount: true },
          },
        },
        orderBy: { postedAt: "desc" },
        take: 50,
      }),
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
      prisma.taxLedger.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.seller.findMany({
        select: {
          id: true,
          businessName: true,
          phone: true,
          payoutAccount: true,
          escrowBalance: true,
          payoutBalance: true,
          rating: true,
          reviewsCount: true,
        },
      }),
      prisma.cashoutRequest.findMany({
        include: {
          seller: {
            select: {
              id: true,
              businessName: true,
              phone: true,
              payoutAccount: true,
              payoutBalance: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.redemption.findMany({
        where: { deliveryStatus: "DISPUTED" },
        include: {
          raffle: {
            include: { seller: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalRevenue = 0;

    ledgerAccounts.forEach((acc) => {
      if (acc.type === "ASSET") totalAssets += acc.balance;
      if (acc.type === "LIABILITY") totalLiabilities += acc.balance;
      if (acc.type === "REVENUE" || acc.type === "EQUITY") totalRevenue += acc.balance;
    });

    let totalGrossRevenue = 0;
    transactions.forEach((tx) => {
      if (tx.status === "SUCCESS") totalGrossRevenue += tx.amount;
    });

    let totalGovVatAccrued = 0;
    taxLedgers.forEach((tl) => {
      totalGovVatAccrued += tl.vatAmount;
    });

    let totalSellerEscrowLocked = 0;
    let totalSellerPayoutAvailable = 0;
    sellers.forEach((s) => {
      totalSellerEscrowLocked += s.escrowBalance;
      totalSellerPayoutAvailable += s.payoutBalance;
    });

    return NextResponse.json({
      summary: {
        totalAssets,
        totalLiabilities,
        totalRevenue,
        trialBalanceBalanced: Math.abs(totalAssets - (totalLiabilities + totalRevenue)) < 0.01,
        totalGrossRevenue,
        totalGovVatAccrued,
        totalSellerEscrowLocked,
        totalSellerPayoutAvailable,
        totalFloatInCirculation: agents.reduce((acc, a) => acc + a.floatBalance, 0),
      },
      ledgerAccounts,
      ledgerTransactions,
      transactions,
      agentLedgers,
      taxLedgers,
      sellers,
      cashoutRequests,
      disputedRedemptions,
    });
  } catch (error: any) {
    console.error("Financials fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
