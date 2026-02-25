'use client';

import { LanguageMode, ReadingMode } from '@/types/v1.1';
import { EyeOff, Eye, BookOpen, Zap, Clock, BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils-v1.1';

interface SettingsBarProps {
  readingMode: ReadingMode;
  languageMode: LanguageMode;
  spoilerFree: boolean;
  onReadingModeChange: (mode: ReadingMode) => void;
  onLanguageModeChange: (mode: LanguageMode) => void;
  onSpoilerFreeChange: (spoilerFree: boolean) => void;
}

export function SettingsBar({
  readingMode,
  languageMode,
  spoilerFree,
  onReadingModeChange,
  onLanguageModeChange,
  onSpoilerFreeChange,
}: SettingsBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 mb-4">
      {/* Reading Mode Toggle — most prominent */}
      <div className="inline-flex rounded-lg bg-gray-200 p-0.5">
        <button
          onClick={() => onReadingModeChange('quick')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            readingMode === 'quick'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          3 min
        </button>
        <button
          onClick={() => onReadingModeChange('full')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            readingMode === 'full'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <BookOpenCheck className="h-3.5 w-3.5" />
          8 min
        </button>
      </div>

      {/* Language Mode Toggle */}
      <button
        onClick={() =>
          onLanguageModeChange(languageMode === 'plain' ? 'insider' : 'plain')
        }
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
          languageMode === 'plain'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-200 text-gray-700'
        )}
      >
        {languageMode === 'plain' ? (
          <BookOpen className="h-3.5 w-3.5" />
        ) : (
          <Zap className="h-3.5 w-3.5" />
        )}
        {languageMode === 'plain' ? 'Plain Language' : 'Insider Mode'}
      </button>

      {/* Spoiler Toggle */}
      <button
        onClick={() => onSpoilerFreeChange(!spoilerFree)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
          spoilerFree
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-gray-200 text-gray-700'
        )}
      >
        {spoilerFree ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        {spoilerFree ? 'Spoiler-Free' : 'Scores Visible'}
      </button>
    </div>
  );
}
