# Sporting Chance — Master Project File

Last updated: 2026-07-10. This is the source of truth for project state and
decisions. Update it when architecture or product direction changes.

## What this is

**Sporting Chance** (sportingchance.app) is a daily AI-generated sports digest
for people who *don't* follow sports. The product gives social fluency, not
fandom: 6 stories a day, each with a "Why should I care?", a quotable
one-liner ("Say this"), conversation starters, and on-demand deep dives — so
users can hold their own in sports small-talk at work or a party in ~3 minutes.

## Current product state (2026-07-10)

- **Fully open, no accounts, no payments.** Login, Stripe, subscriptions, and
  the paywall were all scrapped on 2026-07-10 (`feat: scrap login, payments,
  and the paywall`). Everyone sees everything. **Ads are the only
  monetization** (AdSense placeholders via `src/components/ads/`).
- If auth/payments are ever wanted back, the complete implementation
  (Google + magic-link auth, Stripe 6-month-free-trial → 50¢/mo, 3-free-
  stories paywall) lives in git history through commit `91934ef`.

## Architecture

**Stack:** Next.js 16 (App Router, Turbopack) · Tailwind v4 · Upstash Redis ·
Anthropic API (`claude-sonnet-5`) · ESPN public APIs · Vercel (cron).

**Data flow:**
1. `/api/v2/generate` (Vercel cron, daily 10:00 UTC — see `vercel.json`)
   aggregates ESPN scoreboards/news (`src/lib/data/`), generates the digest
   via `generateDailyDigestV2` (`src/lib/ai/claude-v1.1.ts`), and caches it
   in Redis (`src/lib/storage/kv.ts`, key `digest:{date}`, 48h TTL).
2. `/api/v2/digest` serves cache → yesterday-fallback → live generation.
3. `/api/v2/refresh` is a user-triggered regeneration, rate-limited to
   1/hour per user key.
4. `/api/v1.1/drilldown` ("Go deeper") generates per-story deep dives,
   cached in Redis per blurb+language (48h) — first reader pays ~30s,
   everyone after gets ~30ms. It validates the model output and regenerates
   once if key fields come back empty.

**Model:** `claude-sonnet-5`, plain `messages.create` with a refusal guard
(`src/lib/ai/claude-v1.1.ts` and legacy `claude.ts`). We tried
`claude-fable-5` first (works, ~2min/digest, great quality) but switched to
Sonnet for ~10x lower cost at comparable quality for this task. `max_tokens`
is sized generously because Sonnet 5's adaptive thinking counts toward it.

**Surfaces:**
- `/v2` — mode picker (choice persisted in `localStorage.sporting-chance-view`;
  `/` redirects here)
- `/v2/swipe` — flash cards: flip for full story, "I got this" memorization
  tracking, progress ticks
- `/v2/bold` — headlines feed with expandable "Go deeper" drill-downs
- `/v1.1` — legacy digest page (still works, shares the digest cache)
- `/api/v2/subscribe` — email/sms/slack/discord digest distribution
  (`src/lib/distribution/`)
- v1 surfaces (`src/app/page.tsx`, `/api/digest|drilldown|quiz`) are dead
  code behind the `/` → `/v2` redirect; candidates for deletion.

## Design system (2026-07-09)

Token-driven skins in `src/app/globals.css`. **Never hardcode colors in v2
components** — everything routes through `--sc-*` custom properties exposed
as Tailwind utilities (`warm-*`, `editorial-*`, `invert-*`, `on-ink`,
`on-accent`, `.sc-frame`, `.sc-display`).

- Default skin **"Fast"**: built for speed reading — high contrast, sans
  display, square corners (no squircles), left accent bar on "Why should I
  care", labeled SAY THIS quote block.
- Alternate skins are pure token overrides under `[data-skin=...]`:
  **newsprint** ("Paper", Georgia broadsheet + red), **wire** (mono terminal,
  green/amber on near-black), **jumbotron** ("Jumbo", Helvetica-black
  uppercase, 3px keylines, offset shadows).
