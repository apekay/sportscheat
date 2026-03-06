'use client';

import { AdUnit } from './AdUnit';

interface AdBannerProps {
  slot?: string;
  variant?: 'inline' | 'sticky-bottom';
  className?: string;
}

// Default slot — replace with your real ad unit IDs
const DEFAULT_SLOT = '1234567890';

export function AdBanner({
  slot = DEFAULT_SLOT,
  variant = 'inline',
  className = '',
}: AdBannerProps) {
  if (variant === 'sticky-bottom') {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 ${className}`}>
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
