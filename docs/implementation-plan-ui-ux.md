# UI/UX implementation plan

Phased work aligned with the MECG stack (Vite, React 19, React Router 7, Tailwind 4, Bun). After each phase, run `bun run lint` and `bun run build`.

---

## Phase 1 — Marketing shell (LandingPage, PublicHeader, sections)

### 1.1 Skip link

**Goal:** First tab stop jumps past hero chrome to main narrative content.

**Implementation:**

- In `LandingPage.tsx` (or a thin `LandingChrome.tsx` wrapper), render as the first focusable child:
  - `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] …">Skip to main content</a>`
- Add matching utility in `index.css` if you prefer a `.skip-link` class over repeating Tailwind (keep one pattern).
- Wrap `ImpactSection` through `ContactSection` in `<main id="main-content" tabIndex={-1}>` so programmatic focus after activate lands in the landmark (optional: `useEffect` on hash `#main-content` to `focus()` for consistency).

**Acceptance:** Keyboard-only user can reach first section in one activation; focus ring visible; no layout shift when link is not focused.

### 1.2 Section anchors + sticky sub-nav

**Goal:** History / Firm / Join / Contact orientation on long scroll.

**Implementation:**

- Assign stable ids on section roots (pick one wrapper per logical block):
  - **History** — first block in `FirmSection.tsx` (OUR HISTORY), e.g. `id="section-history"`.
  - **Firm** — roster / THE FIRM block, e.g. `id="section-firm"`.
  - **Join** — `RecruitmentSection.tsx`, e.g. `id="section-join"`.
  - **Contact** — `ContactSection.tsx`, e.g. `id="section-contact"`.
- New component `LandingSubNav.tsx` (or inside `PublicHeader`):
  - Links: `/#section-history`, etc. Use `<a href>` for hash navigation (works with Lenis if you call `lenis.scrollTo('#section-history')` on click **or** register Lenis with ScrollTrigger — verify scroll target after implementation).
  - **Sticky:** `fixed` or `sticky top-*` below the existing `PublicHeader` offset; `bg-bg/80 backdrop-blur`, `border-b border-border`, high `z-index` below modals.
  - **Scroll spy (optional v2):** `IntersectionObserver` on section ids to set `aria-current` on the active link; start with **plain anchor links only** to ship faster.

**Acceptance:** All four links scroll to correct sections on desktop and mobile; sticky bar does not obscure section headings (add `scroll-margin-top` on sections equal to header + sub-nav height).

### 1.3 PublicHeader touch targets

**Goal:** ~44×44px minimum for primary header actions.

**Files:** `PublicHeader.tsx`

**Implementation:**

- Wrap each `Link` in `inline-flex min-h-11 min-w-11 items-center justify-center px-2` (adjust horizontal padding so visual weight stays similar).
- Ensure logo/home link meets the same minimum.

**Acceptance:** Tap targets pass a quick mobile check; focus rings still visible.

### 1.4 Reduced motion + cursor

**Goal:** `prefers-reduced-motion: reduce` avoids custom cursor takeover and keeps system cursor.

**Files:** `LandingPage.tsx`, optionally `CustomCursor.tsx`

**Implementation:**

- Read `getPrefersReducedMotion()` (already used for Lenis).
- When true: **omit** `cursor-none` on the root wrapper; **do not render** `<CustomCursor />` (or render null inside `CustomCursor` when reduced motion).
- When false: keep current behavior.

**Acceptance:** With OS “reduce motion” on, landing uses default cursor and no Lenis; with it off, behavior unchanged.

---

## Phase 2 — Apply flow (`ApplyPage.tsx`)

### 2.1 Step progress + save status

**Goal:** Clear position in funnel and save feedback.

**Implementation:**

