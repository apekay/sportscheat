import Anthropic from '@anthropic-ai/sdk';
import { RawSportsData, DailyDigest, DrillDown, QuizQuestion } from '@/types';
import { buildDigestPrompt, buildDrillDownPrompt, buildQuizPrompt } from './prompts';
import { generateId, todayString } from '@/lib/utils';

// Lazy-initialize the client so env vars are available at call time
// Uses SPORTING_CHANCE_ANTHROPIC_KEY to avoid conflict with system-level ANTHROPIC_API_KEY
function getClient(): Anthropic {
  const apiKey = process.env.SPORTING_CHANCE_ANTHROPIC_KEY || process.env.SPORTSCHEAT_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing API key. Set SPORTING_CHANCE_ANTHROPIC_KEY in .env.local'
    );
  }
  return new Anthropic({ apiKey });
}

const MODEL = 'claude-sonnet-4-20250514';

function extractJSON(text: string): string {
  // Try to find JSON in the response, handling markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // Try to find raw JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  return text;
}

export async function generateDailyDigest(data: RawSportsData): Promise<DailyDigest> {
  const prompt = buildDigestPrompt(data);

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(extractJSON(responseText));

  return {
    id: generateId(),
    date: todayString(),
    generatedAt: new Date().toISOString(),
    blurbs: parsed.blurbs.map((b: Record<string, unknown>) => ({
      ...b,
      id: b.id || generateId(),
    })),
    sportsSummary: parsed.sportsSummary || {},
  };
}

export async function generateDrillDown(
  blurbSummary: string,
  blurbSport: string,
  blurbId: string
): Promise<DrillDown> {
  const prompt = buildDrillDownPrompt(blurbSummary, blurbSport);

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(extractJSON(responseText));

  return {
    blurbId,
    context: parsed.context,
    keyStats: parsed.keyStats,
    counterpoint: parsed.counterpoint,
    followUpQuestions: parsed.followUpQuestions,
    preparedAnswers: parsed.preparedAnswers,
  };
}

export async function generateQuiz(
  blurbs: Array<{ headline: string; summary: string; sport: string }>
): Promise<QuizQuestion[]> {
  const prompt = buildQuizPrompt(blurbs);

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(extractJSON(responseText));

  return parsed.questions.map((q: Record<string, unknown>, i: number) => ({
    question: q.question,
    answer: q.answer,
    hint: q.hint,
    blurbId: blurbs[q.blurbIndex as number ?? i]?.headline || '',
  }));
}
