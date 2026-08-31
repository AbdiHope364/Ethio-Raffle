/**
 * ============================================================================
 * ISOLATED PROVABLY FAIR DRAW ENGINE (§32 & §33)
 * ============================================================================
 * Cryptographic Commit-Reveal Protocol:
 * 1. BEFORE SALES: Generate 256-bit CSPRNG seed -> Compute SHA-256 Commitment Hash -> Publish Hash.
 * 2. SALES: Tickets sold up to capacity / deadline.
 * 3. FREEZE: Immutable snapshot frozen (eligible ticket count and universe hash).
 * 4. REVEAL: Secret seed revealed by operator.
 * 5. VERIFY: Assert SHA-256(seed) === published Commitment.
 * 6. EXTRACT: Extract winning ticket via deterministic modular arithmetic.
 *
 * NOTE: The source of randomness is the 256-bit CSPRNG seed + external public entropy.
 * SHA-256 acts as the tamper-evident commitment and deterministic derivation function.
 */

import * as crypto from "crypto";

export interface CommitResult {
  secretSeed: string;
  commitmentHash: string;
  publicEntropy: string;
  algorithmVersion: string;
}

export interface DrawExecutionInput {
  raffleId: string;
  totalSoldTickets: number;
  revealedSeed: string;
  publishedCommitmentHash: string;
  publicEntropy?: string;
  algorithmVersion?: string;
}

export interface DrawExecutionResult {
  isValid: boolean;
  winningTicketNumber: number;
  derivedMasterHash: string;
  hashBigInt: string;
  formula: string;
  auditTrail: Record<string, any>;
}

export class RaffleDrawEngine {
  public static readonly ALGORITHM_VERSION = "SHA-256-COMMIT-REVEAL-v2";

  /**
   * Generates a 256-bit cryptographically secure random seed and its pre-commitment hash.
   */
  static generateCommitment(raffleId: string, customEntropy?: string): CommitResult {
    const secretSeed = crypto.randomBytes(32).toString("hex");
    const publicEntropy = customEntropy || `ETHIO-TELECOM-${Date.now()}`;
    const payload = `${this.ALGORITHM_VERSION}:${raffleId}:${secretSeed}:${publicEntropy}`;
    const commitmentHash = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      secretSeed,
      commitmentHash,
      publicEntropy,
      algorithmVersion: this.ALGORITHM_VERSION,
    };
  }

  /**
   * Deterministically calculates the winning ticket and verifies commitment integrity.
   */
  static executeDraw(input: DrawExecutionInput): DrawExecutionResult {
    const {
      raffleId,
      totalSoldTickets,
      revealedSeed,
      publishedCommitmentHash,
      publicEntropy = "ETHIO-TELECOM-CONSENSUS",
      algorithmVersion = this.ALGORITHM_VERSION,
    } = input;

    if (totalSoldTickets <= 0) {
      throw new Error("Cannot execute draw with zero eligible tickets.");
    }

    // 1. Verify Commitment Integrity: SHA-256(seed) must equal published commitment
    const commitPayload = `${algorithmVersion}:${raffleId}:${revealedSeed}:${publicEntropy}`;
    const recomputedCommitHash = crypto.createHash("sha256").update(commitPayload).digest("hex");

    const isCommitmentValid = recomputedCommitHash.toLowerCase() === publishedCommitmentHash.toLowerCase();

    // 2. Derive Winning Ticket Number using deterministic master hash
    const drawPayload = `v2.0:${raffleId}:${revealedSeed}:${totalSoldTickets}:${publicEntropy}:SHA-256-COMMIT-REVEAL`;
    const masterHash = crypto.createHash("sha256").update(drawPayload).digest("hex");

    // Take the leading 16 hexadecimal characters (64-bit integer)
    const hashSlice = masterHash.substring(0, 16);
    const hashBigInt = BigInt("0x" + hashSlice);

    // Winning ticket formula: (BigInt % TotalSoldTickets) + 1
    const winningTicketNumber = Number(hashBigInt % BigInt(totalSoldTickets)) + 1;

    const formula = `(${hashBigInt.toString()} % ${totalSoldTickets}) + 1 = #${winningTicketNumber}`;

    return {
      isValid: isCommitmentValid,
      winningTicketNumber,
      derivedMasterHash: masterHash,
      hashBigInt: hashBigInt.toString(),
      formula,
      auditTrail: {
        raffleId,
        algorithmVersion,
        totalSoldTickets,
        publishedCommitmentHash,
        recomputedCommitHash,
        isCommitmentValid,
        masterHash,
        winningTicketNumber,
      },
    };
  }

  /**
   * Client-side independent verification algorithm.
   */
  static verifyWinningTicket(
    raffleId: string,
    revealedSeed: string,
    totalSoldTickets: number,
    publicEntropy: string
  ): { masterHash: string; winningTicketNumber: number } {
    const drawPayload = `v2.0:${raffleId}:${revealedSeed}:${totalSoldTickets}:${publicEntropy}:SHA-256-COMMIT-REVEAL`;
    const masterHash = crypto.createHash("sha256").update(drawPayload).digest("hex");
    const hashSlice = masterHash.substring(0, 16);
    const hashBigInt = BigInt("0x" + hashSlice);
    const winningTicketNumber = Number(hashBigInt % BigInt(totalSoldTickets)) + 1;

    return { masterHash, winningTicketNumber };
  }
}

