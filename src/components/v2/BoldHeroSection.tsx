'use client';

import { format } from 'date-fns';
import { DailyDigestV2, Sport } from '@/types/v1.1';
import { sportEmoji } from '@/lib/utils-v1.1';

interface BoldHeroSectionProps {
  digest: DailyDigestV2;
}

export function BoldHeroSection({ digest }: BoldHeroSectionProps) {
  const dateStr = format(new Date(digest.date + 'T00:00:00'), 'EEEE, MMMM d');
  const sportKeys = Object.keys(digest.sportsSummary) as Sport[];

  return (
    <div className="mb-8">
      {/* Hero headline story */}
      <div className="relative overflow-hidden sc-frame-invert p-6 sm:p-8">
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-invert-ink-2">{dateStr}</span>
            <span className="h-1 w-1 rounded-full bg-invert-ink-3" />
            <span className="text-sm text-invert-ink-3 tabular-nums">
              {digest.blurbs.length} stories
            </span>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-editorial-invert mb-2">
            Get yourself off the bench in 3 mins
          </p>
          <h1 className="sc-display text-xl sm:text-2xl font-serif font-bold text-invert-ink leading-snug">
            {digest.headlineStory}
          </h1>

          {/* Sport summary chips */}
          {sportKeys.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {sportKeys.map((sport) => (
                <div
                  key={sport}
                  className="inline-flex items-center gap-1.5 bg-invert-soft px-3 py-1.5 text-xs text-invert-ink-2"
                >
                  <span>{sportEmoji(sport)}</span>
                  <span className="text-invert-ink-3">
                    {digest.sportsSummary[sport]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
