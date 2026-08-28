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

    const count = ticketCount ? parseInt(ticketCount, 10) : (specificNumbers?.length || 1);

    if (!raffleId || count <= 0) {
      return NextResponse.json(
        { error: "Raffle ID and valid ticket count are required." },
        { status: 400 }
      );
    }

    const phone = customerPhone || session?.phone || "+251900000000";

    const payment = await initiatePayment({
      raffleId,
      userId: session?.userId,
      customerPhone: phone,
      ticketCount: count,
      specificNumbers,
      paymentMethod,
      soldByAgentId,
    });

    return NextResponse.json({
      success: true,
      ...payment,
      payment,
    });
  } catch (error: any) {
    console.error("Payment init error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
