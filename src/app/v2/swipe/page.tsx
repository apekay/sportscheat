'use client';

import { useState, useEffect } from 'react';
import { DailyDigestV2 } from '@/types/v1.1';
import { V2Header } from '@/components/v2/V2Header';
import { SwipeStack } from '@/components/v2/SwipeStack';
import { Loader2 } from 'lucide-react';

export default function SwipePage() {
  const [digest, setDigest] = useState<DailyDigestV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spoilerFree, setSpoilerFree] = useState(true);

  const fetchDigest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v2/digest');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDigest(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
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
      setDigest(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <V2Header
        loading={loading}
        spoilerFree={spoilerFree}
        onRefresh={handleRefresh}
        onSpoilerToggle={() => setSpoilerFree(!spoilerFree)}
        lastUpdated={digest?.generatedAt}
      />

      <main className="mx-auto max-w-2xl px-4 py-4">
        {loading && !digest && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            <p className="mt-4 text-sm text-gray-500">Loading your cheat sheet...</p>
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

        {digest && <SwipeStack digest={digest} spoilerFree={spoilerFree} />}
      </main>
    </div>
  );
}
