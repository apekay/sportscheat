'use client';

import { useState } from 'react';
import { StoryBlurb, QuizQuestionV2 } from '@/types/v1.1';
import { cn } from '@/lib/utils-v1.1';
import { Brain, Check, X, Loader2, RotateCcw, Lightbulb, MapPin } from 'lucide-react';

interface QuizModeV2Props {
  blurbs: StoryBlurb[];
  languageMode: 'plain' | 'insider';
}

export function QuizModeV2({ blurbs, languageMode }: QuizModeV2Props) {
  const [questions, setQuestions] = useState<QuizQuestionV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    setStarted(true);
    try {
      const res = await fetch('/api/v1.1/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blurbs: blurbs.map((b) => ({
            headline: b.headline,
            storyNarrative: b.storyNarrative,
            sport: b.sport,
          })),
        }),
      });
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (knew: boolean) => {
    if (knew) setScore((s) => s + 1);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
      setShowHint(false);
    } else {
      setCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setCompleted(false);
    setShowAnswer(false);
    setShowHint(false);
    setStarted(false);
    setQuestions([]);
  };

  // Not started
  if (!started) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
        <Brain className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-3 text-lg font-semibold text-gray-900">
          Ready to Mingle?
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Test if you can hold your own in a sports conversation.
          Not trivia — real social situations.
        </p>
        <button
          onClick={startQuiz}
          className="mt-4 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Start Social Prep
        </button>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-3 text-sm text-gray-500">Setting up social scenarios...</p>
      </div>
    );
  }

  // Completed
  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-4xl font-bold text-gray-900">
          {score}/{questions.length}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {percentage >= 80
            ? 'You\'re ready. Go be the most interesting person at the party.'
            : percentage >= 50
              ? 'Solid foundation. Review the stories you missed and you\'re golden.'
              : 'Give the cheat sheet another read — you\'ll feel way more confident.'}
        </p>
        <button
          onClick={resetQuiz}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Active question
  const question = questions[currentIndex];
  if (!question) return null;

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-gray-900 transition-all"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', difficultyColors[question.difficulty] || difficultyColors.medium)}>
            {question.difficulty}
          </span>
        </div>

        {/* Situation */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin className="h-3.5 w-3.5" />
          {question.situation}
        </div>

        {/* Question */}
        <p className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.question}
        </p>

        {/* Hint */}
        {!showAnswer && (
          <button
            onClick={() => setShowHint(true)}
            className={cn(
              'mt-3 inline-flex items-center gap-1.5 text-sm transition-colors',
              showHint ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Lightbulb className="h-4 w-4" />
            {showHint ? question.hint : 'Need a hint?'}
          </button>
        )}

        {/* Answer */}
        {showAnswer ? (
          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-medium text-green-900">
                {languageMode === 'plain' ? question.plainAnswer : question.answer}
              </p>
            </div>
            {languageMode === 'plain' && question.answer !== question.plainAnswer && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">
                  Insider version
                </summary>
                <p className="mt-1 ml-2">{question.answer}</p>
              </details>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-4 w-full rounded-lg bg-gray-100 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Show Answer
          </button>
        )}

        {/* Self-assessment */}
        {showAnswer && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              I could say that
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
              Not yet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
