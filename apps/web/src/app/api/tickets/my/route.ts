import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ tickets: [] });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { customerPhone: session.phone },
        ],
      },
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
          },
        },
        soldByAgent: {
          select: {
            fullName: true,
            businessName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
