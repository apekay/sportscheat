'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyDigestV2 } from '@/types/v1.1';
import { trackDigestLoaded, trackDigestRefreshed } from '@/lib/analytics/gtag';

const STORAGE_KEY = 'sporting-chance-digest';
const CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

interface CachedDigest {
  digest: DailyDigestV2;
  fetchedAt: number;
}

function getCachedDigest(): DailyDigestV2 | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cached: CachedDigest = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt > CACHE_MAX_AGE_MS) return null;
    return cached.digest;
  } catch {
    return null;
  }
}

function setCachedDigest(digest: DailyDigestV2): void {
  try {
    const cached: CachedDigest = { digest, fetchedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // localStorage full or unavailable — no-op
  }
}

export function useDigest() {
  // Start with false/null — no spinner on initial server render
  const [digest, setDigest] = useState<DailyDigestV2 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);

  const fetchFromAPI = useCallback(async (silent: boolean) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v2/digest');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DailyDigestV2 = await res.json();
      setDigest(data);
      hasData.current = true;
      setCachedDigest(data);
      trackDigestLoaded(data.blurbs?.length ?? 0);
    } catch (err) {
      // Only show error if user has nothing to look at
      if (!hasData.current) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      }
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
      hasData.current = true;
      setCachedDigest(data);
      trackDigestRefreshed();
      trackDigestLoaded(data.blurbs?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Check localStorage — show cached data INSTANTLY (no spinner)
    const cached = getCachedDigest();
    if (cached) {
      setDigest(cached);
      hasData.current = true;
      // Silently refresh in background — user sees cached content immediately
      fetchFromAPI(true);
    } else {
      // 2. No cache — show spinner and fetch
      setLoading(true);
      fetchFromAPI(false);
    }
  }, [fetchFromAPI]);

  return { digest, loading, error, fetchDigest: fetchFromAPI, handleRefresh };
}
