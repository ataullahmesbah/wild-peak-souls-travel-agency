/**
 * Rate Limiter — In-memory sliding window (Phase 2)
 *
 * For production, replace with Redis-backed limiter (e.g., @upstash/ratelimit).
 * This implementation is suitable for single-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Array.from(store.entries()).forEach(([key, entry]) => {
      if (entry.resetAt < now) store.delete(key);
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs?: number;
}

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { maxRequests, windowMs, identifier } = config;
  const now = Date.now();
  const key = `rl:${identifier}`;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// Pre-configured limiters for common endpoints
export const rateLimiters = {
  auth: (ip: string) => checkRateLimit({ maxRequests: 5, windowMs: 15 * 60 * 1000, identifier: `auth:${ip}` }),
  register: (ip: string) => checkRateLimit({ maxRequests: 3, windowMs: 60 * 60 * 1000, identifier: `register:${ip}` }),
  passwordReset: (ip: string) => checkRateLimit({ maxRequests: 3, windowMs: 60 * 60 * 1000, identifier: `pw-reset:${ip}` }),
  api: (ip: string) => checkRateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000, identifier: `api:${ip}` }),
  upload: (ip: string) => checkRateLimit({ maxRequests: 20, windowMs: 60 * 60 * 1000, identifier: `upload:${ip}` }),
};
