'use client';

import { useState, useCallback } from 'react';
import { DailyDigestV2 } from '@/types/v1.1';
import { SwipeCard } from './SwipeCard';
import { ProgressDots } from './ProgressDots';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeStackProps {
  digest: DailyDigestV2;
  spoilerFree: boolean;
}

export function SwipeStack({ digest, spoilerFree }: SwipeStackProps) {
  const blurbs = [...digest.blurbs].sort(
    (a, b) => b.partyTalkRank - a.partyTalkRank
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownSet, setKnownSet] = useState<Set<number>>(new Set());

  // Filter out spoiler data if spoilerFree
  const processedBlurbs = blurbs.map((b) => ({
    ...b,
    resultSummary: spoilerFree && b.isSpoiler ? '' : b.resultSummary,
  }));

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, blurbs.length - 1));
  }, [blurbs.length]);

  const goPrev = useCallback(() => {
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
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">
          If you only remember one thing
        </p>
        <p className="text-sm text-gray-700 font-medium leading-relaxed max-w-md mx-auto">
          {digest.headlineStory}
        </p>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-start justify-center px-2">
        <div className="w-full max-w-md">
          {currentBlurb && (
            <SwipeCard
              key={currentBlurb.id}
              blurb={currentBlurb}
              index={currentIndex}
              total={blurbs.length}
              onNext={goNext}
              onMarkKnown={markKnown}
              isKnown={knownSet.has(currentIndex)}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4">
        <ProgressDots
          total={blurbs.length}
          current={currentIndex}
          known={knownSet}
          onSelect={setCurrentIndex}
        />
        <div className="flex items-center justify-center gap-4 pb-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {knownSet.size} of {blurbs.length} memorized
          </span>
          <button
            onClick={goNext}
            disabled={currentIndex === blurbs.length - 1}
            className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
