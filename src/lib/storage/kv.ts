import { Redis } from '@upstash/redis';
import { DailyDigestV2 } from '@/types/v1.1';
import { Subscriber, CachedDigest } from '@/types/v2';
import { todayString } from '@/lib/utils';

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error('Missing UPSTASH_REDIS_REST_URL/TOKEN env vars');
  }
  return new Redis({ url, token });
}

// ---- Digest storage ----

const DIGEST_PREFIX = 'digest';
const DIGEST_TTL = 60 * 60 * 48; // 48 hours

export async function saveDigest(date: string, digest: DailyDigestV2): Promise<void> {
  const redis = getRedis();
  const cached: CachedDigest = {
    digest,
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + DIGEST_TTL * 1000).toISOString(),
  };
  await redis.set(`${DIGEST_PREFIX}:${date}`, JSON.stringify(cached), { ex: DIGEST_TTL });
}

export async function getDigest(date: string): Promise<DailyDigestV2 | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(`${DIGEST_PREFIX}:${date}`);
  if (!raw) return null;
  const parsed: CachedDigest = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return parsed.digest;
}

export async function getLatestDigest(): Promise<DailyDigestV2 | null> {
  return getDigest(todayString());
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function getYesterdayDigest(): Promise<DailyDigestV2 | null> {
  return getDigest(yesterdayString());
}

// ---- Refresh rate limiting ----

const REFRESH_PREFIX = 'refresh';
const REFRESH_COOLDOWN = 60 * 60; // 1 hour

export async function canRefresh(userKey: string): Promise<boolean> {
  const redis = getRedis();
  const existing = await redis.get(`${REFRESH_PREFIX}:${userKey}`);
  return !existing;
}

export async function markRefreshed(userKey: string): Promise<void> {
  const redis = getRedis();
  await redis.set(`${REFRESH_PREFIX}:${userKey}`, '1', { ex: REFRESH_COOLDOWN });
}

// ---- Subscribers ----

const SUBSCRIBERS_KEY = 'subscribers';

export async function getSubscribers(): Promise<Subscriber[]> {
  const redis = getRedis();
  const raw = await redis.get<string>(SUBSCRIBERS_KEY);
  if (!raw) return [];
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function addSubscriber(subscriber: Subscriber): Promise<void> {
  const subs = await getSubscribers();
  subs.push(subscriber);
  const redis = getRedis();
  await redis.set(SUBSCRIBERS_KEY, JSON.stringify(subs));
}

export async function removeSubscriber(id: string): Promise<void> {
  const subs = await getSubscribers();
  const filtered = subs.filter((s) => s.id !== id);
  const redis = getRedis();
  await redis.set(SUBSCRIBERS_KEY, JSON.stringify(filtered));
}
