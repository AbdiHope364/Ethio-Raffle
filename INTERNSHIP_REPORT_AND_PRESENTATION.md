# DIRE DAWA UNIVERSITY
## INSTITUTE OF TECHNOLOGY (ድሬዳዋ ዩኒቨርሲቲ ቴክኖሎጂ ኢንስቲትዩት)
### SCHOOL OF COMPUTING (በኮምፒዩቲንግ ትምህርት ቤት)
### DEPARTMENT OF SOFTWARE ENGINEERING (የሶፍትዌር ምህንድስና ትምህርት ክፍል)

**P.O. Box:** 1362 | **Tel:** +251-9-10-78-3938 | **Fax:** +251-025-112-79-71 | **E-mail:** sinedos2001@gamil.com  
**Location:** Dire Dawa, Ethiopia

---

# FINAL INTERNSHIP REPORT & PRESENTATION GUIDE
## Title: Software Engineering Internship Presentation & Technical Report
### Project: LuckyEthio (Idil) — Enterprise Digital Raffle & Double-Entry Financial Marketplace Platform

**Academic Year:** 2017/2018 E.C.  
**Submission Date:** 10/01/2018 E.C.  
**Presentation Date:** 12/01/2018 E.C.  
**Department:** Software Engineering  
**Target Organization:** LuckyEthio FinTech & Digital Gaming Solutions PLC (Addis Ababa / Remote, Ethiopia)  

---

# ==========================================
# PART ONE: COMPREHENSIVE INTERNSHIP REPORT
# ==========================================

## 1. Report Cover Page
* **Institution:** Dire Dawa University, Institute of Technology
* **Faculty:** School of Computing, Department of Software Engineering
* **Course:** Software Engineering Internship (SEng-4182)
* **Report Title:** Software Engineering Internship Presentation & Final Project Report: *Architecting and Engineering a High-Concurrency Multi-Vendor Digital Raffle Platform with Double-Entry Accounting and Provably Fair Cryptography*
* **Student Name:** [Student Full Name]
* **Student ID Number:** [DDU/UGR/XXXX/XX]
* **Host Organization:** LuckyEthio Digital Solutions & FinTech PLC
* **Internship Period:** Sene 01, 2017 E.C. – Meskerem 05, 2018 E.C. (4 Months)
* **Academic Advisor:** [Advisor Name, MSc/PhD]
* **Host Company Supervisor:** [Industry Supervisor Name, Lead Software Engineer]
* **Date of Submission:** 10/01/2018 E.C.

---

## 2. Acknowledgment
First and foremost, I would like to express my deepest gratitude to the Almighty God for providing me with the strength, health, and wisdom to successfully complete my internship and this technical report.

I would like to extend my heartfelt appreciation to **Dire Dawa University, Institute of Technology (IoT), School of Computing, and the Department of Software Engineering** for designing a comprehensive academic curriculum and offering this internship program, which bridges theoretical software engineering concepts with industry practice.

My sincere gratitude goes to my **Academic Advisor** for their constructive guidance, continuous feedback, and mentorship throughout the internship semester. 

Special thanks and appreciation are extended to the management and engineering staff at **LuckyEthio Digital Solutions PLC**, especially my **Industry Supervisor** and the development team, who warmly welcomed me, shared their rich industry experience, provided access to modern cloud development tools, and entrusted me with core production-level responsibilities on the **LuckyEthio (Idil)** digital raffle and financial transaction platform.

Finally, I express my gratitude to my family and fellow software engineering classmates for their continuous encouragement and moral support.

---

