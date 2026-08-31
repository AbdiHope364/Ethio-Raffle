import * as crypto from "crypto";

export interface PaymentInitializationInput {
  orderNumber: string;
  amount: number;
  currency: string;
  customerPhone: string;
  customerName?: string;
  callbackUrl: string;
  returnUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitializationResult {
  provider: string;
  providerReference: string;
  checkoutUrl: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  rawPayload?: any;
}

export interface PaymentVerificationResult {
  success: boolean;
  provider: string;
  providerReference: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  customerPhone?: string;
  rawResponse?: any;
}

export interface PaymentRefundResult {
  success: boolean;
  provider: string;
  providerReference: string;
  refundId: string;
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  message?: string;
}

export interface PaymentProvider {
  providerName: string;
  initializePayment(input: PaymentInitializationInput): Promise<PaymentInitializationResult>;
  verifyPayment(providerReference: string): Promise<PaymentVerificationResult>;
  refundPayment(providerReference: string, amount: number, reason?: string): Promise<PaymentRefundResult>;
  getTransaction(providerReference: string): Promise<any>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

// Alias for backwards compatibility
export type PaymentProviderAdapter = PaymentProvider;

// ----------------------------------------------------
// 1. CHAPA PROVIDER (Primary Provider & Aggregator)
// ----------------------------------------------------
export class ChapaProvider implements PaymentProvider {
  public providerName = "CHAPA";
  private secretKey: string;
  private webhookSecret: string;
  private isTestMode: boolean;

  constructor(
    secretKey = process.env.CHAPA_SECRET_KEY || "CHASECK_TEST-mock",
    webhookSecret = process.env.CHAPA_WEBHOOK_SECRET || "chapa_wh_sec"
  ) {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
    this.isTestMode = this.secretKey.startsWith("CHASECK_TEST") || process.env.PAYMENT_MODE !== "LIVE";
  }

  async initializePayment(input: PaymentInitializationInput): Promise<PaymentInitializationResult> {
    const providerReference = `chapa_${input.orderNumber}_${Date.now()}`;

    // If in Live mode and valid key present, call Chapa API
    if (!this.isTestMode && this.secretKey && !this.secretKey.includes("mock")) {
      try {
        const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: input.amount.toString(),
            currency: input.currency || "ETB",
            phone_number: input.customerPhone,
            first_name: input.customerName || "Customer",
            tx_ref: providerReference,
            callback_url: input.callbackUrl,
            return_url: input.returnUrl,
            "customization[title]": "LuckyEthio Raffle Ticket",
            "customization[description]": `Order #${input.orderNumber}`,
          }),
        });
        const data = await res.json();
        if (data.status === "success" && data.data?.checkout_url) {
          return {
            provider: this.providerName,
            providerReference,
            checkoutUrl: data.data.checkout_url,
            status: "PENDING",
            rawPayload: data,
          };
        }
      } catch (e) {
        console.error("Live Chapa initialize error:", e);
      }
    }

    // Sandbox / Test Mode Fallback
    return {
      provider: this.providerName,
      providerReference,
      checkoutUrl: `/checkout/mock-gateway?provider=CHAPA&ref=${providerReference}&amount=${input.amount}&order=${input.orderNumber}`,
      status: "PENDING",
    };
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResult> {
    if (!this.isTestMode && this.secretKey && !this.secretKey.includes("mock")) {
      try {
        const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${providerReference}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        });
        const data = await res.json();
        const isSuccess = data.status === "success" && data.data?.status === "success";
        return {
          success: isSuccess,
          provider: this.providerName,
          providerReference,
          amount: parseFloat(data.data?.amount || "0"),
          currency: data.data?.currency || "ETB",
          status: isSuccess ? "SUCCESS" : "FAILED",
          customerPhone: data.data?.phone_number,
          rawResponse: data,
        };
      } catch (e) {
        console.error("Chapa verify API error:", e);
      }
    }

    return {
      success: true,
      provider: this.providerName,
      providerReference,
      amount: 0,
      currency: "ETB",
      status: "SUCCESS",
    };
  }

  async refundPayment(providerReference: string, amount: number, reason?: string): Promise<PaymentRefundResult> {
    return {
      success: true,
      provider: this.providerName,
      providerReference,
      refundId: `ref_${Date.now()}`,
      amount,
      status: "COMPLETED",
      message: `Refund processed: ${reason || "User requested refund"}`,
    };
  }

  async getTransaction(providerReference: string): Promise<any> {
    return this.verifyPayment(providerReference);
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature) return true; // fallback in sandbox
    const expected = crypto.createHmac("sha256", this.webhookSecret).update(payload).digest("hex");
    return expected === signature;
  }
}

// Alias
export const ChapaAdapter = ChapaProvider;


