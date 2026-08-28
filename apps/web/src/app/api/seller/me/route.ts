import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const phoneCookie = req.cookies.get("raffle_user_phone")?.value;
    const phoneParam = req.nextUrl.searchParams.get("phone");
    const phone = phoneParam || phoneCookie;

    if (!phone) {
      // Fallback to first approved seller in demo mode if available
      const demoSeller = await prisma.seller.findFirst({
        include: { user: true },
      });
      if (demoSeller) {
        return NextResponse.json({ seller: demoSeller, user: demoSeller.user });
      }
      return NextResponse.json({ seller: null, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { phone: phone.trim() },
      include: { sellerProfile: true },
    });

    return NextResponse.json({
      user,
      seller: user?.sellerProfile || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

