<div align="center">

![Dire Dawa University Logo](ddu_logo.jpg)

# DIRE DAWA UNIVERSITY
## INSTITUTE OF TECHNOLOGY (ድሬዳዋ ዩኒቨርሲቲ ቴክኖሎጂ ኢንስቲትዩት)
### SCHOOL OF COMPUTING &bull; DEPARTMENT OF SOFTWARE ENGINEERING

---

# SOFTWARE ENGINEERING INTERNSHIP PRESENTATION SLIDES
## Project: LuckyEthio — Enterprise Digital Raffle & Double-Entry Financial Marketplace Platform
### Host Organization: SORARDI PLC 

**Student Name:** [Student Full Name] | **Student ID:** [DDU/UGR/XXXX/XX]  
**Academic Advisor:** [Advisor Name, MSc/PhD] | **Industry Supervisor:** [Supervisor Name]  
**Presentation Date:** 12/01/2018 E.C. | **Submission Date:** 10/01/2018 E.C.  

</div>

---

## 📑 SLIDE 1: Cover Page & Project Title
* **Institution:** Dire Dawa University, Institute of Technology
* **Department:** Department of Software Engineering
* **Project Title:** *Architecting & Engineering LuckyEthio — Enterprise Digital Raffle & Double-Entry Financial Marketplace Platform*
* **Host Organization:** SORARDI PLC (Technology & Software Solutions)
* **Student:** [Student Full Name] ([DDU/UGR/XXXX/XX])
* **Date:** 12/01/2018 E.C.

> **Speaker Note:** "Good morning honorable academic committee, advisors, and faculty members. Today, I am honored to present my Software Engineering internship project completed at SORARDI PLC."

---

## 📑 SLIDE 2: Presentation Agenda
1. **Introduction & Host Profile:** SORARDI PLC background and objectives.
2. **Problem Statement:** Bottlenecks in traditional lottery operations in Ethiopia.
3. **Project Objectives:** General and specific engineering goals.
4. **Scope & Limitations:** Functional boundaries and interfaces.
5. **System Specifications & Feasibility:** Technical, operational, economic, and legal.
6. **Methodology & Architecture:** Agile Scrum & Turborepo monorepo.
7. **Key Deliverables:** Double-entry ledger, atomic allocation, provably fair RNG.
8. **Live Demonstration:** Walkthrough of customer and admin flows.
9. **Conclusion & Recommendations:** Academic takeaways and organizational suggestions.

> **Speaker Note:** "Here is the roadmap for today's presentation, covering the problem context, architectural solution, technical results, and live demo."

---

## 📑 SLIDE 3: Introduction & Host Company Profile: SORARDI PLC
* **Host Enterprise:** SORARDI PLC is a specialized Ethiopian technology enterprise providing modern enterprise software, cloud applications, and fintech systems.
* **Internship Role:** Embedded as a Software Engineering Intern in the Core Backend & Architecture team building the LuckyEthio digital platform.
* **Curriculum Alignment:** Practical execution of university courses: *Database Systems*, *Distributed Systems*, *Computer Security*, and *Agile Software Engineering*.

> **Speaker Note:** "SORARDI PLC provided an environment where we applied university principles to solve real-world transaction, concurrency, and security challenges."

---

## 📑 SLIDE 4: Problem Statement
Traditional paper lotteries and promotional raffles in Ethiopia face 4 critical operational bottlenecks:
1. **Opaque Manual Draws:** Lack of verifiable mathematical proof or real-time public transparency.
2. **Inventory Overselling:** High-concurrency web traffic causing race conditions and duplicate ticket reservations.
3. **Escrow Delivery Disputes:** Winner prize claims often lack dynamic cryptographic proof of handover.
4. **Manual Accounting & Tax Non-Compliance:** Unreconciled 15% VAT and financial ledger discrepancies.

> **Speaker Note:** "These 4 core operational and trust bottlenecks guided our engineering requirements and system architecture."

---

## 📑 SLIDE 5: Project Objectives
* **General Objective:** To design and implement a secure, high-concurrency multi-vendor digital raffle platform with double-entry financial accounting and provably fair cryptographic verification.
* **Specific Objectives:**
  * Implement decoupled purchase orders and atomic seat allocation under database transactions.
  * Integrate unified Ethiopian payment adapters (Chapa, Telebirr, CBE Birr, SantimPay).
  * Build a balanced double-entry chart of accounts with automated 15% VAT escrow.
  * Develop multi-entropy SHA-256 commit-reveal RNG and immutable draw snapshot locks.
  * Enforce Two-Person consensus governance on live draws and seller cashout disbursements.

> **Speaker Note:** "Our specific goals addressed data consistency, financial reconciliation, and mathematical provability."

---

## 📑 SLIDE 6: System Specifications & Multi-Channel Scope
* **Customer Web & Mobile Portal:** Self-service raffle browsing, decoupled 3-step checkout, and dynamic QR claim tokens.
* **Merchant Seller Portal:** Multi-vendor listing creation, 3-angle photo upload, Fayda ID verification, and delivery QR scanner.
* **Field Agent POS Kiosk & USSD (`*804#`):** Physical kiosk ticketing and offline feature phone accessibility.
* **Admin Governance Console:** Double-entry ledger, trial balance validation, live draw room, and PDPP data privacy manager.

