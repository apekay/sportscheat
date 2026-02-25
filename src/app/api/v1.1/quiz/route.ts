import { NextResponse } from 'next/server';
import { generateQuizV2 } from '@/lib/ai/claude-v1.1';

// POST /api/v1.1/quiz — social-situation quiz
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blurbs } = body;

    if (!blurbs || !Array.isArray(blurbs) || blurbs.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: blurbs (array)' },
        { status: 400 }
      );
    }

    const questions = await generateQuizV2(blurbs);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('v1.1 Quiz generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: String(error) },
      { status: 500 }
    );
  }
}
