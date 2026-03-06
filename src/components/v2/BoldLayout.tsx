'use client';

import { DailyDigestV2 } from '@/types/v1.1';
import { BoldHeroSection } from './BoldHeroSection';
import { BoldBlurbCard } from './BoldBlurbCard';
import { AdBanner } from '@/components/ads/AdBanner';

interface BoldLayoutProps {
  digest: DailyDigestV2;
  spoilerFree: boolean;
}

export function BoldLayout({ digest, spoilerFree }: BoldLayoutProps) {
  const sortedBlurbs = [...digest.blurbs].sort(
    (a, b) => b.partyTalkRank - a.partyTalkRank
  );

  return (
    <div>
      <BoldHeroSection digest={digest} />

      {/* Ad after hero, before cards */}
      <AdBanner />

      <div className="space-y-4">
        {sortedBlurbs.map((blurb, index) => (
          <div key={blurb.id}>
            <BoldBlurbCard
              blurb={blurb}
              index={index}
              spoilerFree={spoilerFree}
            />
            {/* In-feed ad every 3 cards */}
            {(index + 1) % 3 === 0 && index < sortedBlurbs.length - 1 && (
              <AdBanner className="mt-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
