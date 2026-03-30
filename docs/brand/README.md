# MECG brand packet

This folder is the single source for **design philosophy** and **color meaning**. Implementation lives in code so the site and this documentation stay aligned.

## Contents

| Document | What it covers |
|----------|----------------|
| [design-philosophy.md](./design-philosophy.md) | Voice, composition, marketing vs portal, motion and cursor rules |
| [color-system.md](./color-system.md) | Palette ramps, semantic colors, accent usage, do / don’t |
| [accessibility.md](./accessibility.md) | Contrast targets (WCAG AA), focus ring, when accent is decorative only |
| [tokens-reference.md](./tokens-reference.md) | CSS variables to Tailwind utility mapping |

## How to use this packet

1. **Design or content decisions** — Start with design-philosophy (tone and layout intent), then color-system for application surfaces.
2. **Implementation** — Add or change tokens in [`src/index.css`](../../src/index.css) `@theme` first; mirror any new hex in [`src/lib/brand-colors.ts`](../../src/lib/brand-colors.ts) when WebGL/canvas need the same values (see comment in that file).
3. **Components** — Prefer semantic utilities (`border-border`, `text-ink`, `bg-surface`) over raw hex or generic Tailwind colors (`green-500`).
4. **Type** — At most **two** webfonts: Inter + Playfair. Labels use `.text-technical` (Inter, tracked caps); IDs use `.font-data` or `tabular-nums`.

## Canonical code paths

- **Theme tokens:** `src/index.css` (`@theme { ... }`)
- **Shared hex for 3D / Canvas:** `src/lib/brand-colors.ts`
