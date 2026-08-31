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
1. Acknowledgment
2. List of Acronyms & Abbreviations
3. Introduction (Background, Purpose, Relationship with Software Engineering)
4. Company / Organization Background (SORARDI PLC Profile, LuckyEthio Profile, Org Structure)
5. Internship Activities (Roles, Projects, Monorepo, Frontend, Backend, Payments, Concurrency, Fair RNG, POS, USSD, Ledger, Draw Console, Security, Privacy)
6. Technical Skills and Knowledge Utilized
7. Collaboration and Teamwork
8. Achievements and Contributions
9. Project Highlights
10. Learning and Growth
11. Challenges Faced and Solutions
12. Contribution to the Organization
13. Conclusion and Recommendations
14. References
15. Technical Appendices

---

## 1. ACKNOWLEDGMENT
I would like to express my sincere gratitude to **Dire Dawa University, Institute of Technology, School of Computing, and the Department of Software Engineering** for giving me the opportunity to participate in an internship program that enabled me to connect academic knowledge with practical software engineering.

I am also grateful to the organization, **SORARDI PLC**, and the development team involved in the **LuckyEthio (Idil)** project for providing a professional environment where I could participate in software development, testing, debugging, system integration, and technical documentation.

I would especially like to thank my **Industry Supervisor** and **Academic Advisor** for their guidance, constructive feedback, and continuous support throughout the internship period.

Finally, I would like to thank my classmates, friends, and family for their encouragement and support during my academic and professional development.

---

## 2. LIST OF ACRONYMS
| Acronym | Full Meaning |
| :--- | :--- |
| **API** | Application Programming Interface |
| **ACID** | Atomicity, Consistency, Isolation, Durability |
| **CBE** | Commercial Bank of Ethiopia |
| **DB** | Database |
| **KYC** | Know Your Customer |
| **NLA** | National Lottery Administration |
| **ORM** | Object-Relational Mapping |
| **PDPP** | Personal Data Protection Proclamation (No. 1321/2024) |
| **POS** | Point of Sale |
| **QR** | Quick Response |
| **RBAC** | Role-Based Access Control |
| **RNG** | Random Number Generator |
| **SHA** | Secure Hash Algorithm (e.g. SHA-256) |
| **SMS** | Short Message Service |
| **UI** | User Interface |
| **USSD** | Unstructured Supplementary Service Data (e.g. `*157#`) |
| **VAT** | Value Added Tax (15% Statutory Rate) |

---

## 3. INTRODUCTION
### 3.1 Background
Software engineering education provides students with both theoretical knowledge and practical skills. However, real-world software development requires students to apply these concepts to actual systems involving requirements, architecture, implementation, testing, debugging, collaboration, security, and deployment.

The internship provided an opportunity to participate in the development and integration of **LuckyEthio (Idil)**, a digital raffle platform designed to support raffle management and ticket sales through multiple channels.

The system provides a customer-facing web application, agent POS/kiosk functionality, USSD access (`*157#`), payment processing, ticket allocation, administrative operations, financial management, draw verification, security controls, and auditing. The project follows a modern monorepo architecture in which applications and reusable packages are maintained within one repository.

### 3.2 Purpose of the Internship
The main purpose of the internship was to gain practical experience in software engineering by participating in the development and testing of a real-world application. Specific purposes included:
1. Applying software engineering concepts in a real project.
2. Understanding full-stack application architecture.
3. Developing and integrating frontend and backend functionality.
4. Working with databases and ORM technologies.
5. Understanding API design and integration.
6. Learning secure payment workflows.
7. Understanding concurrency and transaction management.
8. Practicing software testing and debugging.
9. Improving teamwork and communication skills.
10. Understanding professional software development workflows.

### 3.3 Relationship with Software Engineering
The LuckyEthio project is directly related to Software Engineering because it requires application of:
* **Requirements engineering:** Elicitation, specification, and validation of functional and non-functional requirements adhering to NLA, PDPP, and MoR regulations.
* **Software architecture:** Turborepo-based layered architecture, separating presentation, API, domain services, and database layers.
* **Database design:** 18 relational models normalized to 3NF with ACID transaction boundaries and double-entry accounting ledgers.
* **Object-oriented and modular programming:** 100% strict TypeScript types, domain interfaces, and polymorphic payment adapters.
* **API development:** RESTful route handlers, cryptographic webhook signature verification, and telecom USSD APIs.
* **User interface design:** Responsive mobile-first interfaces with bilingual runtime internationalization (English & Amharic).
* **Security engineering:** Multi-entropy SHA-256 commit-reveal RNG, Two-Person Rule consensus, and HMAC dynamic QR tokens.
* **Software testing:** Automated concurrency test scripts, trial balance mathematical assertions, and build type-checking.
* **Version control:** Git branching, pull request reviews, and Conventional Commits.
* **Debugging:** Structured server telemetry, immutable audit trails, and risk event monitoring.
* **Documentation:** System architecture manuals, API specifications, and academic reports.
* **Agile development:** 2-week Sprint Agile Scrum framework at SORARDI PLC.

