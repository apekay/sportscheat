import { Sport } from '@/types/v1.1';
import { fetchAllESPNData, SportEvent } from './espn-v1.1';
import { fetchAllNews } from './rss';
import type { Sport as V1Sport } from '@/types';

// All supported sports including women's leagues
const ALL_SPORTS: Sport[] = [
  'nfl', 'nba', 'mlb', 'nhl', 'ncaaf', 'ncaab',
  'wnba', 'nwsl', 'wta',
];

// Returns only sports that are currently in-season
export function getActiveSports(date: Date = new Date()): Sport[] {
  const month = date.getMonth() + 1; // 1-12

  const active: Sport[] = [];

  // NFL: Sept-Feb (regular + playoffs)
  if (month >= 9 || month <= 2) active.push('nfl');
  // NBA: Oct-June
  if (month >= 10 || month <= 6) active.push('nba');
  // MLB: March-Oct
  if (month >= 3 && month <= 10) active.push('mlb');
  // NHL: Oct-June
  if (month >= 10 || month <= 6) active.push('nhl');
  // NCAAF: Aug-Jan
  if (month >= 8 || month <= 1) active.push('ncaaf');
  // NCAAB: Nov-April
  if (month >= 11 || month <= 4) active.push('ncaab');
  // WNBA: May-Oct
  if (month >= 5 && month <= 10) active.push('wnba');
  // NWSL: March-Nov
  if (month >= 3 && month <= 11) active.push('nwsl');
  // WTA: Year-round (Grand Slams: Jan, May-Jun, Jun-Jul, Aug-Sep)
  active.push('wta');

  return active.length > 0 ? active : ALL_SPORTS;
}

export interface RawSportsDataV2 {
  events: SportEvent[];
  injuries: Array<{
    sport: string;
    playerName: string;
    team: string;
    status: string;
    description: string;
    timestamp: string;
  }>;
  trades: Array<{
    sport: string;
    headline: string;
    description: string;
    teams: string[];
    timestamp: string;
  }>;
  news: Array<{ sport: Sport; headline: string; description: string }>;
  fetchedAt: string;
}

export async function aggregateSportsData(
  sports?: Sport[],
  date?: string
): Promise<RawSportsDataV2> {
  const activeSports = sports || getActiveSports();

  // RSS feeds only work for v1 sports (Big 4 + college)
  const v1Sports = activeSports.filter((s): s is V1Sport =>
    ['nfl', 'nba', 'mlb', 'nhl', 'ncaaf', 'ncaab'].includes(s)
  );

  const [espnResults, newsResults] = await Promise.all([
    fetchAllESPNData(activeSports, date),
    fetchAllNews(v1Sports),
  ]);

  const events = espnResults.flatMap((r) => r.events);
  const allNews = espnResults.flatMap((r) =>
    r.news.map((n) => ({ ...n, sport: r.sport }))
  );

  return {
    events,
    injuries: newsResults.injuries,
    trades: newsResults.trades,
    news: allNews,
    fetchedAt: new Date().toISOString(),
  };
}
