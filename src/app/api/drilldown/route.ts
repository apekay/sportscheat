import { NextRequest, NextResponse } from 'next/server';
import { generateDrillDown } from '@/lib/ai/claude';

// POST /api/drilldown — generate deeper context for a blurb
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blurbId, summary, sport } = body;

    if (!summary || !sport) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, sport' },
        { status: 400 }
      );
    }

    const drillDown = await generateDrillDown(summary, sport, blurbId);

    return NextResponse.json(drillDown);
  } catch (error) {
    console.error('Drill-down generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate drill-down', details: String(error) },
      { status: 500 }
    );
  }
}
