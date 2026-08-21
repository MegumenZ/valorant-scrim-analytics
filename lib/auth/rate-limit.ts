import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash Redis credentials are configured in environment
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let redisInstance: Redis | null = null;
let ratelimiterInstance: Ratelimit | null = null;

if (isUpstashConfigured) {
  try {
    redisInstance = Redis.fromEnv();
    ratelimiterInstance = new Ratelimit({
      redis: redisInstance,
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per 60 seconds
      analytics: false,
      prefix: "scrim_auth_ratelimit",
    });
  } catch (err) {
    console.warn("[RateLimit] Failed to initialize Upstash Redis, falling back to in-memory:", err);
  }
}

// In-memory fallback store for local development without Upstash credentials
interface MemoryRateRecord {
  timestamps: number[];
  blockedUntil?: number;
}
const localMemoryStore = new Map<string, MemoryRateRecord>();

export const authRateLimiter = ratelimiterInstance;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  blocked: boolean;
}

/**
 * Distributed sliding window rate limiter for auth endpoints.
 * Uses Upstash Redis in serverless production, and in-memory sliding window as local fallback.
 */
export async function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000,
  blockDurationMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  if (ratelimiterInstance) {
    try {
      const result = await ratelimiterInstance.limit(ip);
      const resetInSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetInSeconds,
        blocked: !result.success && result.remaining === 0,
      };
    } catch (err) {
      console.warn("[RateLimit] Upstash limit check failed, using fallback:", err);
    }
  }

  // Local In-Memory Fallback
  const now = Date.now();
  let record = localMemoryStore.get(ip);

  if (!record) {
    record = { timestamps: [] };
    localMemoryStore.set(ip, record);
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.blockedUntil - now) / 1000),
      blocked: true,
    };
  }

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests * 2) {
    record.blockedUntil = now + blockDurationMs;
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil(blockDurationMs / 1000),
      blocked: true,
    };
  }

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
      blocked: false,
    };
  }

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
