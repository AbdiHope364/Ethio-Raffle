import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET() {
  try {
    const [auditLogs, drawSnapshots, twoPersonApprovals, drawAudits, accessLogs] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.drawSnapshot.findMany({
        include: { raffle: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.twoPersonApproval.findMany({
        include: { initiator: true, approver: true },
        orderBy: { requestedAt: "desc" },
        take: 50,
      }),
      prisma.drawAudit.findMany({
        include: { raffle: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.agentAccessLog.findMany({
        include: { agent: true, adminUser: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      auditLogs,
      drawSnapshots,
      twoPersonApprovals,
      drawAudits,
      accessLogs,
    });
  } catch (error: any) {
    console.error("Audits fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
