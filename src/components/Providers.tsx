'use client';

import { SessionProvider } from 'next-auth/react';
import { SubscriptionProvider } from '@/lib/hooks/useSubscription';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SubscriptionProvider>{children}</SubscriptionProvider>
    </SessionProvider>
  );
}
