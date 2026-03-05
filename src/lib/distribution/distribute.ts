import { DailyDigestV2 } from '@/types/v1.1';
import { getSubscribers } from '@/lib/storage/kv';
import { sendSMS } from './sms';
import { sendEmail } from './email';
import { sendSlack } from './slack';
import { sendDiscord } from './discord';

export async function distributeDigest(digest: DailyDigestV2): Promise<void> {
  const subscribers = await getSubscribers();
  const active = subscribers.filter((s) => s.active);

  if (active.length === 0) {
    console.log('[distribute] No active subscribers');
    return;
  }

  console.log(`[distribute] Sending to ${active.length} subscribers...`);

  const results = await Promise.allSettled(
    active.map(async (sub) => {
      switch (sub.channel) {
        case 'sms':
          return sendSMS(sub.target, digest);
        case 'email':
          return sendEmail(sub.target, digest);
        case 'slack':
          return sendSlack(sub.target, digest);
        case 'discord':
          return sendDiscord(sub.target, digest);
      }
    })
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;
  console.log(`[distribute] Done: ${succeeded} sent, ${failed} failed`);
}
