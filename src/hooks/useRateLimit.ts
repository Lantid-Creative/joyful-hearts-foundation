/**
 * Client-side rate limiting using localStorage.
 * Complements server-side DB rate limiting for better UX.
 */

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  contact: { max: 3, windowMs: 60 * 60 * 1000 },       // 3 per hour
  volunteer: { max: 2, windowMs: 24 * 60 * 60 * 1000 }, // 2 per 24h
  partner: { max: 2, windowMs: 24 * 60 * 60 * 1000 },   // 2 per 24h
};

interface RateLimitEntry {
  timestamps: number[];
}

export function checkRateLimit(action: keyof typeof LIMITS): {
  allowed: boolean;
  retryAfterMs: number;
} {
  const limit = LIMITS[action];
  const key = `rl_${action}`;
  const now = Date.now();

  let entry: RateLimitEntry = { timestamps: [] };
  try {
    const stored = localStorage.getItem(key);
    if (stored) entry = JSON.parse(stored);
  } catch {
    // ignore parse errors
  }

  // Filter out timestamps outside the window
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < limit.windowMs
  );

  if (entry.timestamps.length >= limit.max) {
    const oldest = Math.min(...entry.timestamps);
    const retryAfterMs = limit.windowMs - (now - oldest);
    return { allowed: false, retryAfterMs };
  }

  // Record this submission
  entry.timestamps.push(now);
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore storage errors
  }

  return { allowed: true, retryAfterMs: 0 };
}

export function formatRetryTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  const hours = Math.ceil(ms / 3600000);
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
}
