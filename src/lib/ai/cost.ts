import Anthropic from '@anthropic-ai/sdk';
import { addCost } from '@/lib/storage/kv';

// claude-sonnet-5 list pricing per million tokens. Intro pricing is
// $2/$10 through 2026-08-31; we ledger at the standard $3/$15 rate so
// the public counter never understates once intro pricing ends.
const INPUT_USD_PER_MTOK = 3;
const OUTPUT_USD_PER_MTOK = 15;

/**
 * Record the dollar cost of one Anthropic API response in the Redis
 * ledger. Fire-and-forget: a ledger failure must never break generation.
 */
export function recordUsage(message: Anthropic.Message): void {
  const { input_tokens, output_tokens } = message.usage;
  const usd =
    (input_tokens * INPUT_USD_PER_MTOK + output_tokens * OUTPUT_USD_PER_MTOK) /
    1_000_000;
  addCost(usd).catch((err) => {
    console.warn('[cost] failed to record usage:', err);
  });
}
