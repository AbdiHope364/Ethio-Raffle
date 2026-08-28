import { NextRequest, NextResponse } from "next/server";
import { handleUSSD } from "@/lib/ussd";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId = `sess_${Date.now()}`,
      phoneNumber = "+251912345678",
      text = "",
    } = body;

    const response = await handleUSSD({
      sessionId,
      phoneNumber,
      text,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("USSD API error:", error);
    return NextResponse.json(
      { message: "USSD service temporarily unavailable. Please try again.", continueSession: false },
      { status: 500 }
    );
  }
}

