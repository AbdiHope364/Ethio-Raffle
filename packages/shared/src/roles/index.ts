/**
 * ============================================================================
 * GRANULAR ADMIN ROLES & ROLE-BASED ACCESS CONTROL (RBAC) (§10)
 * ============================================================================
 * Defines specialized administrative roles with principle of least privilege.
 */

export type AdminRole =
  | "SUPER_ADMIN"
  | "FINANCE_ADMIN"
  | "RAFFLE_ADMIN"
  | "SELLER_ADMIN"
  | "COMPLIANCE_ADMIN"
  | "SUPPORT_ADMIN"
  | "AUDITOR";

export type PermissionKey =
  // Finance Permissions
  | "payout:approve"
  | "payout:reject"
  | "refund:process"
  | "ledger:view"
  | "vat:reconcile"
  | "financial:export"
  // Raffle Permissions
  | "raffle:create"
  | "raffle:edit"
  | "raffle:moderate"
  | "ticket:manage"
  | "draw:schedule"
  | "draw:snapshot"
  | "draw:execute"
  // Seller & KYC Permissions
  | "seller:approve"
  | "seller:reject"
  | "kyc:review"
  | "seller:suspend"
  // Compliance & Privacy Permissions
  | "privacy:export"
  | "privacy:delete"
  | "audit:telemetry"
  | "compliance:report"
  // Support Permissions
  | "ticket:lookup"
  | "dispute:view"
  | "dispute:resolve"
  | "sms:resend"
  // Read-only / Audit
  | "audit:view"
  | "draw:verify"
  | "report:view"
  // Super Admin Master
  | "system:manage"
  | "role:assign"
  | "emergency:killswitch";

export const ROLE_PERMISSIONS: Record<AdminRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    "payout:approve", "payout:reject", "refund:process", "ledger:view", "vat:reconcile", "financial:export",
    "raffle:create", "raffle:edit", "raffle:moderate", "ticket:manage", "draw:schedule", "draw:snapshot", "draw:execute",
    "seller:approve", "seller:reject", "kyc:review", "seller:suspend",
    "privacy:export", "privacy:delete", "audit:telemetry", "compliance:report",
    "ticket:lookup", "dispute:view", "dispute:resolve", "sms:resend",
    "audit:view", "draw:verify", "report:view",
    "system:manage", "role:assign", "emergency:killswitch"
  ],
  FINANCE_ADMIN: [
    "payout:approve", "payout:reject", "refund:process", "ledger:view", "vat:reconcile", "financial:export",
    "report:view", "audit:view"
  ],
  RAFFLE_ADMIN: [
    "raffle:create", "raffle:edit", "raffle:moderate", "ticket:manage", "draw:schedule", "draw:snapshot", "draw:execute",
    "draw:verify", "report:view"
  ],
  SELLER_ADMIN: [
    "seller:approve", "seller:reject", "kyc:review", "seller:suspend", "report:view", "audit:view"
  ],
  COMPLIANCE_ADMIN: [
    "privacy:export", "privacy:delete", "audit:telemetry", "compliance:report", "audit:view", "draw:verify"
  ],
  SUPPORT_ADMIN: [
    "ticket:lookup", "dispute:view", "dispute:resolve", "sms:resend", "report:view"
  ],
  AUDITOR: [
    "ledger:view", "audit:view", "draw:verify", "report:view", "compliance:report"
  ],
};

/**
 * Checks if a given administrative role possesses a specific permission.
 */
export function hasPermission(role: string, permission: PermissionKey): boolean {
  if (role === "SUPER_ADMIN") return true;
  const permissions = ROLE_PERMISSIONS[role as AdminRole];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Checks if an operation is classified as High-Risk and requires step-up re-authentication.
 */
export function isSensitiveOperation(permission: PermissionKey): boolean {
  const sensitiveList: PermissionKey[] = [
    "draw:execute",
    "payout:approve",
    "refund:process",
    "privacy:delete",
    "emergency:killswitch",
    "role:assign"
  ];
  return sensitiveList.includes(permission);
}

