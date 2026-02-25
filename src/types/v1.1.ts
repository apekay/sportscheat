// ============================================
// SportsCheat v1.1 — "The Curious Outsider"
// Extended types for story-first, non-fan-friendly experience
// ============================================

// Expanded sport list: adds women's sports as first-class citizens
export type Sport =
  | 'nfl' | 'nba' | 'mlb' | 'nhl' | 'ncaaf' | 'ncaab'
  | 'wnba' | 'nwsl' | 'wta';

export type MemoryHookStyle = 'zinger' | 'analogy' | 'stat' | 'story';

// User-facing language depth
export type LanguageMode = 'plain' | 'insider';

// Reading depth — how much time they have
export type ReadingMode = 'quick' | 'full'; // 3 min vs 8 min

// ---- Story-first Blurb (v1.1) ----

export interface StoryBlurb {
  id: string;
  sport: Sport;
  headline: string;

  // The human story — always leads (Olympics-style framing)
  storyNarrative: string; // 3-4 sentences: who is this person, what's at stake, what happened
  storyNarrativeQuick: string; // 1-2 sentences: punchy version for 3-min mode
  athleteSpotlight?: AthleteSpotlight; // featured athlete in this story

  // "Why Should I Care?" — one paragraph of cultural/historical context
  whyShouldICare: string;
  whyShouldICareQuick: string; // 1 sentence: snappy version

  // The actual sports result (hidden by default in spoiler-free mode)
  resultSummary: string; // score-containing summary
  isSpoiler: boolean; // true if this contains outcome info

  // Memory hook
  memoryHook: string;
  hookStyle: MemoryHookStyle;

  // Social tools
  partyTalkRank: number; // 1-10
  conversationStarters: string[]; // multiple starters for different audiences
  socialContext?: string; // "Great for: office talk, date night, watching party"

  // Cultural/social layer
  culturalAngle?: string; // celebrity, fashion, music, brand tie-in
  isCulturalEvent: boolean; // halftime show, commercial, celebrity sighting

  // Categorization
  tags: string[];
  audienceFit: ('casual' | 'social' | 'office' | 'date' | 'superfan')[]; // who this story works for
}

// ---- Athlete as Cultural Figure ----

export interface AthleteSpotlight {
  name: string;
  sport: Sport;
  team?: string;
  bio: string; // 1-2 sentences: who they are beyond the sport
  whyTheyMatter: string; // cultural significance
  recentStory: string; // latest narrative arc
  socialHandle?: string; // @handle for context
}

// ---- Cultural Event (non-sports layer) ----

export interface CulturalEvent {
  id: string;
  title: string;
  description: string;
  category: 'halftime' | 'commercial' | 'celebrity' | 'fashion' | 'music' | 'social' | 'charity';
  relatedSport?: Sport;
  relatedEvent?: string; // "Super Bowl LVIII", "NBA All-Star Weekend"
  talkingPoints: string[];
}

// ---- "Why Should I Care?" Context Card ----

export interface WhyShouldICare {
  matchup: string; // "Lakers vs Celtics"
  sport: Sport;
  context: string; // One paragraph: why this matters
  historicalNote?: string; // Brief history if relevant
  culturalNote?: string; // Why non-fans might recognize this
  stakesLevel: 'low' | 'medium' | 'high' | 'massive'; // how big a deal this is
}

// ---- Enhanced Drill-Down (v1.1) ----

export interface DrillDownV2 {
  blurbId: string;

  // Story-first deep dive
  fullStory: string; // 2-3 paragraphs, narrative-first
  athleteBackground?: string; // deeper athlete context

  // Plain language explainer
  plainLanguageExplainer: string; // no jargon version
  jargonGlossary: Record<string, string>; // term → plain definition

  // Key stats (with plain language translations)
  keyStats: Array<{
    stat: string;
    plainLanguage: string; // what this means for a non-fan
  }>;

  // Counterpoint
  counterpoint: string;

  // Social tools
  followUpQuestions: string[];
  preparedAnswers: Record<string, string>;
  midGameExplainers: string[]; // things to say if you're watching live
}

// ---- Daily Digest (v1.1) ----

export interface DailyDigestV2 {
  id: string;
  date: string;
  generatedAt: string;

  // Main content
  blurbs: StoryBlurb[];
  culturalEvents: CulturalEvent[];

  // Summaries
  sportsSummary: Partial<Record<Sport, string>>;
  headlineStory: string; // the one story everyone should know today

  // Settings applied
  languageMode: LanguageMode;
}

// ---- Quiz (v1.1) — social-situation focused ----

export interface QuizQuestionV2 {
  question: string; // framed as something someone might actually say
  answer: string;
  plainAnswer: string; // no-jargon version
  hint: string;
  blurbId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  situation: string; // "At a Super Bowl party", "Office Monday morning"
}

// ---- User Settings (v1.1) ----

export interface UserSettingsV2 {
  // Content preferences
  sports: Sport[];
  favoriteAthletes: string[];

  // Display settings
  languageMode: LanguageMode;
  spoilerFree: boolean; // hide scores by default

  // Digest settings
  digestTime: string;
  hookStylePreference: MemoryHookStyle | 'mixed';

  // Social settings
  showCulturalLayer: boolean;
  showSocialTools: boolean;
}
