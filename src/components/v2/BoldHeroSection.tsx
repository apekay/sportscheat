'use client';

import { format } from 'date-fns';
import { DailyDigestV2, Sport } from '@/types/v1.1';
import { sportEmoji } from '@/lib/utils-v1.1';

interface BoldHeroSectionProps {
  digest: DailyDigestV2;
}

export function BoldHeroSection({ digest }: BoldHeroSectionProps) {
  const dateStr = format(new Date(digest.date), 'EEEE, MMMM d');
  const sportKeys = Object.keys(digest.sportsSummary) as Sport[];

  return (
    <div className="mb-8">
      {/* Hero headline story */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-950 p-6 sm:p-8">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-purple-950/30" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-400">{dateStr}</span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span className="text-sm text-gray-500">
              {digest.blurbs.length} stories
            </span>
          </div>

          <p className="text-xs font-medium uppercase tracking-wider text-indigo-400 mb-2">
            The one thing to know today
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {digest.headlineStory}
          </h1>

          {/* Sport summary pills */}
          {sportKeys.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {sportKeys.map((sport) => (
                <div
                  key={sport}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300"
                >
                  <span>{sportEmoji(sport)}</span>
                  <span className="text-gray-400">
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
