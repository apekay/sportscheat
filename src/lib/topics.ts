// Sport-code → reader-facing topic mapping for the filter tabs.
// ESPN sport codes arrive lowercase (nba, wnba, mlb, nwsl, wta, ...).

export interface Topic {
  id: string;
  label: string;
  emoji: string;
}

const TOPICS: Record<string, Topic> = {
  basketball: { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  football: { id: 'football', label: 'Football', emoji: '🏈' },
  baseball: { id: 'baseball', label: 'Baseball', emoji: '⚾' },
  soccer: { id: 'soccer', label: 'Soccer', emoji: '⚽' },
  tennis: { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  hockey: { id: 'hockey', label: 'Hockey', emoji: '🏒' },
  other: { id: 'other', label: 'More', emoji: '🏅' },
};

const SPORT_TO_TOPIC: Record<string, string> = {
  nba: 'basketball',
  wnba: 'basketball',
  ncaab: 'basketball',
  nfl: 'football',
  ncaaf: 'football',
  mlb: 'baseball',
  nhl: 'hockey',
  nwsl: 'soccer',
  mls: 'soccer',
  epl: 'soccer',
  soccer: 'soccer',
  wta: 'tennis',
  atp: 'tennis',
  tennis: 'tennis',
};

export function topicForSport(sport: string): Topic {
  const id = SPORT_TO_TOPIC[sport?.toLowerCase()] || 'other';
  return TOPICS[id];
}

/** Unique topics present in a set of blurbs, in first-appearance order. */
export function topicsInBlurbs(blurbs: Array<{ sport: string }>): Topic[] {
  const seen = new Map<string, Topic>();
  for (const b of blurbs) {
    const t = topicForSport(b.sport);
    if (!seen.has(t.id)) seen.set(t.id, t);
  }
  return [...seen.values()];
}
