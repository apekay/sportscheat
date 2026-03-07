// ============================================
// Core domain types for Sporting Chance
// ============================================

export type Sport = 'nfl' | 'nba' | 'mlb' | 'nhl' | 'ncaaf' | 'ncaab';

export type MemoryHookStyle = 'zinger' | 'analogy' | 'stat';

export interface SportEvent {
  id: string;
  sport: Sport;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'in_progress' | 'final';
  startTime: string;
  headline?: string;
  isUpset?: boolean;
  isPlayoff?: boolean;
  notable?: string; // e.g. "record-breaking", "rivalry game"
}

export interface InjuryNews {
  sport: Sport;
  playerName: string;
  team: string;
  status: string; // "out", "questionable", "day-to-day"
  description: string;
  timestamp: string;
}

export interface TradeNews {
  sport: Sport;
  headline: string;
  description: string;
  teams: string[];
  timestamp: string;
}

export interface RawSportsData {
  events: SportEvent[];
  injuries: InjuryNews[];
  trades: TradeNews[];
  fetchedAt: string;
}

export interface Blurb {
  id: string;
  sport: Sport;
  headline: string;
  summary: string; // 2-3 sentences
  memoryHook: string;
  hookStyle: MemoryHookStyle;
  partyTalkRank: number; // 1-10, how good is this for conversation
  conversationStarter: string; // "Did you catch the..."
  tags: string[]; // e.g. ["upset", "record", "rivalry"]
}

export interface DrillDown {
  blurbId: string;
  context: string; // 2-3 paragraph deeper explanation
  keyStats: string[];
  counterpoint: string; // "On the other hand..."
  followUpQuestions: string[]; // things someone might ask you
  preparedAnswers: Record<string, string>; // answers to those questions
}

export interface DailyDigest {
  id: string;
  date: string; // YYYY-MM-DD
  generatedAt: string;
  blurbs: Blurb[];
  sportsSummary: Record<Sport, string>; // one-line summary per sport
}

export interface QuizQuestion {
  question: string;
  answer: string;
  blurbId: string;
  hint: string;
}

export interface UserPreferences {
  sports: Sport[];
  favoriteTeams: Record<Sport, string[]>;
  digestTime: string; // "07:00"
  hookStylePreference: MemoryHookStyle | 'mixed';
}
