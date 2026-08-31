/**
 * ============================================================================
 * SECURE OBJECT STORAGE & MEDIA PIPELINE (§04 - §08)
 * ============================================================================
 * Features:
 * 1. Strict separation between PUBLIC buckets (prizes, banners) and PRIVATE buckets (KYC, licenses).
 * 2. Magic-byte buffer validation (blocks renamed malware/executable payloads).
 * 3. Cryptographically random filenames (stripping user-controlled names & path traversal).
 * 4. Time-limited HMAC-signed expiring URLs for sensitive merchant/KYC identity documents.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export type StorageVisibility = "public" | "private";
export type StorageFolder = 
  | "prizes" 
  | "banners" 
  | "logos" 
  | "merchant-kyc" 
  | "licenses" 
  | "identity-documents" 
  | "dispute-evidence";

export interface FileValidationOptions {
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
  visibility?: StorageVisibility;
}

export interface UploadResult {
  success: boolean;
  fileKey: string;
  publicUrl?: string;
  visibility: StorageVisibility;
  mimeType: string;
  sizeBytes: number;
  message?: string;
}

export class SecureStorageService {
  private static readonly MAX_PRIZE_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
  private static readonly MAX_KYC_DOC_SIZE = 10 * 1024 * 1024; // 10 MB
  private static readonly SIGNED_URL_SECRET = process.env.JWT_SECRET || "storage_signing_hmac_secret_2026";

  /**
   * Magic Byte Signatures for genuine file format verification.
   */
  private static readonly MAGIC_BYTES = {
    JPEG: [0xFF, 0xD8, 0xFF],
    PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    WEBP: [0x52, 0x49, 0x46, 0x46], // Starts with "RIFF"
    PDF: [0x25, 0x50, 0x44, 0x46],   // Starts with "%PDF"
  };

  /**
   * Inspects binary buffer headers to determine true MIME type (ignoring client file extension).
   */
  static detectMimeTypeFromMagicBytes(buffer: Buffer): string | null {
    if (!buffer || buffer.length < 8) return null;

    // Check JPEG (FF D8 FF)
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return "image/jpeg";
    }

    // Check PNG (89 50 4E 47 0D 0A 1A 0A)
    if (
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
    ) {
      return "image/png";
    }

    // Check WebP (RIFF....WEBP)
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer.length >= 12 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return "image/webp";
    }

    // Check PDF (%PDF)
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return "application/pdf";
    }

    return null;
  }

  /**
   * Validates file buffer for size, true MIME type, and security constraints.
   */
  static validateFileBuffer(
    buffer: Buffer,
    folder: StorageFolder,
    visibility: StorageVisibility
  ): { valid: boolean; detectedMime: string; extension: string; error?: string } {
    const isImageFolder = ["prizes", "banners", "logos"].includes(folder);
    const maxSize = isImageFolder ? this.MAX_PRIZE_IMAGE_SIZE : this.MAX_KYC_DOC_SIZE;

    if (buffer.length > maxSize) {
      return {
        valid: false,
        detectedMime: "",
        extension: "",
        error: `File size (${(buffer.length / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed limit of ${(maxSize / 1024 / 1024)} MB.`,
      };
    }

    const detectedMime = this.detectMimeTypeFromMagicBytes(buffer);
    if (!detectedMime) {
      return {
        valid: false,
        detectedMime: "",
        extension: "",
        error: "Security Violation: Unknown or unsupported file signature (Magic Bytes mismatch). Executables and scripts are rejected.",
      };
    }

    if (isImageFolder) {
      const allowedImageMimes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedImageMimes.includes(detectedMime)) {
        return {
          valid: false,
          detectedMime,
          extension: "",
          error: `Invalid image format: ${detectedMime}. Only JPEG, PNG, and WebP are allowed for prize images.`,
        };
      }
    } else {
      const allowedDocMimes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedDocMimes.includes(detectedMime)) {
        return {
          valid: false,
          detectedMime,
          extension: "",
          error: `Invalid document format: ${detectedMime}. Only PDF, JPEG, or PNG allowed for verification documents.`,
        };
      }
    }

    let extension = "bin";
    if (detectedMime === "image/jpeg") extension = "jpg";
    else if (detectedMime === "image/png") extension = "png";
    else if (detectedMime === "image/webp") extension = "webp";
    else if (detectedMime === "application/pdf") extension = "pdf";

    return { valid: true, detectedMime, extension };
  }

  /**
   * Generates a cryptographically random filename with sanitized key path.
   */
  static generateStorageKey(visibility: StorageVisibility, folder: StorageFolder, extension: string): string {
    const randomHex = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    return `${visibility}/${folder}/${folder}_${randomHex}_${timestamp}.${extension}`;
  }

  /**
   * Generates a time-limited HMAC-signed URL for private KYC / dispute documents.
   */
  static generateExpiringSignedUrl(fileKey: string, expiresInSeconds = 900): string {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload = `${fileKey}:${expiresAt}`;
    const signature = crypto.createHmac("sha256", this.SIGNED_URL_SECRET).update(payload).digest("hex");
    return `/api/storage/signed-url?key=${encodeURIComponent(fileKey)}&expires=${expiresAt}&sig=${signature}`;
  }

  /**
   * Verifies an HMAC-signed URL for access authorization.
   */
  static verifySignedUrl(fileKey: string, expiresTimestamp: number, signature: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    if (now > expiresTimestamp) {
      return false; // Expired
    }
    const payload = `${fileKey}:${expiresTimestamp}`;
    const expectedSig = crypto.createHmac("sha256", this.SIGNED_URL_SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  }
}

