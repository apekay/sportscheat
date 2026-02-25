import { NextResponse } from 'next/server';
import { aggregateSportsData } from '@/lib/data/aggregate-v1.1';
import { generateDailyDigestV2 } from '@/lib/ai/claude-v1.1';
import { LanguageMode } from '@/types/v1.1';

// GET /api/v1.1/digest — returns today's story-first digest
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'plain') as LanguageMode;

    // 1. Aggregate sports data from ESPN + RSS (now includes women's sports)
    const rawData = await aggregateSportsData();

    // 2. Generate story-first digest via Claude
    const digest = await generateDailyDigestV2(rawData, lang);

    return NextResponse.json(digest);
  } catch (error) {
    console.error('v1.1 Digest generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest', details: String(error) },
      { status: 500 }
    );
  }
}
