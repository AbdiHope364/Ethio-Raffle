/**
 * ============================================================================
 * INPUT VALIDATION SCHEMAS USING ZOD (§11)
 * ============================================================================
 * Strict server-side runtime type validation for all sensitive API endpoints.
 */

import { z } from "zod";

// Ethiopian Phone Regex (+2519... or 09... or 07...)
const ethiopianPhoneRegex = /^(\+251|0)(9|7)\d{8}$/;

export const AdminLoginSchema = z.object({
  identifier: z.string().min(3, "Identifier must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const MFAVerificationSchema = z.object({
  tempToken: z.string().min(10, "Temporary session token required"),
  otpCode: z.string().length(6, "MFA code must be exactly 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

export const StepUpReAuthSchema = z.object({
  password: z.string().min(6, "Password required for sensitive action"),
  action: z.string().min(2, "Action description required"),
});

export const OrderCreationSchema = z.object({
  raffleId: z.string().uuid("Invalid raffle UUID format"),
  ticketQuantity: z.number().int().min(1, "Minimum 1 ticket").max(500, "Maximum 500 tickets per transaction"),
  selectedNumbers: z.array(z.number().int().positive()).optional(),
  customerPhone: z.string().regex(ethiopianPhoneRegex, "Must be a valid Ethiopian mobile number (+2519... or +2517...)"),
  paymentProvider: z.enum(["CHAPA", "TELEBIRR", "CBE_BIRR", "SANTIMPAY"]),
  idempotencyKey: z.string().min(8, "Idempotency key required"),
});

export const PaymentInitSchema = z.object({
  orderNumber: z.string().min(3),
  provider: z.enum(["CHAPA", "TELEBIRR", "CBE_BIRR", "SANTIMPAY"]),
  customerPhone: z.string().regex(ethiopianPhoneRegex),
});

export const DrawExecutionSchema = z.object({
  raffleId: z.string().uuid(),
  secretSeed: z.string().min(8, "Revealed secret seed required"),
  publicEntropy: z.string().min(4, "Public entropy string required"),
  operatorPin: z.string().min(4, "Operator authorization PIN required"),
});

export const SellerRegistrationSchema = z.object({
  businessName: z.string().min(3, "Business name required"),
  businessType: z.string().min(2),
  tinNumber: z.string().min(9, "Valid 10-digit TIN required"),
  faydaIdNumber: z.string().min(8, "Fayda National ID required"),
  licenseRef: z.string().min(4, "Trade license reference required"),
  region: z.string().min(2),
  contactPhone: z.string().regex(ethiopianPhoneRegex),
  payoutAccount: z.string().min(5, "Settlement account number required"),
});

