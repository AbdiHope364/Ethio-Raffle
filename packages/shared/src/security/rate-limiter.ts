/**
 * ============================================================================
 * IN-MEMORY SLIDING-WINDOW API RATE LIMITER (§11)
 * ============================================================================
 * Protects endpoints against brute-force, credential stuffing, and DDoS attacks.
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private static store = new Map<string, RateLimitRecord>();

  /**
   * Checks if a request from a specific identifier (e.g. IP + endpoint) exceeds the rate limit.
   *
   * @param key Unique key (e.g., `login:192.168.1.1` or `order:+251911223344`)
   * @param maxRequests Maximum requests allowed within window
   * @param windowMs Window duration in milliseconds (default 60 seconds)
   * @returns `{ allowed: boolean; remaining: number; resetMs: number }`
   */
  static check(
    key: string,
    maxRequests = 20,
    windowMs = 60000
  ): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const record = this.store.get(key) || { timestamps: [] };

    // Filter out timestamps older than the sliding window
    const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= maxRequests) {
      const oldest = validTimestamps[0];
      const resetMs = Math.max(0, windowMs - (now - oldest));
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    validTimestamps.push(now);
    this.store.set(key, { timestamps: validTimestamps });

    return {
      allowed: true,
      remaining: maxRequests - validTimestamps.length,
      resetMs: windowMs,
    };
  }

  /**
   * Periodically purges stale entries from memory.
   */
  static purgeStale(windowMs = 300000) {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      const valid = record.timestamps.filter((ts) => now - ts < windowMs);
      if (valid.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, { timestamps: valid });
      }
    }
  }
}

