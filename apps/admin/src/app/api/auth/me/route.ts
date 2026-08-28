import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { DEMO_ACCOUNTS } from "@raffle/shared";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionPhone = cookieStore.get("raffle_session_phone")?.value || "+251911000001"; // Default to admin

    const user = await prisma.user.findUnique({
      where: { phone: sessionPhone },
      include: { agentProfile: true },
    });

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
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { agentProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    cookies().set("raffle_session_phone", phone, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

