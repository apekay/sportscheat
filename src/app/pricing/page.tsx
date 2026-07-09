'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const { data: session } = useSession();
  const { isPro } = useSubscription();
  const router = useRouter();
  const [loading, setLoading] = useState<'monthly' | null>(null);

  const handleSubscribe = async (plan: 'monthly') => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading('monthly');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  };

  const features = {
    free: [
      'Updated twice a week',
      'Top 2 stories per update',
      'Why Should I Care context',
      'Spoiler-free mode',
    ],
    pro: [
      'Daily updates',
      'All stories every day',
      'Quotable one-liners',
      'Conversation starters — what to say',
      'No ads',
      'Full drill-down deep dives',
    ],
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-warm-200 bg-warm-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 py-3">
          <Link href="/v2" className="text-lg font-serif font-bold text-warm-900">
            Sporting Chance
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-700 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Gameface
          </div>
          <h1 className="text-3xl font-serif font-bold text-warm-900 mb-3">
            Get off the bench
          </h1>
          <p className="text-base text-warm-600 max-w-md mx-auto">
            Daily updates, every story, every quotable line, and what to say about each one.
            Free for your first 6 months, then 50¢ a month.
          </p>
        </div>

        {isPro ? (
          <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-8 text-center">
            <Check className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h2 className="text-xl font-serif font-bold text-green-900 mb-2">
              You&apos;re on Gameface
            </h2>
            <p className="text-sm text-green-700 mb-4">
              You have access to all stories and features.
            </p>
            <button
              onClick={handleManage}
              disabled={!!loading}
              className="rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                'Manage Subscription'
              )}
            </button>
          </div>
        ) : (
          <div className="max-w-sm mx-auto">
            <div className="rounded-2xl border-2 border-amber-300 bg-warm-white p-8 shadow-sm text-center">
              <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-2">
                Gameface
              </h3>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-serif font-bold text-warm-900">50¢</span>
                <span className="text-sm text-warm-400">/mo</span>
              </div>
              <p className="text-xs text-warm-400 mb-6">
                First 6 months free · Cancel anytime
              </p>
              <ul className="space-y-2 mb-6 text-left">
                {features.pro.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-warm-700">
                    <Check className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-warm-900 py-3 text-sm font-semibold text-white hover:bg-warm-700 disabled:opacity-50 transition-colors"
              >
                {loading === 'monthly' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Start 6 months free
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Free tier comparison */}
        {!isPro && (
          <div className="mt-8 rounded-2xl border border-warm-100 bg-warm-50 p-6">
            <h3 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3">
              Free tier includes
            </h3>
            <ul className="space-y-2">
              {features.free.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-warm-500">
                  <Check className="h-4 w-4 text-warm-300 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/v2"
            className="text-sm text-warm-400 hover:text-warm-600 transition-colors"
          >
            ← Back to cheat sheet
          </Link>
        </div>
      </main>
    </div>
  );
}
