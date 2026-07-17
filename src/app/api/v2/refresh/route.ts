import { NextResponse } from 'next/server';
import {
  canRefresh,
  markRefreshed,
  saveDigest,
  acquireGenerationLock,
  releaseGenerationLock,
} from '@/lib/storage/kv';
import { aggregateSportsData } from '@/lib/data/aggregate-v1.1';
import { generateDailyDigestV2 } from '@/lib/ai/claude-v1.1';
import { todayString } from '@/lib/utils';
import { LanguageMode } from '@/types/v1.1';

// Live regeneration takes ~2 min on Fable (requires Vercel Pro)
export const maxDuration = 300;

// POST /api/v2/refresh — user-triggered digest regeneration (rate-limited)
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'plain') as LanguageMode;

    // Rate limit: 1 refresh per hour per IP
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const allowed = await canRefresh(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limited. You can refresh once per hour.' },
        { status: 429 }
      );
    }

    // Don't stack a refresh on top of an in-flight generation
    const gotLock = await acquireGenerationLock();
    if (!gotLock) {
      return NextResponse.json(
        { status: 'generating' },
        { status: 202, headers: { 'Retry-After': '20', 'Cache-Control': 'no-store' } }
      );
    }

    try {
      const date = todayString();
      console.log(`[v2/refresh] Regenerating digest for ${date}...`);

      const rawData = await aggregateSportsData();
      const digest = await generateDailyDigestV2(rawData, lang);

      await saveDigest(date, digest);
      await markRefreshed(ip);

      return NextResponse.json(digest);
    } finally {
      await releaseGenerationLock().catch(() => {});
    }
  } catch (error) {
    console.error('[v2/refresh] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to refresh digest', details: String(error) },
      { status: 500 }
    );
  }
}
