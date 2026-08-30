import { NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, fullName, requestType, details } = body;

    if (!phoneNumber || !requestType || !details) {
      return NextResponse.json(
        { error: "Phone number, request type, and details are required." },
        { status: 400 }
      );
    }

    const validTypes = ["ACCESS", "CORRECTION", "DELETION", "OBJECTION"];
    if (!validTypes.includes(requestType)) {
      return NextResponse.json(
        { error: `Invalid request type. Allowed types: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Lookup user if exists
    const user = await prisma.user.findUnique({
      where: { phone: phoneNumber },
    });

    const dataRequest = await prisma.dataSubjectRequest.create({
      data: {
        userId: user ? user.id : null,
        phoneNumber,
        fullName: fullName || user?.fullName || null,
        requestType,
        details,
        status: "RECEIVED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data Subject Request successfully submitted under PDPP No. 1321/2024.",
      requestId: dataRequest.id,
      submittedAt: dataRequest.submittedAt,
    });
  } catch (error: any) {
    console.error("PDPP Request submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit Data Subject Request" },
      { status: 500 }
    );
  }
}

