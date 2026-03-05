import { NextResponse } from 'next/server';
import { getLatestDigest, saveDigest } from '@/lib/storage/kv';
import { aggregateSportsData } from '@/lib/data/aggregate-v1.1';
import { generateDailyDigestV2 } from '@/lib/ai/claude-v1.1';
import { todayString } from '@/lib/utils';
import { LanguageMode } from '@/types/v1.1';

// Allow up to 60s for fallback live generation
export const maxDuration = 60;

// GET /api/v2/digest — returns cached digest (instant), falls back to live generation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'plain') as LanguageMode;

    // Try KV cache first (instant response)
    const cached = await getLatestDigest();
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Cache miss — generate live (first visit before cron runs)
    console.log('[v2/digest] Cache miss, generating live...');
    const rawData = await aggregateSportsData();
    const digest = await generateDailyDigestV2(rawData, lang);

    // Save to cache for subsequent requests
    await saveDigest(todayString(), digest);

    return NextResponse.json(digest, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('[v2/digest] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to load digest', details: String(error) },
      { status: 500 }
    );
  }
}
