import { Sport, RawSportsData } from '@/types';
import { fetchAllESPNData } from './espn';
import { fetchAllNews } from './rss';

const DEFAULT_SPORTS: Sport[] = ['nfl', 'nba', 'mlb', 'nhl', 'ncaaf', 'ncaab'];

// Returns only sports that are currently in-season (rough heuristic)
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

  return active.length > 0 ? active : DEFAULT_SPORTS;
}

export async function aggregateSportsData(
  sports?: Sport[],
  date?: string
): Promise<RawSportsData> {
  const activeSports = sports || getActiveSports();

  const [espnResults, newsResults] = await Promise.all([
    fetchAllESPNData(activeSports, date),
    fetchAllNews(activeSports),
  ]);

  const events = espnResults.flatMap((r) => r.events);

  return {
    events,
    injuries: newsResults.injuries,
    trades: newsResults.trades,
    fetchedAt: new Date().toISOString(),
  };
}