- `SkinPicker` in the header cycles skins; persisted in
  `localStorage.sc-skin`; applied pre-paint by an inline script at the top
  of `<body>` in `layout.tsx` (`suppressHydrationWarning` on `<html>` covers
  the server/client attribute diff).
- Pairing rules: `bg-warm-900` fills take `text-on-ink`; `bg-editorial`
  fills take `text-on-accent`; dark card-backs use `invert-*` tokens. Wire
  is the adversarial skin (dark ground) — test new UI against it.

## Ops / dev

- `npm run dev` (port 3000), `npm run lint`, `npm run build`. Always run
  from the repo root.
- `.env.local` needs: `SPORTING_CHANCE_ANTHROPIC_KEY` (or `ANTHROPIC_API_KEY`),
  `UPSTASH_REDIS_REST_URL/TOKEN`, `CRON_SECRET`, `NEXT_PUBLIC_GOOGLE_ADS_ID`.
  The `SUPABASE_*`, `STRIPE_*`, `NEXTAUTH_*`, `GOOGLE_CLIENT_*`,
  `RESEND_*`, and `SUPABASE_DISABLED` entries are **unused** since the
  scrap-payments commit (the old Supabase project is deleted anyway).
- Long routes declare `maxDuration = 300` (live generation runs ~1.5–2 min;
  requires Vercel Pro). Keep that on any new route that calls the model.
- Digest dates are `YYYY-MM-DD` strings — parse with
  `new Date(date + 'T00:00:00')` or US timezones show yesterday's weekday.

## Gotchas

- `.claude/worktrees/` holds old Claude worktrees (one dirty with
  uncommitted Taboola work). They're excluded from git/tsconfig/eslint —
  **never `cd` into them and run npm**; npm resolves their package.json and
  builds the wrong tree.
- If a new Tailwind theme token doesn't take effect in dev, clear `.next`
  and restart — the dev server caches the compiled theme.
- ESPN sometimes returns events without `competitions`/competitors (tennis
  especially); the parsers skip those rather than crash — keep that guard
  if touching `src/lib/data/espn*.ts`.
- The AdSense loader mutates `<head>` before hydration; keep third-party
  scripts out of `<head>` markup (use `next/script` in body).

## Untracked local files (intentionally not committed)

`reddit_posts/` and the `sportscheat_*.{html,xlsx,docx}` marketing docs are
local working files, deliberately kept out of the repo. Note: the
`reddit_posts/` campaign is undisclosed-promotion material that Claude
declined to execute; if marketing is revisited, plan a disclosed approach.

## History of major decisions

| Date | Decision |
|---|---|
| 2026-07-02 | Digest generation migrated off retired `claude-sonnet-4` to `claude-fable-5` (+ SDK 0.78→0.110) |
| 2026-07-09 | Free tier changed Tue/Fri-only → top-3-stories-daily; trial pricing (6mo free → 50¢/mo) built on Stripe |
| 2026-07-09 | Switched Fable 5 → `claude-sonnet-5` for cost; kept refusal guard |
| 2026-07-09 | Fast-reading base design + Paper/Wire/Jumbo skins (token system) |
| 2026-07-10 | Drill-downs: validate+retry incomplete generations, Redis cache per blurb |
| 2026-07-10 | **Scrapped auth, payments, paywall entirely — fully open, ads only** (revert point: `91934ef`) |

## Open threads for next session

- Replace ad placeholders with real AdSense/Taboola units (there's dormant
  Taboola work in the dirty `.claude` worktree `naughty-tereshkova-a98730`).
- Consider deleting the dead v1 surfaces and pruning unused env entries.
- Distribution (`/api/v2/subscribe` + `src/lib/distribution/`) exists but
  the daily send isn't scheduled — only digest generation is cron'd.
- Deploy state on Vercel unverified this cycle (env vars there still
  reference the removed auth/payments stack).
