# MECG color system

Palette is **dark-first**, **institution-neutral**, and built for **consulting / editorial** credibility. One signature **muted copper** accent differentiates the brand from generic AI or SaaS aesthetics. Neutrals are **lifted slightly** from pure black so the UI reads fresher while staying editorial.

## Surfaces

| Token | Hex | Role |
|-------|-----|------|
| `bg` | `#111111` | Default page background |
| `bg-raised` | `#181818` | Slightly lifted areas (nav active wash, stacked depth) |
| `surface` | `#212121` | Cards, inset panels, dense UI blocks |

## Text

| Token | Hex | Role |
|-------|-----|------|
| `ink` | `#fafafa` | Primary text, primary buttons on accent fill |
| `ink-secondary` | `#e5e5e5` | Secondary emphasis, strong labels |
| `muted` | `#b8b8b8` | Supporting copy, placeholders (meets ~4.5:1 on `bg` for body-sized text) |

## Borders

| Token | Hex | Role |
|-------|-----|------|
| `border` | `#404040` | Default hairline / panel borders |
| `border-strong` | `#5c5c5c` | Hover / emphasis on borders |

## Accent (brand)

| Token | Hex | Role |
|-------|-----|------|
| `accent` | `#c9a962` | Primary CTA borders/text, selection tint, key links |
| `accent-hover` | `#e2c77e` | Hover state for accent controls |
| `accent-muted` | `#352e1f` | Low-contrast accent wash (chips, subtle fills) |

**Do:** Use accent for primary actions, active step indicators, and critical links on marketing.  
**Don’t:** Fill large paragraphs with accent-colored text without a contrast check.

## Semantic (status & reviewer)

Used for toasts, form errors, confirmation states, and **review verdict** affordances. Background tokens are tuned for overlays on `bg`.

| Token | Hex | Role |
|-------|-----|------|
| `success` | `#86efac` | Positive text / icons on dark |
| `success-bg` | `#1a3228` | Tinted background (e.g. submitted, Yes verdict strip) |
| `warning` | `#fde68a` | Caution text / Maybe verdict |
| `warning-bg` | `#352f14` | Tinted background for warning |
| `danger` | `#fca5a5` | Error / Pass verdict / destructive hints |
| `danger-bg` | `#321a1e` | Tinted background for danger |

## Focus

| Token | Hex | Role |
|-------|-----|------|
| `focus-ring` | `#e8e8e8` | `:focus-visible` outline (high visibility on dark UI) |

## Implementation note

All of the above are defined as `--color-*` in `src/index.css` `@theme`. Tailwind 4 maps them to utilities such as `bg-bg`, `text-muted`, `border-border`, `text-accent`, `bg-success-bg`, etc. See [tokens-reference.md](./tokens-reference.md).

**shadcn/ui bridge** (`--color-background`, `--color-primary`, `--color-secondary`, …) lives in the same `@theme` block. Brand **`accent`** and body **`muted`** are not overridden by shadcn slots so `text-accent` / `border-accent` stay copper and `text-muted` stays supporting gray. Outline/ghost **Button** hovers use `secondary`, not a second `accent` token.

**Layout (marketing)** — full-bleed vs inset chapters and vertical rhythm: [layout-marketing.md](./layout-marketing.md).
