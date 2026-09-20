# Vort — כמה אתה שווה

Candidate-facing salary benchmark for media & communications professionals in
Israel, built for the Vort home assignment. Five quick questions get you a
free salary range against people in your role; uploading a CV, your salary
expectation, availability, and consent unlocks your exact percentile — which
is what Vort actually needs to fill in behind the scenes.

See the PR description for the product reasoning, the viral mechanic, the
funnel estimate, and what was cut.

## Stack

Next.js (App Router) + TypeScript + Postgres, no ORM (plain `pg` + one
`schema.sql` file — see "Why no ORM" below).

## Running from scratch

Prerequisites: Node 20+, Docker (for local Postgres).

```bash
npm install
cp .env.example .env

npm run db:up       # starts Postgres in Docker (docker-compose)
npm run db:migrate  # applies db/schema.sql
npm run db:seed     # generates ~1,400 synthetic respondents across every cohort

npm run dev         # http://localhost:3000
```

To point at a different Postgres instance (e.g. a managed one for a live
deploy), just set `DATABASE_URL` in `.env` before running `db:migrate` /
`db:seed`.

### Other scripts

```bash
npm run build       # production build
npm run lint        # eslint
npm run db:reset    # re-applies schema + re-seeds (safe to re-run any time)
```

## How the flow works

1. **`/check`** — five tap-to-advance questions (track, level, workplace
   type, years of experience, manages a team). No typing required.
2. **`/r/[token]/range`** — an immediate free result: the 15th–85th
   percentile salary range for that exact cohort, computed live from the
   respondent pool (real + synthetic).
3. **`/r/[token]/details`** — the ask: CV upload, salary expectation,
   availability, and an optional list of employers to hide the profile from.
   Followed by a dedicated consent screen (unchecked by default) explaining
   in plain Hebrew what happens to the data.
4. **`/r/[token]/result`** — the precise percentile, a comparison against
   whoever referred them (if any), a WhatsApp share button, and their
   personal deletion code.
5. **`/from/[token]`** — the link that actually gets shared. Personalized
   landing page + a dynamic Open Graph image (`opengraph-image.tsx`, via
   `next/og`) showing the sharer's percentile, so the WhatsApp/social link
   preview itself is the hook.
6. **`/delete`** — enter a deletion code, and the row (CV bytes included) is
   hard-deleted immediately. No soft-delete flag, no "contact us."

## Data model

One `respondents` table (see `db/schema.sql`) holds both real submissions and
the synthetic seed population, distinguished by `is_synthetic`. Percentile
and range calculations query both together — treating the seed data as the
seeded 3M-profile backdrop the real product would have.

`db/seed.ts` generates ~70 synthetic respondents per (track × level) cohort
using a deterministic PRNG (same seed → same dataset every run). Salaries are
generated from base ranges per track/level, adjusted by workplace type,
experience, and team management, plus randomized noise — see
`src/lib/salary.ts` for the exact formula.

**Where the base salary ranges came from:** journalist ranges are grounded in
Globes' wage survey and Bizportal's reporting on Israeli journalist salaries
(junior ~8-12k ILS/month, senior crossing 20k, editors-in-chief at 22-35k+),
cross-checked against SalaryExpert's Israel editor/newscaster figures and the
July 2025 average Israeli monthly wage (~14.1k ILS). Producer and video
editor ranges aren't independently surveyed publicly, so they're interpolated
from the journalist/editor anchors at a slightly lower band, which is
directionally consistent with how those roles are generally compensated in
Israeli media.

## Why no ORM

Prisma's current CLI (v8, RC at the time of writing) has a materially
different init flow than what most reviewers will have used, which felt like
a bad bet for something meant to run cleanly on someone else's machine.
Given a single, fairly simple table, a plain `pg` client with one readable
`schema.sql` file seemed more transparent than introducing an ORM (and its
version risk) for this scope.

## Design system

Implemented per the brand spec: Heebo throughout, the exact color tokens
(`src/app/globals.css`), RTL, mobile-first single-column layout, tabular
numerals on every number, and coral used only for the logo, links, and one
primary action per screen — never as a heading color, background, or behind
a number.
