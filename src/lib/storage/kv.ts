import { Redis } from '@upstash/redis';
import { DailyDigestV2, DrillDownV2 } from '@/types/v1.1';
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
// 7 days: a stale digest beats a blank site when the daily cron misses.
const DIGEST_TTL = 60 * 60 * 24 * 7;

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

function daysAgoString(daysBack: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().split('T')[0];
}

/** Newest digest from the last `maxDaysBack` days (excluding today). */
export async function getRecentDigest(
  maxDaysBack: number
): Promise<DailyDigestV2 | null> {
  for (let back = 1; back <= maxDaysBack; back++) {
    const digest = await getDigest(daysAgoString(back));
    if (digest) return digest;
  }
  return null;
}

// ---- Generation lock ----
// Live digest generation takes ~2 min; without a lock, every concurrent
// cache-miss request starts its own generation (real API dollars each).

const GEN_LOCK_KEY = 'digest:generating';
const GEN_LOCK_TTL = 60 * 5; // covers one generation, self-heals if a run dies

export async function acquireGenerationLock(): Promise<boolean> {
  const redis = getRedis();
  const res = await redis.set(GEN_LOCK_KEY, '1', { nx: true, ex: GEN_LOCK_TTL });
  return res === 'OK';
}

export async function releaseGenerationLock(): Promise<void> {
  const redis = getRedis();
  await redis.del(GEN_LOCK_KEY);
}

// ---- Drill-down storage ----
// Drill-downs are expensive (~30s of generation); cache per blurb so only
// the first reader of each story pays for it.

const DRILLDOWN_PREFIX = 'drilldown';
const DRILLDOWN_TTL = 60 * 60 * 48; // 48 hours, same horizon as digests

export async function saveDrillDown(
  blurbId: string,
  lang: string,
  drillDown: DrillDownV2
): Promise<void> {
  const redis = getRedis();
  await redis.set(
    `${DRILLDOWN_PREFIX}:${blurbId}:${lang}`,
    JSON.stringify(drillDown),
    { ex: DRILLDOWN_TTL }
  );
}

export async function getDrillDown(
  blurbId: string,
  lang: string
): Promise<DrillDownV2 | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(`${DRILLDOWN_PREFIX}:${blurbId}:${lang}`);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

// ---- Cost ledger ----
// Running total of Anthropic API spend across all visitors, stored as
// integer microdollars so INCRBY stays exact (no float drift).

const COST_KEY = 'costs:total-microdollars';

export async function addCost(usd: number): Promise<void> {
  const redis = getRedis();
  await redis.incrby(COST_KEY, Math.round(usd * 1_000_000));
}

export async function getTotalCost(): Promise<number> {
  const redis = getRedis();
  const micro = await redis.get<number>(COST_KEY);
  return (micro ?? 0) / 1_000_000;
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
