'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

export function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (pushed.current) return;
    if (isDev || !client) return; // skip in dev — placeholder shown instead

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error('AdSense push error:', err);
    }
  }, [isDev, client]);

  // Dev placeholder
  if (isDev || !client) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 ${className}`}
        style={{ minHeight: 90 }}
      >
        Ad Placeholder
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block ${className}`}
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
