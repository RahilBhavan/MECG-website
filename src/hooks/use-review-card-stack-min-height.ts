import { type RefObject, useEffect, useMemo, useState } from "react";
import {
	measureReviewCardContentMinHeightPx,
	textMaxWidthFromCardRoot,
} from "@/src/lib/review-card-text-metrics";
import type { ApplicationAnswers } from "@/src/types/database";

const REVIEW_STACK_MIN_FALLBACK_PX = 380;
/** Preview card uses `inset-x-4` — text column is ~2× 1rem narrower than the front card */
const PREVIEW_INSET_X_TOTAL_PX = 32;

/**
 * Min-height for the review deck column so the front card and (optional) stacked preview
 * stay stable; uses @chenglou/pretext off-DOM measurement + ResizeObserver + `document.fonts.ready`.
 */
export function useReviewCardStackMinHeight(
	currentAnswers: ApplicationAnswers,
	nextAnswers: ApplicationAnswers | null,
	cardContentRef: RefObject<HTMLElement | null>,
): number {
	const [textMaxWidthPx, setTextMaxWidthPx] = useState(0);
	const [fontEpoch, setFontEpoch] = useState(0);

	useEffect(() => {
		const el = cardContentRef.current;
		if (!el) return;

		const measure = () => {
			setTextMaxWidthPx(textMaxWidthFromCardRoot(el));
		};

		measure();
		const ro = new ResizeObserver(() => measure());
		ro.observe(el);
		return () => ro.disconnect();
	}, [cardContentRef]);

	useEffect(() => {
		if (typeof document === "undefined") return;
		void document.fonts.ready.then(() => setFontEpoch((n) => n + 1));
	}, []);

	return useMemo(() => {
		void fontEpoch;
		if (textMaxWidthPx <= 0) return REVIEW_STACK_MIN_FALLBACK_PX;

		const front = measureReviewCardContentMinHeightPx(
			currentAnswers,
			textMaxWidthPx,
		);
		const backWidth = Math.max(0, textMaxWidthPx - PREVIEW_INSET_X_TOTAL_PX);
		const back = nextAnswers
			? measureReviewCardContentMinHeightPx(nextAnswers, backWidth)
			: 0;

		return Math.max(REVIEW_STACK_MIN_FALLBACK_PX, front, back);
	}, [currentAnswers, nextAnswers, textMaxWidthPx, fontEpoch]);
}
