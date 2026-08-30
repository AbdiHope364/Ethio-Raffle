import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    const raffleId = searchParams.get("raffleId");

    const where: any = {};
    if (sellerId) where.sellerId = sellerId;
    if (raffleId) where.raffleId = raffleId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        raffle: {
          select: {
            title: true,
            titleAm: true,
            prizeName: true,
            prizeImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { raffleId, winnerPhone, rating, comment } = body;

    if (!raffleId || !winnerPhone || !rating || !comment) {
      return NextResponse.json(
        { error: "raffleId, winnerPhone, rating (1-5), and comment are required." },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars." },
        { status: 400 }
      );
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { seller: true },
    });

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found." }, { status: 404 });
    }

    if (raffle.status !== "DRAWN") {
      return NextResponse.json(
        { error: "Only concluded raffles can receive winner ratings." },
        { status: 400 }
      );
    }

    if (!raffle.sellerId) {
      return NextResponse.json(
        { error: "This raffle is not associated with an authorized seller." },
        { status: 400 }
      );
    }

    // Verify phone belongs to certified winner
    const winningTicket = await prisma.ticket.findFirst({
      where: {
        raffleId,
        ticketNumber: raffle.winningTicketNumber!,
        status: "CONFIRMED",
      },
      include: { user: true },
    });

    if (!winningTicket) {
      return NextResponse.json(
        { error: "No winning ticket found for this raffle." },
        { status: 404 }
      );
    }

    const registeredWinnerPhone = winningTicket.customerPhone || winningTicket.user?.phone;
    if (
      registeredWinnerPhone &&
      !registeredWinnerPhone.includes(winnerPhone.replace("+251", "").replace("09", "9"))
    ) {
      return NextResponse.json(
        { error: "Credential verification failed. Only the certified winner can rate this merchant." },
        { status: 403 }
      );
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        raffleId,
        winnerPhone: registeredWinnerPhone || winnerPhone,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a verified review for this raffle prize." },
        { status: 400 }
      );
    }

    // Create verified review
    const review = await prisma.review.create({
      data: {
        raffleId,
        sellerId: raffle.sellerId,
        winnerPhone: registeredWinnerPhone || winnerPhone,
        rating,
        comment,
        isVerifiedWinner: true,
      },
    });

    // Update Seller Average Rating
    const seller = await prisma.seller.findUnique({
      where: { id: raffle.sellerId },
    });

    if (seller) {
      const newReviewsCount = seller.reviewsCount + 1;
      const newRating = Number(
        ((seller.rating * seller.reviewsCount + rating) / newReviewsCount).toFixed(2)
      );

      await prisma.seller.update({
        where: { id: seller.id },
        data: {
          rating: newRating,
          reviewsCount: newReviewsCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Verified winner rating and testimonial submitted successfully!",
      review,
    });
  } catch (error: any) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

