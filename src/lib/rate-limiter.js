import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client if credentials exist
let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.error("Failed to initialize Upstash Redis Client:", err.message);
  }
}

// In-Memory Fallback sliding window rate limiter
const localRateLimiter = new Map();

// Local cleanup routine to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, requests] of localRateLimiter.entries()) {
      const validRequests = requests.filter(req => req > now - 60000);
      if (validRequests.length === 0) {
        localRateLimiter.delete(key);
      } else {
        localRateLimiter.set(key, validRequests);
      }
    }
  }, 60000);
}

export async function checkRateLimit(ip, limit = 5, windowMs = 60000, type = "api") {
  const now = Date.now();
  const windowStart = now - windowMs;
  const key = `ratelimit:${type}:${ip}`;

  // 1. Try Upstash Redis Rate Limiting
  if (redis) {
    try {
      // Create pipeline for atomicity
      const p = redis.pipeline();
      // Remove old logs beyond the sliding window
      p.zremrangebyscore(key, 0, windowStart);
      // Get count of requests in current window
      p.zcard(key);
      // Add current request
      const memberVal = `${now}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString()}`;
      p.zadd(key, { score: now, member: memberVal });
      // Set expiration on key
      p.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await p.exec();
      const currentCount = results[1]; // Result of ZCARD command

      if (currentCount >= limit) {
        return { success: false, limit, current: currentCount, remaining: 0 };
      }

      return { success: true, limit, current: currentCount + 1, remaining: Math.max(0, limit - currentCount - 1) };
    } catch (err) {
      console.warn("Upstash Redis error, falling back to local memory limiter:", err.message);
    }
  }

  // 2. Local Fallback Limiter (In-Memory)
  if (!localRateLimiter.has(key)) {
    localRateLimiter.set(key, [now]);
    return { success: true, limit, current: 1, remaining: limit - 1 };
  }

  const requests = localRateLimiter.get(key).filter(time => time > windowStart);
  
  if (requests.length >= limit) {
    localRateLimiter.set(key, requests);
    return { success: false, limit, current: requests.length, remaining: 0 };
  }

  requests.push(now);
  localRateLimiter.set(key, requests);
  return { success: true, limit, current: requests.length, remaining: limit - requests.length };
}
