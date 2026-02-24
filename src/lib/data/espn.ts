import { Sport, SportEvent } from '@/types';

// ESPN hidden API endpoints — no key required
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const SPORT_PATHS: Record<Sport, string> = {
  nfl: 'football/nfl',
  nba: 'basketball/nba',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
  ncaaf: 'football/college-football',
  ncaab: 'basketball/mens-college-basketball',
};

interface ESPNCompetitor {
  homeAway: 'home' | 'away';
  team: { displayName: string; abbreviation: string };
  score: string;
  winner?: boolean;
}

interface ESPNEvent {
  id: string;
  name: string;
  date: string;
  status: {
    type: { name: string; state: string; completed: boolean };
  };
  competitions: Array<{
    competitors: ESPNCompetitor[];
    headlines?: Array<{ shortLinkText: string }>;
    notes?: Array<{ headline: string }>;
  }>;
}

interface ESPNScoreboard {
  events: ESPNEvent[];
}

export async function fetchESPNScoreboard(sport: Sport, date?: string): Promise<SportEvent[]> {
  const path = SPORT_PATHS[sport];
  const params = date ? `?dates=${date.replace(/-/g, '')}` : '';
  const url = `${ESPN_BASE}/${path}/scoreboard${params}`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);

    const data: ESPNScoreboard = await res.json();
    return data.events.map((event) => parseESPNEvent(event, sport));
  } catch (error) {
    console.error(`Failed to fetch ESPN ${sport} scoreboard:`, error);
    return [];
  }
}

function parseESPNEvent(event: ESPNEvent, sport: Sport): SportEvent {
  const comp = event.competitions[0];
  const home = comp.competitors.find((c) => c.homeAway === 'home')!;
  const away = comp.competitors.find((c) => c.homeAway === 'away')!;

  const statusState = event.status.type.state;
  let status: SportEvent['status'] = 'scheduled';
  if (statusState === 'in') status = 'in_progress';
  if (statusState === 'post') status = 'final';

  const homeScore = parseInt(home.score || '0', 10);
  const awayScore = parseInt(away.score || '0', 10);

  // Detect upsets: higher-seed / favored team losing (simplified)
  const headline = comp.headlines?.[0]?.shortLinkText;
  const notable = comp.notes?.[0]?.headline;

  return {
    id: event.id,
    sport,
    homeTeam: home.team.displayName,
    awayTeam: away.team.displayName,
    homeScore,
    awayScore,
    status,
    startTime: event.date,
    headline,
    notable,
  };
}

export async function fetchESPNNews(sport: Sport): Promise<Array<{ headline: string; description: string }>> {
  const path = SPORT_PATHS[sport];
  const url = `${ESPN_BASE}/${path}/news`;

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`ESPN News API error: ${res.status}`);

    const data = await res.json();
    return (data.articles || []).slice(0, 5).map((a: { headline: string; description: string }) => ({
      headline: a.headline,
      description: a.description,
    }));
  } catch (error) {
    console.error(`Failed to fetch ESPN ${sport} news:`, error);
    return [];
  }
}

// Fetch all sports in parallel
export async function fetchAllESPNData(sports: Sport[], date?: string) {
  const results = await Promise.all(
    sports.map(async (sport) => {
      const [events, news] = await Promise.all([
        fetchESPNScoreboard(sport, date),
        fetchESPNNews(sport),
      ]);
      return { sport, events, news };
    })
  );

  return results;
}
