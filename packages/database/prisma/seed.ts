import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function generateCommitHash(secretSeed: string, raffleId: string, totalTickets: number) {
  const version = "v2.0";
  const algorithm = "SHA-256-COMMIT-REVEAL";
  const publicEntropy = "ETHIO-TELECOM-NLA-CONSENSUS";
  const payload = `${version}:${raffleId}:${secretSeed}:${totalTickets}:${publicEntropy}:${algorithm}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

async function main() {
  console.log("🌱 Starting Enterprise database seeding...");

  // Clean existing records in dependency order
  await prisma.ledgerEntry.deleteMany({});
  await prisma.ledgerTransaction.deleteMany({});
  await prisma.ledgerAccount.deleteMany({});
  await prisma.twoPersonApproval.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.riskEvent.deleteMany({});
  await prisma.drawSnapshot.deleteMany({});
  await prisma.dataSubjectRequest.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.cashoutRequest.deleteMany({});
  await prisma.redemption.deleteMany({});
  await prisma.taxLedger.deleteMany({});
  await prisma.drawAudit.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.paymentAttempt.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.agentLedger.deleteMany({});
  await prisma.agentAccessLog.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.raffle.deleteMany({});
  await prisma.seller.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.uSSDSession.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});

  // 1. Seed Dynamic Enterprise RBAC Roles
  console.log("🔐 1. Seeding Enterprise Roles & Permissions...");
  const superAdminRole = await prisma.role.create({
    data: { name: "SUPER_ADMIN", description: "Master platform authority with root capabilities" },
  });
  const opsAdminRole = await prisma.role.create({
    data: { name: "OPERATIONS_ADMIN", description: "Listing appraisal and agent onboarding" },
  });
  const financeAdminRole = await prisma.role.create({
    data: { name: "FINANCE_ADMIN", description: "Double-entry ledger, escrow releases and cashouts" },
  });
  const drawOperatorRole = await prisma.role.create({
    data: { name: "DRAW_OPERATOR", description: "Initiate and execute provably fair draws" },
  });
  const complianceRole = await prisma.role.create({
    data: { name: "COMPLIANCE_ADMIN", description: "NLA regulatory compliance and PDPP data requests" },
  });
  const agentRole = await prisma.role.create({
    data: { name: "AGENT", description: "Field agent POS kiosk ticket sales" },
  });
  const sellerRole = await prisma.role.create({
    data: { name: "SELLER", description: "Independent merchant listing and delivery QR scanning" },
  });
  const customerRole = await prisma.role.create({
    data: { name: "CUSTOMER", description: "Direct ticket buyer" },
  });

  const permissions = [
    { key: "listing:approve", description: "Approve merchant listings" },
    { key: "payout:approve", description: "Authorize cashout disbursements" },
    { key: "draw:initiate", description: "Initiate draw execution under two-person rule" },
    { key: "draw:approve", description: "Approve draw execution under two-person rule" },
    { key: "ledger:view", description: "View double-entry financial ledger" },
    { key: "risk:manage", description: "Review and resolve fraud risk events" },
    { key: "privacy:resolve", description: "Resolve PDPP data subject requests" },
  ];

  for (const p of permissions) {
    const perm = await prisma.permission.create({ data: p });
    await prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // 2. Seed Double-Entry Chart of Accounts
  console.log("📊 2. Seeding Double-Entry Chart of Accounts...");
  const cashTransit = await prisma.ledgerAccount.create({
    data: { code: "1010-CASH-TRANSIT", name: "Cash in Transit / Payment Gateway Clearing", type: "ASSET", balance: 540000.0 },
  });
  const prizeEscrow = await prisma.ledgerAccount.create({
    data: { code: "2010-PRIZE-ESCROW", name: "Seller & Winner Prize Escrow Holding", type: "LIABILITY", balance: 415800.0 },
  });
  const vatPayable = await prisma.ledgerAccount.create({
    data: { code: "2020-VAT-PAYABLE", name: "Statutory 15% Ethiopian VAT Payable (MoR)", type: "LIABILITY", balance: 81000.0 },
  });
  const agentPayable = await prisma.ledgerAccount.create({
    data: { code: "2030-AGENT-COMMISSION", name: "Agent Sales Commission Payable", type: "LIABILITY", balance: 0.0 },
  });
  const platformRevenue = await prisma.ledgerAccount.create({
    data: { code: "4010-PLATFORM-REVENUE", name: "Operating Platform Fee & Commission Revenue", type: "REVENUE", balance: 43200.0 },
  });

  // Seed Balanced Ledger Transaction
  const ledgerTx = await prisma.ledgerTransaction.create({
    data: {
      transactionNumber: "LTX-20260830-INIT-001",
      referenceType: "TICKET_PURCHASE",
      referenceId: "BATCH-TICKET-INIT",
      description: "Batch initial ticket sales allocation double-entry posting",
      status: "POSTED",
      entries: {
        create: [
          { ledgerAccountId: cashTransit.id, entryType: "DEBIT", amount: 540000.0 },
          { ledgerAccountId: vatPayable.id, entryType: "CREDIT", amount: 81000.0 },
          { ledgerAccountId: prizeEscrow.id, entryType: "CREDIT", amount: 415800.0 },
          { ledgerAccountId: platformRevenue.id, entryType: "CREDIT", amount: 43200.0 },
        ],
      },
    },
  });

  // 3. Create Seed Users
  console.log("👥 3. Creating Seed Users & Roles...");
  const superAdmin = await prisma.user.create({
    data: {
      phone: "+251911000000",
      fullName: "Abebe Kebede (Super Admin)",
      role: "SUPER_ADMIN",
      roleId: superAdminRole.id,
      isVerified: true,
      nationalId: "ETH-NAT-890123",
      preferredLang: "EN",
    },
  });

  const drawOperator = await prisma.user.create({
    data: {
      phone: "+251911000002",
      fullName: "Yared Wolde (Draw Operator)",
      role: "DRAW_OPERATOR",
      roleId: drawOperatorRole.id,
      isVerified: true,
      nationalId: "ETH-NAT-890125",
      preferredLang: "EN",
    },
  });

  const sellerUser1 = await prisma.user.create({
    data: {
      phone: "+251911223344",
      fullName: "Kidus Assefa (Kidus Motors)",
      role: "SELLER",
      roleId: sellerRole.id,
      isVerified: true,
      kycStatus: "VERIFIED",
      nationalId: "ETH-NAT-556677",
      preferredLang: "EN",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      phone: "+251933445566",
      fullName: "Helen Tesfaye",
      role: "CUSTOMER",
      roleId: customerRole.id,
      isVerified: true,
      walletBalance: 25000.0,
      nationalId: "ETH-NAT-778899",
      preferredLang: "EN",
    },
  });

  // 4. Create Seller
  const approvedSeller = await prisma.seller.create({
    data: {
      userId: sellerUser1.id,
      businessName: "Kidus Luxury Motors PLC",
      contactPerson: "Kidus Assefa",
      phone: sellerUser1.phone,
      tinNumber: "0098765432",
      licenseRef: "LIC-AA-2025-4421",
      faydaIdNumber: "FAN-9902-8812-44",
      faydaIdDocUrl: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80",
      region: "Addis Ababa (Bole)",
      status: "APPROVED",
      payoutAccount: "CBE 1000234567890",
      payoutBalance: 340000.0,
      escrowBalance: 720000.0,
      commissionRate: 8.0,
      rating: 4.95,
      reviewsCount: 12,
    },
  });

  // 5. Create Raffles with Full Lifecycle
  console.log("🎟️ 4. Creating Raffles & Snapshots...");
  const secret1 = crypto.randomBytes(16).toString("hex");
  const raffle1Id = crypto.randomUUID();
  const commit1 = generateCommitHash(secret1, raffle1Id, 10000);

  const raffle1 = await prisma.raffle.create({
    data: {
      id: raffle1Id,
      sellerId: approvedSeller.id,
      title: "2024 Toyota Hilux Double Cab 4x4",
      titleAm: "2024 ቶዮታ ሃይለክስ ባለ ሁለት ካብ 4x4",
      description: "Win a brand new 2024 Toyota Hilux 2.8L Diesel Double Cab with zero km! Fully customs-cleared with all duties paid.",
      descriptionAm: "አዲስ 2024 ቶዮታ ሃይለክስ 2.8 ሊትር ዲዝል ባለ ሁለት ካቢን መኪና ያሸንፉ! ሙሉ ቀረጥ የተከፈለበት።",
      category: "VEHICLE",
      prizeName: "Toyota Hilux 2024 4x4",
      prizeNameAm: "ቶዮታ ሃይለክስ 2024",
      prizeImage: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
      photo1: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
      photo2: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      photo3: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      declaredMarketValue: 9500000,
      prizeValue: 9500000,
      cashEquivalentAmount: 8500000,
      ticketPrice: 200,
      totalTickets: 10000,
      soldTickets: 2700,
      status: "OPEN",
      moderationStatus: "APPROVED",
      appraisalStatus: "APPROVED",
      drawDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      commitHash: commit1,
      secretSeed: secret1,
      publicEntropy: "ETHIO-TELECOM-NLA-CONSENSUS",
    },
  });

  // Seed Purchase Order and Payment Attempt
  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PUR-20260830-00125",
      customerPhone: customer1.phone,
      userId: customer1.id,
      raffleId: raffle1.id,
      quantity: 2,
      unitPrice: 200.0,
      totalAmount: 400.0,
      status: "PAID",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  await prisma.paymentAttempt.create({
    data: {
      purchaseOrderId: purchaseOrder.id,
      provider: "TELEBIRR",
      providerReference: "telebirr_tx_88992211",
      amount: 400.0,
      status: "SUCCESS",
      idempotencyKey: "idemp_telebirr_88992211",
    },
  });

  // Seed Concluded Raffle with Draw Snapshot
  const secretDrawn = crypto.randomBytes(16).toString("hex");
  const drawnRaffleId = crypto.randomUUID();
  const commitDrawn = generateCommitHash(secretDrawn, drawnRaffleId, 5000);

  const drawnRaffle = await prisma.raffle.create({
    data: {
      id: drawnRaffleId,
      sellerId: approvedSeller.id,
      title: "2026 Sony 85\" BRAVIA XR OLED 4K TV",
      titleAm: "2026 ሶኒ 85 ኢንች ብራቪያ OLED 4K ቴሌቪዥን",
      description: "Flagship 85-inch 4K HDR QD-OLED Smart TV with Dolby Vision.",
      category: "ELECTRONICS",
      prizeName: "Sony 85\" BRAVIA XR OLED",
      prizeImage: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80",
      photo1: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80",
      photo2: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80",
      photo3: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80",
      declaredMarketValue: 650000,
      prizeValue: 650000,
      cashEquivalentAmount: 580000,
      ticketPrice: 150,
      totalTickets: 5000,
      soldTickets: 5000,
      status: "COMPLETED",
      moderationStatus: "APPROVED",
      appraisalStatus: "APPROVED",
      drawDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      drawnAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      commitHash: commitDrawn,
      secretSeed: secretDrawn,
      publicEntropy: "ETHIO-TELECOM-NLA-CONSENSUS",
      winningTicketNumber: 77,
      winnerUserId: customer1.id,
      winnerChoice: "ITEM",
    },
  });

  // Seed Immutable Draw Snapshot
  await prisma.drawSnapshot.create({
    data: {
      raffleId: drawnRaffle.id,
      snapshotNumber: "SNAP-2026-0077",
      totalTickets: 5000,
      soldTickets: 5000,
      eligibleTicketCount: 5000,
      ticketUniverseHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      commitmentHash: commitDrawn,
      secretSeedHash: crypto.createHash("sha256").update(secretDrawn).digest("hex"),
      publicEntropy: "ETHIO-TELECOM-NLA-CONSENSUS",
      algorithmVersion: "SHA-256-COMMIT-REVEAL-v2",
      snapshotHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    },
  });

  // Winning Ticket
  const winningTicket = await prisma.ticket.create({
    data: {
      raffleId: drawnRaffle.id,
      userId: customer1.id,
      customerPhone: customer1.phone,
      ticketNumber: 77,
      purchaseMethod: "ONLINE",
      verificationCode: "TKT-SONY-WIN-77",
      qrVerificationUrl: `/verifier?ref=TKT-SONY-WIN-77&raffle=${drawnRaffle.id}&num=77`,
      vatDeductedAmount: 22.5,
      netEscrowAmount: 127.5,
      status: "ACTIVE",
    },
  });

  // Dynamic QR Claim
  const claimToken = "CLAIM-QR-ETHIO-2026-WINNER-77";
  await prisma.redemption.create({
    data: {
      raffleId: drawnRaffle.id,
      winnerUserId: customer1.id,
      winnerPhone: customer1.phone,
      choice: "ITEM",
      claimQrCode: claimToken,
      claimQrHash: crypto.createHash("sha256").update(claimToken).digest("hex"),
      autoReleaseDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      deliveryStatus: "QR_GENERATED",
    },
  });

  // 6. Seed Two-Person Rule Approval
  console.log("🛡️ 5. Seeding Two-Person Rule Approvals & Audit Logs...");
  await prisma.twoPersonApproval.create({
    data: {
      operationType: "DRAW_EXECUTION",
      entityId: drawnRaffle.id,
      entityType: "RAFFLE",
      initiatedById: drawOperator.id,
      approvedById: superAdmin.id,
      status: "APPROVED",
      metadata: JSON.stringify({ formula: "SHA-256-COMMIT-REVEAL-v2", eligibleTickets: 5000 }),
      approvedAt: new Date(),
    },
  });

  // 7. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      actorId: drawOperator.id,
      actorType: "ADMIN",
      action: "DRAW_INITIATED",
      entityType: "RAFFLE",
      entityId: drawnRaffle.id,
      afterState: JSON.stringify({ status: "SNAPSHOT_LOCKED", snapshotNumber: "SNAP-2026-0077" }),
      ipAddress: "196.188.24.10",
      requestId: "REQ-DRAW-0077",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      actorType: "ADMIN",
      action: "TWO_PERSON_APPROVED_DRAW",
      entityType: "RAFFLE",
      entityId: drawnRaffle.id,
      afterState: JSON.stringify({ winningTicket: 77, verifiedBy: "Two-Person Consensus" }),
      ipAddress: "196.188.24.12",
      requestId: "REQ-APP-0077",
    },
  });

  // 8. Seed Risk Event
  await prisma.riskEvent.create({
    data: {
      customerPhone: "+251911998877",
      riskScore: 25,
      riskLevel: "LOW",
      reasonCode: "STANDARD_PURCHASE",
      details: JSON.stringify({ velocityScore: "Normal", cardCheck: "Passed" }),
    },
  });

  console.log("🎉 Enterprise database seeding completed successfully with double-entry accounting!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
