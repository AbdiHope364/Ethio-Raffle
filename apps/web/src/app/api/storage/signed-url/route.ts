import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { SecureStorageService } from "@raffle/shared";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const expires = parseInt(searchParams.get("expires") || "0", 10);
    const sig = searchParams.get("sig") || "";

    if (!key || !expires || !sig) {
      return NextResponse.json({ error: "Invalid or missing signed URL parameters." }, { status: 400 });
    }

    // Verify HMAC signature and expiration
    const isValidSig = SecureStorageService.verifySignedUrl(key, expires, sig);
    if (!isValidSig) {
      return NextResponse.json({ error: "Access Denied: Signature invalid or expired." }, { status: 403 });
    }

    // Check user authorization (Admin or compliance officer)
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "COMPLIANCE_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Admin privileges required to view private merchant documents." }, { status: 403 });
    }

    // Ensure path traversal is blocked
    const sanitizedKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, "");
    const uploadBaseDir = path.join(process.cwd(), "public", "uploads");
    const targetFilePath = path.join(uploadBaseDir, sanitizedKey);

    if (!fs.existsSync(targetFilePath)) {
      return NextResponse.json({ error: "Requested document not found." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetFilePath);
    const mimeType = SecureStorageService.detectMimeTypeFromMagicBytes(fileBuffer) || "application/octet-stream";

    // Record Access in Immutable Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        actorType: user.role,
        action: "VIEW_PRIVATE_DOCUMENT",
        entityType: "STORAGE_OBJECT",
        entityId: sanitizedKey,
        afterState: JSON.stringify({
          accessTime: new Date().toISOString(),
          ip: req.headers.get("x-forwarded-for") || "internal",
        }),
      },
    });

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Content-Disposition": `inline; filename="${path.basename(sanitizedKey)}"`,
      },
    });
  } catch (error: any) {
    console.error("Signed URL access error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve signed file." }, { status: 500 });
  }
}

