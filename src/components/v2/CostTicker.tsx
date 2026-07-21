'use client';

import { useEffect, useState } from 'react';

const VISITED_KEY = 'sc-visited';

function formatPerPerson(usd: number): string {
  if (usd >= 0.01) return `$${usd.toFixed(2)}`;
  if (usd >= 0.001) return `$${usd.toFixed(3)}`;
  return 'less than a tenth of a cent';
}

/**
 * Public transparency footer: what the site has spent on AI generation,
 * in total and per person who has ever visited. Reads /api/v2/costs;
 * counts each browser once via a localStorage-gated ping.
 */
export function CostTicker() {
  const [totals, setTotals] = useState<{
    totalUsd: number;
    totalVisitors?: number;
  } | null>(null);

  useEffect(() => {
    // First visit from this browser? Count it (fire-and-forget).
    try {
      if (!localStorage.getItem(VISITED_KEY)) {
        localStorage.setItem(VISITED_KEY, '1');
        fetch('/api/v2/view', { method: 'POST' }).catch(() => {});
      }
    } catch {
      /* private mode */
    }

    fetch('/api/v2/costs')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.totalUsd === 'number') setTotals(d);
      })
      .catch(() => {
        /* counter is cosmetic — stay hidden on failure */
      });
  }, []);

  if (!totals) return null;

  const { totalUsd, totalVisitors } = totals;
  const perPerson =
    totalVisitors && totalVisitors > 0 ? totalUsd / totalVisitors : null;

  return (
    <div className="space-y-0.5">
      <p className="text-xs text-warm-300 text-center">
        Total cost to serve this site to everyone, ever: ${totalUsd.toFixed(2)}
      </p>
      {perPerson !== null && (
        <p className="text-xs text-warm-300 text-center">
          Across {totalVisitors!.toLocaleString()}{' '}
          {totalVisitors === 1 ? 'visitor' : 'visitors'}, that&rsquo;s{' '}
          {formatPerPerson(perPerson)} per person.
        </p>
      )}
    </div>
  );
}
