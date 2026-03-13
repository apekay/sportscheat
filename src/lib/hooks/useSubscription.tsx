'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
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

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      setIsPro(false);
      return;
    }

    // Check localStorage cache first
    const cached = localStorage.getItem('sc-sub-status');
    if (cached) {
      try {
        const { isPro: cachedPro, ts } = JSON.parse(cached);
        // Cache valid for 5 minutes
        if (Date.now() - ts < 5 * 60 * 1000) {
          setIsPro(cachedPro);
          return;
        }
      } catch { /* ignore bad cache */ }
    }

    setIsLoading(true);
    fetch('/api/user/subscription')
      .then((res) => res.json())
      .then((data) => {
        setIsPro(data.isPro || false);
        localStorage.setItem(
          'sc-sub-status',
          JSON.stringify({ isPro: data.isPro, ts: Date.now() })
        );
      })
      .catch(() => setIsPro(false))
      .finally(() => setIsLoading(false));
  }, [session, status]);

  return (
    <SubscriptionContext.Provider value={{ isPro, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionState {
  return useContext(SubscriptionContext);
}
