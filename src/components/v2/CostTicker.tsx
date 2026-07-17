'use client';

import { useEffect, useState } from 'react';

/**
 * Public running total of what the site has spent on AI generation,
 * across all visitors. Reads /api/v2/costs (Redis-backed ledger).
 */
export function CostTicker() {
  const [totalUsd, setTotalUsd] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/v2/costs')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.totalUsd === 'number') setTotalUsd(d.totalUsd);
      })
      .catch(() => {
        /* counter is cosmetic — stay hidden on failure */
      });
  }, []);

  if (totalUsd === null) return null;

  return (
    <p className="text-xs text-warm-300 text-center">
      Total cost to serve this site to everyone, ever: $
      {totalUsd.toFixed(2)}
    </p>
  );
}
