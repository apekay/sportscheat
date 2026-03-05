'use client';

import { DailyDigestV2 } from '@/types/v1.1';
import { BoldHeroSection } from './BoldHeroSection';
import { BoldBlurbCard } from './BoldBlurbCard';

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

      <div className="space-y-4">
        {sortedBlurbs.map((blurb, index) => (
          <BoldBlurbCard
            key={blurb.id}
            blurb={blurb}
            index={index}
            spoilerFree={spoilerFree}
          />
        ))}
      </div>
    </div>
  );
}
