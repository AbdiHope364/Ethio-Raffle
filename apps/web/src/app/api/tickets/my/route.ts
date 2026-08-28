import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let phone = searchParams.get("phone")?.trim();
    const code = searchParams.get("code")?.trim() || searchParams.get("verificationCode")?.trim();
    const txRef = searchParams.get("txRef")?.trim();

    const session = await getCurrentUser();
    if (!phone && session?.phone) {
      phone = session.phone;
    }

    // Normalizing Ethiopian phone number (e.g. 0911223344 -> +251911223344)
    let normalizedPhone = phone;
    if (phone && phone.startsWith("09")) {
      normalizedPhone = "+251" + phone.substring(1);
    } else if (phone && phone.startsWith("9") && phone.length === 9) {
      normalizedPhone = "+251" + phone;
    }

    // Construct search filter
    const whereConditions: any[] = [];

    if (code) {
      whereConditions.push({ verificationCode: code });
    }

    if (txRef) {
      whereConditions.push({ transaction: { txRef } });
    }

    if (phone || normalizedPhone) {
      whereConditions.push({ customerPhone: phone });
      if (normalizedPhone && normalizedPhone !== phone) {
        whereConditions.push({ customerPhone: normalizedPhone });
      }
      if (session?.userId) {
        whereConditions.push({ userId: session.userId });
      }
    }

    // If no specific phone, code, or session given, fallback to all verified tickets for demonstration or empty list
    let whereClause: any = {
      status: "CONFIRMED",
    };

    if (whereConditions.length > 0) {
      whereClause.OR = whereConditions;
    } else if (!session) {
      // Default: fetch the most recent confirmed tickets so guest buyer can view demo tickets
      whereClause.OR = [
        { customerPhone: "+251933445566" },
        { customerPhone: "+251944556677" },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            titleAm: true,
            prizeName: true,
            prizeImage: true,
            ticketPrice: true,
            drawDate: true,
            status: true,
            winningTicketNumber: true,
            commitHash: true,
            seller: {
              select: {
                businessName: true,
              },
            },
          },
        },
        soldByAgent: {
          select: {
            fullName: true,
            businessName: true,
          },
        },
        transaction: {
          select: {
            txRef: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      tickets,
      queriedPhone: phone || session?.phone || null,
      queriedCode: code || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
