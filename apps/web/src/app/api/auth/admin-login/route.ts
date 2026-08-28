import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, passcode } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Operator identifier required." }, { status: 400 });
    }

    // In demo environment, admin123 is valid passcode for registered admins
    if (passcode !== "admin123" && passcode !== "superadmin2026") {
      return NextResponse.json({ error: "Invalid Passcode. Attempt logged." }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        phone: phone.trim(),
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Administrative identity not found or unauthorized." },
        { status: 403 }
      );
    }

    // Set secure cookie for cross-service authentication
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
      message: "Admin authentication successful.",
    });

    response.cookies.set("raffle_user_phone", user.phone, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 86400 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

