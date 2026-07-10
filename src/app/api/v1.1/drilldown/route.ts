import { NextResponse } from 'next/server';
import { generateDrillDownV2 } from '@/lib/ai/claude-v1.1';
import { getDrillDown, saveDrillDown } from '@/lib/storage/kv';
import { LanguageMode } from '@/types/v1.1';

// Live generation takes ~30s on a cache miss (requires Vercel Pro)
export const maxDuration = 300;

// POST /api/v1.1/drilldown — deeper context with plain language support
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blurbId, summary, sport, languageMode = 'plain' } = body;

    if (!blurbId || !summary || !sport) {
      return NextResponse.json(
        { error: 'Missing required fields: blurbId, summary, sport' },
        { status: 400 }
      );
    }

    // Serve the cached drill-down if another reader already generated it
    try {
      const cached = await getDrillDown(blurbId, languageMode);
      if (cached) {
        return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
      }
    } catch (cacheErr) {
      console.warn('[v1.1/drilldown] Redis read failed, generating live:', cacheErr);
    }

    const drillDown = await generateDrillDownV2(
      summary,
      sport,
      blurbId,
      languageMode as LanguageMode
    );

    try {
      await saveDrillDown(blurbId, languageMode, drillDown);
    } catch (saveErr) {
      console.warn('[v1.1/drilldown] Failed to cache:', saveErr);
    }

    return NextResponse.json(drillDown, { headers: { 'X-Cache': 'MISS' } });
  } catch (error) {
    console.error('v1.1 Drill-down failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate drill-down', details: String(error) },
      { status: 500 }
    );
  }
}
