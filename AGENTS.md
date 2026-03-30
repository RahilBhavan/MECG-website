## Learned User Preferences

- Use Bun for this repo’s scripts and CLI (`bun run`, `bunx`) rather than npm/yarn/pnpm.
- Product covers three audiences: applicants, alumni network members, and application reviewers; reviewers use a card-based, Tinder-style screening flow.
- Global UX/accessibility: do not hide the system cursor on auth or portal routes—limit custom or `cursor: none` behavior to the landing experience so keyboard and pointer users always see a usable cursor.
- Provide consistent `:focus-visible` styles on interactive controls (links, nav, inputs, review actions).
- Aim for roughly 44×44px minimum touch targets on mobile for primary actions (e.g. Pass / Maybe / Yes, undo, header nav).
- Respect `prefers-reduced-motion` for smooth scroll (Lenis), hero animation (GSAP), and review-card motion.

## Learned Workspace Facts

- App stack is Vite, React 19, and Tailwind; Supabase supplies auth and data through `src/lib/supabase.ts`, preferring `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` and falling back to `NEXT_PUBLIC_SUPABASE_*` (and publishable-key names) so Vercel’s Supabase integration env vars work without duplicating keys under `VITE_*`.
- Repository includes `supabase/` with CLI `config.toml`, SQL migrations, and Postgres 17 settings; database workflows use `bun run db:*` scripts (start/stop/reset/push).
- Do not use `createClient` with the hand-written `Database` type in `src/types/database.ts` until generated types match the live schema; that shape breaks Supabase query-builder typing. Use `bun run db:types` (local Supabase) to emit `src/types/supabase.gen.ts`, then wire the client to generated types when ready.
- Admin access is a row in `public.user_roles` (role `admin`) keyed by the user’s Auth UUID—grant via SQL Editor (`insert` / `delete`), not Auth metadata alone; refresh the session after changes.
- Member roster and headshots: run `bun run roster:import` to regenerate `public/headshots` and `src/data/roster-w26.ts` from the W26 spreadsheet and headshot RAWs; adjust `HEADSHOT_INDEX_OVERRIDES` in `scripts/import-roster.ts` when a face maps to the wrong source image.
- `bun run lint` runs `tsc --noEmit` plus Biome; Vitest and Playwright cover unit/E2E per package scripts; set `VITE_SITE_URL` in production builds for Open Graph and canonical URLs.
- Playfair and Inter load via `@fontsource/*` imports in `src/main.tsx` (Latin subsets); keep typography out of Google Fonts `<link>` tags in `index.html` and out of CSS `@import` chains; portal/auth title rhythm uses `.type-portal-title`, `.type-auth-title`, and `.type-auth-state-title` in `src/index.css`.
- Dense admin or data-heavy portal screens (e.g. Role administration) use `.type-portal-title-sans` in `src/index.css` for Inter at the same scale as `.type-portal-title` instead of Playfair.
- Applicants upload a required headshot to the private Storage bucket `application-headshots`; persist `headshotPath` in `applications.answers` and use signed URLs for preview and reviewer cards (`src/lib/application-headshot-storage.ts`).
- shadcn-style shared primitives live under repo-root `components/ui/` and `lib/utils.ts` with `@/*` mapped to the project root (alongside `src/` app code), matching typical shadcn CLI import paths.
- Alumni peer directory data is served through the masked `list_directory_profiles` RPC; alumni RLS does not allow `SELECT` on other users’ full `profiles` rows (own row or admin only). The review deck uses screening vs final `review_phase`, shortlist verdicts, rubric `scores` jsonb, `applications.cohort` / `tags` / `assigned_reviewer_id`, blind-mode rows in `review_blind_pass`, and admin audit plus batch tagging on `AdminReviewsPage`; apply submit copies the applicant’s `profiles.cohort` onto `applications`.

## Vibecoding playbook

Use this when building or refreshing UI so output stays **distinctive** and **on-brand**, not generic template slop.

1. **Lock an aesthetic** — Pick one direction (e.g. editorial luxury, brutal minimal, soft organic). One memorable motif beats ten half-baked effects.
2. **Tokens first** — Extend `@theme` / CSS variables in `src/index.css` (`--color-*`, `--font-*`) before sprinkling one-off hex values.
3. **Motion with consent** — Use `motion`, `gsap`, and Lenis where they shine; always check `usePrefersReducedMotion()` / `getPrefersReducedMotion()` before smooth scroll or long timelines.
4. **Surface-aware flair** — Full **vibe** on `LandingPage` and marketing sections; **restraint** on auth, reviewer, and alumni portal screens (system cursor, fast interactions, obvious focus).
5. **Verify** — `bun run lint` and `bun run build`; spot-check keyboard tab order and mobile tap targets on primary actions.

Cursor loads extra guidance from `.cursor/rules/` (`mecg-stack.mdc`, `frontend-vibecoding.mdc`, `portal-auth-ui.mdc`).

## Specialist agents (personas)

These are **drop-in instructions** for Cursor Composer agents or the start of a focused chat. Paste the quoted block as the agent **system prompt** or prefix your first message with it.

### Vibe Architect

Use for new sections, landing refreshes, and visual hierarchy.

> You are the **Vibe Architect** for the MECG site (Vite + React 19 + Tailwind 4). Commit to one bold, cohesive aesthetic: typography pair, dominant palette, sharp accent, and spatial composition (asymmetry or generous whitespace — choose deliberately). Extend existing tokens in `src/index.css` (`@theme`) rather than random inline colors. Avoid generic purple-gradient hero clichés and interchangeable three-column “features” grids. Ship production TSX with semantic HTML and `:focus-visible`-friendly controls.

### Motion Sorcerer

Use for GSAP heroes, Lenis scroll, card physics, micro-interactions.

> You are the **Motion Sorcerer**. The repo already includes `gsap`, `motion`, `@studio-freight/lenis`, and hooks `usePrefersReducedMotion` / `getPrefersReducedMotion`. Gate Lenis and heavy timelines on reduced-motion preference; provide instant or fade-only fallbacks. Prefer one strong orchestrated moment (staggered reveal, scroll chapter) over noisy perpetual animation. Never delay reviewer verdict actions or form submit on animation.

### A11y Sentinel

Use before shipping auth, nav, forms, and the review deck.

> You are the **A11y Sentinel**. Enforce visible `:focus-visible` rings, semantic landmarks, and `aria-*` on icon-only controls. Primary actions (Pass / Maybe / Yes, undo, header nav) must meet ~**44×44px** touch targets on small screens. Never apply `cursor: none` or custom cursor takeover outside marketing/landing experiences. Respect `prefers-reduced-motion` for scroll and card motion.

### Supabase Realist

Use for data fetching, RLS-shaped UI, and env wiring.

> You are the **Supabase Realist**. Use the client from `src/lib/supabase.ts` and documented env vars. Do **not** wire `createClient` to the hand-written `Database` type in `src/types/database.ts` until types are regenerated. Always surface loading and error states; use existing toast/skeleton patterns where present.

### Ship Captain

Use for integration passes, PR polish, and cross-file consistency.

> You are the **Ship Captain**. Prefer small, reviewable diffs; match neighboring file style and imports. Use **Bun** only (`bun run`, `bunx`). Run `bun run lint` and `bun run build` and fix failures before finishing. Do not expand scope into unrelated features or unsolicited markdown docs.
