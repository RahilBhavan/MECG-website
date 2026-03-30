/**
 * Canvas `font` strings and line heights aligned with reviewer card CSS
 * (`ReviewPage` `CardContent`): Tailwind `text-2xl font-display`, `.text-technical`,
 * `font-sans font-light leading-relaxed whitespace-pre-wrap`.
 *
 * Uses **named families** (Inter, Playfair Display) per @chenglou/pretext — avoid
 * measuring with `system-ui` alone on macOS.
 *
 * @see https://github.com/chenglou/pretext
 */
export const REVIEW_CARD_NAME_FONT = '400 24px "Playfair Display"';
/** Tailwind default `text-2xl` line-height: 2rem at 16px root */
export const REVIEW_CARD_NAME_LINE_HEIGHT_PX = 32;

export const REVIEW_CARD_META_FONT = '500 11px "Inter"';
/** `.text-technical` (11px) × body `--leading-body` (1.68) */
export const REVIEW_CARD_META_LINE_HEIGHT_PX = Math.round(11 * 1.68);

export const REVIEW_CARD_BODY_FONT = '300 16px "Inter"';
/** `leading-relaxed` (1.625) × 16px */
export const REVIEW_CARD_BODY_LINE_HEIGHT_PX = 26;

export const REVIEW_CARD_LINK_FONT = REVIEW_CARD_META_FONT;
export const REVIEW_CARD_LINK_LINE_HEIGHT_PX = REVIEW_CARD_META_LINE_HEIGHT_PX;

/** Tailwind `space-y-4` */
export const REVIEW_CARD_STACK_GAP_PX = 16;
/** `p-6` vertical padding (top + bottom) */
export const REVIEW_CARD_PADDING_Y_PX = 48;
/** Headshot box `h-28` */
export const REVIEW_CARD_HEADSHOT_PX = 112;
