'use client';

import { useState } from 'react';
import { DailyDigestV2 } from '@/types/v1.1';
import { SwipeCard } from './SwipeCard';
import { ProgressDots } from './ProgressDots';
import { AdBanner } from '@/components/ads/AdBanner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeStackProps {
  digest: DailyDigestV2;
  spoilerFree: boolean;
}

export function SwipeStack({ digest, spoilerFree }: SwipeStackProps) {
  const allBlurbs = [...digest.blurbs].sort(
    (a, b) => b.partyTalkRank - a.partyTalkRank
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownSet, setKnownSet] = useState<Set<number>>(new Set());

  // Filter out spoiler data if spoilerFree
  const processedBlurbs = allBlurbs.map((b) => ({
    ...b,
    resultSummary: spoilerFree && b.isSpoiler ? '' : b.resultSummary,
  }));

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, allBlurbs.length - 1));
  };

  const goPrev = () => {
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
          {currentBlurb ? (
            <SwipeCard
              key={currentBlurb.id}
              blurb={currentBlurb}
              index={currentIndex}
              total={allBlurbs.length}
              onNext={goNext}
              onMarkKnown={markKnown}
              isKnown={knownSet.has(currentIndex)}
            />
          ) : null}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4">
        <ProgressDots
          total={allBlurbs.length}
          current={currentIndex}
          known={knownSet}
          onSelect={setCurrentIndex}
        />
        <div className="flex items-center justify-center gap-4 pb-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded-full bg-warm-50 p-2 text-warm-700 hover:bg-warm-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-warm-500 font-medium">
            {knownSet.size} of {allBlurbs.length} memorized
          </span>
          <button
            onClick={goNext}
            disabled={currentIndex === allBlurbs.length - 1}
            className="rounded-full bg-warm-50 p-2 text-warm-700 hover:bg-warm-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Ad below navigation */}
        <AdBanner />
      </div>
    </div>
  );
}
