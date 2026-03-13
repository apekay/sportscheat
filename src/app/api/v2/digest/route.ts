import { NextResponse } from 'next/server';
import { getLatestDigest, getYesterdayDigest, saveDigest } from '@/lib/storage/kv';
import { aggregateSportsData } from '@/lib/data/aggregate-v1.1';
import { generateDailyDigestV2 } from '@/lib/ai/claude-v1.1';
import { todayString } from '@/lib/utils';
import { LanguageMode } from '@/types/v1.1';

// Allow up to 300s for fallback live generation (requires Vercel Pro)
export const maxDuration = 300;

// GET /api/v2/digest — returns cached digest (instant), falls back to live generation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'plain') as LanguageMode;

    // CDN cache headers — Vercel edge caches for 30 min, serves stale for 24h while revalidating
    // Use Vercel-CDN-Cache-Control so it's not overridden by Next.js
    const cacheHeaders = {
      'CDN-Cache-Control': 's-maxage=1800, stale-while-revalidate=86400',
      'Vercel-CDN-Cache-Control': 's-maxage=1800, stale-while-revalidate=86400',
    };

    // 1. Try today's cached digest (instant response)
    try {
      const cached = await getLatestDigest();
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'X-Cache': 'HIT', ...cacheHeaders },
        });
      }
    } catch (cacheErr) {
      console.warn('[v2/digest] Redis read failed, continuing to fallbacks:', cacheErr);
    }

    // 2. Try yesterday's digest as a quick fallback (still instant)
    try {
      const yesterday = await getYesterdayDigest();
      if (yesterday) {
        console.log('[v2/digest] Serving yesterday\'s digest as fallback');
        return NextResponse.json(yesterday, {
          headers: { 'X-Cache': 'YESTERDAY', ...cacheHeaders },
        });
      }
    } catch (yesterdayErr) {
      console.warn('[v2/digest] Yesterday fallback failed:', yesterdayErr);
    }

    // 3. Full cache miss — generate live (first visit before cron runs)
    console.log('[v2/digest] Cache miss, generating live...');
    const rawData = await aggregateSportsData();
    const digest = await generateDailyDigestV2(rawData, lang);

    // Save to cache for subsequent requests (non-blocking, don't crash if Redis fails)
    try {
      await saveDigest(todayString(), digest);
    } catch (saveErr) {
      console.warn('[v2/digest] Failed to save to cache:', saveErr);
    }

    return NextResponse.json(digest, {
      headers: { 'X-Cache': 'MISS', ...cacheHeaders },
    });
  } catch (error) {
    console.error('[v2/digest] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to load digest', details: String(error) },
      { status: 500 }
    );
  }
}
