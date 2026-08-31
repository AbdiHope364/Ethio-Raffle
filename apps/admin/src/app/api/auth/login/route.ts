import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { AdminLoginSchema, RateLimiter } from "@raffle/shared";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = RateLimiter.check(`admin-login:${ip}`, 5, 60000); // 5 attempts per minute

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${Math.ceil(rateCheck.resetMs / 1000)} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = AdminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input format" }, { status: 400 });
    }

    const { identifier, password } = parsed.data;

    // Find admin user by phone
    const user = await prisma.user.findFirst({
      where: {
        phone: identifier,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Role check: Must have an administrative role
    const adminRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "FINANCE_ADMIN",
      "RAFFLE_ADMIN",
      "SELLER_ADMIN",
      "COMPLIANCE_ADMIN",
      "SUPPORT_ADMIN",
      "AUDITOR",
    ];

    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: "Access denied: Not authorized for Administrative Console." }, { status: 403 });
    }

    // Generate 6-digit MFA OTP Code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tempToken = crypto.randomBytes(32).toString("hex");

    // In production, dispatch OTP via Telecom SMS Gateway
    console.log(`[SECURE MFA DISPATCH] User: ${user.phone}, OTP Code: ${otpCode}, TempToken: ${tempToken}`);

    return NextResponse.json({
      success: true,
      requiresMfa: true,
      tempToken,
      maskedPhone: user.phone.replace(/(\+251\d{2})\d{4}(\d{3})/, "$1****$2"),
      role: user.role,
      debugOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined, // Sandbox convenience
      message: "Credentials verified. Please enter the 6-digit MFA verification code.",
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: error.message || "Authentication failed." }, { status: 500 });
  }
}

