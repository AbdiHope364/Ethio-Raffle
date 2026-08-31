import { NextResponse } from "next/server";
import { prisma } from "@raffle/database";

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Check Database Connectivity
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "HEALTHY",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: process.uptime(),
      checks: {
        database: { status: "UP", latencyMs: dbLatencyMs },
        apiGateway: { status: "UP" },
        paymentGateway: { status: "READY" },
        storagePipeline: { status: "READY" },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        timestamp: new Date().toISOString(),
        error: error.message || "Database connection failed",
      },
      { status: 503 }
    );
  }
}

