import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { SecureStorageService, StorageFolder, StorageVisibility } from "@raffle/shared";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Login required to upload files." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as StorageFolder) || "prizes";
    const visibility = (formData.get("visibility") as StorageVisibility) || (folder === "prizes" ? "public" : "private");

    if (!file) {
      return NextResponse.json({ error: "No file payload provided." }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate size, magic bytes, and MIME type
    const validation = SecureStorageService.validateFileBuffer(buffer, folder, visibility);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate random storage key (strip user filename & path traversal)
    const fileKey = SecureStorageService.generateStorageKey(visibility, folder, validation.extension);

    // Save to local upload directory (or S3 in cloud)
    const uploadBaseDir = path.join(process.cwd(), "public", "uploads");
    const targetFilePath = path.join(uploadBaseDir, fileKey);
    const targetDir = path.dirname(targetFilePath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetFilePath, buffer);

    // Build URL
    const publicUrl = visibility === "public" ? `/uploads/${fileKey}` : undefined;
    const signedUrl = visibility === "private" ? SecureStorageService.generateExpiringSignedUrl(fileKey, 900) : undefined;

    // Log upload in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        actorType: user.role,
        action: "FILE_UPLOAD",
        entityType: "STORAGE_OBJECT",
        entityId: fileKey,
        afterState: JSON.stringify({
          folder,
          visibility,
          mimeType: validation.detectedMime,
          sizeBytes: buffer.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      fileKey,
      publicUrl,
      signedUrl,
      visibility,
      mimeType: validation.detectedMime,
      sizeBytes: buffer.length,
      message: "File validated and stored securely.",
    });
  } catch (error: any) {
    console.error("Secure upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to process upload." }, { status: 500 });
  }
}

