import { PrismaClient } from "@prisma/client";

export const CHART_OF_ACCOUNTS = {
  CASH_IN_TRANSIT: { code: "1010-CASH-TRANSIT", name: "Cash in Transit / Payment Gateway Clearing", type: "ASSET" },
  PRIZE_ESCROW: { code: "2010-PRIZE-ESCROW", name: "Seller & Winner Prize Escrow Holding", type: "LIABILITY" },
  VAT_PAYABLE: { code: "2020-VAT-PAYABLE", name: "Statutory 15% Ethiopian VAT Payable (MoR)", type: "LIABILITY" },
  AGENT_COMMISSION_PAYABLE: { code: "2030-AGENT-COMMISSION", name: "Agent Sales Commission Payable", type: "LIABILITY" },
  PLATFORM_REVENUE: { code: "4010-PLATFORM-REVENUE", name: "Operating Platform Fee & Commission Revenue", type: "REVENUE" },
};

export async function ensureLedgerAccounts(prisma: any) {
  for (const account of Object.values(CHART_OF_ACCOUNTS)) {
    await prisma.ledgerAccount.upsert({
      where: { code: account.code },
      update: {},
      create: {
        code: account.code,
        name: account.name,
        type: account.type,
        currency: "ETB",
        balance: 0.0,
      },
    });
  }
}

export interface PostTicketSaleParams {
  transactionId: string;
  orderNumber: string;
  totalAmount: number;
  vatAmount: number;
  sellerEscrowAmount: number;
  agentCommissionAmount: number;
  platformFeeAmount: number;
  description: string;
}

export async function postTicketSaleLedgerTransaction(
  prisma: any,
  params: PostTicketSaleParams
) {
  await ensureLedgerAccounts(prisma);

  const cashAccount = await prisma.ledgerAccount.findUnique({ where: { code: CHART_OF_ACCOUNTS.CASH_IN_TRANSIT.code } });
  const escrowAccount = await prisma.ledgerAccount.findUnique({ where: { code: CHART_OF_ACCOUNTS.PRIZE_ESCROW.code } });
  const vatAccount = await prisma.ledgerAccount.findUnique({ where: { code: CHART_OF_ACCOUNTS.VAT_PAYABLE.code } });
  const agentAccount = await prisma.ledgerAccount.findUnique({ where: { code: CHART_OF_ACCOUNTS.AGENT_COMMISSION_PAYABLE.code } });
  const revenueAccount = await prisma.ledgerAccount.findUnique({ where: { code: CHART_OF_ACCOUNTS.PLATFORM_REVENUE.code } });

  const totalCredits =
    params.vatAmount +
    params.sellerEscrowAmount +
    params.agentCommissionAmount +
    params.platformFeeAmount;

  // Verify debit/credit balance
  const diff = Math.abs(params.totalAmount - totalCredits);
  if (diff > 0.01) {
    throw new Error(`Double-entry unbalanced: Debits (${params.totalAmount}) != Credits (${totalCredits})`);
  }

  const txNumber = "LTX-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

  const ledgerTx = await prisma.ledgerTransaction.create({
    data: {
      transactionNumber: txNumber,
      referenceType: "TICKET_PURCHASE",
      referenceId: params.transactionId || params.orderNumber,
      description: params.description,
      status: "POSTED",
      entries: {
        create: [
          // Debit Asset
          {
            ledgerAccountId: cashAccount.id,
            entryType: "DEBIT",
            amount: params.totalAmount,
          },
          // Credit VAT Liability
          {
            ledgerAccountId: vatAccount.id,
            entryType: "CREDIT",
            amount: params.vatAmount,
          },
          // Credit Seller Escrow Liability
          {
            ledgerAccountId: escrowAccount.id,
            entryType: "CREDIT",
            amount: params.sellerEscrowAmount,
          },
          // Credit Agent Commission Liability (if applicable)
          ...(params.agentCommissionAmount > 0
            ? [
                {
                  ledgerAccountId: agentAccount.id,
                  entryType: "CREDIT",
                  amount: params.agentCommissionAmount,
                },
              ]
            : []),
          // Credit Operating Platform Revenue
          ...(params.platformFeeAmount > 0
            ? [
                {
                  ledgerAccountId: revenueAccount.id,
                  entryType: "CREDIT",
                  amount: params.platformFeeAmount,
                },
              ]
            : []),
        ],
      },
    },
    include: { entries: true },
  });

  // Update running account balances
  await prisma.ledgerAccount.update({
    where: { id: cashAccount.id },
    data: { balance: { increment: params.totalAmount } },
  });
  await prisma.ledgerAccount.update({
    where: { id: vatAccount.id },
    data: { balance: { increment: params.vatAmount } },
  });
  await prisma.ledgerAccount.update({
    where: { id: escrowAccount.id },
    data: { balance: { increment: params.sellerEscrowAmount } },
  });
  if (params.agentCommissionAmount > 0) {
    await prisma.ledgerAccount.update({
      where: { id: agentAccount.id },
      data: { balance: { increment: params.agentCommissionAmount } },
    });
  }
  if (params.platformFeeAmount > 0) {
    await prisma.ledgerAccount.update({
      where: { id: revenueAccount.id },
      data: { balance: { increment: params.platformFeeAmount } },
    });
  }

  return ledgerTx;
}

