/**
 * ============================================================================
 * WINNER PRIVACY & DATA ANONYMIZATION (§30 & §31)
 * ============================================================================
 * Complies with Ethiopian Personal Data Protection Proclamation (No. 1321/2024).
 * Masks PII from public archives, winner galleries, and API endpoints.
 */

export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "+251 9** *** ***";
  const clean = phone.trim().replace(/\s+/g, "");

  // Format Ethiopian (+251933445566 -> +251 933 *** 566)
  if (clean.startsWith("+251") && clean.length >= 13) {
    const prefix = clean.substring(0, 7); // +251933
    const suffix = clean.substring(clean.length - 3); // 566
    return `${prefix.slice(0, 4)} ${prefix.slice(4)} *** ${suffix}`;
  }

  // Fallback 09... (0933445566 -> 0933 *** 566)
  if (clean.startsWith("09") || clean.startsWith("07")) {
    return `${clean.slice(0, 4)} *** ${clean.slice(-3)}`;
  }

  return "+251 9** *** ***";
}

export function maskFullName(fullName?: string | null): string {
  if (!fullName) return "Lucky Winner";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

export interface SanitizedPublicWinner {
  displayName: string;
  maskedPhone: string;
  isVerified: boolean;
}

export function sanitizeWinnerPublicProfile(user?: { fullName?: string | null; phone?: string | null } | null): SanitizedPublicWinner {
  if (!user) {
    return {
      displayName: "Verified Citizen",
      maskedPhone: "+251 9** *** ***",
      isVerified: true,
    };
  }

  return {
    displayName: maskFullName(user.fullName),
    maskedPhone: maskPhoneNumber(user.phone),
    isVerified: true,
  };
}
