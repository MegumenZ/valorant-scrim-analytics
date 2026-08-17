interface RateLimitRecord {
  timestamps: number[];
  blockedUntil?: number;
}

// In-memory store for rate limiting by IP
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitStore.entries()) {
      if (record.blockedUntil && record.blockedUntil > now) {
        continue;
      }
      // Remove timestamps older than 15 minutes
      record.timestamps = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
      if (record.timestamps.length === 0 && !record.blockedUntil) {
        rateLimitStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  blocked: boolean;
}

/**
 * Sliding window rate limiter to protect authentication endpoints from brute force and automated spam.
 * 
 * @param ip Client IP address or identifier
 * @param maxRequests Maximum requests allowed within windowMs
 * @param windowMs Time window in milliseconds (default: 60s)
 * @param blockDurationMs Duration to block IP if abuse threshold is breached (default: 15m)
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000,
  blockDurationMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  let record = rateLimitStore.get(ip);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(ip, record);
  }

  // Check if currently under penalty block
  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.blockedUntil - now) / 1000),
      blocked: true,
    };
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests * 2) {
    // Severe abuse threshold reached -> trigger temporary ban
    record.blockedUntil = now + blockDurationMs;
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil(blockDurationMs / 1000),
      blocked: true,
    };
  }

  if (record.timestamps.length >= maxRequests) {
    // Normal rate limit exceeded
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
      blocked: false,
    };
  }

  // Record new request timestamp
  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetInSeconds: Math.ceil(windowMs / 1000),
    blocked: false,
  };
}

/**
 * Helper to extract client IP from Next.js request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
