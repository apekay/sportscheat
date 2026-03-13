import { getLatestDigest, getYesterdayDigest } from '@/lib/storage/kv';
import SwipePageClient from './SwipePageClient';

// Revalidate every 30 minutes — Vercel serves cached HTML from edge
export const revalidate = 1800;

export default async function SwipePage() {
  let initialDigest = null;
  try {
    initialDigest = await getLatestDigest();
    if (!initialDigest) initialDigest = await getYesterdayDigest();
  } catch {
    // Redis unavailable — client will fetch as fallback
  }

  return <SwipePageClient initialDigest={initialDigest} />;
}
