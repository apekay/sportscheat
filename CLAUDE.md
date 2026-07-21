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
2. `/api/v2/digest` serves cache → stale fallback (up to 3 days back;
   digest TTL is 7 days so a missed cron never blanks the site) → live
   generation. Live generation is guarded by a Redis lock
   (`digest:generating`, 5-min TTL, `kv.ts`): the first cache-miss request
   generates, concurrent ones get `202 {status:'generating'}` and the
   clients poll every 20s showing a "being written" state. Without the
   lock, N concurrent misses ran N parallel generations (~$0.20 each —
   this burned ~$1.60 in minutes during testing on 2026-07-17).
3. `/api/v2/refresh` is a user-triggered regeneration, rate-limited to
   1/hour per user key and behind the same generation lock (202 if held).
   `/api/v2/generate` (cron) also takes the lock and skips if held.
4. `/api/v1.1/drilldown` ("Go deeper") generates per-story deep dives,
   cached in Redis per blurb+language (48h) — first reader pays ~30s,
   everyone after gets ~30ms. It validates the model output and regenerates
   once if key fields come back empty.
5. **Cost transparency (2026-07-10):** every Anthropic call is metered —
   `src/lib/ai/cost.ts` reads `message.usage` and prices at Sonnet 5
   standard rates ($3/$15 per MTok), accumulating into a Redis
   integer-microdollar counter (`costs:total-microdollars`, `kv.ts`).
   `/api/v2/costs` serves `{totalUsd, totalVisitors}`; `CostTicker`
   renders total + per-person cost ("Across N visitors, that's $Y per
   person") in the footer of `/v2`, `/v2/bold`, and `/v2/swipe`.
   Visitors are counted once per browser (localStorage `sc-visited` gates
   a POST to `/api/v2/view` → Redis `views:total-visitors`). Recording is
   fire-and-forget so a Redis failure can't break generation.

**Model:** `claude-sonnet-5`, plain `messages.create` with a refusal guard
(`src/lib/ai/claude-v1.1.ts` and legacy `claude.ts`). We tried
`claude-fable-5` first (works, ~2min/digest, great quality) but switched to
Sonnet for ~10x lower cost at comparable quality for this task. `max_tokens`
is sized generously because Sonnet 5's adaptive thinking counts toward it.

**Surfaces:**
- `/v2` — mode picker (choice persisted in `localStorage.sporting-chance-view`;
  `/` redirects here)
- `/v2/swipe` — flash cards: flip for full story, "I got this" memorization
  tracking, progress ticks; topic filter chips restart the deck
- `/v2/bold` — headlines feed: topic filter chips (`TopicTabs` +
  `src/lib/topics.ts` sport→topic map), top-3 stories visible with a
  "Show N more" expander (2026-07-21), expandable "Go deeper" drill-downs
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
- `.env.local` needs: `SPORTSCHEAT_ANTHROPIC_KEY` (or
  `SPORTING_CHANCE_ANTHROPIC_KEY`/`ANTHROPIC_API_KEY`),
  `UPSTASH_REDIS_REST_URL/TOKEN`, `NEXT_PUBLIC_ADSENSE_CLIENT`.
  `CRON_SECRET` lives only on Vercel (unset locally, so `/api/v2/generate`
  is open in dev). The dead `SUPABASE_*`, `STRIPE_*`, `NEXTAUTH_*`, and
  `GOOGLE_CLIENT_*` secrets were **deleted from `.env.local` 2026-07-10**;
  mint fresh keys from each dashboard if auth/payments ever return. They
  may still linger in Vercel's env settings — remove them there too.
- Long routes declare `maxDuration = 300` (live generation runs ~1.5–2 min;
  requires Vercel Pro). Keep that on any new route that calls the model.
- Digest dates are `YYYY-MM-DD` strings — parse with
  `new Date(date + 'T00:00:00')` or US timezones show yesterday's weekday.

## Gotchas

- **Local dev and prod share ONE Upstash Redis.** Local generations are
  served to production visitors and vice versa (this is also why prod
  "worked" 07-09→07-12 despite its cron never landing a digest — local
  sessions were feeding the shared cache). Local testing writes prod
  data; be deliberate. Splitting into two Upstash DBs is an open thread.
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
| 2026-07-10 | Public cost counter: metered Anthropic spend in Redis, `/api/v2/costs` + footer `CostTicker`; purged dead auth/payment secrets from `.env.local` |
| 2026-07-12 | Ads: Taboola → AdSense Auto ads → **Adsterra** (permissive, non-Google) in one cycle; env-gated Social Bar/Popunder zone scripts, AdSense fully removed |
| 2026-07-21 | Feed: top-3 + "Show N more" expander, topic filter chips (both v2 surfaces); transparency: per-person cost line backed by a once-per-browser visitor counter |
| 2026-07-17 | **Prod outage diagnosed** ("site stopped working" since ~07-12): repo was 15 commits ahead of origin — Vercel still served the July-9 Stripe-paywall build with login pointing at the deleted Supabase project, its cron generations never landed a digest, and the 07-10 digest's 48h TTL expired 07-12 leaving live-generation (which times out on Vercel) as the only path. Fix: pushed everything; added generation lock, 7-day TTL, 3-day stale fallback, 202+polling UX |

## Open threads for next session

- Ads (2026-07-12): **Adsterra — permissive non-Google network.** Ad-system
  history: Taboola ported → dropped; AdSense Auto ads wired → dropped
  ("not from google"). Research: Adsterra and PropellerAds/Monetag are the
  only reputable no-minimum instant-approval networks; Media.net needs
  approval+traffic; Ezoic runs on Google AdX. Chose Adsterra (5–10 min
  approval, all formats, $5 Paxum/$25 PayPal payout). Code side is done:
  `layout.tsx` loads two env-gated zone scripts —
  `NEXT_PUBLIC_ADSTERRA_SOCIALBAR_SRC` (Social Bar: floating bottom bar +
  interstitials, the site-wide "auto ads" equivalent) and
  `NEXT_PUBLIC_ADSTERRA_POPUNDER_SRC` (optional, most aggressive) — inert
  until set. `AdBanner`/`AdUnit` are dev-only layout markers now (no
  AdSense left; `NEXT_PUBLIC_ADSENSE_CLIENT` removed, `public/ads.txt`
  google line removed). **Aaron must (Claude can't create accounts):**
  sign up at adsterra.com as a publisher, add sportingchance.app, create a
  Social Bar zone (+ Popunder if wanted), copy each zone's GET CODE script
  URL into the env vars (locally + Vercel), and paste their ads.txt lines
  into `public/ads.txt`. Expect lower RPMs and flashier ad creatives than
  AdSense — the price of permissiveness. The `naughty-tereshkova-a98730`
  worktree is superseded and can be deleted.
- Consider deleting the dead v1 surfaces (local env entries are now pruned).
- Distribution (`/api/v2/subscribe` + `src/lib/distribution/`) exists but
  the daily send isn't scheduled — only digest generation is cron'd.
- **Vercel state (2026-07-17, resolved via authed CLI + dashboard):**
  current code deployed to prod by `vercel --prod` (CLI re-authed via
  device flow, token on this machine); 25 dead env vars deleted, 5 live
  ones kept (`SPORTSCHEAT_ANTHROPIC_KEY`, `UPSTASH_*`×2, `CRON_SECRET`,
  `RESEND_API_KEY`); cron `/api/v2/generate` 10:00 UTC registered +
  enabled (Hobby = 1-hour flex window); Fluid compute on, so
  `maxDuration=300` is honored on Hobby — a full 123s generation
  completed on prod via `/api/v2/refresh` as proof. **Still open: the
  project's Git repo is NOT connected** (that's why pushes never
  deployed — prod ran the April 16 build until now). Connecting needs
  the Vercel GitHub App installed from a browser logged into GitHub
  (github.com/apps/vercel → install on `apekay`, then `vercel git
  connect`). Until then, deploy with `vercel --prod`.
- Consider a second Upstash DB so local dev stops writing prod data.
