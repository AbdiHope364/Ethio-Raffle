export interface EvaluateRiskInput {
  userId?: string | null;
  customerPhone: string;
  amount: number;
  quantity: number;
  paymentMethod: string;
  ipAddress?: string;
}

export interface RiskEvaluationResult {
  score: number; // 0 to 100
  level: "LOW" | "REVIEW" | "BLOCK";
  reasonCodes: string[];
  isFlagged: boolean;
}

export async function evaluateTransactionRisk(
  prisma: any,
  input: EvaluateRiskInput
): Promise<RiskEvaluationResult> {
  let score = 0;
  const reasonCodes: string[] = [];

  // 1. High Velocity Check: Multiple transactions in past 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentOrdersCount = await prisma.purchaseOrder.count({
    where: {
      customerPhone: input.customerPhone,
      createdAt: { gte: tenMinutesAgo },
    },
  });

  if (recentOrdersCount >= 5) {
    score += 45;
    reasonCodes.push("HIGH_VELOCITY_ORDERS");
  } else if (recentOrdersCount >= 3) {
    score += 20;
    reasonCodes.push("MODERATE_VELOCITY");
  }

  // 2. High Value Check
  if (input.amount > 50000) {
    score += 30;
    reasonCodes.push("HIGH_VALUE_TRANSACTION");
  }

  // 3. Bulk Quantity Check
  if (input.quantity >= 50) {
    score += 25;
    reasonCodes.push("BULK_TICKET_PURCHASE");
  }

  let level: "LOW" | "REVIEW" | "BLOCK" = "LOW";
  if (score >= 70) {
    level = "BLOCK";
  } else if (score >= 30) {
    level = "REVIEW";
  }

  return {
    score: Math.min(score, 100),
    level,
    reasonCodes,
    isFlagged: level !== "LOW",
  };
}

