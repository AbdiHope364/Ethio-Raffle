import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function generateCommitHash(secretSeed: string, raffleId: string, totalTickets: number) {
  return crypto
    .createHash("sha256")
    .update(`${secretSeed}:${raffleId}:${totalTickets}`)
    .digest("hex");
}

function generateVerificationCode(): string {
  return "TKT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing records
  await prisma.drawAudit.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.agentLedger.deleteMany({});
  await prisma.agentAccessLog.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.raffle.deleteMany({});
  await prisma.seller.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.uSSDSession.deleteMany({});

  // 1. Create Users
  const superAdmin = await prisma.user.create({
    data: {
      phone: "+251911000000",
      fullName: "Abebe Kebede (Super Admin)",
      role: "SUPER_ADMIN",
      isVerified: true,
      nationalId: "ETH-NAT-890123",
      preferredLang: "EN",
    },
  });

  const admin = await prisma.user.create({
    data: {
      phone: "+251911000001",
      fullName: "Sara Haile (Admin)",
      role: "ADMIN",
      isVerified: true,
      nationalId: "ETH-NAT-890124",
      preferredLang: "AM",
    },
  });

  const sellerUser1 = await prisma.user.create({
    data: {
      phone: "+251911223344",
      fullName: "Kidus Assefa (Kidus Motors)",
      role: "SELLER",
      isVerified: true,
      nationalId: "ETH-NAT-556677",
      preferredLang: "EN",
    },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      phone: "+251911998877",
      fullName: "Selamawit Desta (Ethio Tech)",
      role: "SELLER",
      isVerified: false,
      nationalId: "ETH-NAT-889900",
      preferredLang: "AM",
    },
  });

  const agentUser1 = await prisma.user.create({
    data: {
      phone: "+251912345678",
      fullName: "Dawit Tadesse",
      role: "AGENT",
      isVerified: true,
      nationalId: "ETH-NAT-112233",
      preferredLang: "AM",
    },
  });

  const agentUser2 = await prisma.user.create({
    data: {
      phone: "+251922334455",
      fullName: "Mulugeta Bekele",
      role: "AGENT",
      isVerified: false,
      nationalId: "ETH-NAT-445566",
      preferredLang: "EN",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      phone: "+251933445566",
      fullName: "Helen Tesfaye",
      role: "CUSTOMER",
      isVerified: true,
      nationalId: "ETH-NAT-778899",
      preferredLang: "EN",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      phone: "+251944556677",
      fullName: "Yohannes Girma",
      role: "CUSTOMER",
      isVerified: true,
      nationalId: "ETH-NAT-990011",
      preferredLang: "AM",
    },
  });

  console.log("✅ Created Users");

  // 2. Create Sellers (Gate 1 Moderation)
  const approvedSeller = await prisma.seller.create({
    data: {
      userId: sellerUser1.id,
      businessName: "Kidus Luxury Motors PLC",
      contactPerson: "Kidus Assefa",
      phone: sellerUser1.phone,
      tinNumber: "0098765432",
      licenseRef: "LIC-AA-2025-4421",
      region: "Addis Ababa (Bole)",
      status: "APPROVED",
      payoutAccount: "CBE 1000234567890",
      commissionRate: 8.0,
    },
  });

  const pendingSeller = await prisma.seller.create({
    data: {
      userId: sellerUser2.id,
      businessName: "Ethio Tech Electronics Importers",
      contactPerson: "Selamawit Desta",
      phone: sellerUser2.phone,
      tinNumber: "0011223344",
      licenseRef: "LIC-AA-2026-9901",
      region: "Addis Ababa (Merkato)",
      status: "PENDING",
      payoutAccount: "Telebirr 0911998877",
      commissionRate: 8.0,
    },
  });

  console.log("✅ Created Multi-Vendor Sellers (Approved & Pending)");

  // 3. Create Agent Profiles & Float
  const activeAgent = await prisma.agent.create({
    data: {
      userId: agentUser1.id,
      fullName: "Dawit Tadesse",
      businessName: "Bole Medhanialem Kiosk & Tech",
      nationalIdRef: "ETH-NAT-112233",
      region: "Addis Ababa (Bole Subcity)",
      tier: "AGENT",
      status: "ACTIVE",
      commissionRate: 5.0,
      dailySalesLimit: 50000,
      walletMode: "PREPAID",
      floatBalance: 15000.0,
      creditLimit: 0,
      createdByAdminId: admin.id,
    },
  });

  await prisma.agentLedger.create({
    data: {
      agentId: activeAgent.id,
      entryType: "TOPUP",
      amount: 15000.0,
      balanceAfter: 15000.0,
      referenceId: "CBE-FLOAT-TX-998811",
      note: "Initial bank deposit top-up via CBE Birr",
    },
  });

  await prisma.agentAccessLog.create({
    data: {
      agentId: activeAgent.id,
      changedByAdminId: admin.id,
      action: "GRANTED",
      details: JSON.stringify({ reason: "KYC approved, signed physical agent agreement", commission: 5.0 }),
    },
  });

  console.log("✅ Created Agents & Wallets");

  // 4. Create Live Raffles (Gate 2 Moderation & Incomplete Sales Dual-Consent)
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
      prizeValue: 9500000,
      ticketPrice: 200,
      totalTickets: 10000,
      soldTickets: 4320,
      maxTicketsPerUser: 100,
      status: "ACTIVE",
      moderationStatus: "APPROVED",
      drawDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      commitHash: commit1,
      secretSeed: secret1,
    },
  });

  const secret2 = crypto.randomBytes(16).toString("hex");
  const raffle2Id = crypto.randomUUID();
  const commit2 = generateCommitHash(secret2, raffle2Id, 25000);

  const raffle2 = await prisma.raffle.create({
    data: {
      id: raffle2Id,
      sellerId: approvedSeller.id,
      title: "Luxury 3-Bedroom Apartment in Bole",
      titleAm: "የቅንጦት ባለ 3 መኝታ አፓርትመንት በቦሌ",
      description: "Fully furnished 165 sqm modern condo near Bole Medhanialem with underground parking, backup generator, and 24/7 security.",
      descriptionAm: "ቦሌ መድኃኒዓለም አካባቢ የሚገኝ ባለ 165 ካሬ ሜትር ዘመናዊና ሙሉ እቃ የተሟላለት አፓርትመንት።",
      category: "REAL_ESTATE",
      prizeName: "3-Bedroom Bole Luxury Condo",
      prizeNameAm: "ባለ 3 መኝታ የቦሌ አፓርትመንት",
      prizeImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      prizeValue: 18500000,
      ticketPrice: 500,
      totalTickets: 25000,
      soldTickets: 12400,
      maxTicketsPerUser: 250,
      status: "ACTIVE",
      moderationStatus: "APPROVED",
      drawDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      commitHash: commit2,
      secretSeed: secret2,
    },
  });

  // UNDER-SUBSCRIBED / EXPIRED RAFFLE (For testing Dual-Consent Incomplete Sales Rule!)
  const secretPartial = crypto.randomBytes(16).toString("hex");
  const partialRaffleId = crypto.randomUUID();
  const commitPartial = generateCommitHash(secretPartial, partialRaffleId, 1000);

  const partialRaffle = await prisma.raffle.create({
    data: {
      id: partialRaffleId,
      sellerId: approvedSeller.id,
      title: "Apple MacBook Pro 16\" M3 Max (1TB SSD)",
      titleAm: "አፕል ማክቡክ ፕሮ 16 ኢንች M3 ማክስ",
      description: "Space Black M3 Max MacBook Pro. Incomplete capacity test scenario for dual-consent consensus.",
      category: "ELECTRONICS",
      prizeName: "MacBook Pro 16\" M3 Max",
      prizeImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      prizeValue: 380000,
      ticketPrice: 150,
      totalTickets: 1000,
      soldTickets: 680, // 68% sold
      status: "ACTIVE",
      moderationStatus: "APPROVED",
      drawDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // EXPIRED 2 hours ago!
      sellerDrawConsent: false,
      adminDrawConsent: false,
      commitHash: commitPartial,
      secretSeed: secretPartial,
    },
  });

  // PENDING MODERATION RAFFLE (Gate 2 Queue test)
  const secretPending = crypto.randomBytes(16).toString("hex");
  const pendingRaffleId = crypto.randomUUID();
  const commitPending = generateCommitHash(secretPending, pendingRaffleId, 5000);

  const pendingRaffle = await prisma.raffle.create({
    data: {
      id: pendingRaffleId,
      sellerId: approvedSeller.id,
      title: "2026 Suzuki Dzire GLX Automatic",
      titleAm: "2026 ሱዙኪ ዲዛይር አውቶማቲክ",
      description: "Brand new zero mileage vehicle submitted by Kidus Motors awaiting admin moderation review.",
      category: "VEHICLE",
      prizeName: "Suzuki Dzire 2026",
      prizeImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
      prizeValue: 2400000,
      ticketPrice: 150,
      totalTickets: 5000,
      soldTickets: 0,
      status: "ACTIVE",
      moderationStatus: "PENDING_APPROVAL", // Under review in Gate 2
      drawDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      commitHash: commitPending,
      secretSeed: secretPending,
    },
  });

  console.log("✅ Created Raffles with Moderation & Dual-Consent states");

  // 5. Seed Real Tickets & Transactions
  const tx1 = await prisma.transaction.create({
    data: {
      userId: customer1.id,
      raffleId: raffle1.id,
      customerPhone: customer1.phone,
      txRef: "TX-TELEBIRR-1001",
      amount: 400,
      ticketCount: 2,
      paymentMethod: "TELEBIRR",
      status: "SUCCESS",
    },
  });

  await prisma.ticket.create({
    data: {
      raffleId: raffle1.id,
      userId: customer1.id,
      customerPhone: customer1.phone,
      ticketNumber: 7,
      transactionId: tx1.id,
      purchaseMethod: "ONLINE",
      verificationCode: generateVerificationCode(),
      status: "CONFIRMED",
    },
  });

  await prisma.ticket.create({
    data: {
      raffleId: raffle1.id,
      userId: customer1.id,
      customerPhone: customer1.phone,
      ticketNumber: 42,
      transactionId: tx1.id,
      purchaseMethod: "ONLINE",
      verificationCode: generateVerificationCode(),
      status: "CONFIRMED",
    },
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
