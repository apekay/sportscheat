import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserSubscription } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ isPro: false, status: 'unauthenticated' });
    }

    const sub = await getUserSubscription(session.user.id);
    return NextResponse.json(sub);
  } catch {
    return NextResponse.json({ isPro: false, status: 'error' });
  }
}
