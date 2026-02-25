'use client';

import { format } from 'date-fns';
import { DailyDigestV2, ReadingMode, Sport } from '@/types/v1.1';
import { sportLabel, sportEmoji } from '@/lib/utils-v1.1';

interface DigestHeaderV2Props {
  digest: DailyDigestV2;
  readingMode: ReadingMode;
}

export function DigestHeaderV2({ digest, readingMode }: DigestHeaderV2Props) {
  const dateStr = format(new Date(digest.date), 'EEEE, MMMM d, yyyy');
  const sportKeys = Object.keys(digest.sportsSummary) as Sport[];

  return (
    <div className="mb-6">
      {/* Title */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Cheat Sheet</h1>
          <p className="text-sm text-gray-500">{dateStr}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">
            {digest.blurbs.length} stories
          </span>
          <span className="mx-1 text-gray-300">&middot;</span>
          <span className="text-xs text-gray-400">
            ~{readingMode === 'quick' ? '3' : '8'} min read
          </span>
        </div>
      </div>

      {/* Headline story — the ONE thing to know */}
      {digest.headlineStory && (
        <div className="mt-4 rounded-xl bg-gray-900 p-4 text-white">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            If you only remember one thing
          </div>
          <p className="text-sm font-medium leading-relaxed">
            {digest.headlineStory}
          </p>
        </div>
      )}

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
