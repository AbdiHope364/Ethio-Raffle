import { NextRequest, NextResponse } from "next/server";
import { processPaymentSuccess } from "@/lib/payment";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { txRef, simulateStatus = "SUCCESS" } = await req.json();

    if (!txRef) {
      return NextResponse.json({ error: "txRef is required" }, { status: 400 });
    }

    if (simulateStatus === "SUCCESS") {
      const result = await processPaymentSuccess(txRef);
      return NextResponse.json({
        success: true,
        message: "Simulated payment successful!",
        result,
      });
    } else {
      await prisma.transaction.update({
        where: { txRef },
        data: { status: "FAILED" },
      });

      return NextResponse.json({
        success: false,
        message: "Simulated payment failure recorded.",
      });
    }
  } catch (error: any) {
    console.error("Simulation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

