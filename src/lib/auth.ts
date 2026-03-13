import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { getServerSession } from 'next-auth';

let _authOptions: NextAuthOptions | null = null;

export function getAuthOptions(): NextAuthOptions {
  if (_authOptions) return _authOptions;

  _authOptions = {
    adapter: SupabaseAdapter({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),

    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
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
      }),
    ],

    session: {
      strategy: 'jwt',
    },

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
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
