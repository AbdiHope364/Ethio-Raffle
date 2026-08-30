import { NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET() {
  try {
    const riskEvents = await prisma.riskEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ riskEvents });
  } catch (error: any) {
    console.error("Risk events fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { riskEventId, isResolved } = body;

    if (!riskEventId) {
      return NextResponse.json({ error: "riskEventId is required" }, { status: 400 });
    }

    const updated = await prisma.riskEvent.update({
      where: { id: riskEventId },
      data: { isResolved: !!isResolved },
    });

    return NextResponse.json({ success: true, riskEvent: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

