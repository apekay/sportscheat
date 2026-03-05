import { DailyDigestV2 } from '@/types/v1.1';
import { sportEmoji } from '@/lib/utils-v1.1';

export async function sendEmail(email: string, digest: DailyDigestV2): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'digest@sportscheat.app';

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY');
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  const topBlurbs = digest.blurbs
    .sort((a, b) => b.partyTalkRank - a.partyTalkRank)
    .slice(0, 5);

  const blurbsHtml = topBlurbs
    .map(
      (b) => `
      <div style="margin-bottom: 16px; padding: 16px; border-radius: 12px; background: #f9fafb; border: 1px solid #e5e7eb;">
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${sportEmoji(b.sport)} ${b.sport.toUpperCase()}</div>
        <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 8px;">${b.headline}</div>
        <div style="font-size: 14px; color: #374151; line-height: 1.5;">${b.storyNarrativeQuick || b.storyNarrative}</div>
        <div style="margin-top: 8px; padding: 8px 12px; background: #eef2ff; border-radius: 8px; font-size: 13px; color: #4338ca;">
          <strong>Why care:</strong> ${b.whyShouldICareQuick || b.whyShouldICare}
        </div>
      </div>`
    )
    .join('');

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="padding: 24px; background: #111827; border-radius: 12px 12px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 20px;">SportsCheat</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #9ca3af;">${digest.date} — Your daily cheat sheet</p>
      </div>

      <div style="padding: 20px; background: #111827; border-radius: 0; color: white;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 4px;">
          If you only remember one thing
        </div>
        <p style="margin: 0; font-size: 15px; font-weight: 500; line-height: 1.5;">${digest.headlineStory}</p>
      </div>

      <div style="padding: 20px;">
        ${blurbsHtml}
      </div>

      <div style="padding: 20px; text-align: center;">
        <a href="https://sportscheat.vercel.app/v2" style="display: inline-block; padding: 12px 24px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
          View Full Digest
        </a>
      </div>

      <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
        You don't need to be a fan to belong in the conversation.
      </div>
    </div>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: `SportsCheat: ${digest.headlineStory.slice(0, 60)}...`,
    html,
  });

  console.log(`[email] Sent to ${email}`);
}
