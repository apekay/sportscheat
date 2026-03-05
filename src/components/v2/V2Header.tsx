'use client';

import { RefreshCw, Eye, EyeOff } from 'lucide-react';

interface V2HeaderProps {
  loading: boolean;
  spoilerFree: boolean;
  onRefresh: () => void;
  onSpoilerToggle: () => void;
  lastUpdated?: string;
}

export function V2Header({
  loading,
  spoilerFree,
  onRefresh,
  onSpoilerToggle,
  lastUpdated,
}: V2HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <a href="/v2" className="text-xl font-bold text-gray-900">
            SportsCheat
          </a>
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white font-medium">
            v2
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden sm:block">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={onSpoilerToggle}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {spoilerFree ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {spoilerFree ? 'Spoiler-Free' : 'Scores On'}
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            title="Get fresh digest"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
