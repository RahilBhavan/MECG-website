import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lazy, Suspense, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import CustomCursor from "@/src/components/CustomCursor";
import HeroSection from "@/src/components/HeroSection";
import { LandingJsonLd } from "@/src/components/landing-json-ld.tsx";
import { Seo } from "@/src/components/seo.tsx";
import { usePrefersReducedMotion } from "@/src/hooks/use-prefers-reduced-motion";

const LandingMainLazy = lazy(() =>
	import("@/src/components/landing-main-lazy").then((m) => ({
		default: m.LandingMainLazy,
	})),
);

/** Offset for sticky sub-nav + safe top padding when scrolling to section anchors (taller on small screens when nav wraps). */
const NAV_SCROLL_OFFSET = -72;

function LandingMainFallback() {
	return (
		<div className="min-h-[50vh] animate-pulse border-t border-border bg-bg">
			<div className="h-12 border-b border-border bg-surface/60" />
			<div className="mx-auto max-w-7xl space-y-8 px-6 py-16">
				<div className="h-32 max-w-md rounded border border-border bg-surface/50" />
				<div className="h-64 rounded border border-border bg-surface/40" />
			</div>
		</div>
	);
}

/** Public marketing site (smooth scroll + custom cursor; reduced-motion users keep system cursor). */
export default function LandingPage() {
	const location = useLocation();
	const reduceMotion = usePrefersReducedMotion();
	const lenisRef = useRef<Lenis | null>(null);

	useEffect(() => {
		if (reduceMotion) return;

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
			orientation: "vertical",
			gestureOrientation: "vertical",
			smoothWheel: true,
			wheelMultiplier: 1,
			touchMultiplier: 2,
		});
		lenisRef.current = lenis;

		// Keep ScrollTrigger (GSAP) in sync with Lenis-driven scroll position.
		lenis.on("scroll", ScrollTrigger.update);

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		return () => {
			lenis.off("scroll", ScrollTrigger.update);
			lenis.destroy();
			lenisRef.current = null;
		};
	}, [reduceMotion]);

	const scrollToSection = useCallback(
		(sectionId: string) => {
			const el = document.getElementById(sectionId);
			if (!el) return;
			if (lenisRef.current) {
				lenisRef.current.scrollTo(el, { offset: NAV_SCROLL_OFFSET });
			} else {
				el.scrollIntoView({
					behavior: reduceMotion ? "auto" : "smooth",
					block: "start",
				});
			}
		},
		[reduceMotion],
	);

	/** First section lives in a lazy chunk; retry until the anchor mounts. */
	const scrollToSectionWithRetry = useCallback(
		(sectionId: string) => {
			const run = () => scrollToSection(sectionId);
			run();
			for (const ms of [80, 200, 500, 1200]) {
				setTimeout(run, ms);
			}
		},
		[scrollToSection],
	);

	/** Deep links: #section-* after lazy main mounts (retry for Suspense). */
	useEffect(() => {
		const id = location.hash.replace(/^#/, "");
		if (!id?.startsWith("section-")) return;

		const timers: ReturnType<typeof setTimeout>[] = [];
		const tryScroll = () => {
			if (!document.getElementById(id)) return;
			scrollToSection(id);
		};

		tryScroll();
		for (const ms of [80, 200, 500, 1200]) {
			timers.push(setTimeout(tryScroll, ms));
		}

		return () => {
			for (const t of timers) clearTimeout(t);
		};
	}, [location.hash, scrollToSection]);

	function handleSkipToMain(e: React.MouseEvent<HTMLAnchorElement>) {
		e.preventDefault();
		const mainEl = document.getElementById("main-content");
		if (!mainEl) return;
		if (lenisRef.current) {
			lenisRef.current.scrollTo(mainEl, { offset: NAV_SCROLL_OFFSET });
		} else {
			mainEl.scrollIntoView({
				behavior: reduceMotion ? "auto" : "smooth",
				block: "start",
			});
		}
		window.requestAnimationFrame(() => {
			mainEl.focus({ preventScroll: true });
		});
	}

	return (
		<div
			className={`bg-bg text-ink min-h-dvh-screen selection:bg-accent selection:text-bg ${reduceMotion ? "" : "cursor-none"}`}
		>
			<Seo
				title="MECG — Michigan Economics Consulting Group"
				description="Selective economics consulting community at the University of Michigan. Apply, connect with alumni, and access member tools."
				pathname="/"
			/>
			<LandingJsonLd />
			{!reduceMotion ? <CustomCursor /> : null}
			<a href="#main-content" className="skip-link" onClick={handleSkipToMain}>
				Skip to main content
			</a>
			<HeroSection
				onScrollToImpact={() => {
					scrollToSectionWithRetry("section-impact");
				}}
			/>
			<main
				id="main-content"
				tabIndex={-1}
				className="outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
			>
				<Suspense fallback={<LandingMainFallback />}>
					<LandingMainLazy onNavigate={scrollToSection} />
				</Suspense>
			</main>
		</div>
	);
}
