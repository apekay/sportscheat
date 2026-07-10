'use client';

import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { SkinPicker } from './SkinPicker';

interface V2HeaderProps {
  loading: boolean;
  spoilerFree: boolean;
  onRefresh: () => void;
  onSpoilerToggle: () => void;
}

export function V2Header({
  loading,
  spoilerFree,
  onRefresh,
  onSpoilerToggle,
}: V2HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-warm-200 bg-warm-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <a href="/v2" className="sc-display truncate text-lg sm:text-xl font-serif font-bold text-warm-900 whitespace-nowrap">
            Sporting Chance
          </a>
          <span className="bg-editorial px-2 py-0.5 text-xs text-on-accent font-bold">
            v2
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SkinPicker />

          <button
            onClick={onSpoilerToggle}
            className="inline-flex items-center gap-1 rounded-lg bg-warm-50 px-2.5 py-1.5 text-xs font-medium text-warm-700 hover:bg-warm-100 transition-colors"
          >
            {spoilerFree ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {spoilerFree ? 'Spoiler-Free' : 'Scores On'}
            </span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-warm-50 px-2.5 py-1.5 text-xs font-medium text-warm-700 hover:bg-warm-100 disabled:opacity-50 transition-colors"
            title="Get fresh digest"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
