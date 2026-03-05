import { NextResponse } from 'next/server';
import { getSubscribers, addSubscriber, removeSubscriber } from '@/lib/storage/kv';
import { Subscriber, DistributionChannel } from '@/types/v2';
import { generateId } from '@/lib/utils';

// POST /api/v2/subscribe — add a subscriber
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channel, target } = body as { channel: DistributionChannel; target: string };

    if (!channel || !target) {
      return NextResponse.json(
        { error: 'Missing channel or target' },
        { status: 400 }
      );
    }

    const validChannels: DistributionChannel[] = ['sms', 'email', 'slack', 'discord'];
    if (!validChannels.includes(channel)) {
      return NextResponse.json(
        { error: `Invalid channel. Must be one of: ${validChannels.join(', ')}` },
        { status: 400 }
      );
    }

    const subscriber: Subscriber = {
      id: generateId(),
      channel,
      target,
      active: true,
      createdAt: new Date().toISOString(),
    };

    await addSubscriber(subscriber);

    return NextResponse.json({ success: true, subscriber });
  } catch (error) {
    console.error('[v2/subscribe] POST failed:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/v2/subscribe — remove a subscriber
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing subscriber id' }, { status: 400 });
    }

    await removeSubscriber(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v2/subscribe] DELETE failed:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/v2/subscribe — list subscribers (admin only)
export async function GET(request: Request) {
  try {
    const adminKey = process.env.ADMIN_API_KEY;
    const authHeader = request.headers.get('authorization');

    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscribers = await getSubscribers();
    return NextResponse.json({ subscribers, count: subscribers.length });
  } catch (error) {
    console.error('[v2/subscribe] GET failed:', error);
    return NextResponse.json(
      { error: 'Failed to list subscribers', details: String(error) },
      { status: 500 }
    );
  }
}
