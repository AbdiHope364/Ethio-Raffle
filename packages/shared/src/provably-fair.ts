import * as crypto from "crypto";

export interface ProvablyFairCommitment {
  secretSeed: string;
  commitHash: string;
  raffleId: string;
  totalTickets: number;
}

export interface VerificationResult {
  isValid: boolean;
  computedCommitHash: string;
  expectedCommitHash: string;
  hashesMatch: boolean;
  derivedWinningTicket: number;
  expectedWinningTicket: number;
  ticketsMatch: boolean;
  details: string;
}

/**
 * Generate a cryptographically secure 256-bit secret seed (64 hex characters)
 */
export function generateSecretSeed(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generates the SHA-256 commitment hash before the draw starts.
 * This is published to the public so the system cannot alter the seed post-hoc.
 */
export function generateCommitHash(
  secretSeed: string,
  raffleId: string,
  totalTickets: number
): string {
  const payload = `${secretSeed}:${raffleId}:${totalTickets}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Deterministically derives the winning ticket number from the revealed secret seed
 * Formula: (BigInt("0x" + SHA256(secretSeed)) % BigInt(totalSoldTickets)) + 1
 */
export function deriveWinningTicketNumber(
  secretSeed: string,
  totalSoldTickets: number
): number {
  if (totalSoldTickets <= 0) return 1;

  const seedHash = crypto.createHash("sha256").update(secretSeed).digest("hex");
  const seedBigInt = BigInt("0x" + seedHash);
  const totalBigInt = BigInt(totalSoldTickets);
  const winningIndex = Number(seedBigInt % totalBigInt);

  // Return 1-based ticket number
  return winningIndex + 1;
}

/**
 * Public Provably Fair Verifier:
 * Allows anyone (auditors, regulators, players) to verify the integrity of a completed draw.
 */
export function verifyDrawResult(
  revealedSeed: string,
  commitHash: string,
  raffleId: string,
  totalTickets: number,
  totalSoldTickets: number,
  declaredWinningTicket: number
): VerificationResult {
  const cleanSeed = revealedSeed.trim();
  const cleanCommit = commitHash.trim().toLowerCase();

  const computedCommitHash = generateCommitHash(cleanSeed, raffleId, totalTickets).toLowerCase();
  const hashesMatch = computedCommitHash === cleanCommit;

  const derivedWinningTicket = deriveWinningTicketNumber(cleanSeed, totalSoldTickets);
  const ticketsMatch = derivedWinningTicket === declaredWinningTicket;

  const isValid = hashesMatch && ticketsMatch;

  let details = "";
  if (!hashesMatch) {
    details = "Commitment mismatch: The revealed seed does not produce the published SHA-256 commit hash.";
  } else if (!ticketsMatch) {
    details = `Winner mismatch: The derived ticket is #${derivedWinningTicket}, but declared winner was #${declaredWinningTicket}.`;
  } else {
    details = "100% Verified: The draw was provably fair, immutable, and mathematically authentic.";
  }

  return {
    isValid,
    computedCommitHash,
    expectedCommitHash: cleanCommit,
    hashesMatch,
    derivedWinningTicket,
    expectedWinningTicket: declaredWinningTicket,
    ticketsMatch,
    details,
  };
}

