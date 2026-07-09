'use client';

import { useState } from 'react';
import { StoryBlurb } from '@/types/v1.1';
import { sportLabel, sportEmoji } from '@/lib/utils-v1.1';
import { cn } from '@/lib/utils';
import { RotateCcw, MessageCircle, Check, Lock } from 'lucide-react';
import { trackCardEngaged, trackStoryMemorized } from '@/lib/analytics/gtag';
import Link from 'next/link';

export type ProLevel = 'full' | 'partial' | 'locked';

interface SwipeCardProps {
  blurb: StoryBlurb;
  index: number;
  total: number;
  onNext: () => void;
  onMarkKnown: () => void;
  isKnown: boolean;
  proLevel?: ProLevel;
}

export function SwipeCard({
  blurb,
  index,
  total,
  onNext,
  onMarkKnown,
  isKnown,
  proLevel = 'full',
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
          className="w-full sc-frame p-6 sm:p-8"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Sport label + card counter */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark">
              {sportLabel(blurb.sport)}
            </span>
            <span className="text-xs text-warm-300 font-medium tabular-nums">
              {index + 1} / {total}
            </span>
          </div>

          {/* Headline — the scan anchor */}
          <h2 className="sc-display text-2xl sm:text-3xl font-serif font-extrabold text-warm-900 leading-tight mb-5">
            <span className="mr-2">{sportEmoji(blurb.sport)}</span>
            {blurb.headline}
          </h2>

          {/* Why should I care — left-bar block, reads in one pass */}
          <div className="border-l-4 border-editorial bg-editorial-light pl-4 pr-4 py-3 mb-5">
            <p className="text-[11px] font-bold text-editorial-dark uppercase tracking-wider mb-1">
              Why Should I Care?
            </p>
            <p className="text-base text-warm-900 leading-snug font-medium">
              {blurb.whyShouldICareQuick || blurb.whyShouldICare}
            </p>
          </div>

          {/* Memory hook — the line you'll actually say */}
          {proLevel !== 'locked' ? (
            <div className="border border-warm-200 bg-warm-50 px-5 py-4 mb-5">
              <p className="text-[11px] font-bold text-warm-500 uppercase tracking-wider mb-1">
                Say this
              </p>
              <p className="text-base font-serif font-bold text-warm-900 leading-snug">
                &ldquo;{blurb.memoryHook}&rdquo;
              </p>
            </div>
          ) : (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 border border-warm-200 bg-warm-50 px-5 py-4 mb-5 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <Lock className="h-4 w-4 text-warm-300" />
              <span className="text-sm text-warm-400">Unlock quote with Gameface</span>
            </Link>
          )}

          {/* Tap to flip prompt */}
          <button
            onClick={() => {
              setFlipped(true);
              trackCardEngaged(blurb.id, blurb.sport);
            }}
            className="w-full rounded-lg bg-warm-900 py-3 text-sm font-bold text-on-ink hover:bg-warm-700 transition-colors"
          >
            Tap for full story
          </button>
        </div>

        {/* === BACK === */}
        <div
          className="absolute inset-0 w-full sc-frame-invert text-invert-ink p-6 sm:p-8 overflow-y-auto [transform:rotateY(180deg)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Sport label + flip back */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-invert-ink-3">
              {sportLabel(blurb.sport)}
            </span>
            <button
              onClick={() => setFlipped(false)}
              className="text-invert-ink-3 hover:text-invert-ink transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Headline with sport emoji */}
          <h2 className="sc-display text-xl font-serif font-bold mb-4">
            <span className="mr-2">{sportEmoji(blurb.sport)}</span>
            {blurb.headline}
          </h2>

          {/* Full narrative */}
          <p className="text-sm text-invert-ink-2 leading-relaxed mb-4">
            {blurb.storyNarrative}
          </p>

          {/* Result if not spoiler */}
          {blurb.resultSummary && (
            <div className="bg-invert-soft px-4 py-3 mb-4">
              <p className="text-sm font-medium text-invert-ink">
                {blurb.resultSummary}
              </p>
            </div>
          )}

          {/* Athlete spotlight */}
          {blurb.athleteSpotlight && (
            <div className="bg-invert-soft border border-invert-line px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-invert-ink-3 mb-1">
                Who is {blurb.athleteSpotlight.name}?
              </p>
              <p className="text-sm text-invert-ink-2">{blurb.athleteSpotlight.bio}</p>
            </div>
          )}

          {/* Conversation starters (full only — locked for partial, hidden for locked) */}
          {proLevel === 'full' && blurb.conversationStarters?.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-invert-ink-3 mb-2">
                <MessageCircle className="h-3.5 w-3.5" />
                How to bring this up
              </div>
              <div className="space-y-1.5">
                {blurb.conversationStarters.map((s, i) => (
                  <p key={i} className="text-xs text-invert-ink-2">
                    &ldquo;{s}&rdquo;
                  </p>
                ))}
              </div>
            </div>
          )}
          {proLevel === 'partial' && (
            <Link
              href="/pricing"
              className="flex items-center gap-2 bg-invert-soft border border-invert-line px-4 py-3 mb-4 hover:opacity-80 transition-opacity"
            >
              <Lock className="h-3.5 w-3.5 text-invert-ink-3" />
              <span className="text-xs text-invert-ink-3">Unlock what to say about this</span>
            </Link>
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
                'flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-colors',
                isKnown
                  ? 'bg-green-600 text-white'
                  : 'bg-invert-soft text-invert-ink-2 hover:opacity-80'
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
              className="flex-1 rounded-lg bg-editorial py-3 text-sm font-bold text-on-accent hover:bg-editorial-dark transition-colors"
            >
              Next story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
