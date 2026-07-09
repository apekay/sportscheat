'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionState>({
  isPro: false,
  isLoading: false,
});

const subscribeNever = () => () => {};

const CACHE_KEY = 'sc-sub-status';
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Returns the cached pro status, or null if missing/expired. */
function readCachedPro(): boolean | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { isPro, ts } = JSON.parse(cached);
    if (Date.now() - ts < CACHE_TTL_MS) return !!isPro;
  } catch { /* ignore bad cache */ }
  return null;
}

/**
 * Check for dev bypass via URL params without useSearchParams
 * (avoids Suspense boundary requirement during static generation)
 */
function useDevBypass(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).get('dev') === '1',
    () => false
  );
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const devBypass = useDevBypass();
  // null = not fetched yet; stale values after sign-out are masked by the
  // `authenticated &&` guard in the derived isPro below.
  const [fetchedPro, setFetchedPro] = useState<boolean | null>(null);

  const authenticated = status === 'authenticated' && !!session?.user;
  const cachedPro = useSyncExternalStore(subscribeNever, readCachedPro, () => null);

  useEffect(() => {
    if (!authenticated || cachedPro !== null) return;

    fetch('/api/user/subscription')
      .then((res) => res.json())
      .then((data) => {
        setFetchedPro(data.isPro || false);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ isPro: data.isPro, ts: Date.now() })
        );
      })
      .catch(() => setFetchedPro(false));
  }, [authenticated, cachedPro]);

  const isPro = devBypass || (authenticated && (cachedPro ?? fetchedPro ?? false));
  const isLoading =
    !devBypass && authenticated && cachedPro === null && fetchedPro === null;

  return (
    <SubscriptionContext.Provider value={{ isPro, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionState {
  return useContext(SubscriptionContext);
}
