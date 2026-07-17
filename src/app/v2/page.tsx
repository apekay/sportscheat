'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, Layers } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';
import { CostTicker } from '@/components/v2/CostTicker';
import { trackViewModeSelected } from '@/lib/analytics/gtag';

export default function V2Picker() {
  const router = useRouter();

  // Auto-redirect if user already chose a preference
  // Also pre-fetch the digest so it's cached by the time they land on their view
  useEffect(() => {
    const pref = localStorage.getItem('sporting-chance-view');
    if (pref === 'bold') router.replace('/v2/bold');
    else if (pref === 'swipe') router.replace('/v2/swipe');

    // Pre-fetch digest in background — warms browser cache + CDN edge
    fetch('/api/v2/digest').catch(() => {});
  }, [router]);

  const selectView = (view: 'bold' | 'swipe') => {
    localStorage.setItem('sporting-chance-view', view);
    trackViewModeSelected(view);
    router.push(`/v2/${view}`);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-warm-900 mb-2">Sporting Chance</h1>
        <p className="text-sm text-warm-500">
          Pick how you want to read your daily cheat sheet
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {/* Option A — Bold Headlines */}
        <button
          onClick={() => selectView('bold')}
          className="group rounded-2xl border-2 border-warm-200 bg-warm-white p-6 text-left hover:border-warm-900 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-warm-900 p-2.5">
              <Newspaper className="h-6 w-6 text-on-ink" />
            </div>
            <h2 className="text-lg font-serif font-bold text-warm-900">Headlines</h2>
          </div>
          <p className="text-sm text-warm-500 leading-relaxed mb-4">
            Bold cards with headlines, hooks, and drill-downs. Like reading The Athletic in 3 minutes.
          </p>
          <div className="rounded-xl bg-warm-50 border border-warm-200 p-3">
            <div className="h-3 w-3/4 rounded bg-warm-300 mb-2" />
            <div className="h-2 w-full rounded bg-warm-200 mb-1" />
            <div className="h-2 w-5/6 rounded bg-warm-200 mb-3" />
            <div className="rounded-lg bg-editorial-light p-2">
              <div className="h-2 w-1/2 rounded bg-editorial/30 mb-1" />
              <div className="h-2 w-full rounded bg-editorial/15" />
            </div>
          </div>
        </button>

        {/* Option B — Flash Cards */}
        <button
          onClick={() => selectView('swipe')}
          className="group rounded-2xl border-2 border-warm-200 bg-warm-white p-6 text-left hover:border-editorial hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-editorial p-2.5">
              <Layers className="h-6 w-6 text-on-accent" />
            </div>
            <h2 className="text-lg font-serif font-bold text-warm-900">Flash Cards</h2>
          </div>
          <p className="text-sm text-warm-500 leading-relaxed mb-4">
            One story at a time. Tap to flip. Built for memorizing in 2 minutes flat.
          </p>
          <div className="rounded-xl bg-warm-50 border border-warm-200 p-3">
            <div className="h-3 w-2/3 rounded bg-warm-300 mb-3 mx-auto" />
            <div className="rounded-lg bg-editorial-light border border-editorial/15 p-2 mb-2">
              <div className="h-2 w-full rounded bg-editorial/25 mb-1" />
              <div className="h-2 w-3/4 rounded bg-editorial/15 mx-auto" />
            </div>
            <div className="flex justify-center gap-1">
              <div className="h-1.5 w-4 rounded-full bg-editorial" />
              <div className="h-1.5 w-1.5 rounded-full bg-warm-200" />
              <div className="h-1.5 w-1.5 rounded-full bg-warm-200" />
              <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
            </div>
          </div>
        </button>
      </div>

      <div className="w-full max-w-lg mt-6">
        <AdBanner />
      </div>

      <p className="mt-4 text-xs text-warm-300 text-center">
        You can switch anytime from the header.
      </p>
      <div className="mt-2">
        <CostTicker />
      </div>
    </div>
  );
}
