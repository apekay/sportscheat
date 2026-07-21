'use client';

import { Topic } from '@/lib/topics';

interface TopicTabsProps {
  topics: Topic[];
  selected: string; // topic id, or 'all'
  onSelect: (id: string) => void;
}

/** Horizontal topic filter chips shown above the story feed. */
export function TopicTabs({ topics, selected, onSelect }: TopicTabsProps) {
  if (topics.length < 2) return null; // nothing to filter

  const chip = (id: string, label: string) => {
    const active = selected === id;
    return (
      <button
        key={id}
        onClick={() => onSelect(id)}
        className={
          active
            ? 'shrink-0 rounded-full bg-warm-900 px-3.5 py-1.5 text-xs font-semibold text-on-ink'
            : 'shrink-0 rounded-full border border-warm-200 bg-warm-50 px-3.5 py-1.5 text-xs font-medium text-warm-700 hover:bg-warm-100 transition-colors'
        }
      >
        {label}
      </button>
    );
  };

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chip('all', 'All')}
      {topics.map((t) => chip(t.id, `${t.emoji} ${t.label}`))}
    </div>
  );
}
