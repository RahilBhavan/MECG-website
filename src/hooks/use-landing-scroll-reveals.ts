import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useLayoutEffect } from "react";

import { getPrefersReducedMotion } from "@/src/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger);

export type LandingRevealOpts = {
	y?: number;
	duration?: number;
	stagger?: number;
	/** ScrollTrigger start string, e.g. `top 80%` */
	start?: string;
};

const defaultUp: Required<LandingRevealOpts> = {
	y: 48,
	duration: 0.9,
	stagger: 0.11,
	start: "top 80%",
};

const defaultStagger: Required<LandingRevealOpts> = {
	y: 28,
	duration: 0.62,
	stagger: 0.045,
	start: "top 86%",
};

/**
 * Staggered fade/slide for `.reveal-up` descendants when the scoped section enters view.
 * Marketing-only; gate callers with reduced-motion checks if needed (handled inside).
 */
export function useRevealUp(
	scopeRef: RefObject<HTMLElement | null>,
	opts: LandingRevealOpts = {},
): void {
	const y = opts.y ?? defaultUp.y;
	const duration = opts.duration ?? defaultUp.duration;
	const stagger = opts.stagger ?? defaultUp.stagger;
	const start = opts.start ?? defaultUp.start;

	useLayoutEffect(() => {
		const root = scopeRef.current;
		if (!root) return;
		const nodes = root.querySelectorAll(".reveal-up");
		if (!nodes.length) return;

		if (getPrefersReducedMotion()) {
			gsap.set(nodes, { opacity: 1, y: 0, clearProps: "transform,opacity" });
			return;
		}

		const ctx = gsap.context(() => {
			gsap.fromTo(
				nodes,
				{ y, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration,
					stagger,
					ease: "power3.out",
					scrollTrigger: {
						trigger: root,
						start,
						toggleActions: "play none none none",
					},
				},
			);
		}, root);

		return () => ctx.revert();
	}, [scopeRef, y, duration, stagger, start]);
}

/**
 * Stagger children (e.g. timeline rows) when `containerRef` hits the viewport.
 * Pass `revalidateKey` when list DOM changes (e.g. firm tab) so ScrollTriggers rebuild.
 */
export function useRevealStaggerChildren(
	containerRef: RefObject<HTMLElement | null>,
	itemSelector: string,
	opts: LandingRevealOpts = {},
	revalidateKey?: string | number,
): void {
	const y = opts.y ?? defaultStagger.y;
	const duration = opts.duration ?? defaultStagger.duration;
	const stagger = opts.stagger ?? defaultStagger.stagger;
	const start = opts.start ?? defaultStagger.start;

	// biome-ignore lint/correctness/useExhaustiveDependencies: revalidateKey remounts ScrollTriggers when roster tab replaces list DOM
	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const nodes = el.querySelectorAll(itemSelector);
		if (!nodes.length) return;

		if (getPrefersReducedMotion()) {
			gsap.set(nodes, { opacity: 1, y: 0, clearProps: "transform,opacity" });
			return;
		}

		const ctx = gsap.context(() => {
			gsap.fromTo(
				nodes,
				{ y, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration,
					stagger,
					ease: "power2.out",
					scrollTrigger: {
						trigger: el,
						start,
						toggleActions: "play none none none",
					},
				},
			);
		}, el);

		return () => ctx.revert();
	}, [containerRef, itemSelector, y, duration, stagger, start, revalidateKey]);
}
