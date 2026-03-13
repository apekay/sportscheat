'use client';

import { RefreshCw, Eye, EyeOff, Sparkles, User } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useSubscription } from '@/lib/hooks/useSubscription';
import Link from 'next/link';

interface V2HeaderProps {
  loading: boolean;
  spoilerFree: boolean;
  onRefresh: () => void;
  onSpoilerToggle: () => void;
  lastUpdated?: string;
}

export function V2Header({
  loading,
  spoilerFree,
  onRefresh,
  onSpoilerToggle,
  lastUpdated,
}: V2HeaderProps) {
  const { data: session } = useSession();
  const { isPro } = useSubscription();

  return (
    <header className="sticky top-0 z-10 border-b border-warm-200 bg-warm-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <a href="/v2" className="text-xl font-serif font-bold text-warm-900">
            Sporting Chance
          </a>
          {isPro ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              <Sparkles className="h-3 w-3" />
              Pro
            </span>
          ) : (
            <span className="rounded-full bg-editorial px-2 py-0.5 text-xs text-white font-medium">
              v2
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-warm-300 hidden sm:block">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={onSpoilerToggle}
            className="inline-flex items-center gap-1 rounded-lg bg-warm-50 px-2.5 py-1.5 text-xs font-medium text-warm-700 hover:bg-warm-100 transition-colors"
          >
            {spoilerFree ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {spoilerFree ? 'Spoiler-Free' : 'Scores On'}
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-warm-50 px-2.5 py-1.5 text-xs font-medium text-warm-700 hover:bg-warm-100 disabled:opacity-50 transition-colors"
            title="Get fresh digest"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Auth / Upgrade */}
          {!session ? (
            <button
              onClick={() => signIn(undefined, { callbackUrl: '/v2' })}
              className="inline-flex items-center gap-1 rounded-lg bg-warm-50 px-2.5 py-1.5 text-xs font-medium text-warm-700 hover:bg-warm-100 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              Sign In
            </button>
          ) : !isPro ? (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-editorial text-white text-xs font-bold"
              title="Account"
            >
              {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
