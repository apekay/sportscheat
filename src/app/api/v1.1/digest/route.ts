import { NextResponse } from 'next/server';
import { getLatestDigest, saveDigest } from '@/lib/storage/kv';
import { aggregateSportsData } from '@/lib/data/aggregate-v1.1';
import { generateDailyDigestV2 } from '@/lib/ai/claude-v1.1';
import { todayString } from '@/lib/utils';
import { LanguageMode } from '@/types/v1.1';

// Live generation takes ~2 min on Fable (requires Vercel Pro)
export const maxDuration = 300;

// GET /api/v1.1/digest — returns today's story-first digest
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'plain') as LanguageMode;

    // 1. Reuse today's cached digest (shared with v2) when the language matches
    try {
      const cached = await getLatestDigest();
      if (cached && cached.languageMode === lang) {
        return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
      }
    } catch (cacheErr) {
      console.warn('[v1.1/digest] Redis read failed, generating live:', cacheErr);
    }

    // 2. Cache miss — aggregate + generate live
    const rawData = await aggregateSportsData();
    const digest = await generateDailyDigestV2(rawData, lang);

    // Only the default language populates the shared daily cache
    if (lang === 'plain') {
      try {
        await saveDigest(todayString(), digest);
      } catch (saveErr) {
        console.warn('[v1.1/digest] Failed to save to cache:', saveErr);
      }
    }

    return NextResponse.json(digest, { headers: { 'X-Cache': 'MISS' } });
  } catch (error) {
    console.error('v1.1 Digest generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest', details: String(error) },
      { status: 500 }
    );
  }
}
