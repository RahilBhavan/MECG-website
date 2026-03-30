# Marketing layout & rhythm

Short reference for the public landing page. Pair with [color-system.md](./color-system.md) and [accessibility.md](./accessibility.md).

## Composition: alternating full-bleed and inset

We use **inset rails** (`max-w-7xl mx-auto px-6`) for typography-led blocks and **full-bleed bands** for horizontal media, dense lists, or timeline/FAQ density so the page breathes in chapters.

| Block | Pattern | Vertical rhythm |
|-------|---------|-----------------|
| Impact intro + pillars | Inset | Tight (`py-24` / `md:py-28`) |
| Impact case-study strip | **Full-bleed** (edge-to-edge scroll) | Inside tight section |
| Firm (history, president, roster) | Inset | Loose (`py-32` / `md:py-40`) |
| Recruitment pitch | Inset | Tight |
| Timeline + FAQs | **Full-bleed** band (`bg-surface/*`, borders) | Inside tight section |
| Contact | Inset | Loose |

Utility: `.marketing-full-bleed` in `src/index.css` breaks out of the content column to viewport width without breaking horizontal scroll.

## Hero: typography first, canvas quiet

Motion prefers **strong display type** (Playfair, `.type-marketing-hero` / `.text-massive`) over spectacle. WebGL is **atmosphere**: lower emissive/line opacity and a light `bg` scrim over the canvas so copy stays the focal point. `prefers-reduced-motion: reduce` uses the same tokenized radial mesh and surfaces—no “empty” fallback.

## Accent & type scale

- **Accent**: CTAs, `[nn]` kickers, active nav, one hero punctuation mark—not long copy. See color-system “Accent”.
- **Marketing utilities**: `.type-marketing-hero`, `.type-marketing-section`, `.type-marketing-display-xl`, `.type-marketing-kicker` in `src/index.css` keep section titles aligned across Impact, Firm, Recruitment, Contact.

## Portal vs marketing

Editorial rules apply to **landing only**. Auth, alumni portal, and **review** stay utilitarian: system cursor, obvious focus, ~44px primary actions, verdict labels **plus** icons for non-color cues.
