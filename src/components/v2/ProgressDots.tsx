'use client';

import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  total: number;
  current: number;
  known: Set<number>;
  onSelect: (index: number) => void;
}

export function ProgressDots({ total, current, known, onSelect }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            'h-2 rounded-full transition-all',
            i === current
              ? 'w-6 bg-indigo-600'
              : known.has(i)
              ? 'w-2 bg-green-400'
              : 'w-2 bg-gray-300 hover:bg-gray-400'
          )}
        />
      ))}
    </div>
  );
}
