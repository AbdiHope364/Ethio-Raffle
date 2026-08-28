import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If Admin/Super Admin, return all agents
    if (session.role === "ADMIN" || session.role === "SUPER_ADMIN") {
      const agents = await prisma.agent.findMany({
        include: {
          user: { select: { phone: true, fullName: true, status: true, isVerified: true } },
          _count: { select: { soldTickets: true, ledgerEntries: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ agents });
    }

    // If Agent, return own profile
    if (session.role === "AGENT") {
      const agent = await prisma.agent.findFirst({
        where: { userId: session.userId },
        include: {
          user: true,
          _count: { select: { soldTickets: true } },
        },
      });
      return NextResponse.json({ agent });
    }

    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin role required to onboard agents." }, { status: 403 });
    }

    const body = await req.json();
    const {
      phone,
      fullName,
      businessName,
      nationalIdRef,
      region = "Addis Ababa",
      commissionRate = 5.0,
      dailySalesLimit = 50000,
      walletMode = "PREPAID",
      initialFloat = 0,
      status = "ACTIVE",
    } = body;

    if (!phone || !fullName) {
      return NextResponse.json({ error: "Phone and Full Name are required" }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          fullName,
          role: "AGENT",
          isVerified: true,
          nationalId: nationalIdRef,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "AGENT" },
      });
    }

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        fullName,
        businessName,
        nationalIdRef,
        region,
        tier: "AGENT",
        status,
        commissionRate: parseFloat(commissionRate),
        dailySalesLimit: parseFloat(dailySalesLimit),
        walletMode,
        floatBalance: parseFloat(initialFloat),
        createdByAdminId: session.userId,
      },
    });

    if (parseFloat(initialFloat) > 0) {
      await prisma.agentLedger.create({
        data: {
          agentId: agent.id,
          entryType: "TOPUP",
          amount: parseFloat(initialFloat),
          balanceAfter: parseFloat(initialFloat),
          note: "Initial float credited during onboarding",
        },
      });
    }

    // Audit log
    await prisma.agentAccessLog.create({
      data: {
        agentId: agent.id,
        changedByAdminId: session.userId,
        action: "GRANTED",
        details: JSON.stringify({
          createdAgent: fullName,
          commissionRate,
          dailyLimit: dailySalesLimit,
          walletMode,
        }),
      },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    console.error("Agent creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { agentId, status, commissionRate, dailySalesLimit, walletMode, creditLimit, reason } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const currentAgent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!currentAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const updateData: any = {};
    let logAction = "PERMISSION_UPDATED";

    if (status) {
      updateData.status = status;
      logAction = status === "ACTIVE" ? "GRANTED" : status === "SUSPENDED" ? "SUSPENDED" : "REVOKED";
    }
    if (commissionRate !== undefined) updateData.commissionRate = parseFloat(commissionRate);
    if (dailySalesLimit !== undefined) updateData.dailySalesLimit = parseFloat(dailySalesLimit);
    if (walletMode) updateData.walletMode = walletMode;
    if (creditLimit !== undefined) updateData.creditLimit = parseFloat(creditLimit);

    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: updateData,
    });

    // Access log
    await prisma.agentAccessLog.create({
      data: {
        agentId,
        changedByAdminId: session.userId,
        action: logAction,
        details: JSON.stringify({ changes: updateData, reason: reason || "Admin updated configuration" }),
      },
    });

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (error: any) {
    console.error("Agent update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

