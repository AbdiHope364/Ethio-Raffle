<div align="center">

![Dire Dawa University Logo](ddu_logo.jpg)

# DIRE DAWA UNIVERSITY
## INSTITUTE OF TECHNOLOGY (ድሬዳዋ ዩኒቨርሲቲ ቴክኖሎጂ ኢንስቲትዩት)
### SCHOOL OF COMPUTING (በኮምፒዩቲንግ ትምህርት ቤት)
### DEPARTMENT OF SOFTWARE ENGINEERING (የሶፍትዌር ምህንድስና ትምህርት ክፍል)

**P.O. Box:** 1362 | **Tel:** +251-9-10-78-3938 | **Fax:** +251-025-112-79-71 | **E-mail:** sinedos2001@gamil.com  
**Location:** Dire Dawa, Ethiopia

---

# FINAL INTERNSHIP TECHNICAL REPORT
## Course: Software Engineering Internship (SEng-4182)
### Title: Architecting & Engineering a High-Concurrency Multi-Vendor Digital Raffle Platform with Double-Entry Accounting and Provably Fair Cryptography
### Project: LuckyEthio (Idil) Enterprise Infrastructure
### Host Organization: SORARDI PLC

**Academic Year:** 2017/2018 E.C.  
**Submission Date:** 10/01/2018 E.C.  
**Student Name:** [Student Full Name]  
**Student ID:** [DDU/UGR/XXXX/XX]  
**Academic Advisor:** [Advisor Name, MSc/PhD]  
**Industry Supervisor:** [Supervisor Name, Lead Software Engineer]  

</div>

---

# TABLE OF CONTENTS
1. Cover Page
2. Acknowledgment
3. List of Acronyms & Abbreviations
4. Table of Contents
5. Introduction (Objectives, Academic Relevance)
6. Host Company Profile (SORARDI PLC)
7. Internship Activities & Engineering Roles
8. Technical Skills and Knowledge Utilized
9. Collaboration & Teamwork
10. Project Deep-Dive: LuckyEthio Platform
11. Challenges Encountered & Engineering Solutions
12. Contribution to SORARDI PLC
13. Conclusion & Recommendations
14. References
15. Technical Appendices

---

## 2. Acknowledgment
First and foremost, I offer my profound thanks to Almighty God for providing me the perseverance, good health, and intellectual clarity to successfully accomplish my Software Engineering internship and author this technical report.

I express my deepest appreciation to **Dire Dawa University, Institute of Technology (IoT), School of Computing, and the Department of Software Engineering** for curating a forward-looking curriculum and facilitating this vital industry attachment. Special gratitude is extended to my **Academic Advisor** for providing continuous academic oversight and constructive evaluation.

I am deeply indebted to **SORARDI PLC**, my **Industry Supervisor**, and the entire software engineering team. Their mentorship, willingness to share advanced system architecture knowledge, and confidence in assigning me core financial, cryptographic, and backend concurrency modules on the LuckyEthio digital platform were instrumental to the success of this internship.

---

## 3. List of Acronyms & Abbreviations
| Acronym | Full Definition |
| :--- | :--- |
| **API** | Application Programming Interface |
| **CBE** | Commercial Bank of Ethiopia |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **ECA** | Ethiopian Communications Authority |
| **ETB** | Ethiopian Birr |
| **HMAC** | Hash-based Message Authentication Code |
| **MoR** | Ministry of Revenues (Federal Democratic Republic of Ethiopia) |
| **NLA** | National Lottery Administration (Ethiopia) |
| **PDPP** | Personal Data Protection Proclamation (No. 1321/2024) |
| **POS** | Point of Sale |
| **RBAC** | Role-Based Access Control |
| **RNG** | Random Number Generator |
| **SHA** | Secure Hash Algorithm (e.g. SHA-256) |
| **USSD** | Unstructured Supplementary Service Data (e.g. `*804#`) |
| **VAT** | Value Added Tax (Statutory 15% Rate) |

---

## 5. Introduction
### 5.1 Purpose of the Internship
The Software Engineering Internship (SEng-4182) at Dire Dawa University is a cornerstone practical course designed to immerse students into enterprise software development workflows. The attachment allows students to apply theoretical knowledge from courses like *Database Systems*, *Web Engineering*, *Software Architecture*, and *Computer Security* directly to commercial systems.

### 5.2 Relevance to the Software Engineering Program
The internship program directly aligns with key courses in the Software Engineering curriculum:
* **Object-Oriented Software Engineering (SEng-3121):** Applying modular separation, adapter design patterns for payment gateways, and domain-driven design.
* **Database Systems & Management (CoSc-2082):** Designing normalized relational schemas, transaction isolation levels, atomic sequence locking, and double-entry accounting models using Prisma ORM.
* **Web Engineering (SEng-3132):** Developing modern full-stack web applications using Next.js 14 App Router, Server Components, client state management, and REST APIs.
* **Computer & Network Security (SEng-4151):** Implementing SHA-256 cryptographic commitments, HMAC signature verification for payment webhooks, dynamic QR code hashing, and Role-Based Access Control (RBAC).

---

## 6. Host Company Profile: SORARDI PLC
**SORARDI PLC** is an innovative Ethiopian software development and technology solutions enterprise specializing in modern web architectures, enterprise resource planning (ERP), digital financial systems, and high-concurrency cloud applications.