## 3. List of Acronyms & Abbreviations
* **API:** Application Programming Interface
* **CBE:** Commercial Bank of Ethiopia
* **CI/CD:** Continuous Integration / Continuous Deployment
* **CRUD:** Create, Read, Update, Delete
* **ECA:** Ethiopian Communications Authority
* **ETB:** Ethiopian Birr
* **HMAC:** Hash-based Message Authentication Code
* **JSON:** JavaScript Object Notation
* **KYC:** Know Your Customer
* **MoR:** Ministry of Revenues (Ethiopia)
* **MVC:** Model-View-Controller
* **NLA:** National Lottery Administration (Ethiopia)
* **NBE:** National Bank of Ethiopia
* **ORM:** Object-Relational Mapping
* **PDPP:** Personal Data Protection Proclamation (No. 1321/2024)
* **POS:** Point of Sale
* **QR:** Quick Response (Code)
* **RBAC:** Role-Based Access Control
* **REST:** Representational State Transfer
* **RNG:** Random Number Generator
* **SE:** Software Engineering
* **SHA:** Secure Hash Algorithm (e.g., SHA-256)
* **SMS:** Short Message Service
* **SQL:** Structured Query Language
* **UI/UX:** User Interface / User Experience
* **USSD:** Unstructured Supplementary Service Data (e.g., `*804#`)
* **VAT:** Value Added Tax (Statutory 15%)

---

## 4. Table of Contents
1. Executive Summary
2. Chapter 1: Introduction
   - 1.1 Purpose and Objectives of the Internship
   - 1.2 Relevance to Software Engineering Curriculum
3. Chapter 2: Company Profile & Organizational Background
   - 2.1 Industry Overview & Market Context
   - 2.2 Host Company Services and Mission
   - 2.3 Organizational Structure and Team Placement
4. Chapter 3: Internship Activities & Roles
   - 3.1 Overview of Roles and Responsibilities
   - 3.2 Key Projects Participated In
   - 3.3 Development Processes & Methodologies (Agile / Scrum)
   - 3.4 Tools, Frameworks, and Technologies Used
5. Chapter 4: Technical Skills and Knowledge Utilized
   - 4.1 Frontend Engineering (Next.js 14, React, Tailwind CSS, Lucide Icons)
   - 4.2 Backend & Distributed Services (Node.js, TypeScript, REST APIs)
   - 4.3 Database Architecture & ORM (Prisma ORM, SQLite / PostgreSQL)
   - 4.4 Financial Engineering (Double-Entry General Ledger, Chart of Accounts)
   - 4.5 Applied Cryptography & Security (Provably Fair Multi-Entropy RNG, SHA-256, HMAC Webhooks)
   - 4.6 Soft Skills & Professional Communication
6. Chapter 5: Collaboration, Teamwork & Significant Contributions
   - 5.1 Team Dynamics and Code Reviews
   - 5.2 Specific Engineering Achievements
7. Chapter 6: Deep Dive: The LuckyEthio Platform Project
   - 6.1 Problem Statement
   - 6.2 Solution Architecture & System Design
   - 6.3 Decoupled Purchase & Atomic Concurrency Allocation Pipeline
   - 6.4 Provably Fair Draw Mechanics & Cryptographic Snapshot
   - 6.5 Multi-Role Administrative Governance & Two-Person Consensus
8. Chapter 7: Challenges Encountered & Engineering Solutions
   - 7.1 Database Race Conditions & Inventory Overselling
   - 7.2 Financial Ledger Imbalances
   - 7.3 Multi-Channel Access & USSD State Handling
9. Chapter 8: Value Added to the Host Organization
   - 8.1 Production Codebase & Monorepo Infrastructure
   - 8.2 Technical Documentation & System Guides
10. Chapter 9: Conclusion & Recommendations
    - 9.1 Summary of Experience
    - 9.2 Recommendations for the Host Company
    - 9.3 Recommendations for Dire Dawa University
    - 9.4 Career Impact and Future Outlook
11. References
12. Appendices (Architecture Diagrams, Data Schemas, UI Previews)

---

## 5. Introduction
### 5.1 Purpose of the Internship
Practical internship experience is an indispensable pillar of the Bachelor of Science in Software Engineering degree at Dire Dawa University. The primary purpose of this 4-month professional attachment is to transition students from classroom theory to professional software development environments. It allows students to:
1. Apply software engineering methodologies, design patterns, clean coding standards, and architectural paradigms to real-world commercial problems.
2. Experience agile sprint rhythms, daily standups, collaborative code reviews, and enterprise version control systems.
3. Understand regulatory, financial, legal, and security considerations involved in building fintech and digital gaming platforms in Ethiopia.
4. Enhance critical thinking, technical problem-solving, teamwork, and communication skills.

