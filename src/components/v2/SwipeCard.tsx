'use client';

import { useState } from 'react';
import { StoryBlurb } from '@/types/v1.1';
import { sportLabel, sportColor, sportEmoji } from '@/lib/utils-v1.1';
import { cn } from '@/lib/utils';
import { RotateCcw, MessageCircle, Check } from 'lucide-react';

interface SwipeCardProps {
  blurb: StoryBlurb;
  index: number;
  total: number;
  onNext: () => void;
  onMarkKnown: () => void;
  isKnown: boolean;
}

export function SwipeCard({
  blurb,
  index,
  total,
  onNext,
  onMarkKnown,
  isKnown,
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
          className="w-full rounded-3xl bg-white border border-gray-200 shadow-lg p-6 sm:p-8"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Sport pill + card counter */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white',
                sportColor(blurb.sport)
              )}
            >
              {sportEmoji(blurb.sport)} {sportLabel(blurb.sport)}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {index + 1} / {total}
            </span>
          </div>

          {/* Bold headline — the hook */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-6">
            {blurb.headline}
          </h2>

          {/* Why should I care — prominent */}
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5 mb-6">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
              Why Should I Care?
            </p>
            <p className="text-base text-indigo-900 leading-relaxed font-medium">
              {blurb.whyShouldICareQuick || blurb.whyShouldICare}
            </p>
          </div>

          {/* Memory hook — the one-liner */}
          <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 mb-6">
            <p className="text-base font-bold text-amber-900 text-center">
              &ldquo;{blurb.memoryHook}&rdquo;
            </p>
          </div>

          {/* Tap to flip prompt */}
          <button
            onClick={() => setFlipped(true)}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Tap for full story
          </button>
        </div>

        {/* === BACK === */}
        <div
          className="absolute inset-0 w-full rounded-3xl bg-gray-950 text-white shadow-lg p-6 sm:p-8 overflow-y-auto [transform:rotateY(180deg)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Sport pill */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400">
              {sportEmoji(blurb.sport)} {sportLabel(blurb.sport)}
            </span>
            <button
              onClick={() => setFlipped(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Headline */}
          <h2 className="text-xl font-bold mb-4">{blurb.headline}</h2>

          {/* Full narrative */}
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {blurb.storyNarrative}
          </p>

          {/* Result if not spoiler */}
          {blurb.resultSummary && (
            <div className="rounded-xl bg-white/10 px-4 py-3 mb-4">
              <p className="text-sm font-medium text-gray-200">
                {blurb.resultSummary}
              </p>
            </div>
          )}

          {/* Athlete spotlight */}
          {blurb.athleteSpotlight && (
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-1">
                Who is {blurb.athleteSpotlight.name}?
              </p>
              <p className="text-sm text-gray-300">{blurb.athleteSpotlight.bio}</p>
            </div>
          )}

          {/* Conversation starters */}
          {blurb.conversationStarters?.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
                <MessageCircle className="h-3.5 w-3.5" />
                How to bring this up
              </div>
              <div className="space-y-1.5">
                {blurb.conversationStarters.map((s, i) => (
                  <p key={i} className="text-xs text-gray-400 italic">
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
                setFlipped(false);
                onNext();
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors',
                isKnown
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
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
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Next story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
