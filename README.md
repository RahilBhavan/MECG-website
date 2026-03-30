# MECG website

Vite + React 19 + React Router 7 + Tailwind 4 + Supabase. Use **Bun** for scripts (`bun run`, `bunx`).

## Setup

1. `bun install`
2. Copy `.env.example` → `.env.local` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. For correct share previews in production builds, set `VITE_SITE_URL` (public origin, no trailing slash).
3. Optional: `bun run playwright:install` before first E2E run.
4. `bun run dev` — app at [http://localhost:3000](http://localhost:3000)

## Quality

- `bun run lint` — TypeScript + Biome
- `bun run test` — Vitest
- `bun run test:e2e` — Playwright (starts dev server on port 4179)
- `bun run build` — production bundle

Open Graph image: `bun run og:generate` writes `public/og.png`.

## Observability and analytics

Optional env vars (see [`.env.example`](.env.example)):

- **`VITE_SENTRY_DSN`** — client error reporting (Sentry). In dev, set **`VITE_SENTRY_DEV=true`** to enable.
- **`VITE_PLAUSIBLE_DOMAIN`** — loads Plausible; SPA page views and custom **`Funnel`** events on signup submit and apply submit.
- **`VITE_ANALYTICS_EVENTS_ENDPOINT`** — HTTPS URL receiving small JSON **`sendBeacon`** bodies for `pageview` / `funnel` (production only). Separate from **`VITE_WEB_VITALS_ENDPOINT`** (Core Web Vitals).

## SEO note (SPA)

`react-helmet-async` updates title, canonical, and Open Graph per route in the live app. Many link-preview crawlers do not execute JavaScript; if per-URL share cards for `/login` or `/signup` are critical, add **prerender** for those paths (e.g. a Vite prerender plugin) or **bot-specific HTML** at the edge.

## E2E credentials

`tests/e2e/critical-paths.spec.ts` runs **only when** role env vars are set (loaded from `.env.local` by Playwright if present):

- **`E2E_APPLICANT_EMAIL`** / **`E2E_APPLICANT_PASSWORD`**
- **`E2E_REVIEWER_EMAIL`** / **`E2E_REVIEWER_PASSWORD`**
- **`E2E_ALUMNI_EMAIL`** / **`E2E_ALUMNI_PASSWORD`**
- **`E2E_ADMIN_EMAIL`** / **`E2E_ADMIN_PASSWORD`**

Use a staging Supabase project and dedicated test users with the right `user_roles`. Review and apply tests **skip** when the queue is empty or the applicant has already submitted.

Optional: `bun run test:e2e:save-auth` (with applicant env vars set) writes `tests/.auth/applicant.json` for reuse in a custom Playwright `storageState` project.

Supabase schema docs: [`docs/supabase/rls-and-routes.md`](docs/supabase/rls-and-routes.md). Regenerate DB types after `db:start`: `bun run db:types`.

## shadcn-style UI

- Primitives live under [`components/ui/`](components/ui/) with `cn()` in [`lib/utils.ts`](lib/utils.ts). Imports use the `@/` alias (repo root), e.g. `@/components/ui/button`.
- Demo: [http://localhost:3000/balloons-demo](http://localhost:3000/balloons-demo) (`balloons-js` + Button).
- To add more shadcn components: `bunx shadcn@latest init` (choose Vite + Tailwind + `@/*` → `./*`), then `bunx shadcn@latest add …` so paths stay aligned with `components.json`.
