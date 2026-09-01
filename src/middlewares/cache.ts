import { Request, Response, NextFunction } from "express";
import redis from "../shared/redis";

/**
 * HTTP cache middleware backed by Redis. Only caches GET requests that
 * complete with a 2xx status. Pass `ttl` in seconds (default: 60).
 *
 * Usage: router.get("/categories", cache(300), CategoryController.getAll)
 */
export const cache =
  (ttl = 60) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests; skip if Redis is not connected
    if (req.method !== "GET" || redis.status !== "ready") {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(JSON.parse(cached));
        return;
      }
    } catch {
      // Redis read failure is non-fatal — fall through to the real handler
      return next();
    }

    // Monkey-patch res.json to capture the response and store it
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis
          .set(key, JSON.stringify(body), "EX", ttl)
          .catch(() => {/* non-fatal */});
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };

/**
 * Invalidates all cache keys matching the given pattern.
 * Call after mutations: await invalidateCache("cache:/categories*")
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
  if (redis.status !== "ready") return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Non-fatal
  }
};
