import * as crypto from "crypto";

export interface FairRNGCommitmentParams {
  version?: string;
  raffleId: string;
  secretSeed: string;
  totalTickets: number;
  publicEntropy?: string;
  algorithm?: string;
}

export function generateMultiEntropyCommitment(params: FairRNGCommitmentParams): string {
  const version = params.version || "v2.0";
  const algorithm = params.algorithm || "SHA-256-COMMIT-REVEAL";
  const publicEntropy = params.publicEntropy || "ETHIO-TELECOM-NLA-CONSENSUS";

  const payload = `${version}:${params.raffleId}:${params.secretSeed}:${params.totalTickets}:${publicEntropy}:${algorithm}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function createImmutableDrawSnapshot(prisma: any, raffleId: string) {
  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
    include: {
      tickets: {
        where: { status: "ACTIVE" },
        select: { id: true, ticketNumber: true, customerPhone: true, createdAt: true },
        orderBy: { ticketNumber: "asc" },
      },
    },
  });

  if (!raffle) throw new Error("Raffle not found");

  // Compute Merkle/hash of all eligible tickets
  const ticketManifest = raffle.tickets.map((t: any) => `${t.ticketNumber}:${t.customerPhone}`).join("|");
  const ticketUniverseHash = crypto.createHash("sha256").update(ticketManifest).digest("hex");
  const secretSeedHash = crypto.createHash("sha256").update(raffle.secretSeed || "seed").digest("hex");

  const snapshotNumber = "SNAP-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
  const snapshotHash = crypto
    .createHash("sha256")
    .update(`${raffle.id}:${ticketUniverseHash}:${secretSeedHash}:${raffle.soldTickets}`)
    .digest("hex");

  const snapshot = await prisma.drawSnapshot.upsert({
    where: { raffleId },
    update: {
      totalTickets: raffle.totalTickets,
      soldTickets: raffle.soldTickets,
      eligibleTicketCount: raffle.tickets.length,
      ticketUniverseHash,
      commitmentHash: raffle.commitHash || "",
      secretSeedHash,
      publicEntropy: raffle.publicEntropy || "ETHIO-NLA-PUBLIC-SEED",
      algorithmVersion: "SHA-256-COMMIT-REVEAL-v2",
      snapshotHash,
    },
    create: {
      raffleId,
      snapshotNumber,
      totalTickets: raffle.totalTickets,
      soldTickets: raffle.soldTickets,
      eligibleTicketCount: raffle.tickets.length,
      ticketUniverseHash,
      commitmentHash: raffle.commitHash || "",
      secretSeedHash,
      publicEntropy: raffle.publicEntropy || "ETHIO-NLA-PUBLIC-SEED",
      algorithmVersion: "SHA-256-COMMIT-REVEAL-v2",
      snapshotHash,
    },
  });

  await prisma.raffle.update({
    where: { id: raffleId },
    data: { status: "SNAPSHOT_LOCKED" },
  });

  return snapshot;
}

export function deriveMultiEntropyWinnerTicketNumber(
  secretSeed: string,
  raffleId: string,
  soldTickets: number,
  publicEntropy = "ETHIO-NLA-PUBLIC-SEED"
): { winningTicketNumber: number; drawHash: string } {
  if (soldTickets <= 0) return { winningTicketNumber: 0, drawHash: "" };

  const payload = `v2.0:${raffleId}:${secretSeed}:${soldTickets}:${publicEntropy}:SHA-256-COMMIT-REVEAL`;
  const drawHash = crypto.createHash("sha256").update(payload).digest("hex");

  // Take first 8 bytes (16 hex chars) as BigInt
  const hashInt = BigInt("0x" + drawHash.substring(0, 16));
  const winningTicketNumber = Number(hashInt % BigInt(soldTickets)) + 1;

  return { winningTicketNumber, drawHash };
}

