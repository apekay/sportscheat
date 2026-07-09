'use client';

import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface UpgradeCardProps {
  remainingCount: number;
  variant?: 'bold' | 'swipe';
}

export function UpgradeCard({ remainingCount, variant = 'bold' }: UpgradeCardProps) {
  const isSwipe = variant === 'swipe';

  return (
    <div
      className={`${
        isSwipe
          ? 'w-full rounded-3xl bg-gradient-to-br from-amber-50 to-warm-50 border border-amber-200 shadow-lg p-6 sm:p-8'
          : 'rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-warm-50 shadow-sm p-6'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-full bg-amber-100 p-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          Gameface
        </span>
      </div>

      <h3 className={`font-serif font-bold text-warm-900 mb-2 ${isSwipe ? 'text-2xl' : 'text-lg'}`}>
        {remainingCount} more {remainingCount === 1 ? 'story' : 'stories'} waiting
      </h3>

      <p className="text-sm text-warm-600 leading-relaxed mb-4">
        Get daily updates, all stories, quotable one-liners, and what to say about each one. Plus, no ads.
      </p>

      <div className="flex flex-col gap-2">
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 rounded-xl bg-warm-900 py-3 text-sm font-semibold text-white hover:bg-warm-700 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Get off the bench — 6 months free
        </Link>
      </div>
    </div>
  );
}

/** Card shown on non-update days for free users */
export function NextUpdateCard({ nextDay, variant = 'bold' }: { nextDay: string; variant?: 'bold' | 'swipe' }) {
  const isSwipe = variant === 'swipe';

  return (
    <div
      className={`${
        isSwipe
          ? 'w-full rounded-3xl bg-warm-white border border-warm-200 shadow-lg p-6 sm:p-8'
          : 'rounded-2xl border border-warm-200 bg-warm-white shadow-sm p-6'
      }`}
    >
      <p className={`font-serif font-bold text-warm-900 mb-2 ${isSwipe ? 'text-2xl' : 'text-lg'}`}>
        Your next update drops {nextDay}
      </p>
      <p className="text-sm text-warm-600 leading-relaxed mb-4">
        Free updates land twice a week. Want daily stories instead?
      </p>
      <div className="flex flex-col gap-2">
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 rounded-xl bg-warm-900 py-3 text-sm font-semibold text-white hover:bg-warm-700 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Go daily — 6 months free
        </Link>
      </div>
    </div>
  );
}

/** Small inline lock shown on premium features */
export function PremiumLock({ label }: { label?: string }) {
  return (
    <Link
      href="/pricing"
      className="group rounded-xl bg-warm-50 border border-warm-200 px-4 py-3 flex items-center gap-2 hover:border-amber-300 hover:bg-amber-50 transition-colors"
    >
      <Lock className="h-4 w-4 text-warm-300 group-hover:text-amber-500 transition-colors" />
      <span className="text-sm text-warm-400 group-hover:text-amber-700 transition-colors">
        {label || 'Unlock with Gameface'}
      </span>
    </Link>
  );
}
