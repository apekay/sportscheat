'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, Layers } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

export default function V2Picker() {
  const router = useRouter();

  // Auto-redirect if user already chose a preference
  useEffect(() => {
    const pref = localStorage.getItem('sportscheat-view');
    if (pref === 'bold') router.replace('/v2/bold');
    if (pref === 'swipe') router.replace('/v2/swipe');
  }, [router]);

  const selectView = (view: 'bold' | 'swipe') => {
    localStorage.setItem('sportscheat-view', view);
    router.push(`/v2/${view}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SportsCheat</h1>
        <p className="text-sm text-gray-500">
          Pick how you want to read your daily cheat sheet
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {/* Option A — Bold Headlines */}
        <button
          onClick={() => selectView('bold')}
          className="group rounded-2xl border-2 border-gray-200 bg-white p-6 text-left hover:border-gray-900 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-gray-900 p-2.5">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Headlines</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Bold cards with headlines, hooks, and drill-downs. Like reading The Athletic in 3 minutes.
          </p>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
            <div className="h-3 w-3/4 rounded bg-gray-300 mb-2" />
            <div className="h-2 w-full rounded bg-gray-200 mb-1" />
            <div className="h-2 w-5/6 rounded bg-gray-200 mb-3" />
            <div className="rounded-lg bg-indigo-50 p-2">
              <div className="h-2 w-1/2 rounded bg-indigo-200 mb-1" />
              <div className="h-2 w-full rounded bg-indigo-100" />
            </div>
          </div>
        </button>

        {/* Option B — Flash Cards */}
        <button
          onClick={() => selectView('swipe')}
          className="group rounded-2xl border-2 border-gray-200 bg-white p-6 text-left hover:border-indigo-600 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-indigo-600 p-2.5">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Flash Cards</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            One story at a time. Tap to flip. Built for memorizing in 2 minutes flat.
          </p>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
            <div className="h-3 w-2/3 rounded bg-gray-300 mb-3 mx-auto" />
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-2 mb-2">
              <div className="h-2 w-full rounded bg-amber-200 mb-1" />
              <div className="h-2 w-3/4 rounded bg-amber-100 mx-auto" />
            </div>
            <div className="flex justify-center gap-1">
              <div className="h-1.5 w-4 rounded-full bg-indigo-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
            </div>
          </div>
        </button>
      </div>

      <div className="w-full max-w-lg mt-6">
        <AdBanner />
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        You can switch anytime from the header.
      </p>
    </div>
  );
}
