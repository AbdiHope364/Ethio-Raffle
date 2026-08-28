# LuckyEthio Raffle Platform (Turborepo Monorepo)

A production-ready web platform for selling and managing raffle tickets in Ethiopia, featuring multi-channel ticketing, local Ethiopian payment integrations, verifiable random draws with SHA-256 commit-reveal mechanics, USSD feature phone interface (`*804#`), and full bilingual English & Amharic (አማርኛ) support.

---

## 🏛️ Monorepo Architecture

```
raffle-monorepo/
├── apps/
│   ├── web/        # Customer Portal, Agent POS & Kiosk, USSD Simulator (*804#), Public Verifier (Port 3000)
│   └── admin/      # Dedicated Admin Operations Portal, Live Draw Console, Financial Ledger, KYC (Port 3001)
├── packages/
│   ├── database/   # Shared Prisma ORM Schema, Client Singleton & Seed scripts
│   └── shared/     # Provably Fair SHA-256 Engine, Concurrency Mutex Queue, i18n (EN/AM), Payment Adapters
└── turbo.json      # Turborepo build & dev pipeline configuration
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (or 20+)
- npm / pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Push schema and generate Prisma client
npm run db:push

# Seed demo users, active raffles, agent wallets & draw audits
npm run db:seed
```

### 4. Run Development Servers
```bash
# Run both Web Client (3000) and Admin Portal (3001) concurrently
npm run dev
```

- **Web Client & Customer Portal**: [http://localhost:3000](http://localhost:3000)
- **Admin Operations Console**: [http://localhost:3001](http://localhost:3001)

### 5. Run Verification Test Suite
```bash
npx tsx scripts/test-platform.ts
```

---

## 🌟 Key Features

1. **Provably Fair SHA-256 Commit-Reveal RNG**:
   - $\text{CommitHash} = \text{SHA-256}(\text{SecretSeed} : \text{RaffleID} : \text{TotalTickets})$
   - $\text{Winner} = (\text{BigInt}(\text{SHA-256}(\text{Seed})) \pmod{\text{TotalSoldTickets}}) + 1$
   - Public validator tool at `/verifier` for regulators and players.

2. **Concurrency & Anti-Overselling**:
   - In-memory sequential queue per raffle and atomic database transactions guaranteeing zero duplicate numbers and zero overselling.

3. **Ethiopian Payment Integrations**:
   - Telebirr (Instant USSD / QR), CBE Birr, Chapa, SantimPay, and Agent Cash Float.

4. **Agent Sales Channel & POS**:
   - Physical kiosk ticketing, float balance ledger, automatic commission accruals, and USSD feature phone interface (`*804#`).

5. **Regulatory & Compliance**:
   - Designed in compliance with National Lottery Administration (NLA) standards, 18+ restrictions, and immutable audit logging.

---

## 📜 License
Licensed by National Lottery Administration (NLA/ETH/2026/89). All rights reserved.

