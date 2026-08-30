import { NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET() {
  try {
    const requests = await prisma.dataSubjectRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Failed to fetch PDPP requests:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { requestId, status, resolutionNotes } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Request ID and new status are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.dataSubjectRequest.update({
      where: { id: requestId },
      data: {
        status,
        resolutionNotes: resolutionNotes || null,
        resolvedAt: status === "COMPLETED" || status === "REJECTED" ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Request marked as ${status}`,
      request: updated,
    });
  } catch (error: any) {
    console.error("Failed to update PDPP request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update request" },
      { status: 500 }
    );
  }
}

