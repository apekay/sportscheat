import { NextResponse } from 'next/server';
import { aggregateSportsData } from '@/lib/data/aggregate-v1.1';
import { generateDailyDigestV2 } from '@/lib/ai/claude-v1.1';
import {
  saveDigest,
  acquireGenerationLock,
  releaseGenerationLock,
} from '@/lib/storage/kv';
import { todayString } from '@/lib/utils';

// Allow up to 300s for data fetch + Claude API call (requires Vercel Pro)
export const maxDuration = 300;

// GET /api/v2/generate — cron-triggered daily digest generation
export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel sends this header for cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const date = todayString();

    // One generation at a time (shared lock with /api/v2/digest live fallback)
    const gotLock = await acquireGenerationLock();
    if (!gotLock) {
      console.log('[v2/generate] Skipped — another generation is in flight');
      return NextResponse.json({ success: false, skipped: 'generation already in progress' });
    }

    try {
      console.log(`[v2/generate] Generating digest for ${date}...`);

      // 1. Aggregate sports data
      const rawData = await aggregateSportsData();

      // 2. Generate digest via Claude
      const digest = await generateDailyDigestV2(rawData, 'plain');

      // 3. Save to KV cache
      await saveDigest(date, digest);
      console.log(`[v2/generate] Digest cached for ${date}`);

      // 4. Distribute to subscribers (non-blocking)
      // Distribution is imported dynamically to avoid errors when env vars are missing
      try {
        const { distributeDigest } = await import('@/lib/distribution/distribute');
        await distributeDigest(digest);
        console.log(`[v2/generate] Distribution complete`);
      } catch (distErr) {
        console.warn('[v2/generate] Distribution skipped:', distErr);
      }

      return NextResponse.json({
        success: true,
        date,
        blurbCount: digest.blurbs.length,
        generatedAt: digest.generatedAt,
      });
    } finally {
      await releaseGenerationLock().catch(() => {});
    }
  } catch (error) {
    console.error('[v2/generate] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest', details: String(error) },
      { status: 500 }
    );
  }
}