### 5.2 Relevance to the Software Engineering Program
The internship program directly aligns with key courses in the Software Engineering curriculum, including:
* **Object-Oriented Software Engineering & Design Patterns (SEng-3121):** Applying modular separation, adapter design patterns for payment gateways, and domain-driven design.
* **Database Systems & Management (CoSc-2082):** Designing normalized relational schemas, transaction isolation levels, atomic sequence locking, and double-entry accounting models using Prisma ORM.
* **Web Engineering & Distributed Systems (SEng-3132):** Developing modern full-stack web applications using Next.js 14 App Router, Server Components, client state management, and REST APIs.
* **Computer & Network Security (SEng-4151):** Implementing SHA-256 cryptographic commitments, HMAC signature verification for payment webhooks, dynamic QR code hashing, and Role-Based Access Control (RBAC).
* **Software Project Management (SEng-4171):** Working within Agile/Scrum teams using GitHub pull requests, milestone planning, and issue tracking.

---

## 6. Company Background [Profile]
### 6.1 Industry Overview
The Ethiopian digital economy is experiencing unprecedented growth, accelerated by the expansion of mobile broadband, the National Digital Payments Strategy, and the adoption of mobile money platforms like **Telebirr**, **CBE Birr**, and **Chapa**. However, the traditional lottery and promotional raffle sector has historically relied on physical paper tickets, manual drum draws, and centralized draws that lack real-time public transparency, automated statutory tax withholding, and independent digital verification.

### 6.2 Host Company: LuckyEthio Digital Solutions PLC
**LuckyEthio** is a pioneer Ethiopian technology startup focused on building transparent, cryptographically verifiable, and regulatory-compliant digital raffle marketplaces, point-of-sale agent networks, and financial transaction engines.

* **Vision:** To become East Africa's most trusted, transparent, and accessible digital promotional raffle and ticketing marketplace.
* **Core Products & Services:**
  1. *Customer Web & Mobile Portal:* Self-service raffle browsing, instant digital ticketing, and winner claim console.
  2. *Merchant Seller Portal:* Multi-vendor car, electronics, and real estate asset appraisal and raffle listing.
  3. *Agent POS & USSD Network (`*804#`):* Field kiosk ticket sales and offline feature phone accessibility.
  4. *Admin Governance & Draw Console:* Double-entry financial ledger, live draw execution, and compliance monitoring.

### 6.3 Organizational Structure & Team Placement
LuckyEthio operates with an engineering-centric organizational structure:
* **Executive Leadership:** Chief Executive Officer (CEO) & Product Management.
* **Engineering Department:**
  * Lead Software Architect
  * Frontend & UI/UX Engineering Team
  * Backend & Core Systems Team *(Intern Placement Team)*
  * Quality Assurance & Security Engineering
* **Operations & Compliance Department:** Regulatory Liaison (NLA), Ministry of Revenues (MoR) Tax Compliance, and Merchant KYC Reviewers.

---

## 7. Internship Activities & Detailed Work Breakdown
### 7.1 Roles and Responsibilities
As a Software Engineering Intern within the Core Systems Engineering team, my responsibilities included:
1. Contributing to the architectural refactoring of the monolithic raffle repository into a high-performance **Turborepo monorepo** (`apps/web`, `apps/admin`, `packages/database`, `packages/shared`).
2. Designing and implementing the **Double-Entry Financial Ledger** service to ensure all ticket proceeds, 15% VAT, and escrow funds balance to zero discrepancy.
3. Implementing the **Two-Stage Purchase and Atomic Ticket Allocation Engine** to eliminate race-condition overselling.
4. Integrating and abstracting local Ethiopian payment providers (**Chapa, Telebirr, CBE Birr, SantimPay**) using the Adapter Design Pattern.
5. Upgrading the **Multi-Entropy Provably Fair Commit-Reveal RNG Engine** and building the immutable **Draw Snapshot** mechanism.
6. Building customer and admin interfaces for the **Ethiopian Personal Data Protection Proclamation No. 1321/2024 (PDPP)** compliance module.
7. Writing unit, integration, and build verification test suites.

