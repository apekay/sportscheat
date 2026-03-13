'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn('email', { email, redirect: false });
    setEmailSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-warm-900">
            Sporting Chance
          </h1>
          <p className="mt-2 text-sm text-warm-500">
            Sign in to unlock your full cheat sheet
          </p>
        </div>

        <div className="rounded-2xl border border-warm-200 bg-warm-white p-6 shadow-sm">
          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/v2' })}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-warm-900 py-3 text-sm font-semibold text-white hover:bg-warm-700 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-warm-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-warm-white px-3 text-warm-400">or</span>
            </div>
          </div>

          {/* Email magic link */}
          {emailSent ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
              <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">Check your email</p>
              <p className="mt-1 text-xs text-green-600">
                We sent a sign-in link to {email}
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn}>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-warm-600 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm text-warm-900 placeholder-warm-300 focus:border-editorial focus:outline-none focus:ring-1 focus:ring-editorial transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-editorial py-3 text-sm font-semibold text-white hover:bg-editorial-dark disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Send magic link
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-warm-400">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
