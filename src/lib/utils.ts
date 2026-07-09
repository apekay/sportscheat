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
  };
  return labels[sport] || sport.toUpperCase();
}

export function sportColor(sport: string): string {
  const colors: Record<string, string> = {
    nfl: 'bg-green-600',
    nba: 'bg-orange-500',
    mlb: 'bg-red-600',
    nhl: 'bg-blue-600',
    ncaaf: 'bg-amber-700',
    ncaab: 'bg-purple-600',
  };
  return colors[sport] || 'bg-gray-600';
}

export function sportEmoji(sport: string): string {
  const emojis: Record<string, string> = {
    nfl: '🏈',
    nba: '🏀',
    mlb: '⚾',
    nhl: '🏒',
    ncaaf: '🏈',
    ncaab: '🏀',
  };
  return emojis[sport] || '🏅';
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Free users get fresh content on Tuesdays (2) and Fridays (5).
 * Returns true if today is a free-content day.
 */
export function isFreeContentDay(): boolean {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  return day === 2 || day === 5;
}

/**
 * Returns the name of the next free-content day.
 */
export function nextFreeDay(): string {
  const day = new Date().getDay();
  // Days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  if (day < 2) return 'Tuesday';
  if (day < 5) return 'Friday';
  return 'Tuesday'; // Sat or Sun → next Tuesday
}