### 7.2 Tools, Languages & Frameworks Used
* **Programming Languages:** TypeScript (100% strict typing), JavaScript (ESNext).
* **Frontend Frameworks & UI:** Next.js 14 (App Router, Server & Client Components), React 18, Tailwind CSS, Lucide Icons, Canvas Confetti.
* **Backend & API:** Node.js, Next.js Route Handlers, REST APIs, Webhook receivers.
* **Database & ORM:** Prisma ORM, SQLite (Development / Local Sandbox), PostgreSQL compatibility.
* **Monorepo & Build Tooling:** Turborepo 2.x, NPM Workspaces, TSX, PostCSS.
* **Cryptography & Security:** Node.js `crypto` module (SHA-256 hashing, HMAC signatures, CSPRNG bytes).
* **Version Control & Collaboration:** Git, GitHub, Linux Bash shell.

### 7.3 Development Methodologies (Agile / Scrum)
The engineering team adhered to Agile Scrum practices:
* **Two-Week Sprints:** Sprint planning, backlog refinement, and demo retrospectives.
* **Daily Standups (15 minutes):** Reporting yesterday's accomplishments, today's targets, and technical blockers.
* **Code Reviews & CI:** Every feature branch required a pull request, passing TypeScript static analysis, and approval from the senior engineer before merging into `main`.

---

## 8. Technical Skills and Knowledge Utilized

### 8.1 Technical Capabilities Developed
1. **Full-Stack Monorepo Architecture:** Managing shared packages (`@raffle/database`, `@raffle/shared`) and isolated applications (`@raffle/web`, `@raffle/admin`) within a single Turborepo.
2. **Double-Entry Bookkeeping in Software:** Translating formal financial accounting (Assets = Liabilities + Equity) into relational database transactions with immutable debits and credits.
3. **High-Concurrency Data Safety:** Utilizing database transactions (`tx.$transaction`) and unique database constraints (`UNIQUE(raffleId, ticketNumber)`) to guarantee atomic seat reservations without deadlocks.
4. **Provably Fair Cryptography:** Implementing commit-reveal algorithms where operator seeds and external public entropy generate deterministic, verifiable winner outcomes.
5. **Dynamic RBAC & Two-Person Governance:** Enforcing dual-operator consensus on high-value financial cashouts and draw triggers.
6. **Regulatory Compliance Engineering:** Implementing statutory requirements for Ethiopian VAT (15%) and data subject rights under Proclamation No. 1321/2024.

### 8.2 Soft Skills & Professional Attributes
* **Team Communication:** Articulating architectural trade-offs during sprint reviews.
* **Problem Decomposition:** Breaking large ambiguous specifications into modular, testable tasks.
* **Time Management:** Meeting strict sprint deadlines while maintaining high code quality.
* **Technical Documentation:** Authoring comprehensive system manuals, API documentation, and architecture diagrams.

---

## 9. Collaboration, Teamwork & Contributions
During the internship, I collaborated closely with frontend designers, backend engineers, and compliance specialists. Key collaborative achievements include:
1. **Refactoring the Mobile Navigation Experience:** Re-architecting `Navbar.tsx` on mobile to float on the right-hand side and formatting `Footer.tsx` so that categories sit side-by-side on mobile screens.
2. **Building the Admin Moderation & Anti-Gouging System:** Creating multi-photo inspection (3 distinct angles), fair market value counter-offers, and Fayda National ID verification workflows for merchant onboarding.
3. **Establishing Zero-Error Build Pipelines:** Ensuring all 34 customer web pages and 23 admin console pages compile cleanly with zero TypeScript errors or ESLint warnings.

---

## 10. Deep-Dive Project Highlight: LuckyEthio Platform

