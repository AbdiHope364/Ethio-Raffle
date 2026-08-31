import { NextResponse } from "next/server";
import { prisma } from "@raffle/database";
import { TicketReservationService } from "@raffle/shared";

export async function GET() {
  try {
    const result = await TicketReservationService.releaseExpiredReservations(prisma);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredReservationsReleased: result.expiredCount,
    });
  } catch (error: any) {
    console.error("Cron reservation release error:", error);
    return NextResponse.json({ error: error.message || "Failed to release reservations." }, { status: 500 });
  }
}

