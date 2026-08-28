import { NextRequest, NextResponse } from "next/server";
import { executeAtomicTicketPurchase } from "@/lib/concurrency";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must be agent
    const agent = await prisma.agent.findFirst({
      where: { userId: session.userId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent profile not found." }, { status: 403 });
    }

    if (agent.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Agent is not active (Current status: ${agent.status}). Please contact admin.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { raffleId, customerPhone, ticketCount, specificNumbers } = body;

    if (!raffleId || !customerPhone || !ticketCount) {
      return NextResponse.json(
        { error: "Raffle, Customer Phone, and Ticket Count are required." },
        { status: 400 }
      );
    }

    const result = await executeAtomicTicketPurchase({
      raffleId,
      customerPhone,
      ticketCount: parseInt(ticketCount, 10),
      specificNumbers,
      paymentMethod: "AGENT_CASH",
      soldByAgentId: agent.id,
      purchaseMethod: "AGENT_CASH",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Fetch updated agent float
    const updatedAgent = await prisma.agent.findUnique({
      where: { id: agent.id },
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      tickets: result.tickets,
      transaction: result.transaction,
      agentFloatRemaining: updatedAgent?.floatBalance,
    });
  } catch (error: any) {
    console.error("Agent POS sale error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

