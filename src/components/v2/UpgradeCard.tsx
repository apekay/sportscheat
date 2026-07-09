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
      className={`sc-frame border-l-4 border-l-editorial ${
        isSwipe ? 'w-full p-6 sm:p-8' : 'p-6'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-editorial" />
        <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark">
          Gameface
        </span>
      </div>

      <h3 className={`sc-display font-serif font-bold text-warm-900 mb-2 ${isSwipe ? 'text-2xl' : 'text-lg'}`}>
        {remainingCount} more {remainingCount === 1 ? 'story' : 'stories'} waiting
      </h3>

      <p className="text-sm text-warm-600 leading-snug mb-4">
        Unlock every story, quotable one-liners, and what to say about each one. Plus, no ads.
      </p>

      <div className="flex flex-col gap-2">
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 rounded-lg bg-warm-900 py-3 text-sm font-bold text-on-ink hover:bg-warm-700 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Get off the bench — 6 months free
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
      className="group bg-warm-50 border border-warm-100 px-4 py-3 flex items-center gap-2 hover:border-amber-300 hover:bg-amber-50 transition-colors"
    >
      <Lock className="h-4 w-4 text-warm-300 group-hover:text-amber-500 transition-colors" />
      <span className="text-sm text-warm-400 group-hover:text-amber-700 transition-colors">
        {label || 'Unlock with Gameface'}
      </span>
    </Link>
  );
}
