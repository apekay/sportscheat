import { DailyDigestV2 } from '@/types/v1.1';
import { sportEmoji } from '@/lib/utils-v1.1';

export async function sendDiscord(webhookUrl: string, digest: DailyDigestV2): Promise<void> {
  const topBlurbs = digest.blurbs
    .sort((a, b) => b.partyTalkRank - a.partyTalkRank)
    .slice(0, 5);

  const fields = topBlurbs.map((b) => ({
    name: `${sportEmoji(b.sport)} ${b.headline}`,
    value: `${b.storyNarrativeQuick || b.storyNarrative}\n*${b.memoryHook}*`,
    inline: false,
  }));

  const embeds = [
    {
      title: `Sporting Chance — ${digest.date}`,
      description: `**If you only remember one thing:**\n${digest.headlineStory}`,
      fields,
      color: 0x111827,
      footer: {
        text: "You don't need to be a fan to belong in the conversation.",
      },
      url: 'https://sportscheat.vercel.app/v2',
    },
  ];

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds }),
  });

  if (!res.ok) {
    throw new Error(`Discord webhook failed: ${res.status}`);
  }

  console.log('[discord] Message sent');
}