- Header area: `Step {activeStep + 1} of {STEPS.length}` + a thin `div` progress bar (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
- Near primary actions: compact status text — **Saving…** / **Saved** (with timestamp optional) / **Couldn’t save** tied to existing `saving` + `message` state.
- Use `aria-live="polite"` on the save status region so assistive tech announces completion.

**Acceptance:** User always sees which step they’re on; save errors are visible next to the action they use.

### 2.2 Validation timing + focus management

**Goal:** Blur validation for required fields; full validation on submit; focus first error.

**Implementation:**

- On **blur** of required inputs (`fullName`, `major`, `academicYear`, `whyMecg`): set field-level errors if empty or trivially invalid.
- On **submit**: run full validation; build ordered list of field refs or ids.
- First error: `element.focus()` and `element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })` gated with `getPrefersReducedMotion()` → `behavior: 'auto'` when reduced.
- Connect inputs to errors with `aria-invalid` and `aria-describedby` pointing to error id.

**Acceptance:** No error flash on first keystroke; submit lands focus on first problem field.

### 2.3 Resume URL hint

**Goal:** Reduce unusable links.

**Implementation:**

- Below `resumeUrl` label/input, one line muted helper text: e.g. “Use a link anyone can open (PDF or cloud) without signing in.”

**Acceptance:** Copy is visible in Links step only; no new validation required unless you add optional URL format check later.

---

## Phase 3 — Review (`ReviewPage.tsx`)

### 3.1 Empty states + error copy

**Goal:** One primary action per empty state; contextual explanation when `message` is set.

**Implementation:**

- `batch_empty`: primary button **Clear batch filter** → `setBatchFilter('all')` + optional `refreshQueue()`.
- `all_reviewed`: keep **Refresh queue**; ensure it’s the single emphasized button.
- `none_submitted`: optional link **Back to portal** or **View site** — only if it fits product; otherwise one line “Check back after the next application deadline.”
- When `message` is non-null: short **“Why am I seeing this?”** line (e.g. “The server returned an error loading applications.”) above or below the technical `message`, without duplicating noise.

**Acceptance:** Each empty state has an obvious next step; error UI is human-readable.

### 3.2 Batch filter: dropdown + custom

**Goal:** Fewer typos; keep power-user custom id.

**Implementation:**

- Add `useEffect` + Supabase query: `select('batch_id').from('applications')` with distinct batch ids (or RPC). If RLS blocks listing all batches, fall back to:
  - **Static list** from `import.meta.env.VITE_REVIEW_BATCH_IDS` (comma-separated) plus **Custom…**
- UI: `<select>` with known ids + option value `__custom__` that reveals existing text input, **or** datalist + text input.
- Preserve current `batchFilter` state shape (`'all' | string`).

**Acceptance:** Reviewers can pick from list or type; filter still syncs with query.

### 3.3 Live region for queue count

**Goal:** Screen readers hear progress after verdicts.

**Implementation:**

- Wrap “X left in queue” (or a dedicated one-line summary) in `<p aria-live="polite" aria-atomic="true" className="sr-only">` **or** visually shown region with `aria-live="polite"` (polite avoids interrupting mid-form).
- Update text when `queue.length` changes after `recordVerdict`.

**Acceptance:** VoiceOver/NVDA announces new count after a review action.

### 3.4 First-card swipe / keyboard hint

**Goal:** Dismissible affordance; respects reduced motion.

**Implementation:**

- Local state + `localStorage` key e.g. `mecg.review.swipeHint.dismissed`.
- Show small tooltip / callout **only** when `current` is first card in session and not dismissed and `queue.length > 0`.
- Copy: “Drag the card or use arrow keys: ← pass, → yes, ↑ maybe.”
- Dismiss: button + auto-dismiss after first verdict (optional).
- Animate with CSS or `motion` only when `!reduceMotion`; instant show/hide when reduced.

**Acceptance:** Does not reappear after dismiss; hidden when reduced motion and you choose instant presentation.

---

## Phase 4 — Portal shell & auth

### 4.1 Active route (`AppShell.tsx`)

**Goal:** Clear current destination for sighted users; correct semantics.

**Implementation:**

- React Router `NavLink` already sets `aria-current="page"` when active — **verify** in devtools for each route.
- Enhance **visual** active state if too subtle: e.g. bottom border `border-b-2 border-accent` or `text-accent` for active only.
- Mobile sheet: same `NavLink` classes so active state matches.

**Acceptance:** Active item obvious at a glance; `aria-current` present on portal routes.

### 4.2 Auth `aria-describedby` + focus (`LoginPage.tsx`, `SignupPage.tsx`, `ResetPasswordPage.tsx`)

**Goal:** Errors tied to fields; focus first invalid on failed submit.

**Implementation:**

- Each input: `id`, error span `id={`${id}-error`}`, `aria-invalid={!!error}`, `aria-describedby` when error present.
- On submit failure: `requestAnimationFrame` → focus first invalid field + `scrollIntoView({ block: 'nearest' })`.
- For global errors (e.g. wrong password), use `role="alert"` on the banner.

**Acceptance:** axe or manual screen reader pass shows association; focus moves predictably.

---

## Phase 5 — Global polish

### 5.1 Inline skeletons (Review / Apply)

**Goal:** Loading UI mirrors final layout.

**Files:** `ReviewPage.tsx` loading branch; `ApplyPage.tsx` loading branch.

**Implementation:**

- Reuse patterns from `PortalRouteSkeleton` / `src/components/skeletons/`: card-shaped block for review; form columns for apply.

**Acceptance:** No generic single bar where a card will appear.

### 5.2 Focus audit

**Goal:** No invisible keyboard traps.

**Implementation:**

- Grep `outline-none` without paired `focus-visible:` replacement.
- Check `FirmSection` tabs, `ReviewPage` drag card (ensure inner controls and verdict buttons remain focusable).
- Fix any regression.

**Acceptance:** Tab order logical on Review + Apply + landing sub-nav.

### 5.3 Lazy below-the-fold landing sections

**Goal:** Smaller initial JS for faster first paint.

**Files:** `LandingPage.tsx`

**Implementation:**

- `lazy(() => import('…'))` for `FirmSection`, `RecruitmentSection`, `ContactSection` (keep `HeroSection` + `ImpactSection` eager or lazy Impact only — measure).
- Wrap lazy chunks in `<Suspense fallback={<section className="min-h-[40vh] animate-pulse bg-ink/5" aria-hidden />}>`.

**Acceptance:** LCP improves or bundle split visible in build output; no layout jump flash (tune fallback min-height).

---

## Suggested order of execution

| Order | Phase | Rationale |
|------|--------|-----------|
| 1 | 1.1, 1.3, 1.4 | Low risk, immediate a11y wins |
| 2 | 1.2 | Needs section ids + scroll-margin tuning |
| 3 | 5.3 | Independent perf win |
| 4 | 2.x | Applicant funnel clarity |
| 5 | 3.x | Reviewer efficiency |
| 6 | 4.x | Portal consistency |
| 7 | 5.1, 5.2 | Polish pass |

---

## Risks & notes

- **Lenis + hash links:** If native hash scroll conflicts with Lenis, prefer `preventDefault` on sub-nav clicks and `lenis.scrollTo(target, { offset: -N })` with `N` = combined header heights.
- **Batch distinct query:** Confirm RLS allows reviewers to read `batch_id` list; otherwise env/static list is required.
- **`NavLink` + `aria-current`:** RR7 documents `aria-current` on active `NavLink` — treat visual enhancement as the main delta if already correct.

---

## Definition of done (whole plan)

- [ ] All new interactive targets meet ~44px where specified.
- [ ] `prefers-reduced-motion` respected for landing cursor, Lenis, and focus scroll behavior.
- [ ] No regressions: `bun run lint`, `bun run build`, spot-check keyboard on landing, Apply, Review, login.
