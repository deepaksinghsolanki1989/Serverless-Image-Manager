type TokenBucket = {
  tokens: number;
  lastRefill: number;
};

const BUCKET_CAPACITY = 20; // max tokens per client
const REFILL_RATE_PER_MIN = 20; // tokens per minute

const buckets = new Map<string, TokenBucket>();

export function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  let bucket = buckets.get(clientId);
  if (!bucket) {
    bucket = { tokens: BUCKET_CAPACITY, lastRefill: now };
    buckets.set(clientId, bucket);
  }

  const elapsedMinutes = (now - bucket.lastRefill) / 60000;
  if (elapsedMinutes > 0) {
    const refill = elapsedMinutes * REFILL_RATE_PER_MIN;
    bucket.tokens = Math.min(BUCKET_CAPACITY, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return false;
  }

  return true;
}