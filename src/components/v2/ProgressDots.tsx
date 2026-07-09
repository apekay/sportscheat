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
              ? 'w-6 bg-editorial'
              : known.has(i)
              ? 'w-2 bg-green-400'
              : 'w-2 bg-warm-200 hover:bg-warm-300'
          )}
        />
      ))}
    </div>
  );
}
