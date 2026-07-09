import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sportLabel(sport: string): string {
  const labels: Record<string, string> = {
    nfl: 'NFL',
    nba: 'NBA',
    mlb: 'MLB',
    nhl: 'NHL',
    ncaaf: 'College Football',
    ncaab: 'College Basketball',
    wnba: 'WNBA',
    nwsl: 'NWSL',
    wta: 'WTA Tennis',
  };
  return labels[sport] || sport.toUpperCase();
}

export function sportColor(sport: string): string {
  const colors: Record<string, string> = {
    nfl: 'bg-green-700',
    nba: 'bg-orange-700',
    mlb: 'bg-red-700',
    nhl: 'bg-blue-700',
    ncaaf: 'bg-amber-800',
    ncaab: 'bg-purple-700',
    wnba: 'bg-pink-700',
    nwsl: 'bg-teal-700',
    wta: 'bg-rose-700',
  };
  return colors[sport] || 'bg-warm-500';
}

export function sportEmoji(sport: string): string {
  const emojis: Record<string, string> = {
    nfl: '\u{1F3C8}',
    nba: '\u{1F3C0}',
    mlb: '\u26BE',
    nhl: '\u{1F3D2}',
    ncaaf: '\u{1F3C8}',
    ncaab: '\u{1F3C0}',
    wnba: '\u{1F3C0}',
    nwsl: '\u26BD',
    wta: '\u{1F3BE}',
  };
  return emojis[sport] || '\u{1F3C5}';
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function audienceFitLabel(fit: string): string {
  const labels: Record<string, string> = {
    casual: 'Casual Chat',
    social: 'Social Event',
    office: 'Office Talk',
    date: 'Date Night',
    superfan: 'Sports Fan',
  };
  return labels[fit] || fit;
}

export function audienceFitColor(fit: string): string {
  const colors: Record<string, string> = {
    casual: 'bg-sky-100 text-sky-700',
    social: 'bg-violet-100 text-violet-700',
    office: 'bg-slate-100 text-slate-700',
    date: 'bg-rose-100 text-rose-700',
    superfan: 'bg-amber-100 text-amber-700',
  };
  return colors[fit] || 'bg-gray-100 text-gray-700';
}

export function stakesColor(level: string): string {
  const colors: Record<string, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    massive: 'text-red-600',
  };
  return colors[level] || 'text-gray-500';
}
