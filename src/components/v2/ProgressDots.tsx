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
            'h-1.5 transition-all',
            i === current
              ? 'w-7 bg-editorial'
              : known.has(i)
              ? 'w-3 bg-green-500'
              : 'w-3 bg-warm-200 hover:bg-warm-300'
          )}
        />
      ))}
    </div>
  );
}
