export interface RequestApprovalParams {
  operationType: "DRAW_EXECUTION" | "PRIZE_PAYOUT" | "RAFFLE_CANCELLATION" | "LARGE_REFUND" | "AGENT_FLOAT_ADJUST";
  entityId: string;
  entityType: "RAFFLE" | "CASHOUT" | "AGENT";
  initiatedById: string;
  metadata?: Record<string, any>;
}

export async function requestTwoPersonApproval(prisma: any, params: RequestApprovalParams) {
  return await prisma.twoPersonApproval.create({
    data: {
      operationType: params.operationType,
      entityId: params.entityId,
      entityType: params.entityType,
      initiatedById: params.initiatedById,
      status: "PENDING",
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}

export async function authorizeTwoPersonApproval(
  prisma: any,
  approvalId: string,
  approvedById: string,
  decision: "APPROVED" | "REJECTED"
) {
  const approval = await prisma.twoPersonApproval.findUnique({
    where: { id: approvalId },
  });

  if (!approval) throw new Error("Approval record not found");

  if (approval.initiatedById === approvedById) {
    throw new Error("Two-Person Rule Violation: The initiator cannot approve their own high-value operation.");
  }

  return await prisma.twoPersonApproval.update({
    where: { id: approvalId },
    data: {
      approvedById,
      status: decision,
      approvedAt: new Date(),
    },
  });
}

