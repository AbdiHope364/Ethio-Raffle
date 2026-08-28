import { NextRequest, NextResponse } from "next/server";
import { executeAtomicTicketPurchase } from "@/lib/concurrency";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await req.json();

    const {
      raffleId,
      customerPhone,
      ticketCount,
      specificNumbers,
      paymentMethod = "TELEBIRR",
    } = body;

    if (!raffleId || !ticketCount) {
      return NextResponse.json(
        { error: "Raffle ID and ticket count are required." },
        { status: 400 }
      );
    }

    const phone = customerPhone || session?.phone || "+251900000000";

    const result = await executeAtomicTicketPurchase({
      raffleId,
      userId: session?.userId,
      customerPhone: phone,
      ticketCount: parseInt(ticketCount, 10),
      specificNumbers,
      paymentMethod,
      purchaseMethod: "ONLINE",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      tickets: result.tickets,
      transaction: result.transaction,
    });
  } catch (error: any) {
    console.error("Ticket purchase API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

