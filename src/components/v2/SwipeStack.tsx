'use client';

import { useState, useCallback } from 'react';
import { DailyDigestV2 } from '@/types/v1.1';
import { SwipeCard } from './SwipeCard';
import { ProgressDots } from './ProgressDots';
import { AdBanner } from '@/components/ads/AdBanner';
import { UpgradeCard } from './UpgradeCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeStackProps {
  digest: DailyDigestV2;
  spoilerFree: boolean;
  isPro?: boolean;
}

export function SwipeStack({ digest, spoilerFree, isPro = false }: SwipeStackProps) {
  const allBlurbs = [...digest.blurbs].sort(
    (a, b) => b.partyTalkRank - a.partyTalkRank
  );

  // Free users see only 1 blurb
  const blurbs = isPro ? allBlurbs : allBlurbs.slice(0, 1);
  const hiddenCount = allBlurbs.length - blurbs.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownSet, setKnownSet] = useState<Set<number>>(new Set());
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Filter out spoiler data if spoilerFree
  const processedBlurbs = blurbs.map((b) => ({
    ...b,
    resultSummary: spoilerFree && b.isSpoiler ? '' : b.resultSummary,
  }));

  const goNext = useCallback(() => {
    if (!isPro && currentIndex === blurbs.length - 1) {
      setShowUpgrade(true);
      return;
    }
    setCurrentIndex((prev) => Math.min(prev + 1, blurbs.length - 1));
  }, [blurbs.length, currentIndex, isPro]);

  const goPrev = useCallback(() => {
    setShowUpgrade(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const markKnown = useCallback(() => {
    setKnownSet((prev) => new Set(prev).add(currentIndex));
  }, [currentIndex]);

  const currentBlurb = processedBlurbs[currentIndex];

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Hero headline */}
      <div className="text-center mb-6">
        <p className="text-xs font-medium text-editorial-dark uppercase tracking-wider mb-1">
          If you only remember one thing
        </p>
        <p className="text-sm font-serif text-warm-700 font-medium leading-relaxed max-w-md mx-auto">
          {digest.headlineStory}
        </p>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-start justify-center px-2">
        <div className="w-full max-w-md">
          {showUpgrade && !isPro ? (
            <UpgradeCard remainingCount={hiddenCount} variant="swipe" />
          ) : currentBlurb ? (
            <SwipeCard
              key={currentBlurb.id}
              blurb={currentBlurb}
              index={currentIndex}
              total={isPro ? blurbs.length : allBlurbs.length}
              onNext={goNext}
              onMarkKnown={markKnown}
              isKnown={knownSet.has(currentIndex)}
              isPro={isPro}
            />
          ) : null}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4">
        <ProgressDots
          total={blurbs.length}
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
            {knownSet.size} of {blurbs.length} memorized
          </span>
          <button
            onClick={goNext}
            disabled={showUpgrade || currentIndex === blurbs.length - 1}
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
