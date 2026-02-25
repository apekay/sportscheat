'use client';

import { useState } from 'react';
import { StoryBlurb, DrillDownV2, ReadingMode } from '@/types/v1.1';
import { cn, sportLabel, sportColor, audienceFitLabel, audienceFitColor } from '@/lib/utils-v1.1';
import { SpoilerGuard } from './SpoilerGuard';
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Brain,
  Loader2,
  User,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface StoryBlurbCardProps {
  blurb: StoryBlurb;
  index: number;
  spoilerFree: boolean;
  languageMode: 'plain' | 'insider';
  readingMode: ReadingMode;
}

export function StoryBlurbCard({ blurb, index, spoilerFree, languageMode, readingMode }: StoryBlurbCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [drillDown, setDrillDown] = useState<DrillDownV2 | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(false);

  const isQuick = readingMode === 'quick';

  const handleExpand = async () => {
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
            languageMode,
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
    zinger: 'Zinger',
    analogy: 'Analogy',
    stat: 'Key Stat',
    story: 'Story Hook',
  };

  // Pick the right version based on reading mode
  const narrative = isQuick
    ? (blurb.storyNarrativeQuick || blurb.storyNarrative)
    : blurb.storyNarrative;

  const whyCare = isQuick
    ? (blurb.whyShouldICareQuick || blurb.whyShouldICare)
    : blurb.whyShouldICare;

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm transition-all',
        'hover:shadow-md',
        expanded && 'ring-2 ring-gray-300'
      )}
    >
      {/* Main content */}
      <div className="p-4">
        {/* Sport badge + rank */}
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
              sportColor(blurb.sport)
            )}
          >
            {sportLabel(blurb.sport)}
          </span>
          <span className="text-xs text-gray-400">#{index + 1} today</span>
          {blurb.partyTalkRank >= 8 && (
            <span className="text-xs text-amber-500 font-medium">Hot topic</span>
          )}
          {blurb.isCulturalEvent && (
            <span className="inline-flex items-center gap-0.5 text-xs text-violet-600 font-medium">
              <Sparkles className="h-3 w-3" />
              Cultural Moment
            </span>
          )}
        </div>

        {/* Headline */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {blurb.headline}
        </h3>

        {/* Story Narrative */}
        <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">
          {narrative}
        </p>

        {/* Spoiler-guarded result */}
        {blurb.isSpoiler && blurb.resultSummary && (
          <div className="mt-2">
            <SpoilerGuard spoilerFree={spoilerFree} label="Tap to reveal the result">
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                <p className="text-sm font-medium text-gray-900">
                  {blurb.resultSummary}
                </p>
              </div>
            </SpoilerGuard>
          </div>
        )}

        {/* "Why Should I Care?" */}
        <div className="mt-2 rounded-lg bg-indigo-50 border border-indigo-200 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 mb-1">
            <BookOpen className="h-3.5 w-3.5" />
            Why Should I Care?
          </div>
          <p className="text-sm text-indigo-900 leading-relaxed">
            {whyCare}
          </p>
        </div>

        {/* Athlete Spotlight — only in full mode */}
        {!isQuick && blurb.athleteSpotlight && (
          <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
              <User className="h-3.5 w-3.5" />
              Who is {blurb.athleteSpotlight.name}?
            </div>
            <p className="text-sm text-slate-800">
              {blurb.athleteSpotlight.bio}
            </p>
            <p className="mt-1 text-xs text-slate-600 italic">
              {blurb.athleteSpotlight.whyTheyMatter}
            </p>
          </div>
        )}

        {/* Memory Hook */}
        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <div className="text-xs font-medium text-amber-700 mb-1">
            Remember This{!isQuick && ` — ${hookStyleLabel[blurb.hookStyle] || 'Hook'}`}
          </div>
          <p className="text-sm font-medium text-amber-900">
            &ldquo;{blurb.memoryHook}&rdquo;
          </p>
        </div>

        {/* Cultural Angle — only in full mode */}
        {!isQuick && blurb.culturalAngle && (
          <div className="mt-2 rounded-lg bg-violet-50 border border-violet-200 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              The Scene
            </div>
            <p className="text-sm text-violet-900">{blurb.culturalAngle}</p>
          </div>
        )}

        {/* Conversation Starters — collapsed by default, always available */}
        <button
          onClick={() => setShowConversations(!showConversations)}
          className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {showConversations ? 'Hide' : 'How to bring this up'}
        </button>

        {showConversations && blurb.conversationStarters && (
          <div className="mt-2 space-y-1.5">
            {blurb.conversationStarters.map((starter, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2">
                <MessageCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 italic">{starter}</p>
              </div>
            ))}
          </div>
        )}

        {/* Audience tags — only in full mode */}
        {!isQuick && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {blurb.audienceFit?.map((fit) => (
              <span
                key={fit}
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  audienceFitColor(fit)
                )}
              >
                {audienceFitLabel(fit)}
              </span>
            ))}
            {blurb.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={handleExpand}
          className={cn(
            'mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors',
            'bg-gray-50 text-gray-700 hover:bg-gray-100'
          )}
        >
          <Brain className="h-4 w-4" />
          {expanded ? 'Less' : 'Go deeper'}
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
                Building your deep dive...
              </span>
            </div>
          ) : drillDown ? (
            <div className="space-y-4">
              {/* Full Story */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  The Full Story
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {drillDown.fullStory}
                </p>
              </div>

              {/* Athlete Background */}
              {drillDown.athleteBackground && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <h4 className="text-xs font-semibold text-slate-700 mb-1">
                    About the Person
                  </h4>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {drillDown.athleteBackground}
                  </p>
                </div>
              )}

              {/* Plain Language Explainer */}
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <h4 className="text-xs font-semibold text-green-800 mb-1">
                  The Simple Version
                </h4>
                <p className="text-sm text-green-900 leading-relaxed">
                  {drillDown.plainLanguageExplainer}
                </p>
              </div>

              {/* Jargon Glossary */}
              {Object.keys(drillDown.jargonGlossary || {}).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Jargon Decoder
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(drillDown.jargonGlossary).map(([term, def]) => (
                      <div key={term} className="flex items-start gap-2 text-sm">
                        <span className="font-medium text-gray-900 whitespace-nowrap">{term}:</span>
                        <span className="text-gray-600">{def}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Stats with plain language */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Key Numbers
                </h4>
                <ul className="space-y-2">
                  {drillDown.keyStats.map((stat, i) => (
                    <li key={i} className="text-sm">
                      <div className="font-medium text-gray-800">{stat.stat}</div>
                      <div className="text-xs text-gray-500 italic mt-0.5">
                        Translation: {stat.plainLanguage}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Counterpoint */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <h4 className="text-xs font-semibold text-blue-800 mb-1">
                  The Other Side
                </h4>
                <p className="text-sm text-blue-900">{drillDown.counterpoint}</p>
              </div>

              {/* Mid-Game Explainers */}
              {drillDown.midGameExplainers?.length > 0 && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                  <h4 className="text-xs font-semibold text-orange-800 mb-2">
                    If You&apos;re Watching Live...
                  </h4>
                  <div className="space-y-1.5">
                    {drillDown.midGameExplainers.map((e, i) => (
                      <p key={i} className="text-sm text-orange-900">{e}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Q&A */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  If Someone Asks You...
                </h4>
                <div className="space-y-2">
                  {drillDown.followUpQuestions.map((q, i) => (
                    <details key={i} className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-800 hover:text-gray-900">
                        &ldquo;{q}&rdquo;
                      </summary>
                      <p className="mt-1 ml-4 text-sm text-gray-600">
                        {drillDown.preparedAnswers[q]}
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