### 10.1 Problem Statement
In Ethiopia, traditional paper-based lotteries and merchant raffles suffer from critical challenges:
1. **Lack of Provable Fairness:** Participants cannot independently verify if winning numbers were pre-determined or tampered with.
2. **Double-Booking & Overselling:** High-traffic ticket sales often lead to database race conditions where more tickets are sold than exist in the prize inventory.
3. **Financial Escrow Risks:** Winner delivery disputes and merchant fraud frequently leave buyers unprotected.
4. **Tax Non-Compliance:** Manual VAT reconciliation leads to delays and errors in statutory tax remittance to the Ministry of Revenues.

### 10.2 Architectural Solution
To address these challenges, we built **LuckyEthio (Idil)**, an enterprise-grade digital raffle and financial transaction platform:

```
[ Customer / Kiosk / USSD ] ──► [ Decoupled Purchase Order ] ──► [ Payment Gateway Adapter ]
                                                                        │ (Signed Webhook)
                                                                        ▼
[ Immutable Audit Trail ] ◄── [ Double-Entry Ledger ] ◄── [ Atomic DB Ticket Allocator ]
                                                                        │
                                                                        ▼
                                                             [ Cryptographic Draw Snapshot ]
                                                                        │
                                                                        ▼
                                                             [ Multi-Entropy Fair RNG ]
```

### 10.3 Core Modules Implemented
1. **Decoupled Purchase Pipeline (`PurchaseOrder` & `PaymentAttempt`):** Separates customer purchase intent from payment gateway processing and ticket minting.
2. **Double-Entry Financial Ledger (`packages/shared/src/ledger`):** Automatically debits `1010-CASH-TRANSIT` (100%) and credits `2020-VAT-PAYABLE` (15%), `2010-PRIZE-ESCROW` (77%), and `4010-PLATFORM-REVENUE` (8%).
3. **Multi-Entropy Fair RNG (`packages/shared/src/fair-rng`):**
   $$\text{Seed Commitment} = \text{SHA-256}(\text{Version} : \text{RaffleID} : \text{SecretSeed} : \text{TotalTickets} : \text{PublicEntropy} : \text{Algorithm})$$
4. **Two-Person Consensus Engine (`packages/shared/src/two-person`):** Guarantees that a single administrator cannot unilaterally draw numbers or disburse cashouts without secondary authorization.
5. **Fraud & Risk Scoring Engine (`packages/shared/src/risk`):** Evaluates velocity spikes and volume anomalies, scoring transactions from 0 to 100.
6. **Bilingual Localization (`packages/shared/src/i18n`):** Full English and Amharic (አማርኛ) translation dictionaries across all components.

---

## 11. Challenges Encountered & Engineering Solutions

| Challenge Encountered | Technical Root Cause | Implemented Engineering Solution |
| :--- | :--- | :--- |
| **High-Concurrency Ticket Overselling** | Concurrent HTTP requests reading stale `soldTickets` counts before writing to database. | Replaced loose updates with atomic database transactions (`tx.$transaction`) and unique composite constraints `@@unique([raffleId, ticketNumber])`. |
| **Payment Webhook Duplicate Processing** | Gateways retrying successful webhooks, causing double-minting of tickets. | Implemented strict **Idempotency Keys** and unique `providerReference` lookups before executing ticket allocation. |
| **Financial Escrow Discrepancies** | Rounding errors and unlinked transactions causing balance sheet drift. | Implemented a strict **Double-Entry General Ledger** requiring total debits to equal total credits ($\Delta = 0.00$) before committing any transaction. |
| **Under-Subscribed Raffle Disputes** | Raffles reaching draw dates without selling minimum viable tickets. | Implemented **Dual-Consent Timestamps** requiring explicit cryptographic consent from both Seller and Admin before draw initiation. |

---

