'use client';

import { useState } from 'react';
import { StoryBlurb, DrillDownV2 } from '@/types/v1.1';
import { sportLabel, sportColor, sportEmoji } from '@/lib/utils-v1.1';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Brain,
  Loader2,
  Zap,
} from 'lucide-react';

interface BoldBlurbCardProps {
  blurb: StoryBlurb;
  index: number;
  spoilerFree: boolean;
}

export function BoldBlurbCard({ blurb, index, spoilerFree }: BoldBlurbCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [drillDown, setDrillDown] = useState<DrillDownV2 | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStarters, setShowStarters] = useState(false);

  const handleDrillDown = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);

    if (!drillDown) {
      setLoading(true);
      try {
        const res = await fetch('/api/v1.1/drilldown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blurbId: blurb.id,
            summary: blurb.storyNarrative,
            sport: blurb.sport,
            languageMode: 'plain',
          }),
        });
        setDrillDown(await res.json());
      } catch (err) {
        console.error('Drill-down failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="p-5">
        {/* Sport badge + rank */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white',
              sportColor(blurb.sport)
            )}
          >
            {sportEmoji(blurb.sport)} {sportLabel(blurb.sport)}
          </span>
          {blurb.partyTalkRank >= 8 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Zap className="h-3 w-3" />
              Hot
            </span>
          )}
          <span className="ml-auto text-xs text-gray-400">#{index + 1}</span>
        </div>

        {/* Bold headline */}
        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">
          {blurb.headline}
        </h2>

        {/* Quick narrative */}
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {blurb.storyNarrativeQuick || blurb.storyNarrative}
        </p>

        {/* Score result — spoiler guarded */}
        {blurb.isSpoiler && blurb.resultSummary && !spoilerFree && (
          <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-2 mb-3">
            {blurb.resultSummary}
          </p>
        )}

        {/* "Why Should I Care?" callout — the key retention hook */}
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 mb-3">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            Why Should I Care?
          </p>
          <p className="text-sm text-indigo-900 leading-relaxed font-medium">
            {blurb.whyShouldICareQuick || blurb.whyShouldICare}
          </p>
        </div>

        {/* Memory hook — quotable one-liner */}
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-sm font-bold text-amber-900">
            &ldquo;{blurb.memoryHook}&rdquo;
          </p>
        </div>

        {/* Conversation starters */}
        <button
          onClick={() => setShowStarters(!showStarters)}
          className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {showStarters ? 'Hide starters' : 'How to bring this up'}
        </button>

        {showStarters && blurb.conversationStarters?.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {blurb.conversationStarters.map((s, i) => (
              <div
                key={i}
                className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800 italic"
              >
                &ldquo;{s}&rdquo;
              </div>
            ))}
          </div>
        )}

        {/* Expand for drill-down */}
        <button
          onClick={handleDrillDown}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Brain className="h-4 w-4" />
          {expanded ? 'Less' : 'Go deeper'}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Drill-down expansion */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 rounded-b-2xl p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading deep dive...</span>
            </div>
          ) : drillDown ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">The Full Story</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {drillDown.fullStory}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <h4 className="text-xs font-bold text-green-800 mb-1">The Simple Version</h4>
                <p className="text-sm text-green-900">{drillDown.plainLanguageExplainer}</p>
              </div>

              {drillDown.keyStats?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Key Numbers</h4>
                  {drillDown.keyStats.map((s, i) => (
                    <div key={i} className="mb-1.5">
                      <p className="text-sm font-medium text-gray-800">{s.stat}</p>
                      <p className="text-xs text-gray-500 italic">= {s.plainLanguage}</p>
                    </div>
                  ))}
                </div>
              )}

              {drillDown.followUpQuestions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">If Someone Asks...</h4>
                  {drillDown.followUpQuestions.map((q, i) => (
                    <details key={i} className="group mb-1">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        &ldquo;{q}&rdquo;
                      </summary>
                      <p className="mt-1 ml-4 text-sm text-gray-600">
                        {drillDown.preparedAnswers[q]}
                      </p>
                    </details>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
