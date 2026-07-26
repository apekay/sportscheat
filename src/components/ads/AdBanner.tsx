'use client';

import { AdUnit } from './AdUnit';

interface AdBannerProps {
  slot?: string;
  variant?: 'inline' | 'sticky-bottom';
  className?: string;
}

// Dev-only layout markers for future ad placements. No ad network is
// currently integrated; production renders nothing here.
export function AdBanner({
  slot,
  variant = 'inline',
  className = '',
}: AdBannerProps) {
  if (variant === 'sticky-bottom') {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-20 bg-warm-white/95 backdrop-blur-sm border-t border-warm-100 px-4 py-2 ${className}`}>
        <div className="mx-auto max-w-2xl">
          <AdUnit slot={slot} format="horizontal" />
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <div className={`my-4 ${className}`}>
      <AdUnit slot={slot} format="auto" />
    </div>
  );
}