## 12. Contribution to the Organization
My contributions delivered tangible, long-term value to LuckyEthio:
1. **Production-Ready Codebase:** Delivered modular packages for payments, ledger, risk monitoring, provably fair RNG, and audit logging.
2. **Clean Monorepo Infrastructure:** Configured Turborepo build caching, reducing local build and testing times significantly.
3. **Comprehensive Documentation:** Produced detailed technical architecture manuals, PDF user guides, and API integration guides.
4. **Security & Regulatory Compliance:** Prepared the platform for regulatory review by embedding NLA compliance notices and PDPP data protection workflows.

---

## 13. Conclusion & Recommendations

### 13.1 Conclusion
The 4-month software engineering internship at LuckyEthio was a transformative academic and professional experience. It provided me with first-hand experience in designing scalable, secure, and regulatory-compliant fintech systems. Working on the LuckyEthio platform deepened my mastery of full-stack engineering, database concurrency, financial accounting in software, applied cryptography, and agile collaboration.

### 13.2 Recommendations for the Host Organization
1. **Automated End-to-End Load Testing:** Integrate tools like k6 or Artillery to simulate 10,000+ concurrent users on live draw nights.
2. **Hardware Security Modules (HSM):** Transition seed commitments to dedicated cloud HSMs for enhanced cryptographic protection.
3. **Direct Telecom SMPP SMS Gateway:** Deploy dedicated short-code SMS aggregators for sub-second ticket delivery.

### 13.3 Recommendations for Dire Dawa University
1. **Incorporate Monorepo & Cloud Tooling into Lab Sessions:** Introduce modern tooling like Turborepo, Docker, and Prisma into Web Engineering courses.
2. **Financial Technology & Distributed Ledger Course:** Introduce coursework covering financial ledger design, idempotency patterns, and high-concurrency database isolation.
3. **Strengthen Industry Partnerships:** Expand formal internship linkage agreements with emerging tech hubs and fintech startups.

---

## 14. References
1. National Lottery Administration (NLA) of Ethiopia, *Proclamation No. 535/2007: Commercial Lottery Regulations and Operational Directives*.
2. Ethiopian Communications Authority (ECA), *Personal Data Protection Proclamation No. 1321/2024*.
3. Ministry of Revenues (MoR), *Value Added Tax (VAT) Proclamation No. 285/2002 and Withholding Directives*.
4. Vercel & Next.js Core Team, *Next.js 14 Documentation: App Router, Server Actions, and Optimization*, 2024.
5. Prisma ORM Team, *Prisma Client & Schema Reference: Transactions and Concurrency Control*, 2024.
6. Martin Fowler, *Patterns of Enterprise Application Architecture: Accounting & Ledger Patterns*, Addison-Wesley.
7. National Institute of Standards and Technology (NIST), *FIPS PUB 180-4: Secure Hash Standard (SHA-256)*.

---

## 15. Appendices

### Appendix A: Database Entity-Relationship Overview
The system schema comprises 18 normalized relational models in Prisma:
* Dynamic RBAC: `Role`, `Permission`, `RolePermission`
* Core Accounts: `User`, `Seller`, `Agent`, `AgentLedger`, `AgentAccessLog`
* Ticketing & Lifecycle: `Raffle`, `PurchaseOrder`, `PaymentAttempt`, `Ticket`, `Transaction`
* Financials & Escrow: `LedgerAccount`, `LedgerTransaction`, `LedgerEntry`, `TaxLedger`, `CashoutRequest`
* Audit & Governance: `DrawSnapshot`, `DrawAudit`, `TwoPersonApproval`, `AuditLog`, `RiskEvent`, `DataSubjectRequest`

### Appendix B: Public Provably Fair Verifier Formula
```typescript
function verifyDrawProof(secretSeed: string, raffleId: string, soldTickets: number, publicEntropy: string) {
  const payload = `v2.0:${raffleId}:${secretSeed}:${soldTickets}:${publicEntropy}:SHA-256-COMMIT-REVEAL`;
  const hash = crypto.createHash("sha256").update(payload).digest("hex");
  const hashBigInt = BigInt("0x" + hash.substring(0, 16));
  const winnerTicket = Number(hashBigInt % BigInt(soldTickets)) + 1;
  return { winnerTicket, hash };
}
```

