'use client';

interface AdUnitProps {
  /** Reserved for a future per-placement Adsterra banner zone. Today every
      unit is a dev-only marker: site-wide ads (Social Bar / Popunder) are
      injected globally by the zone scripts in layout.tsx, so in production
      this renders nothing. */
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
      Ad Placeholder (site-wide Adsterra units inject globally)
    </div>
  );
}
