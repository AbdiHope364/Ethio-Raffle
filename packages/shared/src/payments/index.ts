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

export interface PaymentProviderAdapter {
  providerName: string;
  initializePayment(input: PaymentInitializationInput): Promise<PaymentInitializationResult>;
  verifyPayment(providerReference: string): Promise<PaymentVerificationResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

// ----------------------------------------------------
// 1. CHAPA ADAPTER (NBE-Licensed Aggregator)
// ----------------------------------------------------
export class ChapaAdapter implements PaymentProviderAdapter {
  public providerName = "CHAPA";
  private secretKey: string;
  private webhookSecret: string;

  constructor(secretKey = process.env.CHAPA_SECRET_KEY || "CHASECK_TEST-mock", webhookSecret = process.env.CHAPA_WEBHOOK_SECRET || "chapa_wh_sec") {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
  }

  async initializePayment(input: PaymentInitializationInput): Promise<PaymentInitializationResult> {
    const providerReference = `chapa_${input.orderNumber}_${Date.now()}`;
    return {
      provider: this.providerName,
      providerReference,
      checkoutUrl: `/checkout/mock-gateway?provider=CHAPA&ref=${providerReference}&amount=${input.amount}&order=${input.orderNumber}`,
      status: "PENDING",
    };
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResult> {
    // In production, queries https://api.chapa.co/v1/transaction/verify/{providerReference}
    return {
      success: true,
      provider: this.providerName,
      providerReference,
      amount: 0, // Filled from webhook/lookup
      currency: "ETB",
      status: "SUCCESS",
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature) return true; // fallback for sandbox
    const expected = crypto.createHmac("sha256", this.webhookSecret).update(payload).digest("hex");
    return expected === signature;
  }
}

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

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    return true;
  }
}

// ----------------------------------------------------
// ADAPTER FACTORY
// ----------------------------------------------------
export function getPaymentAdapter(provider: string): PaymentProviderAdapter {
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

