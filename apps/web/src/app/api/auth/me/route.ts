import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_ACCOUNTS } from "@/lib/auth-types";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      user,
      demoAccounts: DEMO_ACCOUNTS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { agentProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Set cookie
    cookies().set("raffle_session_phone", phone, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
    });

    return NextResponse.json({
      success: true,
      user: {
        userId: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        agentProfileId: user.agentProfile?.id,
        agentStatus: user.agentProfile?.status,
        floatBalance: user.agentProfile?.floatBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
