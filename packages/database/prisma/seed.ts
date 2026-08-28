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

  // 2. Create Agent Profiles & Float
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

  const pendingAgent = await prisma.agent.create({
    data: {
      userId: agentUser2.id,
      fullName: "Mulugeta Bekele",
      businessName: "Piazza Stationery & Mobile",
      nationalIdRef: "ETH-NAT-445566",
      region: "Addis Ababa (Arada Subcity)",
      tier: "AGENT",
      status: "PENDING",
      commissionRate: 4.5,
      dailySalesLimit: 25000,
      walletMode: "PREPAID",
      floatBalance: 0.0,
      creditLimit: 0,
    },
  });

  console.log("✅ Created Agents & Wallets");

  // 3. Create Raffles
  const secret1 = crypto.randomBytes(16).toString("hex");
  const raffle1Id = crypto.randomUUID();
  const commit1 = generateCommitHash(secret1, raffle1Id, 10000);

  const raffle1 = await prisma.raffle.create({
    data: {
      id: raffle1Id,
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
      title: "Luxury 3-Bedroom Apartment in Bole",
      titleAm: "የቅንጦት ባለ 3 መኝታ አፓርትመንት በቦሌ",
      description: "Fully furnished 165 sqm modern condo near Bole Medhanialem with underground parking, backup generator, and 24/7 security.",
      descriptionAm: "ቦሌ መድኃኒዓለም አካባቢ የሚገኝ ባለ 165 ካሬ ሜትር ዘመናዊና ሙሉ እቃ የተሟላለት አፓርትመንት።",
      category: "REAL_ESTATE",
      prizeName: "3-Bedroom Bole Luxury Condo",
      prizeNameAm: "ባለ 3 መኝታ የቦሌ አፓርትመንት",
      prizeImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      prizeValue: 28000000,
      ticketPrice: 500,
      totalTickets: 25000,
      soldTickets: 18940,
      maxTicketsPerUser: 200,
      status: "ACTIVE",
      drawDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      commitHash: commit2,
      secretSeed: secret2,
    },
  });

  const secret3 = crypto.randomBytes(16).toString("hex");
  const raffle3Id = crypto.randomUUID();
  const commit3 = generateCommitHash(secret3, raffle3Id, 2000);

  const raffle3 = await prisma.raffle.create({
    data: {
      id: raffle3Id,
      title: "Apple iPhone 16 Pro Max (1TB Titanium)",
      titleAm: "አፕል አይፎን 16 ፕሮ ማክስ (1TB ታይታኒየም)",
      description: "Brand new unopened iPhone 16 Pro Max 1TB with AppleCare+, USB-C Fast Charger, and AirPods Pro 2 included!",
      descriptionAm: "አዲስ የታሸገ አይፎን 16 ፕሮ ማክስ 1TB ከአፕል ኬር እና ኤርፖድስ ፕሮ 2 ጋር!",
      category: "ELECTRONICS",
      prizeName: "iPhone 16 Pro Max 1TB",
      prizeNameAm: "አይፎን 16 ፕሮ ማክስ 1TB",
      prizeImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
      prizeValue: 185000,
      ticketPrice: 50,
      totalTickets: 2000,
      soldTickets: 1450,
      maxTicketsPerUser: 50,
      status: "ACTIVE",
      drawDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      commitHash: commit3,
      secretSeed: secret3,
    },
  });

  const secret4 = crypto.randomBytes(16).toString("hex");
  const raffle4Id = crypto.randomUUID();
  const commit4 = generateCommitHash(secret4, raffle4Id, 15000);

  const raffle4 = await prisma.raffle.create({
    data: {
      id: raffle4Id,
      title: "1,000,000 ETB Cash Prize (Direct Bank Transfer)",
      titleAm: "1,000,000 ብር የጥሬ ገንዘብ ሽልማት (በቀጥታ በባንክ)",
      description: "One Million Ethiopian Birr transferred instantly to your Telebirr, CBE, or Awash Bank account on live television broadcast.",
      descriptionAm: "አንድ ሚሊዮን የኢትዮጵያ ብር በቀጥታ ወደ ቴሌብር ወይም ንግድ ባንክ ሂሳብዎ ገቢ ይደረጋል!",
      category: "CASH",
      prizeName: "1,000,000 ETB Cash",
      prizeNameAm: "1,000,000 ብር ጥሬ ገንዘብ",
      prizeImage: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80",
      prizeValue: 1000000,
      ticketPrice: 100,
      totalTickets: 15000,
      soldTickets: 8720,
      maxTicketsPerUser: 100,
      status: "ACTIVE",
      drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      commitHash: commit4,
      secretSeed: secret4,
    },
  });

  // Past Drawn Raffle for Provably Fair Verification Testing
  const pastSecret = "7f8b9c2a1d4e6f30a9b8c7d6e5f4a3b2";
  const pastRaffleId = crypto.randomUUID();
  const pastCommit = generateCommitHash(pastSecret, pastRaffleId, 1000);

  const pastRaffle = await prisma.raffle.create({
    data: {
      id: pastRaffleId,
      title: "Suzuki Dzire 2024 (Season 1 Grand Draw)",
      titleAm: "ሱዙኪ ዲዛየር 2024 (የዙር 1 ታላቅ እጣ)",
      description: "Season 1 completed raffle. Provably fair draw executed and verified on live television.",
      descriptionAm: "የተጠናቀቀ እጣ። በፍትሃዊ እና በቴክኖሎጂ በተረጋገጠ ስርአት የተከናወነ።",
      category: "VEHICLE",
      prizeName: "Suzuki Dzire 2024",
      prizeNameAm: "ሱዙኪ ዲዛየር 2024",
      prizeImage: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
      prizeValue: 2400000,
      ticketPrice: 100,
      totalTickets: 1000,
      soldTickets: 1000,
      maxTicketsPerUser: 20,
      status: "DRAWN",
      drawDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      commitHash: pastCommit,
      secretSeed: pastSecret,
      revealedSeed: pastSecret,
      winningTicketNumber: 427,
      winnerUserId: customer1.id,
    },
  });

  await prisma.drawAudit.create({
    data: {
      raffleId: pastRaffle.id,
      commitHash: pastCommit,
      secretSeed: pastSecret,
      revealedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      totalSoldTickets: 1000,
      winningTicketNumber: 427,
      formulaDescription: "SHA256(secretSeed) % totalSoldTickets + 1",
      verifiedBy: "National Lottery Administration Auditor (NLA-ETH-2026)",
    },
  });

  console.log("✅ Created Raffles & Provably Fair Draw Audit");

  // 4. Seed initial tickets for Customer 1 & 2
  const tx1 = await prisma.transaction.create({
    data: {
      userId: customer1.id,
      raffleId: raffle1.id,
      customerPhone: customer1.phone,
      txRef: "TX-CHAPA-1001",
      amount: 400,
      ticketCount: 2,
      paymentMethod: "CHAPA",
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

  // Seed Agent cash sale
  const txAgent = await prisma.transaction.create({
    data: {
      userId: customer2.id,
      raffleId: raffle3.id,
      customerPhone: customer2.phone,
      txRef: "TX-AGENT-CASH-2001",
      amount: 150,
      ticketCount: 3,
      paymentMethod: "AGENT_CASH",
      status: "SUCCESS",
    },
  });

  for (const num of [101, 102, 103]) {
    await prisma.ticket.create({
      data: {
        raffleId: raffle3.id,
        userId: customer2.id,
        customerPhone: customer2.phone,
        ticketNumber: num,
        transactionId: txAgent.id,
        soldByAgentId: activeAgent.id,
        purchaseMethod: "AGENT_CASH",
        verificationCode: generateVerificationCode(),
        status: "CONFIRMED",
      },
    });
  }

  // Winning ticket for past drawn raffle
  await prisma.ticket.create({
    data: {
      raffleId: pastRaffle.id,
      userId: customer1.id,
      customerPhone: customer1.phone,
      ticketNumber: 427,
      purchaseMethod: "ONLINE",
      verificationCode: "TKT-WINNER-427-LUCKY",
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

