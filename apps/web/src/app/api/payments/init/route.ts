import { NextRequest, NextResponse } from "next/server";
import { initiatePayment } from "@/lib/payment";
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
      paymentMethod = "CHAPA",
      soldByAgentId,
    } = body;

    if (!raffleId || !ticketCount) {
      return NextResponse.json(
        { error: "Raffle ID and ticket count are required." },
        { status: 400 }
      );
    }

    const phone = customerPhone || session?.phone || "+251900000000";

    const payment = await initiatePayment({
      raffleId,
      userId: session?.userId,
      customerPhone: phone,
      ticketCount: parseInt(ticketCount, 10),
      specificNumbers,
      paymentMethod,
      soldByAgentId,
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error("Payment init error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

