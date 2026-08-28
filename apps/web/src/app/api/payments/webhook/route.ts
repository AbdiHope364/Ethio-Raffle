import { NextRequest, NextResponse } from "next/server";
import { processPaymentSuccess, verifyWebhookSignature } from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-chapa-signature") || req.headers.get("x-signature") || "";
    const secretKey = process.env.CHAPA_WEBHOOK_SECRET || "mock_webhook_secret_ethiopia_raffle";

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { tx_ref, status } = payload;
    if (!tx_ref) {
      return NextResponse.json({ error: "Missing tx_ref in webhook" }, { status: 400 });
    }

    // Optional signature verification check in development/testing
    if (signature && process.env.NODE_ENV === "production") {
      const isValid = verifyWebhookSignature(rawBody, signature, secretKey);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    if (status === "success" || status === "SUCCESS") {
      const result = await processPaymentSuccess(tx_ref);
      return NextResponse.json({
        success: true,
        message: "Payment processed and tickets minted",
        data: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Ignored status: ${status}`,
      });
    }
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

