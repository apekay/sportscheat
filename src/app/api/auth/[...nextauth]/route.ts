import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _handler: any = null;

function handler() {
  if (!_handler) _handler = NextAuth(getAuthOptions());
  return _handler;
}

type RouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(req: Request, ctx: RouteContext) {
  return handler()(req, ctx);
}

export async function POST(req: Request, ctx: RouteContext) {
  return handler()(req, ctx);
}
