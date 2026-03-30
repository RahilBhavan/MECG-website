# Token → Tailwind mapping

Defined in `src/index.css` inside `@theme { ... }`. Tailwind 4 generates utilities from `--color-{name}`.

## Typography (two typefaces)

| Role | Family | How |
|------|--------|-----|
| Display | **Playfair Display** | `font-display`, `.text-massive`, `.type-portal-title`, `.type-auth-title` |
| UI + labels | **Inter** | `font-sans` (default `body`), `.text-technical`, `.font-data` |

Google Fonts in [`index.html`](../../index.html) load **only** Playfair + Inter. `font-mono` in Tailwind resolves to Inter so no accidental third face.

## Surfaces

| CSS variable | Example utilities |
|----------------|-------------------|
| `--color-bg` | `bg-bg`, `text-bg` (e.g. text on accent button) |
| `--color-bg-raised` | `bg-bg-raised` |
| `--color-surface` | `bg-surface` |

## Text

| CSS variable | Example utilities |
|----------------|-------------------|
| `--color-ink` | `text-ink`, `border-ink` |
| `--color-ink-secondary` | `text-ink-secondary` |
| `--color-muted` | `text-muted` |

## Borders

| CSS variable | Example utilities |
|----------------|-------------------|
| `--color-border` | `border-border` |
| `--color-border-strong` | `border-border-strong` |

## Accent

| CSS variable | Example utilities |
|----------------|-------------------|
| `--color-accent` | `text-accent`, `border-accent`, `bg-accent` |
| `--color-accent-hover` | `text-accent-hover`, `border-accent-hover`, `bg-accent-hover` |
| `--color-accent-muted` | `bg-accent-muted`, `border-accent-muted` |

## Semantic

| CSS variable | Example utilities |
|----------------|-------------------|
| `--color-success` | `text-success`, `border-success` |
| `--color-success-bg` | `bg-success-bg` |
| `--color-warning` | `text-warning`, `border-warning` |
| `--color-warning-bg` | `bg-warning-bg` |
| `--color-danger` | `text-danger`, `border-danger` |
| `--color-danger-bg` | `bg-danger-bg` |

## Focus

| CSS variable | Example utilities |
|----------------|-------------------|
| `--color-focus-ring` | `outline-focus-ring` (e.g. `focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus-ring`) |

## Opacity modifiers

Where appropriate, use Tailwind opacity on token colors, e.g. `bg-ink/10` for a light wash on dark (nav active state).

## WebGL / Canvas

Duplicate hex values for Three.js and similar live in `src/lib/brand-colors.ts`. **When you change `@theme` colors, update that file in the same commit** (see file header comment).
