'use client';

import { format } from 'date-fns';
import { DailyDigest, Sport } from '@/types';
import { sportLabel, sportEmoji } from '@/lib/utils';

interface DigestHeaderProps {
  digest: DailyDigest;
}

export function DigestHeader({ digest }: DigestHeaderProps) {
  const dateStr = format(new Date(digest.date), 'EEEE, MMMM d, yyyy');
  const sportKeys = Object.keys(digest.sportsSummary) as Sport[];

  return (
    <div className="mb-6">
      {/* Title */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your Cheat Sheet
          </h1>
          <p className="text-sm text-gray-500">{dateStr}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">
            {digest.blurbs.length} stories
          </span>
          <span className="mx-1 text-gray-300">·</span>
          <span className="text-xs text-gray-400">~3 min read</span>
        </div>
      </div>

      {/* Sport summaries */}
      {sportKeys.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sportKeys.map((sport) => (
            <div
              key={sport}
              className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2"
            >
              <span className="text-base flex-shrink-0">{sportEmoji(sport)}</span>
              <div>
                <span className="text-xs font-medium text-gray-700">
                  {sportLabel(sport)}
                </span>
                <p className="text-xs text-gray-500">
                  {digest.sportsSummary[sport]}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
