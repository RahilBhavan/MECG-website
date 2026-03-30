import {
	type RefObject,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { PrepareOptions } from "@/src/lib/pretext-shrink-wrap";
import {
	findBalancedMaxWidthPx,
	prepareShrinkWrapText,
} from "@/src/lib/pretext-shrink-wrap";

export type UseBalancedTextMaxWidthOpts = {
	text: string;
	font: string;
	prepareOptions?: PrepareOptions;
	minWidthPx: number;
	/** Upper bound when container is unknown or wider than this (e.g. Tailwind `max-w-2xl`). */
	maxWidthCapPx: number;
	scopeRef: RefObject<HTMLElement | null>;
	stepPx?: number;
};

/**
 * Computes a `max-width` (px) that minimizes line-width variance via Pretext
 * `walkLineRanges` — Phase 3 “balanced rag”. Re-runs on resize, fonts ready, and
 * when `font` / `text` change.
 */
export function useBalancedTextMaxWidth({
	text,
	font,
	prepareOptions,
	minWidthPx,
	maxWidthCapPx,
	scopeRef,
	stepPx = 14,
}: UseBalancedTextMaxWidthOpts): number | null {
	const [widthPx, setWidthPx] = useState<number | null>(null);
	const [fontEpoch, setFontEpoch] = useState(0);
	const rafRef = useRef<number | undefined>(undefined);

	const prepared = useMemo(
		() => prepareShrinkWrapText(text, font, prepareOptions),
		[text, font, prepareOptions],
	);

	useEffect(() => {
		if (typeof document === "undefined") return;
		void document.fonts.ready.then(() => setFontEpoch((n) => n + 1));
	}, []);

	useLayoutEffect(() => {
		void fontEpoch;

		if (!prepared) {
			setWidthPx(null);
			return;
		}

		const run = () => {
			const el = scopeRef.current;
			const bound = el
				? Math.min(maxWidthCapPx, Math.max(1, Math.floor(el.clientWidth)))
				: maxWidthCapPx;
			if (bound < minWidthPx) {
				setWidthPx(null);
				return;
			}
			setWidthPx(
				findBalancedMaxWidthPx(prepared, {
					minWidthPx,
					maxWidthPx: bound,
					stepPx,
				}),
			);
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
		const el = scopeRef.current;
		if (!el)
			return () => {
				if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
			};

		const ro = new ResizeObserver(schedule);
		ro.observe(el);
		return () => {
			ro.disconnect();
			if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
		};
	}, [prepared, minWidthPx, maxWidthCapPx, stepPx, scopeRef, fontEpoch]);

	return widthPx;
}
