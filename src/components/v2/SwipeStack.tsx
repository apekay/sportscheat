'use client';

import { useState } from 'react';
import { DailyDigestV2 } from '@/types/v1.1';
import { SwipeCard, ProLevel } from './SwipeCard';
import { ProgressDots } from './ProgressDots';
import { AdBanner } from '@/components/ads/AdBanner';
import { UpgradeCard, NextUpdateCard } from './UpgradeCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isFreeContentDay, nextFreeDay } from '@/lib/utils';

interface SwipeStackProps {
  digest: DailyDigestV2;
  spoilerFree: boolean;
  isPro?: boolean;
}

/**
 * Determines per-card pro level for free users:
 * - Cards 0-1 (blurbs 1-2): 'full' — everything visible
 * - Card 2 (blurb 3): 'partial' — conversation starters locked
 * - Cards 3+ (blurbs 4-5): 'locked' — fully pro-locked (show UpgradeCard)
 */
function getProLevel(index: number, isPro: boolean): ProLevel {
  if (isPro) return 'full';
  if (index <= 1) return 'full';
  if (index === 2) return 'partial';
  return 'locked';
}

export function SwipeStack({ digest, spoilerFree, isPro = false }: SwipeStackProps) {
  const allBlurbs = [...digest.blurbs].sort(
    (a, b) => b.partyTalkRank - a.partyTalkRank
  );

  const freeDay = isPro || isFreeContentDay();

  // On non-free days, show just 1 teaser card
  // On free days, show 3 cards (2 full + 1 partial)
  const visibleCount = isPro
    ? allBlurbs.length
    : freeDay
      ? Math.min(3, allBlurbs.length)
      : 1;
  const lockedCount = allBlurbs.length - visibleCount;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownSet, setKnownSet] = useState<Set<number>>(new Set());
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Filter out spoiler data if spoilerFree
  const processedBlurbs = allBlurbs.map((b) => ({
    ...b,
    resultSummary: spoilerFree && b.isSpoiler ? '' : b.resultSummary,
  }));

  const goNext = () => {
    // Free users: after last visible card, show upgrade
    if (!isPro && currentIndex >= visibleCount - 1) {
      setShowUpgrade(true);
      return;
    }
    setCurrentIndex((prev) => Math.min(prev + 1, (isPro ? allBlurbs.length : visibleCount) - 1));
  };

  const goPrev = () => {
    setShowUpgrade(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const markKnown = () => {
    setKnownSet((prev) => new Set(prev).add(currentIndex));
  };

  const currentBlurb = processedBlurbs[currentIndex];

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Hero headline */}
      <div className="text-center mb-6">
        <p className="text-xs font-medium text-editorial-dark uppercase tracking-wider mb-1">
          Get yourself off the bench in 3 mins
        </p>
        <p className="text-sm font-serif text-warm-700 font-medium leading-relaxed max-w-md mx-auto">
          {digest.headlineStory}
        </p>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-start justify-center px-2">
        <div className="w-full max-w-md">
          {showUpgrade && !isPro ? (
            freeDay ? (
              <UpgradeCard remainingCount={lockedCount} variant="swipe" />
            ) : (
              <NextUpdateCard nextDay={nextFreeDay()} variant="swipe" />
            )
          ) : currentBlurb ? (
            <SwipeCard
              key={currentBlurb.id}
              blurb={currentBlurb}
              index={currentIndex}
              total={allBlurbs.length}
              onNext={goNext}
              onMarkKnown={markKnown}
              isKnown={knownSet.has(currentIndex)}
              proLevel={freeDay ? getProLevel(currentIndex, isPro) : 'partial'}
            />
          ) : null}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4">
        <ProgressDots
          total={isPro ? allBlurbs.length : visibleCount}
          current={currentIndex}
          known={knownSet}
          onSelect={(i) => {
            setShowUpgrade(false);
            setCurrentIndex(i);
          }}
        />
        <div className="flex items-center justify-center gap-4 pb-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0 && !showUpgrade}
            className="rounded-full bg-warm-50 p-2 text-warm-700 hover:bg-warm-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-warm-500 font-medium">
            {knownSet.size} of {allBlurbs.length} memorized
          </span>
          <button
            onClick={goNext}
            disabled={showUpgrade || (isPro && currentIndex === allBlurbs.length - 1)}
            className="rounded-full bg-warm-50 p-2 text-warm-700 hover:bg-warm-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Ad below navigation (free users only) */}
        {!isPro && <AdBanner />}
      </div>
    </div>
  );
}
