export type UserRole =
  | "CUSTOMER"
  | "AGENT"
  | "SELLER"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "FINANCE_ADMIN"
  | "COMPLIANCE_ADMIN"
  | "DRAW_OPERATOR"
  | "AUDITOR";


export interface AuthSession {
  userId: string;
  phone: string;
  fullName: string;
  role: UserRole;
  agentProfileId?: string | null;
  agentStatus?: string | null;
  floatBalance?: number;
}

export const DEMO_ACCOUNTS = [
  {
    phone: "+251911000000",
    name: "Abebe Kebede",
    role: "SUPER_ADMIN" as UserRole,
    description: "Super Admin — Full system configuration & user management",
  },
  {
    phone: "+251911000001",
    name: "Sara Haile",
    role: "ADMIN" as UserRole,
    description: "Admin — Raffle operations, agent KYC approval, live draw trigger",
  },
  {
    phone: "+251912345678",
    name: "Dawit Tadesse",
    role: "AGENT" as UserRole,
    description: "Active Agent — Bole Kiosk (15,000 ETB float balance, 5% comm.)",
  },
  {
    phone: "+251922334455",
    name: "Mulugeta Bekele",
    role: "AGENT" as UserRole,
    description: "Pending Agent — Piazza Shop (Waiting for Admin approval)",
  },
  {
    phone: "+251933445566",
    name: "Helen Tesfaye",
    role: "CUSTOMER" as UserRole,
    description: "Customer 1 — Self-service online buyer",
  },
  {
    phone: "+251944556677",
    name: "Yohannes Girma",
    role: "CUSTOMER" as UserRole,
    description: "Customer 2 — Self-service buyer & past winner",
  },
];

