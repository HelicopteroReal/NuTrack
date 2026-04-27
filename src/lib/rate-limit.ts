import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory rate limiter using a bucket algorithm.
 *
 * IMPORTANT: This implementation is NOT suitable for production with multiple server instances.
 * For production deployment:
 * - Use a Redis-backed rate limiter for distributed systems
 * - Consider using libraries like `upstash/ratelimit` or `redis` with npm packages
 * - Example: https://github.com/upstash/ratelimit
 *
 * This implementation works well for:
 * - Development environments
 * - Single-server deployments
 * - Learning purposes
 */

type Bucket = {
  count: number;
  resetAt: number;
};

// WARNING: This map is cleared on server restart. Use Redis for persistence.
const buckets = new Map<string, Bucket>();

/**
 * Extract client IP from request, checking for forwarded headers.
 * Works with reverse proxies and load balancers.
 */
function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * Check if a request exceeds rate limit.
 * @param request - The incoming request
 * @param keyPrefix - A prefix for the rate limit key (e.g., "login", "register")
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds (e.g., 60000 for 1 minute)
 * @returns NextResponse with 429 status if rate limited, null if allowed
 *
 * Example usage:
 * const rateLimitError = checkRateLimit(request, "login", 15, 60000);
 * if (rateLimitError) return rateLimitError;
 */
export function checkRateLimit(request: NextRequest, keyPrefix: string, limit: number, windowMs: number) {
  const key = `${keyPrefix}:${getClientIp(request)}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((existing.resetAt - now) / 1000)),
        },
      }
    );
  }

  existing.count += 1;
  buckets.set(key, existing);
  return null;
}