---
---

# ==========================================
# PART TWO: INTERNSHIP PRESENTATION SLIDES & SCRIPT
# ==========================================

### SLIDE 1: Cover Page & Project Title
* **Header:** DIRE DAWA UNIVERSITY | INSTITUTE OF TECHNOLOGY | SCHOOL OF COMPUTING
* **Department:** Department of Software Engineering
* **Title:** Software Engineering Internship Presentation
* **Sub-Title:** *Engineering LuckyEthio — Enterprise Digital Raffle & Double-Entry Financial Marketplace Platform*
* **Student Name:** [Student Name] | **ID:** [Student ID]
* **Company:** LuckyEthio Digital Solutions PLC
* **Advisor:** [Advisor Name] | **Supervisor:** [Supervisor Name]
* **Date:** 12/01/2018 E.C.

---

### SLIDE 2: Presentation Contents (Agenda)
1. Introduction & Background
2. Problem Statement
3. Project Objectives (General & Specific)
4. Scope and Limitations
5. System Specifications & Key Features
6. Project Feasibility Analysis
7. Software Engineering Methodology & Architecture
8. Results, Outcomes & Deliverables
9. Conclusion & Recommendations
10. System Demonstration (Live Demo)

---

### SLIDE 3: Introduction & Company Profile
* **Host Company:** LuckyEthio Digital Solutions PLC (Addis Ababa, Ethiopia).
* **Core Focus:** Building transparent, cryptographically verifiable digital raffle infrastructure, point-of-sale agent networks, and financial accounting engines.
* **Internship Purpose:** Bridging academic software engineering concepts (databases, web architectures, applied cryptography, and agile development) with production fintech systems.

---

### SLIDE 4: Problem Statement
Traditional paper lotteries and promotional raffles in Ethiopia face severe operational and trust bottlenecks:
1. **Lack of Transparency:** Opaque manual draws without verifiable mathematical proof.
2. **Concurrency & Overselling:** High-traffic digital sales causing duplicate ticket numbers.
3. **Escrow & Trust Risks:** Unprotected winner claims leading to seller non-delivery disputes.
4. **Manual Accounting & Tax Non-Compliance:** Unreconciled 15% VAT and financial discrepancies.

---

### SLIDE 5: Project Objectives
* **General Objective:** To design, architect, and implement a secure, high-concurrency multi-vendor digital raffle platform with double-entry financial ledger accounting and provably fair cryptographic verification.
* **Specific Objectives:**
  * Implement an atomic ticket reservation engine to eliminate overselling under high concurrency.
  * Integrate multi-provider Ethiopian payment adapters (Chapa, Telebirr, CBE Birr, SantimPay).
  * Build a double-entry general ledger to balance prize escrow, platform revenue, and 15% VAT.
  * Implement SHA-256 multi-entropy commit-reveal RNG and immutable draw snapshots.
  * Build a two-person consensus mechanism for high-value governance.
  * Enforce personal data rights under Ethiopian PDPP Proclamation No. 1321/2024.

---

### SLIDE 6: Scope and Limitations
* **In Scope:**
  * Customer portal (ticketing, purchase order tracking, winner claim QR code).
  * Merchant seller portal (listing appraisal, 3-angle photo upload, delivery QR scanning).
  * Field Agent POS kiosk and USSD (`*804#`) feature phone simulator.
  * Admin Operations Console (General Ledger, Draw Room, Fraud Engine, PDPP Manager).
  * Bilingual English & Amharic (አማርኛ) user experience.
* **Limitations:**
  * Production USSD deployment requires direct telecom telco aggregator short-code provisioning.
  * Hardware Security Modules (HSM) simulated via secure CSPRNG environment variables.

---

