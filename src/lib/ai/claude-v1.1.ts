import Anthropic from '@anthropic-ai/sdk';
import {
  DailyDigestV2,
  DrillDownV2,
  QuizQuestionV2,
  LanguageMode,
} from '@/types/v1.1';
import {
  buildDigestPromptV2,
  buildDrillDownPromptV2,
  buildQuizPromptV2,
} from './prompts-v1.1';
import { RawSportsDataV2 } from '@/lib/data/aggregate-v1.1';
import { generateId, todayString } from '@/lib/utils';

function getClient(): Anthropic {
  const apiKey = process.env.SPORTSCHEAT_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Set SPORTSCHEAT_ANTHROPIC_KEY in .env.local');
  }
  return new Anthropic({ apiKey });
}

const MODEL = 'claude-sonnet-4-20250514';

function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  return text;
}

export async function generateDailyDigestV2(
  data: RawSportsDataV2,
  languageMode: LanguageMode = 'plain'
): Promise<DailyDigestV2> {
  const prompt = buildDigestPromptV2(data, languageMode);

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 7000, // larger for v1.1's richer content + quick versions
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(extractJSON(responseText));

  return {
    id: generateId(),
    date: todayString(),
    generatedAt: new Date().toISOString(),
    blurbs: (parsed.blurbs || []).map((b: Record<string, unknown>) => ({
      ...b,
      id: b.id || generateId(),
      storyNarrativeQuick: b.storyNarrativeQuick || '',
      whyShouldICareQuick: b.whyShouldICareQuick || '',
      isSpoiler: b.isSpoiler ?? true,
      isCulturalEvent: b.isCulturalEvent ?? false,
      conversationStarters: b.conversationStarters || [],
      audienceFit: b.audienceFit || ['casual'],
      tags: b.tags || [],
    })),
    culturalEvents: (parsed.culturalEvents || []).map((e: Record<string, unknown>) => ({
      ...e,
      id: e.id || generateId(),
      talkingPoints: e.talkingPoints || [],
    })),
    sportsSummary: parsed.sportsSummary || {},
    headlineStory: parsed.headlineStory || '',
    languageMode,
  };
}

export async function generateDrillDownV2(
  blurbSummary: string,
  blurbSport: string,
  blurbId: string,
  languageMode: LanguageMode = 'plain'
): Promise<DrillDownV2> {
  const prompt = buildDrillDownPromptV2(blurbSummary, blurbSport, languageMode);

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(extractJSON(responseText));

  return {
    blurbId,
    fullStory: parsed.fullStory || parsed.context || '',
    athleteBackground: parsed.athleteBackground,
    plainLanguageExplainer: parsed.plainLanguageExplainer || '',
    jargonGlossary: parsed.jargonGlossary || {},
    keyStats: (parsed.keyStats || []).map((s: Record<string, string> | string) =>
      typeof s === 'string' ? { stat: s, plainLanguage: s } : s
    ),
    counterpoint: parsed.counterpoint || '',
    followUpQuestions: parsed.followUpQuestions || [],
    preparedAnswers: parsed.preparedAnswers || {},
    midGameExplainers: parsed.midGameExplainers || [],
  };
}

export async function generateQuizV2(
  blurbs: Array<{ headline: string; storyNarrative: string; sport: string }>
): Promise<QuizQuestionV2[]> {
  const prompt = buildQuizPromptV2(blurbs);

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(extractJSON(responseText));

  return (parsed.questions || []).map(
    (q: Record<string, unknown>, i: number) => ({
      question: q.question,
      answer: q.answer,
      plainAnswer: q.plainAnswer || q.answer,
      hint: q.hint,
      blurbId: blurbs[(q.blurbIndex as number) ?? i]?.headline || '',
      difficulty: q.difficulty || 'medium',
      situation: q.situation || 'At a social gathering',
    })
  );
}
