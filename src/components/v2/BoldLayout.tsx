'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DailyDigestV2 } from '@/types/v1.1';
import { BoldHeroSection } from './BoldHeroSection';
import { BoldBlurbCard } from './BoldBlurbCard';
import { TopicTabs } from './TopicTabs';
import { AdBanner } from '@/components/ads/AdBanner';
import { topicForSport, topicsInBlurbs } from '@/lib/topics';

const VISIBLE_COUNT = 3;

interface BoldLayoutProps {
  digest: DailyDigestV2;
  spoilerFree: boolean;
}

export function BoldLayout({ digest, spoilerFree }: BoldLayoutProps) {
  const [topic, setTopic] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const sortedBlurbs = useMemo(
    () => [...digest.blurbs].sort((a, b) => b.partyTalkRank - a.partyTalkRank),
    [digest.blurbs]
  );
  const topics = useMemo(() => topicsInBlurbs(sortedBlurbs), [sortedBlurbs]);

  const filtered =
    topic === 'all'
      ? sortedBlurbs
      : sortedBlurbs.filter((b) => topicForSport(b.sport).id === topic);

  const visible = expanded ? filtered : filtered.slice(0, VISIBLE_COUNT);
  const hiddenCount = filtered.length - visible.length;

  const selectTopic = (id: string) => {
    setTopic(id);
    setExpanded(false); // each topic starts back at its top 3
  };

  return (
    <div>
      <BoldHeroSection digest={digest} />

      {/* Ad after hero */}
      <AdBanner />

      <TopicTabs topics={topics} selected={topic} onSelect={selectTopic} />

      <div className="space-y-4">
        {visible.map((blurb, index) => (
          <div key={blurb.id}>
            <BoldBlurbCard
              blurb={blurb}
              index={index}
              spoilerFree={spoilerFree}
            />
            {/* In-feed ad every 3 cards */}
            {(index + 1) % 3 === 0 && index < visible.length - 1 && (
              <AdBanner className="mt-4" />
            )}
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-warm-200 bg-warm-50 px-4 py-3 text-sm font-semibold text-warm-700 hover:border-warm-900 hover:bg-warm-100 transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
          Show {hiddenCount} more {hiddenCount === 1 ? 'story' : 'stories'}
        </button>
      )}

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-warm-500">
          No stories in this topic today — check back tomorrow.
        </p>
      )}
    </div>
  );
}
