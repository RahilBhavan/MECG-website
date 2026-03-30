# MECG design philosophy

## Positioning

MECG presents as a **serious, selective economics consulting community**: analytical rigor, clarity, and craft—not a generic startup landing or social app. The visual system should feel like a **night studio with precision instruments**: dark surfaces, crisp structure, and a single warm accent for human emphasis.

## Core principles

1. **Tokens before decoration** — Color, type, and spacing come from the shared token set. Avoid one-off hex values in components.
2. **One accent, used with discipline** — Muted mineral copper carries brand warmth. It signals primary actions, key links, and highlights—not every heading or paragraph.
3. **Typography carries hierarchy (two families only)** — **Playfair Display** for display headlines, quotes, and hero mass type; **Inter** for everything else, including “technical” labels (uppercase, tracked, medium weight via `.text-technical`). Use **tabular numerals** (`font-data` or `tabular-nums`) for IDs and tables—never a third webfont.
4. **Spatial intent** — Marketing pages may use **asymmetry, overlap, and grid breaks** for memorability. Portal, auth, and reviewer flows favor **predictable layout, obvious hierarchy, and fast scanning**.
5. **Motion with consent** — Rich scroll and hero motion belong on the **landing** experience only. Respect `prefers-reduced-motion`. Never delay reviewer verdicts or form submission for animation.

## Marketing vs application surfaces

| Surface | Cursor | Motion | Visual density |
|---------|--------|--------|----------------|
| Landing and public sections | Custom cursor allowed (`cursor-none` + custom cursor) | Lenis, GSAP, 3D hero as implemented | Higher drama, large type, borders as graphic device |
| Login, signup, reset password | **System cursor only** | Subtle transitions only | Restrained; focus on forms and errors |
| Review deck, alumni portal, admin | **System cursor only** | Subtle only; no long timelines | Functional panels, large tap targets (~44×44px minimum for primary actions) |

## Do / don’t

**Do**

- Use semantic colors for status (success, warning, danger) in reviewer and form feedback.
- Keep focus rings visible and consistent (`:focus-visible` uses the shared focus token).
- Test primary flows on mobile for tap target size and contrast.

**Don’t**

- Apply purple-gradient-on-white or interchangeable three-column “feature” grids without brand rationale.
- Hide the system cursor or run heavy cursor effects on auth or portal routes.
- Use the accent color for long body text unless contrast has been verified (see accessibility.md).

## Alternative accent (documented only)

If the brand ever shifts cooler, a **glacial teal** could replace copper in tokens only—without changing structure. The current shipped accent is **muted copper** (see color-system.md).
