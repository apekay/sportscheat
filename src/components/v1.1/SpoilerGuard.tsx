'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SpoilerGuardProps {
  children: React.ReactNode;
  spoilerFree: boolean;
  label?: string;
}

export function SpoilerGuard({ children, spoilerFree, label = 'Tap to reveal score' }: SpoilerGuardProps) {
  const [revealed, setRevealed] = useState(false);

  if (!spoilerFree || revealed) {
    return <>{children}</>;
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      className="group relative w-full rounded-lg bg-gray-100 border border-gray-200 px-4 py-3 text-left transition-all hover:bg-gray-50"
    >
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <EyeOff className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
        <Eye className="h-3 w-3" />
        Spoiler-free mode is on
      </div>
    </button>
  );
}
