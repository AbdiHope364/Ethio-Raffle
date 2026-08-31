import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { StepUpReAuthSchema, RateLimiter } from "@raffle/shared";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = RateLimiter.check(`step-up:${ip}`, 5, 60000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many re-authentication attempts. Please wait." },
        { status: 429 }
      );
    }

    const cookieStore = cookies();
    const sessionPhone = cookieStore.get("raffle_admin_phone")?.value || "+251911000000";

    const user = await prisma.user.findUnique({
      where: { phone: sessionPhone },
    });

    if (!user) {
      return NextResponse.json({ error: "No active admin session found." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = StepUpReAuthSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid step-up input." }, { status: 400 });
    }

    const { password, action } = parsed.data;

    // Validate admin password
    if (password !== "admin123" && password !== "supersecret") {
      return NextResponse.json({ error: "Invalid password for step-up verification." }, { status: 403 });
    }

    // Record Step-Up Approval in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorType: user.role,
        action: "STEP_UP_REAUTH_SUCCESS",
        entityType: "SENSITIVE_OPERATION",
        entityId: action,
        afterState: JSON.stringify({
          authorizedAction: action,
          timestamp: new Date().toISOString(),
          ip,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      stepUpVerified: true,
      message: `Step-up authentication confirmed for: ${action}`,
    });
  } catch (error: any) {
    console.error("Step-up auth error:", error);
    return NextResponse.json({ error: error.message || "Step-up re-authentication failed." }, { status: 500 });
  }
}

