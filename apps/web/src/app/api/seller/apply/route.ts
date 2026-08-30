import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      businessName,
      contactPerson,
      tinNumber,
      licenseRef,
      faydaIdNumber,
      faydaIdDocUrl,
      region = "Addis Ababa",
      payoutAccount,
    } = body;

    if (!phone || !businessName || !contactPerson) {
      return NextResponse.json(
        { error: "Phone number, Business Name, and Contact Person are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          fullName: contactPerson,
          role: "SELLER",
          status: "ACTIVE",
          kycStatus: "PENDING_VERIFICATION",
        },
      });
    } else {
      // Update role to SELLER if not already admin
      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "SELLER", kycStatus: "PENDING_VERIFICATION" },
        });
      }
    }

    // Check if seller profile already exists
    const existingSeller = await prisma.seller.findUnique({
      where: { userId: user.id },
    });

    if (existingSeller) {
      return NextResponse.json({
        success: true,
        seller: existingSeller,
        message: `Seller application exists with status: ${existingSeller.status}`,
      });
    }

    // Create new seller profile with PENDING status
    const seller = await prisma.seller.create({
      data: {
        userId: user.id,
        businessName,
        contactPerson,
        phone: cleanPhone,
        tinNumber: tinNumber || undefined,
        licenseRef: licenseRef || undefined,
        faydaIdNumber: faydaIdNumber || undefined,
        faydaIdDocUrl: faydaIdDocUrl || undefined,
        region,
        payoutAccount: payoutAccount || undefined,
        status: "PENDING",
      },
    });

    const response = NextResponse.json({
      success: true,
      seller,
      message: "Application submitted successfully. Awaiting administrative verification.",
    });

    response.cookies.set("raffle_user_phone", cleanPhone, {
      path: "/",
      maxAge: 86400 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Seller application error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

