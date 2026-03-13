import { withAuth } from 'next-auth/middleware';

// Only protect Stripe and user API routes — everything else is public
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/api/stripe/checkout', '/api/stripe/portal', '/api/user/:path*'],
};