---

## 4. COMPANY / ORGANIZATION BACKGROUND
### 4.1 Organization Profile
* **Host Organization:** **SORARDI PLC** (Technology & Software Solutions)
* **Sector:** Software Development, Cloud Applications & Fintech Platforms
* **Mission:** To empower Ethiopian consumers and commercial enterprises with secure, high-speed, transparent, and regulatory-compliant digital systems.

### 4.2 LuckyEthio Project Profile
LuckyEthio is a multi-channel raffle marketplace serving:
* **Customers:** Buying tickets online, via kiosks, or through USSD (`*157#`), tracking purchases, and claiming prizes.
* **Agents:** Physical point-of-sale ticket sales, cash collections, and float management.
* **Administrators:** Moderating listings, approving KYC records, and configuring platform fees.
* **Finance Personnel:** Auditing double-entry ledgers, reconciling 15% VAT, and approving seller cashouts.
* **Draw Operators:** Freezing ticket snapshots, initiating commit-reveal draws, and managing public entropy.
* **Super Administrators:** Platform governance, Two-Person Rule authorization, and role management.
* **Auditors & Compliance:** Real-time immutable telemetry inspection and PDPP request processing.

### 4.3 Organizational Structure
```
                    SORARDI PLC
                         │
          ┌──────────────┴──────────────┐
          │                             │
     MANAGEMENT                    TECHNOLOGY
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                    Development       QA          Operations
                         │
               ┌─────────┴─────────┐
               │                   │
           Frontend              Backend
               │                   │
          Web / Admin        API / Database
```

---

## 5. INTERNSHIP ACTIVITIES
### 5.1 Role and Responsibilities
My activities focused on full-stack development, integration, concurrency testing, debugging, and documentation:
* Understanding monorepo architecture and workspace dependencies.
* Developing customer, agent, and admin interfaces in Next.js 14.
* Connecting frontend UI components to backend API route handlers.
* Testing atomic ticket allocation and verifying zero overselling under race conditions.
* Testing multi-provider payment integrations (Telebirr, CBE Birr, Chapa, SantimPay).
* Testing agent POS kiosk float deductions and receipt generation.
* Implementing public cryptographic draw verification.
* Debugging system issues using structured server logs and audit trails.
* Managing database migrations and double-entry chart of accounts with Prisma ORM.
* Participating in daily Agile Scrum standups.

### 5.2 Projects Participated In
Primary project: **LuckyEthio (Idil) Raffle Platform**, including Customer portal, Raffle catalogue, Ticket selection, Decoupled Checkout, Payment webhook processing, My Tickets, Agent POS, USSD simulator (`*157#`), Public verifier, Admin portal, Financial ledger, Live draw console, KYC/risk engine, Privacy portal, and Immutable audit system.

### 5.3 Monorepo Architecture
```
raffle-monorepo/
│
├── apps/
│   ├── web/           # Customer + Agent + Kiosk + Verifier + USSD (Port 3000)
│   └── admin/         # Operations + Financials + Live Draws + Audits (Port 3001)
│
├── packages/
│   ├── database/      # Prisma Schema (18 Models) + Migrations + Seed
│   └── shared/        # Ledger + Payments + Fair-RNG + Risk + Two-Person + i18n
│
├── turbo.json         # Turborepo Pipeline Orchestration
├── package.json
└── README.md
```

### 5.4 Frontend Development
* **Customer:** Browse raffles, select tickets, checkout, view tickets, dynamic QR claims, verify draws, submit PDPP privacy requests.
* **Agent:** POS login, customer data intake, cash ticket sales, float management, commission tracking, receipt generation.
* **Administrator:** Listing moderation, user management, double-entry financial ledger exploration, live two-person draw execution, regulatory audit monitoring.

### 5.5 Backend Integration
```
Customer Interface ──► POST /api/orders/create ──► Order Service ──► DB Transaction ──► Purchase Created
Raffle Page        ──► GET  /api/raffles       ──► Raffle Service ──► Prisma ORM    ──► PostgreSQL Data
```

