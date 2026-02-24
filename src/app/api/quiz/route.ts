import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/ai/claude';

// POST /api/quiz — generate quiz questions from today's blurbs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blurbs } = body;

    if (!blurbs || !Array.isArray(blurbs) || blurbs.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: blurbs (array)' },
        { status: 400 }
      );
    }

    const questions = await generateQuiz(blurbs);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: String(error) },
      { status: 500 }
    );
  }
}
