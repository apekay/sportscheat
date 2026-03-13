'use client';

import { DailyDigestV2 } from '@/types/v1.1';
import { BoldHeroSection } from './BoldHeroSection';
import { BoldBlurbCard } from './BoldBlurbCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { UpgradeCard } from './UpgradeCard';

interface BoldLayoutProps {
  digest: DailyDigestV2;
  spoilerFree: boolean;
  isPro?: boolean;
}

export function BoldLayout({ digest, spoilerFree, isPro = false }: BoldLayoutProps) {
  const sortedBlurbs = [...digest.blurbs].sort(
    (a, b) => b.partyTalkRank - a.partyTalkRank
  );

  // Free users see only the first blurb
  const visibleBlurbs = isPro ? sortedBlurbs : sortedBlurbs.slice(0, 1);
  const hiddenCount = sortedBlurbs.length - visibleBlurbs.length;

  return (
    <div>
      <BoldHeroSection digest={digest} />

      {/* Ad after hero (free users only) */}
      {!isPro && <AdBanner />}

      <div className="space-y-4">
        {visibleBlurbs.map((blurb, index) => (
          <div key={blurb.id}>
            <BoldBlurbCard
              blurb={blurb}
              index={index}
              spoilerFree={spoilerFree}
              isPro={isPro}
            />
            {/* In-feed ad every 3 cards (free users only) */}
            {!isPro && (index + 1) % 3 === 0 && index < visibleBlurbs.length - 1 && (
              <AdBanner className="mt-4" />
            )}
          </div>
        ))}

        {/* Upgrade card for free users */}
        {!isPro && hiddenCount > 0 && (
          <UpgradeCard remainingCount={hiddenCount} variant="bold" />
        )}
      </div>
    </div>
  );
}
