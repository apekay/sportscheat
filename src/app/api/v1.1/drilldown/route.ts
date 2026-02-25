import { NextResponse } from 'next/server';
import { generateDrillDownV2 } from '@/lib/ai/claude-v1.1';
import { LanguageMode } from '@/types/v1.1';

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

    const drillDown = await generateDrillDownV2(
      summary,
      sport,
      blurbId,
      languageMode as LanguageMode
    );

    return NextResponse.json(drillDown);
  } catch (error) {
    console.error('v1.1 Drill-down failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate drill-down', details: String(error) },
      { status: 500 }
    );
  }
}
