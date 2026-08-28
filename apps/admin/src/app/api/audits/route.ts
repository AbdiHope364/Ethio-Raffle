import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET() {
  try {
    const [accessLogs, drawAudits] = await Promise.all([
      prisma.agentAccessLog.findMany({
        include: { agent: true, adminUser: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.drawAudit.findMany({
        include: { raffle: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({ accessLogs, drawAudits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

