# LuckyEthio (Idil) — Enterprise Digital Raffle & Financial Marketplace Infrastructure

An enterprise-grade, high-concurrency multi-vendor digital raffle platform and double-entry financial ledger engineered for the Ethiopian market. Built with decoupled purchase pipelines, multi-entropy cryptographic draw proofs, atomic ticket allocation, two-person governance rules, and automated statutory tax escrow (Ministry of Revenues & National Lottery Administration compliance).

---

## 🏛️ System Architecture

```
luckyethio/
├── apps/
│   ├── web/            # Customer Portal, POS Kiosk, USSD Simulator (*804#), Public Verifier (Port 3000)
│   └── admin/          # Admin Operations, Double-Entry Finance, Live Draw & Two-Person Console (Port 3001)
├── packages/
│   ├── database/       # Prisma ORM Schema, Double-Entry Chart of Accounts & Seed Dataset
│   └── shared/         # Enterprise Core Engine:
│       ├── ledger/     # Double-entry financial accounting (Debits = Credits)
│       ├── payments/   # Provider adapters (Chapa, Telebirr, CBE Birr, SantimPay)
│       ├── fair-rng/   # Multi-entropy commit-reveal RNG & immutable snapshot engine
│       ├── risk/       # Fraud risk scoring engine (0-100 Low/Review/Block)
│       ├── audit/      # Append-only immutable audit event stream
│       ├── two-person/ # Two-Person Rule authorization engine
│       ├── i18n/       # First-class bilingual English & Amharic (አማርኛ) dictionaries
│       └── ussd/       # Formal USSD (*804#) session state machine
└── turbo.json          # Monorepo build and development pipelines
```

---

## 🔐 Core Enterprise Security & Architecture Principles

### 1. Decoupled Purchase $\rightarrow$ Payment $\rightarrow$ Atomic Ticket Allocation Pipeline
```
Customer Intent → PurchaseOrder (PENDING)
       ↓
PaymentAttempt → Payment Gateway (Chapa/Telebirr/CBE)
       ↓
Server-Side Signed Webhook Verification + Idempotency Guard
       ↓
Atomic Ticket Allocation (Inside DB Transaction with UNIQUE(raffleId, ticketNumber))
       ↓
Double-Entry Ledger Journal Posting (Balanced Debits & Credits)
       ↓
Instant SMS Delivery + Opaque Signed QR Verification URL
```

### 2. Double-Entry Financial Ledger (§03)
Every single Ethiopian Birr (ETB) flowing through LuckyEthio is balanced across formal Chart of Accounts:
- **`1010-CASH-TRANSIT`** (Asset): Payment Gateway clearing balance.
- **`2010-PRIZE-ESCROW`** (Liability): Seller proceeds locked in escrow until verified QR handover.
- **`2020-VAT-PAYABLE`** (Liability): Statutory 15% Ethiopian VAT deducted at source for Ministry of Revenues (MoR).
- **`2030-AGENT-COMMISSION`** (Liability): Commission payable to POS kiosk network.
- **`4010-PLATFORM-REVENUE`** (Revenue/Equity): Operating platform fee.

### 3. Multi-Entropy Provably Fair RNG & Immutable Draw Snapshot (§05 & §06)
- **Pre-Commitment**: Initial digital seal published before ticket #1:
  $$\text{Commitment} = \text{SHA-256}(\text{Version} : \text{RaffleID} : \text{SecretSeed} : \text{TotalTickets} : \text{PublicEntropy} : \text{Algorithm})$$
- **Immutable Snapshot**: When sales close, ticket universe is hashed into `DrawSnapshot` (freezing eligible tickets).
- **Multi-Entropy Draw Calculation**:
  $$\text{Winner} = (\text{BigInt}(\text{SHA-256}(\text{Version} : \text{RaffleID} : \text{RevealedSeed} : \text{SoldTickets} : \text{PublicEntropy} : \text{Algorithm})) \pmod{\text{SoldTickets}}) + 1$$
- Public 1-click independent cryptographic verification available on `/verifier`.

### 4. Two-Person Rule for High-Value Governance (§09)
Critical operations require dual authorization:
- **Draw Execution**: Initiated by `DRAW_OPERATOR` $\rightarrow$ Approved by `SUPER_ADMIN`.
- **Seller Cashout Disbursements**: Initiated by `OPERATIONS_ADMIN` $\rightarrow$ Approved by `FINANCE_ADMIN`.
- **Under-Subscribed Raffles**: Dual-consent required by both Seller and Admin.

### 5. Fraud & Risk Monitoring Engine (§17)
- Real-time heuristic scoring (0 to 100).
- **0–30 (LOW)**: Instant auto-approval.
- **31–70 (REVIEW)**: Velocity anomaly flagged in Admin Risk Console.
- **71–100 (BLOCK)**: Immediate checkout hold and dispute arbitration.

### 6. Personal Data Protection (PDPP No. 1321/2024 Compliance)
- Full support for statutory Data Subject Rights: Right of Access, Rectification, Erasure (Deletion), and Objection.
- Customer request portal at `/privacy/data-request`.
- Admin Data Governance & Privacy Console at `/privacy`.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ or 20+
- npm / pnpm

### 2. Installation & Database Migration
```bash
# 1. Install monorepo dependencies
npm install

# 2. Push Prisma database schema
npm run db:push

# 3. Seed double-entry chart of accounts, users, active raffles & audits
npm run db:seed
```

### 3. Launch Development Servers
```bash
# Runs Customer Portal (Port 3000) and Stealth Admin Console (Port 3001)
npm run dev
```

- **Customer Web App & Verifier**: [http://localhost:3000](http://localhost:3000)
- **Admin Operations Console**: [http://localhost:3001](http://localhost:3001) (Stealth Access Hotkey: `Ctrl + Shift + A`)

### 4. Production Build Verification
```bash
npm run build
```

---

## ⚖️ Regulatory Status & Legal Framework

> **Regulatory Notice**: This software infrastructure is engineered to comply with applicable Ethiopian lottery regulations under the National Lottery Administration (NLA) Proclamation No. 535/2007, the Ethiopian Personal Data Protection Proclamation No. 1321/2024 (ECA), and Ministry of Revenues (MoR) source-deducted statutory VAT tax withholding. Production commercial operation is subject to obtaining and maintaining all required regulatory authorizations, operational permits, and payment provider agreements.
