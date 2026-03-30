import {
	type PreparedTextWithSegments,
	type PrepareOptions,
	prepareWithSegments,
	walkLineRanges,
} from "@chenglou/pretext";

export type { PrepareOptions };

/**
 * Line widths at a given max width (Pretext `walkLineRanges` — no DOM).
 */
export function lineWidthsAtWidthPx(
	prepared: PreparedTextWithSegments,
	maxWidthPx: number,
): number[] {
	const widths: number[] = [];
	if (maxWidthPx <= 0) return widths;
	walkLineRanges(prepared, maxWidthPx, (line) => {
		widths.push(line.width);
	});
	return widths;
}

/** Population variance of line widths; lower = more even rag. */
export function lineWidthVariance(widths: number[]): number {
	if (widths.length <= 1) return 0;
	const mean = widths.reduce((a, b) => a + b, 0) / widths.length;
	return widths.reduce((s, x) => s + (x - mean) ** 2, 0) / widths.length;
}

export type BalancedWidthSearchOpts = {
	minWidthPx: number;
	maxWidthPx: number;
	/** Pixel step along [min, max]; ~12–16 is a good tradeoff vs work. */
	stepPx: number;
};

/**
 * Scan widths and pick one with lowest line-width variance (balanced rag).
 * On equal scores, prefers the wider measure for readability.
 */
export function findBalancedMaxWidthPx(
	prepared: PreparedTextWithSegments,
	opts: BalancedWidthSearchOpts,
): number {
	const { minWidthPx, maxWidthPx, stepPx } = opts;
	if (maxWidthPx <= 0) return minWidthPx;
	const lo = Math.max(1, Math.floor(minWidthPx));
	const hi = Math.max(lo, Math.floor(maxWidthPx));
	const step = Math.max(1, Math.floor(stepPx));

	let bestW = hi;
	let bestScore = Number.POSITIVE_INFINITY;

	for (let w = lo; w <= hi; w += step) {
		const widths = lineWidthsAtWidthPx(prepared, w);
		if (widths.length === 0) continue;
		// Prefer multi-line rag; single-line at huge max-width would otherwise “win” with variance 0.
		const score = widths.length === 1 ? 1e9 - w : lineWidthVariance(widths);
		if (score < bestScore - 1e-9) {
			bestScore = score;
			bestW = w;
		} else if (Math.abs(score - bestScore) < 1e-9 && w > bestW) {
			bestW = w;
		}
	}

	return bestW;
}

/**
 * Line count at `maxWidthPx` (same breaks as `layoutWithLines` width pass).
 */
export function lineCountAtWidthPx(
	prepared: PreparedTextWithSegments,
	maxWidthPx: number,
): number {
	if (maxWidthPx <= 0) return 0;
	return walkLineRanges(prepared, maxWidthPx, () => {});
}

/**
 * Largest width in `[minWidthPx, maxWidthPx]` such that the paragraph uses at most
 * `maxLines` lines (binary search). Useful for “keep this pull quote to N lines”.
 */
export function findWidestWidthForMaxLinesPx(
	prepared: PreparedTextWithSegments,
	maxLines: number,
	minWidthPx: number,
	maxWidthPx: number,
): number {
	if (maxLines < 1 || maxWidthPx <= 0) return minWidthPx;
	let lo = Math.max(1, Math.floor(minWidthPx));
	let hi = Math.max(lo, Math.floor(maxWidthPx));
	let ans = lo;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		const lines = lineCountAtWidthPx(prepared, mid);
		if (lines <= maxLines) {
			ans = mid;
			lo = mid + 1;
		} else {
			hi = mid - 1;
		}
	}
	return ans;
}

export function prepareShrinkWrapText(
	text: string,
	font: string,
	options?: PrepareOptions,
): PreparedTextWithSegments | null {
	if (typeof document === "undefined") return null;
	const t = text.trim();
	if (!t) return null;
	return prepareWithSegments(t, font, options);
}