### SLIDE 7: System Specifications & Functional Features
* **Decoupled Purchase Pipeline:** `PurchaseOrder` $\rightarrow$ `PaymentAttempt` $\rightarrow$ Webhook Signature $\rightarrow$ Atomic Allocation.
* **Double-Entry Chart of Accounts:** `1010-CASH-TRANSIT`, `2010-PRIZE-ESCROW`, `2020-VAT-PAYABLE`, `4010-PLATFORM-REVENUE`.
* **Multi-Entropy Fair RNG:**
  $$\text{Commitment} = \text{SHA-256}(\text{Version} : \text{RaffleID} : \text{SecretSeed} : \text{TotalTickets} : \text{PublicEntropy} : \text{Algorithm})$$
* **Two-Person Rule:** Dual authorization required for live draws and cashouts.
* **Risk Engine:** Heuristic fraud scoring (0-30 Low, 31-70 Review, 71-100 Block).

---

### SLIDE 8: Project Feasibility
* **Technical Feasibility:** Built on mature, scalable technologies (Next.js 14, TypeScript, Prisma ORM, Node.js Crypto) with zero third-party lock-in.
* **Operational Feasibility:** Accessible across smartphones (Web), field kiosks (Agent POS), and basic 2G feature phones (USSD `*804#`).
* **Economic Feasibility:** Automated 8% platform monetization and 15% source-deducted statutory VAT escrow.
* **Legal & Regulatory Feasibility:** Fully aligned with NLA directives and PDPP Proclamation No. 1321/2024.

---

### SLIDE 9: Software Engineering Methodology & Architecture
* **Methodology:** Agile Scrum with 2-week sprints, daily standups, and pull request reviews.
* **Monorepo Architecture (Turborepo):**
  * `apps/web`: Customer Portal, POS Kiosk, USSD Simulator, Public Verifier (Port 3000).
  * `apps/admin`: Stealth Admin Console, Financial Ledger, Live Draw Room (Port 3001).
  * `packages/database`: Prisma schema, migrations, seed dataset.
  * `packages/shared`: Payments, Ledger, Fair-RNG, Risk, Audit, Two-Person, i18n.

---

### SLIDE 10: Results and Outcomes
* **57 Production Routes:** 34 customer web pages and 23 admin console pages compiled with **0 errors**.
* **100% Balanced Double-Entry Ledger:** Zero variance between total debits and credits across all transactions.
* **Provably Fair Verification:** Independent public validator running deterministic SHA-256 verification in 1 click.
* **Enterprise Security:** Complete append-only audit trail and dynamic RBAC with 9 distinct roles.

---

### SLIDE 11: Conclusion and Recommendations
* **Conclusion:** Successfully designed and delivered an enterprise-grade digital raffle and financial transaction platform meeting all commercial and regulatory standards in Ethiopia.
* **Future Recommendations:**
  * Deploy automated stress testing for 50,000+ concurrent buyers.
  * Implement telecom SMPP gateways for instant SMS ticket receipts.
  * Integrate hardware-backed cryptographic signing modules.

---

### SLIDE 12: Live System Demonstration Walkthrough
1. **Flow 1: Customer Ticket Purchase**
   * Browse active Toyota Hilux raffle $\rightarrow$ Create Purchase Order $\rightarrow$ Complete payment via Telebirr/Chapa adapter $\rightarrow$ View minted ticket with signed QR verification link.
2. **Flow 2: Admin Double-Entry Ledger & Balance Sheet**
   * Open Admin Financials (`/financials`) $\rightarrow$ Inspect balanced Journal Entries $\rightarrow$ Verify 15% VAT escrow and trial balance ($\Delta = 0.00$).
3. **Flow 3: Two-Person Provably Fair Live Draw**
   * Freeze sales into immutable `DrawSnapshot` $\rightarrow$ Request Two-Person consensus $\rightarrow$ Reveal secret seed and calculate winner $\rightarrow$ Verify proof on `/verifier`.
4. **Flow 4: Merchant Delivery & Winner Claim QR Scan**
   * Customer reveals dynamic claim QR token $\rightarrow$ Merchant scans QR code $\rightarrow$ Delivery verified and seller escrow balance unfrozen.
5. **Flow 5: Data Privacy Portal (PDPP 1321/2024)**
   * Submit data access/deletion request $\rightarrow$ Review and resolve in Admin Governance console.
