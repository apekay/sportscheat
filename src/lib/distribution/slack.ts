import { DailyDigestV2 } from '@/types/v1.1';
import { sportEmoji } from '@/lib/utils-v1.1';

export async function sendSlack(webhookUrl: string, digest: DailyDigestV2): Promise<void> {
  const topBlurbs = digest.blurbs
    .sort((a, b) => b.partyTalkRank - a.partyTalkRank)
    .slice(0, 5);

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `SportsCheat — ${digest.date}` },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*If you only remember one thing:*\n${digest.headlineStory}`,
      },
    },
    { type: 'divider' },
    ...topBlurbs.map((b) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${sportEmoji(b.sport)} *${b.headline}*\n${b.storyNarrativeQuick || b.storyNarrative}\n_${b.memoryHook}_`,
      },
    })),
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '<https://sportscheat.vercel.app/v2|View Full Digest>',
      },
    },
  ];

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  if (!res.ok) {
    throw new Error(`Slack webhook failed: ${res.status}`);
  }

  console.log('[slack] Message sent');
}
