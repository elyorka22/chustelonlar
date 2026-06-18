import Redis from "ioredis";
import { isBuildPhase } from "@/lib/runtime";
import { memCacheGet, memCacheSet, memCacheDel, memCacheDelPrefix } from "@/lib/memory-cache";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (isBuildPhase()) return null;
  if (!process.env.REDIS_URL) return null;

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
    } catch {
      return null;
    }
  }

  return redis;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const client = getRedis();

  if (!client) {
    return { success: true, remaining: limit };
  }

  try {
    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, windowSeconds);
    }

    return {
      success: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  } catch {
    return { success: true, remaining: limit };
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const fromMemory = memCacheGet<T>(key);
  if (fromMemory !== null) return fromMemory;

  const client = getRedis();
  if (!client) return null;

  try {
    const data = await client.get(key);
    if (!data) return null;
    const parsed = JSON.parse(data) as T;
    memCacheSet(key, parsed, 60);
    return parsed;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  memCacheSet(key, value, ttlSeconds);

  const client = getRedis();
  if (!client) return;

  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Cache failures are non-critical
  }
}

export async function cacheDel(key: string): Promise<void> {
  memCacheDel(key);

  const client = getRedis();
  if (!client) return;

  try {
    await client.del(key);
  } catch {
    // Cache failures are non-critical
  }
}

export async function cacheDelByPrefix(prefix: string): Promise<void> {
  memCacheDelPrefix(prefix);

  const client = getRedis();
  if (!client) return;

  try {
    const stream = client.scanStream({ match: `${prefix}*`, count: 100 });
    const keys: string[] = [];
    for await (const batch of stream) {
      keys.push(...(batch as string[]));
    }
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Cache failures are non-critical
  }
}
