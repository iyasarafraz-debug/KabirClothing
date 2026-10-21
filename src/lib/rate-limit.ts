/**
 * Lightweight in-memory rate limiter for sensitive endpoints.
 * Not suitable for multi-instance production; use Redis or Upstash in prod.
 */

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

const CLEANUP_INTERVAL = 60 * 1000
let lastCleanup = Date.now()

export function rateLimit(
  key: string,
  opts: { max: number; windowMs: number }
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k)
    }
    lastCleanup = now
  }
  const existing = buckets.get(key)
  if (!existing || existing.resetAt < now) {
    const resetAt = now + opts.windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: opts.max - 1, resetAt }
  }
  if (existing.count >= opts.max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt }
  }
  existing.count += 1
  return { ok: true, remaining: opts.max - existing.count, resetAt: existing.resetAt }
}
