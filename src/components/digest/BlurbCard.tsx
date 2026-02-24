'use client';

import { useState } from 'react';
import { Blurb, DrillDown } from '@/types';
import { cn, sportLabel, sportColor } from '@/lib/utils';
import { ChevronDown, ChevronUp, MessageCircle, Brain, Loader2 } from 'lucide-react';

interface BlurbCardProps {
  blurb: Blurb;
  index: number;
}

export function BlurbCard({ blurb, index }: BlurbCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    if (!drillDown) {
      setLoading(true);
      try {
        const res = await fetch('/api/drilldown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blurbId: blurb.id,
            summary: blurb.summary,
            sport: blurb.sport,
          }),
        });
        const data = await res.json();
        setDrillDown(data);
      } catch (err) {
        console.error('Failed to load drill-down:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const hookStyleLabel: Record<string, string> = {
    zinger: '🎯 Zinger',
    analogy: '🔄 Analogy',
    stat: '📊 Key Stat',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm transition-all',
        'hover:shadow-md',
        expanded && 'ring-2 ring-gray-300'
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Sport badge + rank */}
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                  sportColor(blurb.sport)
                )}
              >
                {sportLabel(blurb.sport)}
              </span>
              <span className="text-xs text-gray-400">
                #{index + 1} today
              </span>
              {blurb.partyTalkRank >= 8 && (
                <span className="text-xs text-amber-500 font-medium">
                  🔥 Hot topic
                </span>
              )}
            </div>

            {/* Headline */}
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {blurb.headline}
            </h3>

            {/* Summary */}
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
              {blurb.summary}
            </p>

            {/* Memory Hook */}
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <div className="text-xs font-medium text-amber-700 mb-1">
                {hookStyleLabel[blurb.hookStyle] || '💡 Remember'}
              </div>
              <p className="text-sm font-medium text-amber-900">
                &ldquo;{blurb.memoryHook}&rdquo;
              </p>
            </div>

            {/* Conversation Starter */}
            <div className="mt-2 flex items-start gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 italic">
                {blurb.conversationStarter}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-2 flex flex-wrap gap-1">
              {blurb.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={handleExpand}
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors',
            'bg-gray-50 text-gray-700 hover:bg-gray-100'
          )}
        >
          <Brain className="h-4 w-4" />
          {expanded ? 'Less' : 'Tell me more'}
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Drill-Down Section */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">
                Getting the full story...
              </span>
            </div>
          ) : drillDown ? (
            <div className="space-y-4">
              {/* Context */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  The Full Story
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {drillDown.context}
                </p>
              </div>

              {/* Key Stats */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  📊 Key Stats
                </h4>
                <ul className="space-y-1">
                  {drillDown.keyStats.map((stat, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <span className="text-gray-400">•</span>
                      {stat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Counterpoint */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <h4 className="text-xs font-semibold text-blue-800 mb-1">
                  🤔 The Other Side
                </h4>
                <p className="text-sm text-blue-900">{drillDown.counterpoint}</p>
              </div>

              {/* Follow-up Q&A */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  💬 If someone asks...
                </h4>
                <div className="space-y-2">
                  {drillDown.followUpQuestions.map((q, i) => (
                    <details key={i} className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-800 hover:text-gray-900">
                        &ldquo;{q}&rdquo;
                      </summary>
                      <p className="mt-1 ml-4 text-sm text-gray-600">
                        → {drillDown.preparedAnswers[q]}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
