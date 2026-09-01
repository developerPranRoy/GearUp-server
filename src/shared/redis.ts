import Redis from "ioredis";
import config from "../config";

// Single shared Redis client — reused across rate-limiter, cache, etc.
// Lazy-connects on first use; gracefully falls back if Redis is unavailable
// (non-critical feature — the app still works, just without caching).
const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on("error", (err) => {
  // Don't crash the app if Redis is unavailable in development
  if (config.env !== "production") {
    console.warn("[Redis] Connection error (non-fatal):", err.message);
  }
});

export default redis;
