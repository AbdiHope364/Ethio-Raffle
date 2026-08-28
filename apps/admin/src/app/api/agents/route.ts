import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET(req: NextRequest) {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        user: { select: { phone: true, fullName: true, status: true, isVerified: true } },
        _count: { select: { soldTickets: true, ledgerEntries: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ agents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ error: "Phone and Full Name required" }, { status: 400 });
    }

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

    await prisma.agentAccessLog.create({
      data: {
        agentId: agent.id,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, status, commissionRate, dailySalesLimit, walletMode, creditLimit, reason } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
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

    await prisma.agentAccessLog.create({
      data: {
        agentId,
        action: logAction,
        details: JSON.stringify({ changes: updateData, reason: reason || "Admin update" }),
      },
    });

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

