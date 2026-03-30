# MECG accessibility — color & focus

Targets **WCAG 2.2** contrast for text where applicable. Non-text UI (focus rings, some borders) follows **focus appearance** guidance: visible 2px outline with sufficient adjacency contrast.

## Text contrast (approximate ratios on `#111111`)

Ratios are computed for **normal** text unless noted. Use as regression guidance when changing tokens. Slightly lower than on pure `#000` / `#0a0a0a`, but the same foreground tokens remain in a safe band.

| Foreground | On `#111111` | ~Ratio | AA normal (4.5:1) |
|------------|----------------|--------|-------------------|
| `#fafafa` (ink) | bg | ~18:1 | Pass |
| `#e5e5e5` (ink-secondary) | bg | ~15:1 | Pass |
| `#b8b8b8` (muted) | bg | ~8:1 | Pass |
| `#c9a962` (accent) | bg | ~7:1 | Pass (large body only—prefer accent for UI chrome, not long copy) |
| `#86efac` (success) | bg | ~11:1 | Pass |
| `#fde68a` (warning) | bg | ~14:1 | Pass |
| `#fca5a5` (danger) | bg | ~8:1 | Pass |

**Accent on accent-muted** (`#c9a962` on `#352e1f`): use for chips and small labels; avoid long paragraphs.

## Focus

- Global `:focus-visible` uses `--color-focus-ring` (`#e8e8e8`) at **2px** solid outline, **2px** offset.
- Do not remove focus outlines on portal or auth routes without replacing them with an equivalent visible indicator.

## Reviewer & portal

- Primary actions (Pass / Maybe / Yes, undo, submit) must remain **at least ~44×44px** touch targets on small viewports.
- Semantic colors for verdicts use **tokenized** foreground + background pairs so states remain distinguishable for color-blind users when combined with **labels** (already present in copy).
- Verdict controls pair **text labels** with **icons** (e.g. dismiss, uncertain, confirm) so meaning does not rely on hue alone.

## When you change the palette

Re-run spot checks: login form, review deck, toast variants, and one marketing section. Update the table above if hex values change.