> **Speaker Note:** "We ensured universal accessibility across modern smartphones, field agent kiosks, and basic 2G feature phones via USSD."

---

## 📑 SLIDE 7: Feasibility Analysis
* **Technical Feasibility:** Built on Next.js 14, TypeScript, Prisma ORM, Node.js Crypto, and Tailwind CSS. 100% type-safe with zero proprietary vendor lock-in.
* **Operational Feasibility:** Bilingual English & Amharic (አማርኛ) support, right-aligned mobile ergonomics, and USSD feature phone interface.
* **Economic Feasibility:** Self-sustaining monetization via 8% platform commissions and automated 15% source-deducted VAT tax compliance.
* **Legal & Regulatory Feasibility:** Adheres to National Lottery Administration Proclamation No. 535/2007 and PDPP Proclamation No. 1321/2024.

> **Speaker Note:** "All feasibility dimensions—technical, economic, operational, and regulatory—were rigorously analyzed and satisfied."

---

## 📑 SLIDE 8: Software Methodology & Monorepo Architecture
* **Agile Scrum Methodology:** 2-week sprint cycles, daily standups, and pull request code reviews.
* **Turborepo Monorepo Structure:**
  * `apps/web`: Customer Portal, POS Kiosk, USSD (`*804#`) Simulator, Public Verifier (Port 3000).
  * `apps/admin`: Admin Operations, Financial Ledger, Live Draw Console (Port 3001).
  * `packages/database`: Prisma schema (18 models), migrations, seed scripts.
  * `packages/shared`: Payments, Ledger, Fair-RNG, Risk, Two-Person, i18n.

> **Speaker Note:** "Our monorepo cleanly separates shared business logic from the user-facing web and admin applications."

---

## 📑 SLIDE 9: Double-Entry Financial Ledger Deliverable
* Every ticket purchase atomically posts balanced journal entries across standard Chart of Accounts:
  * **Debit:** `1010-CASH-TRANSIT` (Asset &bull; 100%)
  * **Credit:** `2020-VAT-PAYABLE` (Liability &bull; 15% MoR Tax Escrow)
  * **Credit:** `2010-PRIZE-ESCROW` (Liability &bull; 77% Seller Holding)
  * **Credit:** `4010-PLATFORM-REVENUE` (Revenue &bull; 8% Platform Fee)
* **Trial Balance Status:** 100% Balanced with zero mathematical variance ($\Delta = 0.00$).

> **Speaker Note:** "This guarantees that money in transit, prize escrow, and government taxes are balanced down to the exact cent."

---

## 📑 SLIDE 10: Provably Fair Verification & Two-Person Consensus
* **Pre-Commitment:** Digital SHA-256 commitment published prior to selling ticket #1.
* **Immutable Snapshot:** When sales close, the exact ticket universe is locked in `DrawSnapshot`.
* **Two-Person Consensus:** Draw Operator initiates $\rightarrow$ Super Admin approves.
* **Deterministic Math:** `Winner = (BigInt(SHA256(v2.0 : RaffleID : Seed : Sold : PublicEntropy : Algo)) % Sold) + 1`.
* **Public Verifier:** Instant 1-click independent proof validator at `/verifier`.

> **Speaker Note:** "Neither the operator nor the buyer can manipulate the winning outcome once the pre-commitment is published."

---

## 📑 SLIDE 11: Conclusion & Recommendations
* **Conclusion:** Successfully architected and deployed a production-grade digital raffle and financial transaction platform for SORARDI PLC, compiling 57 Next.js routes with zero errors.
* **Recommendations for SORARDI PLC:** Implement cloud Hardware Security Modules (HSM) and dedicated telecom SMPP SMS gateways.
* **Recommendations for DDU:** Introduce enterprise monorepo tools (Turborepo) and financial ledger design into software engineering lab coursework.

> **Speaker Note:** "In conclusion, this internship successfully demonstrated the application of advanced software engineering in building resilient financial infrastructure."

---

## 📑 SLIDE 12: Live System Demonstration Walkthrough
1. **Flow 1: Customer Ticket Purchase** $\rightarrow$ Decoupled purchase order, Telebirr payment simulation, and atomic ticket minting.
2. **Flow 2: Double-Entry Financial Ledger** $\rightarrow$ Review balanced journal entries, 15% VAT escrow, and trial balance on `/financials`.
3. **Flow 3: Two-Person Provably Fair Live Draw** $\rightarrow$ Snapshot freeze, dual-authorization, and public verification at `/verifier`.
4. **Flow 4: Winner Claim QR & Merchant Scanning** $\rightarrow$ Dynamic QR token generation and merchant delivery escrow release.
5. **Flow 5: Data Privacy Governance** $\rightarrow$ PDPP Proclamation No. 1321/2024 compliance portal.

> **Speaker Note:** "Thank you for your time and attention. I will now proceed to the live demonstration of the LuckyEthio system."

