import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { getServerSession } from 'next-auth';

let _authOptions: NextAuthOptions | null = null;

/**
 * SUPABASE_DISABLED=1 runs auth without the database: Google-only,
 * pure-JWT sessions (user id = Google account id). Magic-link sign-in
 * is unavailable in this mode because verification tokens live in the
 * adapter. Remove the flag once a Supabase project is configured.
 */
const supabaseDisabled = process.env.SUPABASE_DISABLED === '1';

export function getAuthOptions(): NextAuthOptions {
  if (_authOptions) return _authOptions;

  const providers: NextAuthOptions['providers'] = [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ];

  if (!supabaseDisabled) {
    // EmailProvider needs the adapter for verification tokens
    providers.push(
      EmailProvider({
        server: {
          host: 'smtp.resend.com',
          port: 465,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY!,
          },
        },
        from: process.env.RESEND_FROM_EMAIL || 'noreply@sportingchance.app',
      })
    );
  }

  _authOptions = {
    ...(supabaseDisabled
      ? {}
      : {
          adapter: SupabaseAdapter({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
            secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          }),
        }),

    providers,

    session: {
      strategy: 'jwt',
    },

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        } else if (!token.id && token.sub) {
          // Adapterless mode: fall back to the provider account id
          token.id = token.sub;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.id) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },

    pages: {
      signIn: '/auth/signin',
    },
  };

  return _authOptions;
}

export async function getSession() {
  return getServerSession(getAuthOptions());
}
