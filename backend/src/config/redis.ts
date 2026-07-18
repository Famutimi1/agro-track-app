import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

/**
 * Whether Redis is enabled via configuration (REDIS_ENABLED env var).
 * When disabled, the app runs against an in-memory stub so that caching,
 * rate limiting and login security keep working without a Redis server.
 */
export const redisEnabled = env.REDIS_ENABLED;

/** Whether a real Redis connection is currently established. */
export let redisAvailable = false;

/**
 * Minimal in-memory implementation of the subset of Redis commands used by
 * this app. Used when REDIS_ENABLED=false. Data lives in process memory only
 * and is lost on restart — fine for local development.
 */
class InMemoryRedis {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  status = "ready";

  private isExpired(entry: { expiresAt?: number }): boolean {
    return entry.expiresAt !== undefined && entry.expiresAt <= Date.now();
  }

  private getEntry(key: string) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  async get(key: string): Promise<string | null> {
    return this.getEntry(key)?.value ?? null;
  }

  async set(key: string, value: string | number): Promise<"OK"> {
    this.store.set(key, { value: String(value) });
    return "OK";
  }

  async setex(key: string, ttlSeconds: number, value: string | number): Promise<"OK"> {
    this.store.set(key, { value: String(value), expiresAt: Date.now() + ttlSeconds * 1000 });
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    return count;
  }

  async incr(key: string): Promise<number> {
    const entry = this.getEntry(key);
    const next = (entry ? parseInt(entry.value, 10) : 0) + 1;
    this.store.set(key, { value: String(next), expiresAt: entry?.expiresAt });
    return next;
  }

  async expire(key: string, ttlSeconds: number): Promise<number> {
    const entry = this.getEntry(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + ttlSeconds * 1000;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const entry = this.getEntry(key);
    if (!entry) return -2;
    if (entry.expiresAt === undefined) return -1;
    return Math.ceil((entry.expiresAt - Date.now()) / 1000);
  }

  async exists(...keys: string[]): Promise<number> {
    return keys.reduce((count, key) => count + (this.getEntry(key) ? 1 : 0), 0);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      "^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    const result: string[] = [];
    for (const key of this.store.keys()) {
      if (this.getEntry(key) && regex.test(key)) result.push(key);
    }
    return result;
  }

  async quit(): Promise<"OK"> {
    this.store.clear();
    return "OK";
  }

  async connect(): Promise<void> {
    /* no-op */
  }

  disconnect(): void {
    /* no-op */
  }

  on(): this {
    return this;
  }
}

function createRedisClient(): Redis | InMemoryRedis {
  if (!redisEnabled) {
    logger.info("Redis disabled (REDIS_ENABLED=false) — using in-memory store");
    return new InMemoryRedis();
  }

  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 500, 2000);
    },
    lazyConnect: true,
  });

  client.on("connect", () => {
    redisAvailable = true;
    logger.info("Redis connected");
  });

  client.on("close", () => {
    redisAvailable = false;
  });

  let errorLogged = false;
  client.on("error", (err) => {
    if (!errorLogged) {
      logger.warn("Redis error — features depending on Redis may be degraded", { error: err.message });
      errorLogged = true;
    }
  });

  return client;
}

export const redis = createRedisClient() as Redis;

export async function connectRedis(): Promise<void> {
  if (!redisEnabled) {
    redisAvailable = false;
    return;
  }

  try {
    await redis.connect();
    redisAvailable = true;
  } catch (err) {
    redisAvailable = false;
    logger.warn("Redis unavailable — running without cache/queues", { error: (err as Error).message });
  }
}
