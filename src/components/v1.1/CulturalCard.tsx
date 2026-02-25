'use client';

import { CulturalEvent } from '@/types/v1.1';
import { Sparkles } from 'lucide-react';

interface CulturalCardProps {
  event: CulturalEvent;
}

const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  halftime: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Halftime Show' },
  commercial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ad Moment' },
  celebrity: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Celebrity Sighting' },
  fashion: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Fashion' },
  music: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Music' },
  social: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Social Moment' },
  charity: { bg: 'bg-green-100', text: 'text-green-700', label: 'Charity' },
};

export function CulturalCard({ event }: CulturalCardProps) {
  const style = categoryStyles[event.category] || categoryStyles.social;

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-pink-50 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
          {style.label}
        </span>
        {event.relatedEvent && (
          <span className="text-xs text-gray-500">{event.relatedEvent}</span>
        )}
      </div>

      <h3 className="text-base font-semibold text-gray-900">{event.title}</h3>
      <p className="mt-1 text-sm text-gray-700 leading-relaxed">{event.description}</p>

      {event.talkingPoints.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-violet-700 mb-1.5">Talking Points</div>
          <div className="space-y-1">
            {event.talkingPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-violet-900">
                <span className="text-violet-400 mt-0.5">-</span>
                {point}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
