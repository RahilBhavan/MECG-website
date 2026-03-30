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

Supabase schema docs: [`docs/supabase/rls-and-routes.md`](docs/supabase/rls-and-routes.md). Regenerate DB types after `db:start`: `bun run db:types`.

## shadcn-style UI

- Primitives live under [`components/ui/`](components/ui/) with `cn()` in [`lib/utils.ts`](lib/utils.ts). Imports use the `@/` alias (repo root), e.g. `@/components/ui/button`.
- Demo: [http://localhost:3000/balloons-demo](http://localhost:3000/balloons-demo) (`balloons-js` + Button).
- To add more shadcn components: `bunx shadcn@latest init` (choose Vite + Tailwind + `@/*` → `./*`), then `bunx shadcn@latest add …` so paths stay aligned with `components.json`.
