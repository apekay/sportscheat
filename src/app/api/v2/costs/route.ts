import { NextResponse } from 'next/server';
import { getTotalCost, getTotalVisitors } from '@/lib/storage/kv';

// GET /api/v2/costs — running total of Anthropic API spend (USD) and
// total unique visitors, for the public transparency footer
export async function GET() {
  try {
    const [totalUsd, totalVisitors] = await Promise.all([
      getTotalCost(),
      getTotalVisitors(),
    ]);
    return NextResponse.json(
      { totalUsd, totalVisitors },
      {
        headers: {
          'CDN-Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
          'Vercel-CDN-Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('[v2/costs] Failed:', error);
    return NextResponse.json({ error: 'Failed to load costs' }, { status: 500 });
  }
}
