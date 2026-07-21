import { NextResponse } from 'next/server';
import { incrementVisitors } from '@/lib/storage/kv';

// POST /api/v2/view — first-visit ping (client sends once per browser,
// gated by localStorage). Feeds the cost-per-person transparency line.
export async function POST() {
  try {
    await incrementVisitors();
  } catch (err) {
    console.warn('[v2/view] failed to count visitor:', err);
  }
  // Counter is cosmetic — always 204 so a Redis hiccup never surfaces
  return new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  });
}
