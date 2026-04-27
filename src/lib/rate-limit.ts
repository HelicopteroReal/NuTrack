import { NextRequest, NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10000;
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000;

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function cleanupExpiredBuckets() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
  
  if (buckets.size > MAX_BUCKETS) {
    const entries = Array.from(buckets.entries());
    entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
    const toRemove = entries.slice(0, Math.floor(MAX_BUCKETS / 2));
    for (const [key] of toRemove) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(request: NextRequest, keyPrefix: string, limit: number, windowMs: number) {
  cleanupExpiredBuckets();
  
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
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(existing.resetAt / 1000)),
        },
      }
    );
  }

  existing.count += 1;
  buckets.set(key, existing);
  return null;
}