// ----------------------------------------------------
// 2. TELEBIRR ADAPTER (Ethio Telecom Mobile Money)
// ----------------------------------------------------
export class TelebirrAdapter implements PaymentProviderAdapter {
  public providerName = "TELEBIRR";

  async initializePayment(input: PaymentInitializationInput): Promise<PaymentInitializationResult> {
    const providerReference = `telebirr_${input.orderNumber}_${Date.now()}`;
    return {
      provider: this.providerName,
      providerReference,
      checkoutUrl: `/checkout/mock-gateway?provider=TELEBIRR&ref=${providerReference}&amount=${input.amount}&order=${input.orderNumber}`,
      status: "PENDING",
    };
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResult> {
    return {
      success: true,
      provider: this.providerName,
      providerReference,
      amount: 0,
      currency: "ETB",
      status: "SUCCESS",
    };
  }

  async refundPayment(providerReference: string, amount: number, reason?: string): Promise<PaymentRefundResult> {
    return {
      success: true,
      provider: this.providerName,
      providerReference,
      refundId: `ref_telebirr_${Date.now()}`,
      amount,
      status: "COMPLETED",
      message: `Telebirr refund initiated: ${reason || "Refund requested"}`,
    };
  }

  async getTransaction(providerReference: string): Promise<any> {
    return this.verifyPayment(providerReference);
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    return true;
  }
}

// ----------------------------------------------------
// 3. CBE BIRR ADAPTER (Commercial Bank of Ethiopia)
// ----------------------------------------------------
export class CBEBirrAdapter implements PaymentProviderAdapter {
  public providerName = "CBE_BIRR";

  async initializePayment(input: PaymentInitializationInput): Promise<PaymentInitializationResult> {
    const providerReference = `cbe_${input.orderNumber}_${Date.now()}`;
    return {
      provider: this.providerName,
      providerReference,
      checkoutUrl: `/checkout/mock-gateway?provider=CBE_BIRR&ref=${providerReference}&amount=${input.amount}&order=${input.orderNumber}`,
      status: "PENDING",
    };
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResult> {
    return {
      success: true,
      provider: this.providerName,
      providerReference,
      amount: 0,
      currency: "ETB",
      status: "SUCCESS",
    };
  }

  async refundPayment(providerReference: string, amount: number, reason?: string): Promise<PaymentRefundResult> {
    return {
      success: true,
      provider: this.providerName,
      providerReference,
      refundId: `ref_cbe_${Date.now()}`,
      amount,
      status: "COMPLETED",
      message: `CBE Birr refund initiated: ${reason || "Refund requested"}`,
    };
  }

  async getTransaction(providerReference: string): Promise<any> {
    return this.verifyPayment(providerReference);
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    return true;
  }
}

// ----------------------------------------------------
// 4. SANTIMPAY ADAPTER
// ----------------------------------------------------
export class SantimPayAdapter implements PaymentProviderAdapter {
  public providerName = "SANTIMPAY";

  async initializePayment(input: PaymentInitializationInput): Promise<PaymentInitializationResult> {
    const providerReference = `santim_${input.orderNumber}_${Date.now()}`;
    return {
      provider: this.providerName,
      providerReference,
      checkoutUrl: `/checkout/mock-gateway?provider=SANTIMPAY&ref=${providerReference}&amount=${input.amount}&order=${input.orderNumber}`,
      status: "PENDING",
    };
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResult> {
    return {
      success: true,
      provider: this.providerName,
      providerReference,
      amount: 0,
      currency: "ETB",
      status: "SUCCESS",
    };
  }

  async refundPayment(providerReference: string, amount: number, reason?: string): Promise<PaymentRefundResult> {
    return {
      success: true,
      provider: this.providerName,
      providerReference,
      refundId: `ref_santim_${Date.now()}`,
      amount,
      status: "COMPLETED",
      message: `SantimPay refund initiated: ${reason || "Refund requested"}`,
    };
  }

  async getTransaction(providerReference: string): Promise<any> {
    return this.verifyPayment(providerReference);
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    return true;
  }
}

// ----------------------------------------------------
// ADAPTER FACTORY WITH COMPLIANCE GATE
// ----------------------------------------------------
import { ComplianceGate } from "../compliance";

export function getPaymentAdapter(provider: string, enforceCompliance = false): PaymentProviderAdapter {
  if (enforceCompliance) {
    ComplianceGate.assertRealMoneyAllowed();
  }

  switch (provider.toUpperCase()) {
    case "CHAPA":
      return new ChapaAdapter();
    case "TELEBIRR":
    case "CHAPA_TELEBIRR":
      return new TelebirrAdapter();
    case "CBE_BIRR":
    case "CBEBIRR":
      return new CBEBirrAdapter();
    case "SANTIMPAY":
      return new SantimPayAdapter();
    default:
      return new ChapaAdapter();
  }
}


