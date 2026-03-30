import {
	type PreparedTextWithSegments,
	type PrepareOptions,
	prepareWithSegments,
} from "@chenglou/pretext";

export type { PrepareOptions };

/** Pretext options that match browser textarea wrapping (spaces + `\n`). */
export const TEXTAREA_PRE_WRAP: PrepareOptions = { whiteSpace: "pre-wrap" };

/**
 * Prepare textarea value for layout — does **not** trim (unlike shrink-wrap copy).
 */
export function prepareTextareaText(
	text: string,
	font: string,
	options?: PrepareOptions,
): PreparedTextWithSegments | null {
	if (typeof document === "undefined") return null;
	return prepareWithSegments(text, font, { ...TEXTAREA_PRE_WRAP, ...options });
}

/** Canvas `font` string aligned with the textarea’s computed styles. */
export function canvasFontFromTextarea(el: HTMLTextAreaElement): string {
	const cs = getComputedStyle(el);
	const style =
		cs.fontStyle && cs.fontStyle !== "normal" ? `${cs.fontStyle} ` : "";
	return `${style}${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`.trim();
}

/** Inner width available for wrapping (matches Pretext width pass). */
export function textareaContentWidthPx(el: HTMLTextAreaElement): number {
	const cs = getComputedStyle(el);
	const pl = Number.parseFloat(cs.paddingLeft) || 0;
	const pr = Number.parseFloat(cs.paddingRight) || 0;
	return Math.max(1, Math.floor(el.clientWidth - pl - pr));
}
