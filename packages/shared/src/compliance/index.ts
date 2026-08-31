/**
 * ============================================================================
 * COMPLIANCE & LEGAL PRODUCTION GATE (§01)
 * ============================================================================
 * Enforces strict separation between Development/Sandbox (Test Mode) and Real Money.
 *
 * PRODUCTION GATE CHECKLIST:
 * 1. Legal Verification (National Lottery Administration Proclamation No. 535/2007)
 * 2. License / Permit Issued & Active (Configurable legal status, not hardcoded)
 * 3. Business Registration Validated (Ministry of Trade & Regional Integration)
 * 4. Payment Provider Formal Merchant Approval (Telebirr / CBE / Chapa / SantimPay)
 * 5. Ministry of Revenues (MoR) 15% VAT Tax/Accounting Integration Approved
 *
 * UNTIL ALL 5 GATES ARE MET, SYSTEM IS LOCKED IN TEST MODE.
 */

export type EnvironmentMode = "TEST" | "STAGING" | "LIVE";

export interface ComplianceGateStatus {
  paymentMode: EnvironmentMode;
  legalVerification: boolean;
  licensePermitStatus: "NOT_ISSUED" | "PENDING_VERIFICATION" | "ACTIVE" | "EXPIRED";
  permitNumber: string | null;
  businessRegistrationValid: boolean;
  paymentProviderApproval: boolean;
  taxAccountingApproval: boolean;
  isReadyForRealMoney: boolean;
  rejectionReasons: string[];
}

export class ComplianceGate {
  /**
   * Retrieves the current compliance state based on configuration and environment.
   */
  static getStatus(): ComplianceGateStatus {
    const paymentMode = (process.env.PAYMENT_MODE || "TEST").toUpperCase() as EnvironmentMode;
    const legalVerification = process.env.LEGAL_VERIFICATION_VERIFIED === "true";
    const licensePermitStatus = (process.env.NLA_LICENSE_STATUS || "PENDING_VERIFICATION") as ComplianceGateStatus["licensePermitStatus"];
    const permitNumber = process.env.NLA_PERMIT_NUMBER || null;
    const businessRegistrationValid = process.env.BUSINESS_REGISTRATION_VERIFIED === "true";
    const paymentProviderApproval = process.env.PAYMENT_PROVIDER_MERCHANT_APPROVED === "true";
    const taxAccountingApproval = process.env.TAX_ACCOUNTING_INTEGRATION_APPROVED === "true";

    const rejectionReasons: string[] = [];

    if (paymentMode === "LIVE") {
      if (!legalVerification) {
        rejectionReasons.push("Gate 1 Failed: Legal verification with NLA regulatory body is not confirmed.");
      }
      if (licensePermitStatus !== "ACTIVE" || !permitNumber) {
        rejectionReasons.push("Gate 2 Failed: National Lottery Administration (NLA) operational permit is not in ACTIVE status.");
      }
      if (!businessRegistrationValid) {
        rejectionReasons.push("Gate 3 Failed: Commercial business registration is unverified.");
      }
      if (!paymentProviderApproval) {
        rejectionReasons.push("Gate 4 Failed: Commercial merchant acquiring agreement with payment aggregator is pending approval.");
      }
      if (!taxAccountingApproval) {
        rejectionReasons.push("Gate 5 Failed: Statutory 15% VAT withholding and tax escrow accounting integration is pending sign-off.");
      }
    }

    const isReadyForRealMoney = paymentMode === "LIVE" && rejectionReasons.length === 0;

    return {
      paymentMode,
      legalVerification,
      licensePermitStatus,
      permitNumber,
      businessRegistrationValid,
      paymentProviderApproval,
      taxAccountingApproval,
      isReadyForRealMoney,
      rejectionReasons,
    };
  }

  /**
   * Asserts that real money processing is legally authorized.
   * Throws an error if attempted in TEST mode or with unverified compliance gates.
   */
  static assertRealMoneyAllowed(): void {
    const status = ComplianceGate.getStatus();
    if (status.paymentMode !== "LIVE") {
      throw new Error(
        "REAL MONEY DISALLOWED: Platform is configured in TEST MODE (Sandbox / Simulated Money). Switch PAYMENT_MODE=LIVE only after regulatory approval."
      );
    }
    if (!status.isReadyForRealMoney) {
      throw new Error(
        `COMPLIANCE GATE REJECTION: Real money transaction blocked due to unverified regulatory requirements: ${status.rejectionReasons.join(" | ")}`
      );
    }
  }
}

