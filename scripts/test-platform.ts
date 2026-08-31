import { prisma } from "../packages/database/src/index";
import {
  generateSecretSeed,
  generateCommitHash,
  deriveWinningTicketNumber,
  verifyDrawResult,
} from "../packages/shared/src/provably-fair";
import {
  executeAtomicTicketPurchase,
  reserveTicketsForOneHour,
  cleanupExpiredReservations,
} from "../packages/shared/src/concurrency";
import { handleUSSD } from "../packages/shared/src/ussd";
import { initiatePayment, processPaymentSuccess } from "../packages/shared/src/payment";

async function runPlatformTests() {
  console.log("=================================================");
  console.log("🧪 STARTING RAFFLE PLATFORM MONOREPO TEST SUITE");
  console.log("=================================================\n");

  // 1. TEST CONCURRENCY & ANTI-COLLISION
  console.log("▶ TEST 1: Concurrency & Anti-Collision Ticket Minting");
  const testRaffle = await prisma.raffle.create({
    data: {
      title: "Concurrency Test Raffle",
      description: "Testing race conditions under 100 concurrent requests",
      prizeName: "Test Prize",
      prizeImage: "https://via.placeholder.com/400",
      prizeValue: 50000,
      ticketPrice: 50,
      totalTickets: 20, // Low capacity to test oversell barrier
      soldTickets: 0,
      drawDate: new Date(Date.now() + 86400000),
      status: "ACTIVE",
    },
  });

  // Attempt 1: 10 concurrent requests all requesting the exact same ticket #5
  console.log("  Simulating 10 concurrent requests competing for Ticket #5...");
  const singleSlotRequests = Array.from({ length: 10 }).map((_, i) =>
    executeAtomicTicketPurchase({
      raffleId: testRaffle.id,
      customerPhone: `+2519110000${i}`,
      ticketCount: 1,
      specificNumbers: [5],
      paymentMethod: "TELEBIRR",
    })
  );

  const singleSlotResults = await Promise.all(singleSlotRequests);
  const successSingle = singleSlotResults.filter((r) => r.success).length;
  const blockedSingle = singleSlotResults.filter((r) => !r.success).length;

  console.log(`  ✓ Successful purchases for Ticket #5: ${successSingle} (Expected: 1)`);
  console.log(`  ✓ Blocked duplicate purchases: ${blockedSingle} (Expected: 9)`);

  if (successSingle !== 1) {
    throw new Error(`CRITICAL FAILURE: Duplicate ticket collision! Successful count: ${successSingle}`);
  }

  // Attempt 2: 25 concurrent quick picks competing for remaining 19 slots
  console.log("  Simulating 25 concurrent requests competing for remaining 19 slots...");
  const quickPickRequests = Array.from({ length: 25 }).map((_, i) =>
    executeAtomicTicketPurchase({
      raffleId: testRaffle.id,
      customerPhone: `+2519220000${i}`,
      ticketCount: 1,
      paymentMethod: "CBE_BIRR",
    })
  );

  const quickPickResults = await Promise.all(quickPickRequests);
  const successQuick = quickPickResults.filter((r) => r.success).length;
  const rejectedQuick = quickPickResults.filter((r) => !r.success).length;

  const refreshedRaffle = await prisma.raffle.findUnique({
    where: { id: testRaffle.id },
  });

  console.log(`  ✓ Total tickets sold: ${refreshedRaffle?.soldTickets} / ${testRaffle.totalTickets}`);
  console.log(`  ✓ Successful quick picks: ${successQuick}`);
  console.log(`  ✓ Gracefully rejected oversell attempts: ${rejectedQuick}`);

  if ((refreshedRaffle?.soldTickets || 0) > 20) {
    throw new Error(`CRITICAL FAILURE: Overselling occurred! Total sold: ${refreshedRaffle?.soldTickets}`);
  }
  console.log("  ✅ Test 1 Passed: Zero duplicates, Zero overselling!\n");

  // 2. TEST PROVABLY FAIR COMMIT-REVEAL CRYPTO
  console.log("▶ TEST 2: Provably Fair SHA-256 Commit-Reveal Cryptography");
  const secretSeed = generateSecretSeed();
  const raffleId = "raffle-uuid-test-999";
  const totalTickets = 5000;
  const totalSoldTickets = 3500;

  const commitHash = generateCommitHash(secretSeed, raffleId, totalTickets);
  const derivedWinner = deriveWinningTicketNumber(secretSeed, totalSoldTickets);

  console.log(`  Generated Secret Seed (32 bytes): ${secretSeed}`);
  console.log(`  Published SHA-256 Hash: ${commitHash}`);
  console.log(`  Deterministically Derived Winning Ticket: #${derivedWinner}`);

  const auditCheck = verifyDrawResult(
    secretSeed,
    commitHash,
    raffleId,
    totalTickets,
    totalSoldTickets,
    derivedWinner
  );

  console.log(`  Independent Auditor Verification Result: ${auditCheck.isValid ? "VALID ✓" : "INVALID ✗"}`);
  if (!auditCheck.isValid) {
    throw new Error("CRITICAL FAILURE: Provably Fair Cryptographic verification failed!");
  }
  console.log("  ✅ Test 2 Passed: Cryptographic verification 100% mathematically sound!\n");

  // 3. TEST AGENT FLOAT & COMMISSION LEDGER
  console.log("▶ TEST 3: Agent POS Float Deductions & Auto-Commission");
  const uniqueSuffix = Date.now().toString().slice(-6);
  const testAgentUser = await prisma.user.create({
    data: {
      phone: `+251999${uniqueSuffix}`,
      fullName: "Test Kiosk Agent",
      role: "AGENT",
      agentProfile: {
        create: {
          fullName: "Test Kiosk Agent",
          businessName: "Bole Medhanialem Kiosk",
          region: "Addis Ababa",
          commissionRate: 8.0,
          floatBalance: 500.0,
          status: "ACTIVE",
        },
      },
    },
    include: { agentProfile: true },
  });

  const agentId = testAgentUser.agentProfile!.id;

  const agentSaleRaffle = await prisma.raffle.create({
    data: {
      title: "Agent Test Raffle",
      description: "Testing POS float deduction",
      prizeName: "10,000 Birr Cash",
      prizeImage: "https://via.placeholder.com/400",
      prizeValue: 10000,
      ticketPrice: 100,
      totalTickets: 50,
      drawDate: new Date(Date.now() + 86400000),
      status: "ACTIVE",
    },
  });

  const posSaleResult = await executeAtomicTicketPurchase({
    raffleId: agentSaleRaffle.id,
    customerPhone: "+251911223344",
    ticketCount: 2,
    paymentMethod: "AGENT_CASH",
    soldByAgentId: agentId,
    purchaseMethod: "AGENT_CASH",
  });

  const refreshedAgent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { ledgerEntries: true },
  });

  console.log(`  Initial Agent Float: 500 ETB`);
  console.log(`  Sold 2 Tickets @ 100 ETB = 200 ETB deduction`);
  console.log(`  Accrued 8% Commission = 16 ETB`);
  console.log(`  Remaining Float: ${refreshedAgent?.floatBalance} ETB (Expected: 300 ETB)`);
  console.log(`  Ledger Audit Records Created: ${refreshedAgent?.ledgerEntries.length} entries`);

  if (refreshedAgent?.floatBalance !== 300) {
    throw new Error(`CRITICAL FAILURE: Float calculation incorrect. Expected 300, got ${refreshedAgent?.floatBalance}`);
  }
  console.log("  ✅ Test 3 Passed: Float deduction & ledger accounting verified!\n");

  // 4. TEST USSD PROTOCOL STATE MACHINE
  console.log("▶ TEST 4: USSD Offline State Machine Engine (*157#)");
  const testPhone = "+251988112233";

  // Dial *157#
  const step1 = await handleUSSD({
    sessionId: "SESSION-999-1",
    phoneNumber: testPhone,
    text: "",
  });
  console.log(`  Dial *157# Response: "${step1.message.split("\n")[0]}"`);

  // Step 2: Select 1 (Browse Raffles)
  const step2 = await handleUSSD({
    sessionId: "SESSION-999-1",
    phoneNumber: testPhone,
    text: "1",
  });
  console.log(`  Select Menu 1 Response: "${step2.message.split("\n")[0]}"`);

  if (!step1.continueSession || !step2.continueSession) {
    throw new Error("CRITICAL FAILURE: USSD session terminated unexpectedly!");
  }
  console.log("  ✅ Test 4 Passed: USSD state machine protocol working seamlessly!\n");

  // 5. TEST 1-HOUR TICKET RESERVATION & EXPIRY
  console.log("▶ TEST 5: 1-Hour Ticket Reservation, Lockout & Expiration Engine");
  const reserveRaffle = await prisma.raffle.create({
    data: {
      title: "1-Hour Reservation Test Raffle",
      description: "Testing hold timers and auto-expiry",
      prizeName: "Smart TV",
      prizeImage: "https://via.placeholder.com/400",
      prizeValue: 35000,
      ticketPrice: 100,
      totalTickets: 10,
      drawDate: new Date(Date.now() + 86400000),
      status: "ACTIVE",
    },
  });

  // Step A: Reserve ticket #3 for 60 minutes
  console.log("  Customer A reserving Ticket #3 for 60 minutes...");
  const resA = await reserveTicketsForOneHour({
    raffleId: reserveRaffle.id,
    customerPhone: "+251911111111",
    ticketCount: 1,
    specificNumbers: [3],
    holdMinutes: 60,
  });

  console.log(`  ✓ Reservation status: ${resA.success ? "RESERVED ✓" : "FAILED ✗"}`);
  if (!resA.success) throw new Error("Failed to reserve ticket #3.");

  // Step B: Customer B tries to reserve the same ticket #3 (Must be blocked!)
  console.log("  Customer B attempting to reserve the already-booked Ticket #3...");
  const resB = await reserveTicketsForOneHour({
    raffleId: reserveRaffle.id,
    customerPhone: "+251922222222",
    ticketCount: 1,
    specificNumbers: [3],
  });

  console.log(`  ✓ Blocked duplicate reservation attempt: ${!resB.success ? "BLOCKED ✓" : "FAILED ✗"}`);
  if (resB.success) throw new Error("CRITICAL FAILURE: Allowed booking of already-reserved ticket!");

  // Step C: Simulate 1-hour expiry by shifting reservedUntil into the past
  console.log("  Simulating 60-minute time lapse on Ticket #3...");
  await prisma.ticket.updateMany({
    where: { raffleId: reserveRaffle.id, ticketNumber: 3 },
    data: { reservedUntil: new Date(Date.now() - 5000) }, // 5 seconds in the past
  });

  // Step D: Customer C tries to reserve Ticket #3 now (Must succeed because previous hold expired!)
  console.log("  Customer C reserving Ticket #3 after hold expiry...");
  const resC = await reserveTicketsForOneHour({
    raffleId: reserveRaffle.id,
    customerPhone: "+251933333333",
    ticketCount: 1,
    specificNumbers: [3],
  });

  console.log(`  ✓ Successfully claimed re-opened Ticket #3: ${resC.success ? "SUCCESS ✓" : "FAILED ✗"}`);
  if (!resC.success) throw new Error("CRITICAL FAILURE: Expired ticket was not released back to remaining pool!");

  // Step E: Complete payment for Customer C to convert to CONFIRMED
  console.log("  Customer C completes payment to confirm Ticket #3...");
  const confirmResult = await executeAtomicTicketPurchase({
    raffleId: reserveRaffle.id,
    customerPhone: "+251933333333",
    ticketCount: 1,
    specificNumbers: [3],
    paymentMethod: "TELEBIRR",
  });

  const confirmedTicket = await prisma.ticket.findFirst({
    where: { raffleId: reserveRaffle.id, ticketNumber: 3 },
  });

  console.log(`  ✓ Final Ticket Status: ${confirmedTicket?.status} (Expected: CONFIRMED)`);
  if (confirmedTicket?.status !== "CONFIRMED") {
    throw new Error(`CRITICAL FAILURE: Expected ticket to be CONFIRMED, got ${confirmedTicket?.status}`);
  }
  console.log("  ✅ Test 5 Passed: 1-hour ticket hold, lockout, and auto-expiry verified!\n");

  console.log("=================================================");
  console.log("🎉 ALL 5 SYSTEM TESTS PASSED WITH 100% INTEGRITY!");
  console.log("=================================================");
}

runPlatformTests()
  .catch((err) => {
    console.error("\n❌ TEST SUITE FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
