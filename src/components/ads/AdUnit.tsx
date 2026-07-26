'use client';

interface AdUnitProps {
  /** Layout marker for a possible future ad placement. No ad network is
      integrated — renders a dashed marker in dev, nothing in production. */
  slot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

export function AdUnit({ className = '' }: AdUnitProps) {
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-warm-200 bg-warm-50 text-xs text-warm-300 ${className}`}
      style={{ minHeight: 90 }}
    >
      Ad Placeholder
    </div>
  );
}
