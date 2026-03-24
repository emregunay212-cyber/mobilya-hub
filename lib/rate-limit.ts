/**
 * In-memory sliding window rate limiter.
 * For production, replace with Upstash Redis or Vercel KV.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 15 * 60 * 1000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export const RATE_LIMITS = {
  login: { maxRequests: 5, windowSeconds: 15 * 60 } as RateLimitConfig,
  storeCreate: { maxRequests: 10, windowSeconds: 60 * 60 } as RateLimitConfig,
  crud: { maxRequests: 60, windowSeconds: 60 } as RateLimitConfig,
  deploy: { maxRequests: 5, windowSeconds: 60 * 60 } as RateLimitConfig,
};

/**
 * Check if a request is rate limited.
 * @returns null if allowed, or an object with error info if rate limited.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { error: string; retryAfterSeconds: number } | null {
  const key = identifier;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldestInWindow);
    return {
      error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin.",
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  return null;
}

/**
 * Get client IP from request headers.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
