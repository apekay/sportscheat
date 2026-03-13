'use client';

import { useState } from 'react';
import { StoryBlurb } from '@/types/v1.1';
import { sportLabel, sportEmoji } from '@/lib/utils-v1.1';
import { cn } from '@/lib/utils';
import { RotateCcw, MessageCircle, Check, Lock } from 'lucide-react';
import { trackCardEngaged, trackStoryMemorized } from '@/lib/analytics/gtag';
import Link from 'next/link';

interface SwipeCardProps {
  blurb: StoryBlurb;
  index: number;
  total: number;
  onNext: () => void;
  onMarkKnown: () => void;
  isKnown: boolean;
  isPro?: boolean;
}

export function SwipeCard({
  blurb,
  index,
  total,
  onNext,
  onMarkKnown,
  isKnown,
  isPro = false,
}: SwipeCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative w-full" style={{ perspective: '1000px' }}>
      <div
        className={cn(
          'relative w-full transition-transform duration-500',
          flipped && '[transform:rotateY(180deg)]'
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* === FRONT === */}
        <div
          className="w-full rounded-3xl bg-warm-white border border-warm-200 shadow-lg p-6 sm:p-8"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Sport label + card counter */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-warm-500">
              {sportLabel(blurb.sport)}
            </span>
            <span className="text-xs text-warm-300 font-medium">
              {index + 1} / {total}
            </span>
          </div>

          {/* Bold headline with sport emoji */}
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-warm-900 leading-tight mb-6">
            <span className="mr-2">{sportEmoji(blurb.sport)}</span>
            {blurb.headline}
          </h2>

          {/* Why should I care — prominent */}
          <div className="rounded-2xl bg-editorial-light border border-editorial/20 p-5 mb-6">
            <p className="text-xs font-bold text-editorial-dark uppercase tracking-wider mb-2">
              Why Should I Care?
            </p>
            <p className="text-base text-warm-900 leading-relaxed font-medium">
              {blurb.whyShouldICareQuick || blurb.whyShouldICare}
            </p>
          </div>

          {/* Memory hook — the one-liner (Pro only) */}
          {isPro ? (
            <div className="rounded-2xl bg-warm-50 border border-warm-100 px-5 py-4 mb-6">
              <p className="text-base font-serif font-bold italic text-warm-900 text-center">
                &ldquo;{blurb.memoryHook}&rdquo;
              </p>
            </div>
          ) : (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 rounded-2xl bg-warm-50 border border-warm-200 px-5 py-4 mb-6 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <Lock className="h-4 w-4 text-warm-300" />
              <span className="text-sm text-warm-400">Unlock quote with Pro</span>
            </Link>
          )}

          {/* Tap to flip prompt */}
          <button
            onClick={() => {
              setFlipped(true);
              trackCardEngaged(blurb.id, blurb.sport);
            }}
            className="w-full rounded-xl bg-warm-900 py-3 text-sm font-semibold text-white hover:bg-warm-700 transition-colors"
          >
            Tap for full story
          </button>
        </div>

        {/* === BACK === */}
        <div
          className="absolute inset-0 w-full rounded-3xl bg-hero-bg text-white shadow-lg p-6 sm:p-8 overflow-y-auto [transform:rotateY(180deg)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Sport label + flip back */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-warm-300">
              {sportLabel(blurb.sport)}
            </span>
            <button
              onClick={() => setFlipped(false)}
              className="text-warm-300 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Headline with sport emoji */}
          <h2 className="text-xl font-serif font-bold mb-4">
            <span className="mr-2">{sportEmoji(blurb.sport)}</span>
            {blurb.headline}
          </h2>

          {/* Full narrative */}
          <p className="text-sm text-warm-200 leading-relaxed mb-4">
            {blurb.storyNarrative}
          </p>

          {/* Result if not spoiler */}
          {blurb.resultSummary && (
            <div className="rounded-xl bg-white/10 px-4 py-3 mb-4">
              <p className="text-sm font-medium text-warm-100">
                {blurb.resultSummary}
              </p>
            </div>
          )}

          {/* Athlete spotlight */}
          {blurb.athleteSpotlight && (
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-warm-300 mb-1">
                Who is {blurb.athleteSpotlight.name}?
              </p>
              <p className="text-sm text-warm-200">{blurb.athleteSpotlight.bio}</p>
            </div>
          )}

          {/* Conversation starters (Pro only) */}
          {isPro && blurb.conversationStarters?.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-warm-300 mb-2">
                <MessageCircle className="h-3.5 w-3.5" />
                How to bring this up
              </div>
              <div className="space-y-1.5">
                {blurb.conversationStarters.map((s, i) => (
                  <p key={i} className="text-xs text-warm-300 font-serif italic">
                    &ldquo;{s}&rdquo;
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                onMarkKnown();
                trackStoryMemorized(blurb.id, blurb.sport);
                setFlipped(false);
                onNext();
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors',
                isKnown
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-warm-200 hover:bg-white/20'
              )}
            >
              <Check className="h-4 w-4" />
              I got this
            </button>
            <button
              onClick={() => {
                setFlipped(false);
                onNext();
              }}
              className="flex-1 rounded-xl bg-editorial py-3 text-sm font-semibold text-white hover:bg-editorial-dark transition-colors"
            >
              Next story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
