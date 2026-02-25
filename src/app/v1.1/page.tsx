'use client';

import { useState, useEffect } from 'react';
import { DailyDigestV2, LanguageMode, ReadingMode } from '@/types/v1.1';
import { DigestHeaderV2 } from '@/components/v1.1/DigestHeaderV2';
import { StoryBlurbCard } from '@/components/v1.1/StoryBlurbCard';
import { CulturalCard } from '@/components/v1.1/CulturalCard';
import { QuizModeV2 } from '@/components/v1.1/QuizModeV2';
import { SettingsBar } from '@/components/v1.1/SettingsBar';
import { Loader2, RefreshCw, Trophy, Sparkles } from 'lucide-react';

export default function HomeV2() {
  const [digest, setDigest] = useState<DailyDigestV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCultural, setShowCultural] = useState(false);

  // User settings
  const [languageMode, setLanguageMode] = useState<LanguageMode>('plain');
  const [spoilerFree, setSpoilerFree] = useState(true);
  const [readingMode, setReadingMode] = useState<ReadingMode>('quick');

  const fetchDigest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1.1/digest?lang=${languageMode}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDigest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load digest');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when language mode changes (generates new content)
  const handleLanguageModeChange = (mode: LanguageMode) => {
    setLanguageMode(mode);
    // Don't refetch — the existing blurbs are fine, drill-downs will use new mode
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">SportsCheat</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600 font-medium">
              v1.1
            </span>
          </div>
          <div className="flex items-center gap-2">
            {digest && digest.culturalEvents.length > 0 && (
              <button
                onClick={() => setShowCultural(!showCultural)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  showCultural
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                The Scene
              </button>
            )}
            <button
              onClick={() => setShowQuiz(!showQuiz)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                showQuiz
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Prep
            </button>
            <button
              onClick={fetchDigest}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Settings Bar */}
        <SettingsBar
          readingMode={readingMode}
          languageMode={languageMode}
          spoilerFree={spoilerFree}
          onReadingModeChange={setReadingMode}
          onLanguageModeChange={handleLanguageModeChange}
          onSpoilerFreeChange={setSpoilerFree}
        />

        {/* Loading state */}
        {loading && !digest && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            <p className="mt-4 text-sm text-gray-500">
              Building your cheat sheet...
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Finding the stories behind the scores
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !digest && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-800">Something went wrong</p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
            <button
              onClick={fetchDigest}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Digest content */}
        {digest && (
          <>
            <DigestHeaderV2 digest={digest} readingMode={readingMode} />

            {/* Quiz Mode */}
            {showQuiz && (
              <div className="mb-6">
                <QuizModeV2 blurbs={digest.blurbs} languageMode={languageMode} />
              </div>
            )}

            {/* Cultural Events — "The Scene" */}
            {showCultural && digest.culturalEvents.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  The Scene
                </h2>
                <div className="space-y-3">
                  {digest.culturalEvents.map((event) => (
                    <CulturalCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Story Blurb Cards */}
            <div className="space-y-4">
              {digest.blurbs
                .sort((a, b) => b.partyTalkRank - a.partyTalkRank)
                .map((blurb, index) => (
                  <StoryBlurbCard
                    key={blurb.id}
                    blurb={blurb}
                    index={index}
                    spoilerFree={spoilerFree}
                    languageMode={languageMode}
                    readingMode={readingMode}
                  />
                ))}
            </div>

            {/* Footer */}
            <div className="mt-8 py-6 text-center">
              <p className="text-xs text-gray-400">
                Generated at {new Date(digest.generatedAt).toLocaleTimeString()}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Stories first. Scores second. Powered by ESPN + Claude AI.
              </p>
              <p className="mt-2 text-xs text-gray-300">
                You don&apos;t need to be a fan to belong in the conversation.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
