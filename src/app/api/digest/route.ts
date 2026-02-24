import { NextResponse } from 'next/server';
import { aggregateSportsData } from '@/lib/data/aggregate';
import { generateDailyDigest } from '@/lib/ai/claude';

// GET /api/digest — returns today's digest (generates if needed)
export async function GET() {
  try {
    // TODO: Check Supabase cache first, return cached if < 1hr old

    // 1. Aggregate sports data from ESPN + RSS
    const rawData = await aggregateSportsData();

    // 2. Generate digest via Claude
    const digest = await generateDailyDigest(rawData);

    // TODO: Cache in Supabase

    return NextResponse.json(digest);
  } catch (error) {
    console.error('Digest generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/digest — force regenerate (used by cron)
export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawData = await aggregateSportsData();
    const digest = await generateDailyDigest(rawData);

    // TODO: Save to Supabase

    return NextResponse.json({ success: true, digest });
  } catch (error) {
    console.error('Digest regeneration failed:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate digest', details: String(error) },
      { status: 500 }
    );
  }
}
