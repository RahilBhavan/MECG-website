import { type RefObject, useLayoutEffect, useState } from "react";
import { lineCountAtWidthPx } from "@/src/lib/pretext-shrink-wrap";
import {
	canvasFontFromTextarea,
	type PrepareOptions,
	prepareTextareaText,
	textareaContentWidthPx,
} from "@/src/lib/pretext-textarea-layout";

export type UsePretextTextareaRowsOpts = {
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	value: string;
	minRows?: number;
	maxRows?: number;
	prepareOptions?: PrepareOptions;
};

/**
 * Row count from Pretext `walkLineRanges` at the textarea’s content width (`pre-wrap`).
 * Caps height for long answers; re-measures on resize and `document.fonts.ready`.
 */
export function usePretextTextareaRows({
	textareaRef,
	value,
	minRows = 6,
	maxRows = 24,
	prepareOptions,
}: UsePretextTextareaRowsOpts): number {
	const [rows, setRows] = useState(minRows);
	const [fontEpoch, setFontEpoch] = useState(0);

	useLayoutEffect(() => {
		if (typeof document === "undefined") return;
		void document.fonts.ready.then(() => setFontEpoch((n) => n + 1));
	}, []);

	useLayoutEffect(() => {
		void fontEpoch;

		const el = textareaRef.current;
		if (!el) {
			setRows(minRows);
			return;
		}

		const rafRef = { current: undefined as number | undefined };

		const run = () => {
			const ta = textareaRef.current;
			if (!ta) {
				setRows(minRows);
				return;
			}

			/* Hidden panels (e.g. `display: none`) report 0 width — skip Pretext or line count explodes. */
			if (ta.getClientRects().length === 0 || ta.clientWidth < 32) {
				setRows(minRows);
				return;
			}

			if (!value) {
				setRows(minRows);
				return;
			}

			const font = canvasFontFromTextarea(ta);
			const prepared = prepareTextareaText(value, font, prepareOptions);
			if (!prepared) {
				setRows(minRows);
				return;
			}

			const w = textareaContentWidthPx(ta);
			const lineCount = lineCountAtWidthPx(prepared, w);
			const next = Math.min(
				maxRows,
				Math.max(minRows, lineCount > 0 ? lineCount : minRows),
			);
			setRows(next);
		};

		const schedule = () => {
			if (rafRef.current !== undefined) {
				cancelAnimationFrame(rafRef.current);
			}
			rafRef.current = requestAnimationFrame(() => {
				rafRef.current = undefined;
				run();
			});
		};

		schedule();

		const ro = new ResizeObserver(schedule);
		ro.observe(el);

		return () => {
			ro.disconnect();
			if (rafRef.current !== undefined) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [value, minRows, maxRows, prepareOptions, textareaRef, fontEpoch]);

	return rows;
}
