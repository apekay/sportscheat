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
import { recordUsage } from './cost';

function getClient(): Anthropic {
  const apiKey = process.env.SPORTING_CHANCE_ANTHROPIC_KEY || process.env.SPORTSCHEAT_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Set SPORTING_CHANCE_ANTHROPIC_KEY in .env.local');
  }
  return new Anthropic({ apiKey });
}

const MODEL = 'claude-sonnet-5';
const MAX_RETRIES = 3;

async function createMessage(
  anthropic: Anthropic,
  prompt: string,
  maxTokens: number
): Promise<Anthropic.Message> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  recordUsage(message);
  return message;
}

function getResponseText(message: Anthropic.Message): string {
  if (message.stop_reason === 'refusal') {
    throw new Error('Model declined the request (stop_reason: refusal)');
  }
  const block = message.content.find((b) => b.type === 'text');
  return block?.text ?? '';
}

async function callWithRetry(
  fn: () => Promise<Anthropic.Message>,
  retries = MAX_RETRIES
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isRetryable =
        err instanceof Error &&
        (err.message.includes('529') ||
         err.message.includes('overloaded') ||
         err.message.includes('rate_limit') ||
         err.message.includes('500') ||
         err.message.includes('503'));

      if (!isRetryable || attempt === retries) {
        throw err;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt + 1) * 1000;
      console.log(`Anthropic API retry ${attempt + 1}/${retries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

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
  // Extra headroom: Sonnet 5's adaptive thinking (on by default) counts
  // toward max_tokens.
  const message = await callWithRetry(() => createMessage(anthropic, prompt, 16000));

  const parsed = JSON.parse(extractJSON(getResponseText(message)));

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = {};

  // The model occasionally returns the JSON with empty fields; regenerate
  // once rather than serving a hollow drill-down.
  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await callWithRetry(() => createMessage(anthropic, prompt, 8000));
    parsed = JSON.parse(extractJSON(getResponseText(message)));
    const complete =
      (parsed.fullStory || parsed.context) && parsed.plainLanguageExplainer;
    if (complete) break;
    console.warn(
      `[drilldown] incomplete generation for ${blurbId} (attempt ${attempt + 1}), ` +
      `missing: ${!parsed.fullStory && !parsed.context ? 'fullStory ' : ''}` +
      `${!parsed.plainLanguageExplainer ? 'plainLanguageExplainer' : ''}`
    );
  }

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
  const message = await callWithRetry(() => createMessage(anthropic, prompt, 8000));

  const parsed = JSON.parse(extractJSON(getResponseText(message)));

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
