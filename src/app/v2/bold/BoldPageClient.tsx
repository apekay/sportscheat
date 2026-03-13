'use client';

import { useState, useEffect, useCallback } from 'react';
import { DailyDigestV2 } from '@/types/v1.1';
import { V2Header } from '@/components/v2/V2Header';
import { BoldLayout } from '@/components/v2/BoldLayout';
import { AdBanner } from '@/components/ads/AdBanner';
import { trackDigestLoaded, trackDigestRefreshed } from '@/lib/analytics/gtag';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface Props {
  initialDigest: DailyDigestV2 | null;
}

export default function BoldPageClient({ initialDigest }: Props) {
  const [digest, setDigest] = useState<DailyDigestV2 | null>(initialDigest);
  const [loading, setLoading] = useState(!initialDigest);
  const [error, setError] = useState<string | null>(null);
  const [spoilerFree, setSpoilerFree] = useState(true);
  const { isPro } = useSubscription();

  const fetchDigest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v2/digest');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DailyDigestV2 = await res.json();
      setDigest(data);
      trackDigestLoaded(data.blurbs?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v2/refresh', { method: 'POST' });
      if (res.status === 429) {
        setError('Refresh available once per hour. Try again later.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DailyDigestV2 = await res.json();
      setDigest(data);
      trackDigestRefreshed();
      trackDigestLoaded(data.blurbs?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  }, []);

  // If server didn't provide data, fetch on client as fallback
  useEffect(() => {
    if (!initialDigest) {
      fetchDigest();
    } else {
      trackDigestLoaded(initialDigest.blurbs?.length ?? 0);
    }
  }, [initialDigest, fetchDigest]);

  return (
    <div className="min-h-screen bg-cream">
      <V2Header
        loading={loading}
        spoilerFree={spoilerFree}
        onRefresh={handleRefresh}
        onSpoilerToggle={() => setSpoilerFree(!spoilerFree)}
        lastUpdated={digest?.generatedAt}
      />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading && !digest && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-warm-300" />
            <p className="mt-4 text-sm text-warm-500">Loading your cheat sheet...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center mb-4">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchDigest}
              className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {digest && <BoldLayout digest={digest} spoilerFree={spoilerFree} isPro={isPro} />}

        {digest && (
          <>
            {!isPro && <AdBanner className="mt-6" />}
            <div className="mt-4 py-6 text-center">
              <p className="text-xs text-warm-300">
                You don&apos;t need to be a fan to belong in the conversation.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
