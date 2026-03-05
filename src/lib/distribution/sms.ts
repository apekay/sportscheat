import { DailyDigestV2 } from '@/types/v1.1';

export async function sendSMS(phone: string, digest: DailyDigestV2): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Missing Twilio env vars');
  }

  // Build concise SMS body (~300 chars)
  const topBlurbs = digest.blurbs
    .sort((a, b) => b.partyTalkRank - a.partyTalkRank)
    .slice(0, 3);

  const lines = [
    `SportsCheat ${digest.date}`,
    '',
    digest.headlineStory,
    '',
    ...topBlurbs.map((b) => `- ${b.headline}`),
    '',
    'Full digest: https://sportscheat.vercel.app/v2',
  ];

  const body = lines.join('\n').slice(0, 1600); // SMS limit

  const twilio = await import('twilio');
  const client = twilio.default(accountSid, authToken);

  await client.messages.create({
    body,
    from: fromNumber,
    to: phone,
  });

  console.log(`[sms] Sent to ${phone.slice(0, 4)}...`);
}
