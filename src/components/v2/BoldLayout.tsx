'use client';

import { DailyDigestV2 } from '@/types/v1.1';
import { BoldHeroSection } from './BoldHeroSection';
import { BoldBlurbCard, ProLevel } from './BoldBlurbCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { UpgradeCard, NextUpdateCard } from './UpgradeCard';
import { isFreeContentDay, nextFreeDay } from '@/lib/utils';

interface BoldLayoutProps {
  digest: DailyDigestV2;
  spoilerFree: boolean;
  isPro?: boolean;
}

/**
 * Determines per-card pro level for free users:
 * - Cards 0-1 (blurbs 1-2): 'full' — everything visible
 * - Card 2 (blurb 3): 'partial' — conversation starters locked
 * - Cards 3+ (blurbs 4-5): 'locked' — fully pro-locked
 */
function getProLevel(index: number, isPro: boolean): ProLevel {
  if (isPro) return 'full';
  if (index <= 1) return 'full';
  if (index === 2) return 'partial';
  return 'locked';
}

export function BoldLayout({ digest, spoilerFree, isPro = false }: BoldLayoutProps) {
  const sortedBlurbs = [...digest.blurbs].sort(
    (a, b) => b.partyTalkRank - a.partyTalkRank
  );

  const freeDay = isPro || isFreeContentDay();

  return (
    <div>
      <BoldHeroSection digest={digest} />

      {/* Ad after hero (free users only) */}
      {!isPro && <AdBanner />}

      {/* Non-free day: show 1 teaser blurb + come-back card */}
      {!freeDay ? (
        <div className="space-y-4">
          <BoldBlurbCard
            blurb={sortedBlurbs[0]}
            index={0}
            spoilerFree={spoilerFree}
            proLevel="partial"
          />
          <NextUpdateCard nextDay={nextFreeDay()} />
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBlurbs.map((blurb, index) => {
            const proLevel = getProLevel(index, isPro);

            // For fully locked cards, show UpgradeCard instead
            if (proLevel === 'locked') {
              // Only show UpgradeCard once (at the first locked position)
              if (index === 3) {
                const lockedCount = sortedBlurbs.length - 3;
                return (
                  <UpgradeCard
                    key="upgrade"
                    remainingCount={lockedCount}
                    variant="bold"
                  />
                );
              }
              return null;
            }

            return (
              <div key={blurb.id}>
                <BoldBlurbCard
                  blurb={blurb}
                  index={index}
                  spoilerFree={spoilerFree}
                  proLevel={proLevel}
                />
                {/* In-feed ad every 3 cards (free users only) */}
                {!isPro && (index + 1) % 3 === 0 && index < sortedBlurbs.length - 1 && (
                  <AdBanner className="mt-4" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
