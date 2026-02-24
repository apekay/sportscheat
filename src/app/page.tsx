'use client';

import { useState, useEffect } from 'react';
import { DailyDigest } from '@/types';
import { DigestHeader } from '@/components/digest/DigestHeader';
import { BlurbCard } from '@/components/digest/BlurbCard';
import { QuizMode } from '@/components/digest/QuizMode';
import { Loader2, RefreshCw, Trophy } from 'lucide-react';

export default function Home() {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const fetchDigest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/digest');
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              SportsCheat
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              beta
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuiz(!showQuiz)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                showQuiz
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Quiz
            </button>
            <button
              onClick={fetchDigest}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Loading state */}
        {loading && !digest && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            <p className="mt-4 text-sm text-gray-500">
              Building your cheat sheet...
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Pulling scores, news, and generating your blurbs
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !digest && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-800">
              Something went wrong
            </p>
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
            <DigestHeader digest={digest} />

            {/* Quiz Mode */}
            {showQuiz && (
              <div className="mb-6">
                <QuizMode blurbs={digest.blurbs} />
              </div>
            )}

            {/* Blurb Cards */}
            <div className="space-y-4">
              {digest.blurbs
                .sort((a, b) => b.partyTalkRank - a.partyTalkRank)
                .map((blurb, index) => (
                  <BlurbCard key={blurb.id} blurb={blurb} index={index} />
                ))}
            </div>

            {/* Footer */}
            <div className="mt-8 py-6 text-center">
              <p className="text-xs text-gray-400">
                Generated at{' '}
                {new Date(digest.generatedAt).toLocaleTimeString()}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Powered by ESPN data + Claude AI
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