### 5.6 Payment Integration
```
Customer ──► Select Ticket ──► Create Order ──► Initialize Payment ──► Payment Provider (Telebirr/Chapa)
                                                                                  │
Order Confirmation ◄── Issue Ticket ◄── Allocate Ticket ◄── Verify Webhook ◄──────┘
```

### 5.7 Ticket Allocation and Concurrency
```
User A ─────┐
User B ─────┼────► Ticket Allocation ──► Atomic Transaction (tx.$transaction)
User C ─────┘                                    │
                                 ┌───────────────┴───────────────┐
                                 │                               │
                          Availability Check              Unique Constraint
                                 │                               │
                                 └───────────────┬───────────────┘
                                                 ▼
                                        Ticket Issued (#100)
```

### 5.8 Provably Fair Draw Architecture
```
Stage 1: COMMIT   ──► Secret Seed + Raffle ID + Public Entropy ──► SHA-256 ──► Commitment Hash
Stage 2: SNAPSHOT ──► Sales Closed ──► Eligible Tickets Locked ──► Immutable Draw Snapshot
Stage 3: REVEAL   ──► Seed Revealed ──► Deterministic Math ──► Winner Selected
Stage 4: VERIFY   ──► Public Verifier ──► Recomputes Hash ──► Confirms Winner Independently
```

### 5.9 Agent POS and Kiosk
```
Agent Login ──► Select Customer ──► Select Raffle ──► Select Ticket ──► Cash Payment ──► Ticket Allocation ──► Commission ──► Float Update ──► Receipt
```

### 5.10 USSD Service (`*157#`)
```
*157# ──► Main Menu ──► 1. Buy Ticket ──► Select Raffle ──► Select Quantity ──► Confirm & Pay ──► SMS Ticket Receipt
```

### 5.11 Financial Ledger (Double-Entry Bookkeeping)
```
Customer Payment (100 ETB) ──► Debit: 1010-CASH-TRANSIT (100 ETB)
                                 ├── Credit: 2020-VAT-PAYABLE (15 ETB • 15% Statutory MoR Tax)
                                 ├── Credit: 2010-PRIZE-ESCROW (77 ETB • Seller Net Escrow)
                                 └── Credit: 4010-PLATFORM-REVENUE (8 ETB • Platform Fee)
                                 Total Debits (100 ETB) === Total Credits (100 ETB) [Δ = 0.00]
```

### 5.12 Administrative Draw Console (Two-Person Rule)
```
Draw Operator ──► Initiate Draw ──► Snapshot Frozen ──► Super Admin ──► Approve & Sign ──► Execute Draw ──► Winner Selected ──► Immutable Audit Record
```

### 5.13 Security Engineering
* **Authentication & RBAC:** Session cookies with fine-grained role permissions.
* **Idempotency:** Unique keys preventing duplicate payment processing.
* **Audit Trails:** Append-only logs with actor IP, timestamp, and payload state diffs.
* **HMAC Signatures:** Dynamic QR claims and webhook callback signature validation.
* **Two-Person Rule:** Strict separation of duties for draw executions and cashout disbursements.

### 5.14 Privacy Portal (PDPP Proclamation No. 1321/2024)
* End-to-end customer workflows for personal data export, data correction, and anonymized erasure.

---

## 6. TECHNICAL SKILLS AND KNOWLEDGE UTILIZED
* **Languages:** TypeScript, JavaScript, SQL.
* **Frameworks:** React 18, Next.js 14 (App Router), Node.js.
* **Databases & ORM:** PostgreSQL, SQLite, Prisma ORM.
* **Tools:** VS Code, Git & GitHub, npm, Turborepo, Tailwind CSS.
* **Core Concepts:** REST APIs, Database Transactions, ACID Concurrency, Cryptography (SHA-256, HMAC), Double-Entry Accounting, Webhooks, Idempotency, Testing, Telemetry.

---

## 7. COLLABORATION AND TEAMWORK
Executed within SORARDI PLC's 2-week Sprint Agile Scrum framework, engaging in daily standups, backlog refinement, sprint planning, PR peer reviews, and collaborative problem solving.

---

## 8. ACHIEVEMENTS AND CONTRIBUTIONS
* **8.1 Ticket Concurrency Testing:** Verified zero race conditions and zero duplicate ticket allocations.
* **8.2 Payment Workflow Testing:** Validated initiation, webhook signature checks, and atomic ticket minting.
* **8.3 Agent POS:** Implemented kiosk sales workflows with float deduction and receipt generation.
* **8.4 Public Draw Verification:** Developed 1-click independent proof validator.
* **8.5 Admin Draw Console:** Engineered two-person authorization for sensitive live draws.
* **8.6 Documentation:** Authored complete architecture specifications, user manuals, and academic reports.

