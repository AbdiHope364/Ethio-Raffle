import { NextRequest, NextResponse } from "next/server";
import { verifyDrawResult } from "@/lib/provably-fair";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      raffleId,
      revealedSeed,
      commitHash,
      totalTickets,
      totalSoldTickets,
      winningTicketNumber,
    } = body;

    let testRaffleId = raffleId;
    let testSeed = revealedSeed;
    let testCommit = commitHash;
    let testTotal = totalTickets;
    let testSold = totalSoldTickets;
    let testWinner = winningTicketNumber;

    // If raffleId is passed alone, load details from DB
    if (raffleId && (!testSeed || !testCommit)) {
      const raffle = await prisma.raffle.findUnique({
        where: { id: raffleId },
      });
      if (!raffle) {
        return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
      }
      testSeed = testSeed || raffle.revealedSeed || raffle.secretSeed;
      testCommit = testCommit || raffle.commitHash;
      testTotal = testTotal || raffle.totalTickets;
      testSold = testSold || raffle.soldTickets;
      testWinner = testWinner || raffle.winningTicketNumber;
    }

    if (!testSeed || !testCommit || !testTotal || !testSold || !testWinner) {
      return NextResponse.json(
        { error: "Missing required parameters for cryptographic verification." },
        { status: 400 }
      );
    }

    const verification = verifyDrawResult(
      testSeed,
      testCommit,
      testRaffleId || "manual-test",
      parseInt(testTotal, 10),
      parseInt(testSold, 10),
      parseInt(testWinner, 10)
    );

    return NextResponse.json({ verification });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