* **Mission:** To empower Ethiopian businesses and consumers with transparent, secure, and world-class digital platforms.
* **Core Products & Services:**
  1. *Customer Web & Mobile Portals:* High-speed ticketing and interactive claim interfaces.
  2. *Merchant Systems:* Multi-vendor inventory management, KYC compliance, and delivery verification.
  3. *Agent POS & USSD Gateways (`*804#`):* Field kiosk software and feature phone accessibility.
  4. *Enterprise Financial & Governance Consoles:* Double-entry bookkeeping, audit telemetry, and automated tax withholding.

---

## 7. Internship Activities & Engineering Roles
My primary responsibilities at SORARDI PLC centered around full-stack feature engineering, database architecture, and cryptographic protocol implementation:
1. **Monorepo Engineering:** Restructured the codebase into a modular `Turborepo` containing `apps/web`, `apps/admin`, `packages/database`, and `packages/shared`.
2. **Double-Entry Financial Ledger:** Engineered balanced ledger transactions (Debits = Credits) for ticket proceeds, 15% VAT escrow, seller holdings, and agent commissions.
3. **Atomic Ticket Concurrency:** Implemented database-level transaction locks (`tx.$transaction`) and composite unique constraints to guarantee zero overselling under high concurrency.
4. **Multi-Provider Payment Adapters:** Built unified provider adapters for Chapa, Telebirr, CBE Birr, and SantimPay with idempotent webhook handlers.
5. **Provably Fair RNG Engine:** Designed a multi-entropy commit-reveal formula with immutable `DrawSnapshot` state locks.
6. **Data Privacy Governance:** Implemented customer data rights workflows adhering to Ethiopian PDPP Proclamation No. 1321/2024.

---

## 8. Technical Skills Utilized
* **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons.
* **Backend & API:** Node.js, TypeScript, REST API Route Handlers, Signed Webhooks.
* **Database & Storage:** Prisma ORM, SQLite / PostgreSQL, Relational Normalization.
* **Financial Engineering:** Double-Entry General Ledger, Chart of Accounts, Trial Balance Verification.
* **Security & Cryptography:** SHA-256 Commitments, HMAC Signatures, Two-Person Authorization, Dynamic QR Tokens.
* **Project Management:** Agile Scrum, 2-Week Sprints, GitHub Pull Requests.

---

## 9. Collaboration & Teamwork
Working within SORARDI PLC's Agile Scrum framework, I actively participated in daily standups, code review sessions, and backlog refinement. Key collaborative milestones included re-engineering the mobile drawer navigation to float on the right-hand side, standardizing dual-consent seller draw agreements, and building the stealth administrative authentication portal.

---

## 10. Project Deep-Dive: LuckyEthio Platform Highlights
The platform decouples ticket purchasing into a robust multi-stage pipeline:

```
Customer Intent ──► PurchaseOrder (PUR-XXXX) ──► Payment Gateway (Chapa/Telebirr)
      ▲
      │ (Webhook Verified + Idempotency Guard)
      ▼
Atomic DB Transaction ──► Allocate Tickets (TKT-XXXX) ──► Double-Entry Ledger Posting
```

$$\text{Provably Fair Formula: Winner} = (\text{BigInt}(\text{SHA256}(\text{v2.0} : \text{RaffleID} : \text{SecretSeed} : \text{SoldTickets} : \text{PublicEntropy} : \text{Algorithm})) \pmod{\text{SoldTickets}}) + 1$$

---

## 11. Challenges Encountered & Engineering Solutions
* **Inventory Race Conditions:** Solved using database transactions (`tx.$transaction`) and unique composite constraints `UNIQUE(raffleId, ticketNumber)`.
* **Duplicate Payment Webhooks:** Solved by enforcing strict `idempotencyKey` tracking and unique `providerReference` lookups.
* **Ledger Imbalances:** Solved by enforcing strict double-entry balancing ($\text{Total Debits} = \text{Total Credits}$, $\Delta = 0.00$).

---

## 12. Contribution to SORARDI PLC
* Delivered 57 production Next.js routes (34 web pages, 23 admin pages) compiling with **zero TypeScript errors**.
* Configured Turborepo caching for lightning-fast builds.
* Authored comprehensive system manuals, API documentation, and user guides.

---

## 13. Conclusion & Recommendations
* **For SORARDI PLC:** Implement hardware security modules (HSM) for automated secret seed rotation and integrate telecom SMPP gateways.
* **For Dire Dawa University:** Incorporate enterprise monorepo tooling (Turborepo) and financial ledger design into advanced programming labs.

---

## 14. References
1. National Lottery Administration (NLA) of Ethiopia, *Proclamation No. 535/2007*.
2. Ethiopian Communications Authority (ECA), *Personal Data Protection Proclamation No. 1321/2024*.
3. Ministry of Revenues (MoR), *Value Added Tax (VAT) Proclamation No. 285/2002*.
4. Vercel & Next.js Core Team, *Next.js 14 App Router Documentation*, 2024.
5. Prisma ORM Team, *Prisma Client & Concurrency Documentation*, 2024.

---

## 15. Appendices
### Appendix A: Database Schema Summary
18 relational models: `Role`, `Permission`, `RolePermission`, `User`, `Seller`, `Agent`, `AgentLedger`, `AgentAccessLog`, `Raffle`, `PurchaseOrder`, `PaymentAttempt`, `Ticket`, `Transaction`, `LedgerAccount`, `LedgerTransaction`, `LedgerEntry`, `TaxLedger`, `CashoutRequest`, `DrawSnapshot`, `DrawAudit`, `TwoPersonApproval`, `AuditLog`, `RiskEvent`, `DataSubjectRequest`.