---

## 9. PROJECT HIGHLIGHTS
* **Highlight One — Anti-Overselling Concurrency Engine:** Database transactions with `UNIQUE(raffleId, ticketNumber)` ensuring zero inventory overselling under high concurrency.
* **Highlight Two — Provably Fair Multi-Entropy RNG:** Pre-committed SHA-256 hash published before ticket #1 is sold, with deterministic mathematical calculation:
$$\text{Winner} = \left(\text{BigInt}\left(\text{SHA256}\left(\text{Payload}\right)\right) \pmod{\text{SoldTickets}}\right) + 1$$

---

## 10. LEARNING AND GROWTH
* **Technical Growth:** Mastered full-stack Next.js 14, Prisma ORM, concurrency isolation, Ethiopian payment gateways, cryptography, and automated testing.
* **Professional Growth:** Strengthened communication, problem-solving, code review discipline, and technical documentation.

---

## 11. CHALLENGES FACED AND SOLUTIONS
| Challenge Encountered | Engineering Solution Implemented |
| :--- | :--- |
| **Concurrent Ticket Requests** | Transaction-based allocation and composite unique constraints |
| **Duplicate Payment Callbacks** | Strict `idempotencyKey` tracking and status guards |
| **Payment Verification** | Server-side HMAC-SHA256 signature verification |
| **Draw Transparency** | Commit-reveal cryptographic mechanism with pre-draw hashes |
| **Feature-Phone Accessibility** | GSM USSD (`*157#`) state machine gateway |
| **Financial Tracking** | Double-entry general ledger with balanced trial balances |
| **Sensitive Administration** | Two-Person Rule consensus authorization |
| **Debugging Integration Issues** | Immutable audit telemetry and structured server logging |

---

## 12. CONTRIBUTION TO THE ORGANIZATION (SORARDI PLC)
* **Operational Benefits:** Centralized multi-vendor raffle management, automated payments, agent POS kiosks, double-entry financial tracking.
* **Technical Benefits:** Modular Turborepo architecture, reusable shared domain libraries, type-safe Prisma client, zero build errors across 57 routes.
* **Customer Benefits:** High-speed online purchasing, USSD (`*157#`) feature phone access, dynamic QR claim tokens, 1-click public verification.

---

## 13. CONCLUSION AND RECOMMENDATIONS
### 13.1 Conclusion
The internship at SORARDI PLC provided hands-on mastery in building resilient financial, cryptographic, and concurrency-safe software systems. Working on LuckyEthio demonstrated the importance of correctness, trust, and mathematical provability in modern fintech applications.

### 13.2 Recommendations
1. Increasing automated test coverage across edge cases.
2. Performing comprehensive load and stress testing.
3. Conducting independent third-party security audits.
4. Improving production cloud monitoring and APM telemetry.
5. Expanding payment provider integrations (e.g. CBE direct host-to-host).
6. Continuing enhancement of USSD (`*157#`) offline features.
7. Improving English and Amharic localization dictionaries.
8. Strengthening automated financial ledger reconciliation bots.
9. Improving documentation and developer onboarding manuals.
10. Establishing production incident-response runbooks.

---

## 14. REFERENCES
1. Vercel Core Team, *Next.js 14 App Router Documentation*, 2024.
2. Facebook Open Source, *React 18 Documentation & Server Components*, 2024.
3. Microsoft Corporation, *TypeScript Language Specification v5.7*, 2024.
4. Prisma Data Inc., *Prisma ORM Client & Concurrency Documentation*, 2024.
5. PostgreSQL Global Development Group, *PostgreSQL 16 Manual*, 2024.
6. Vercel, *Turborepo Monorepo Architecture Handbook*, 2024.
7. National Lottery Administration (NLA) of Ethiopia, *Proclamation No. 535/2007*.
8. Ethiopian Communications Authority (ECA), *Personal Data Protection Proclamation No. 1321/2024*.
9. Ministry of Revenues (MoR), *Value Added Tax (VAT) Proclamation No. 285/2002*.
10. SORARDI PLC, *LuckyEthio Technical Architecture Specification*, 2026.

---

## 15. APPENDICES
* **Appendix A — Monorepo Project Architecture**
* **Appendix B — Database Entity Relationship (ER) Diagram**
* **Appendix C — Customer Purchase & Payment Sequence**
* **Appendix D — Provably Fair Draw Sequence**
* **Appendix E — System Screen Gallery / Walkthrough**
