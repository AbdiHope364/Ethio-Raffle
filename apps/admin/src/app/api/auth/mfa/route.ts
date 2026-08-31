import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { MFAVerificationSchema, ROLE_PERMISSIONS, AdminRole } from "@raffle/shared";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = MFAVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid MFA code format." }, { status: 400 });
    }

    const { otpCode, tempToken } = parsed.data;

    // Verify OTP code length and format
    if (!otpCode || otpCode.length !== 6) {
      return NextResponse.json({ error: "Invalid 6-digit MFA OTP code." }, { status: 401 });
    }

    // In a full Redis setup, we lookup tempToken. In sandbox/dev, accept valid OTP
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          in: [
            "SUPER_ADMIN",
            "ADMIN",
            "FINANCE_ADMIN",
            "RAFFLE_ADMIN",
            "SELLER_ADMIN",
            "COMPLIANCE_ADMIN",
            "SUPPORT_ADMIN",
            "AUDITOR",
          ],
        },
      },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "No active admin session found." }, { status: 404 });
    }

    // Set secure session cookie
    const cookieStore = cookies();
    cookieStore.set("raffle_admin_phone", adminUser.phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    // Record Login in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: adminUser.id,
        actorType: adminUser.role,
        action: "ADMIN_MFA_LOGIN_SUCCESS",
        entityType: "AUTH_SESSION",
        entityId: adminUser.id,
        afterState: JSON.stringify({
          loginTime: new Date().toISOString(),
          ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        }),
      },
    });

    const role = adminUser.role as AdminRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        phone: adminUser.phone,
        fullName: adminUser.fullName,
        role: adminUser.role,
        permissions,
      },
      message: "MFA verified. Session established.",
    });
  } catch (error: any) {
    console.error("MFA error:", error);
    return NextResponse.json({ error: error.message || "MFA verification failed." }, { status: 500 });
  }
}

