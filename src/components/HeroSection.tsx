import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import {
	type ComponentType,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Link } from "react-router-dom";

import type { HeroWebGLCanvasProps } from "@/src/components/hero-section-webgl";
import PublicHeader from "@/src/components/PublicHeader";
import { getPrefersReducedMotion } from "@/src/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger);

type HeroWebGLCanvasComponent = ComponentType<HeroWebGLCanvasProps>;

function scheduleHeroWebGLImport(
	onReady: (C: HeroWebGLCanvasComponent) => void,
): () => void {
	let cancelled = false;
	const load = () => {
		void import("@/src/components/hero-section-webgl").then((m) => {
			if (!cancelled) onReady(m.HeroWebGLCanvas);
		});
	};

	const ric = window.requestIdleCallback?.(load, { timeout: 2800 });
	if (ric == null) {
		queueMicrotask(load);
		return () => {
			cancelled = true;
		};
	}
	return () => {
		cancelled = true;
		window.cancelIdleCallback?.(ric);
	};
}

type HeroSectionProps = {
	/** Scrolls to the first main section (Impact); uses parent Lenis offset when present. */
	onScrollToImpact?: () => void;
};

export default function HeroSection({ onScrollToImpact }: HeroSectionProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const h1Ref = useRef<HTMLHeadingElement>(null);
	const subcopyRef = useRef<HTMLParagraphElement>(null);
	const scrollProgressRef = useRef<number>(0);
	const [reduceMotion, setReduceMotion] = useState(() =>
		getPrefersReducedMotion(),
	);
	const [WebGLCanvas, setWebGLCanvas] =
		useState<HeroWebGLCanvasComponent | null>(null);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onChange = () => setReduceMotion(mq.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		if (reduceMotion) {
			setWebGLCanvas(null);
			return;
		}
		// Must wrap: passing a function to setState is interpreted as an updater, not a component ref.
		return scheduleHeroWebGLImport((C) => setWebGLCanvas(() => C));
	}, [reduceMotion]);

	useLayoutEffect(() => {
		if (reduceMotion) return;
		const h1 = h1Ref.current;
		const sub = subcopyRef.current;
		if (!h1) return;

		const lines = h1.querySelectorAll(".hero-enter-line");
		const ctx = gsap.context(() => {
			gsap.fromTo(
				lines,
				{ y: 36, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 0.85,
					stagger: 0.12,
					ease: "power3.out",
					delay: 0.15,
				},
			);
			if (sub) {
				gsap.fromTo(
					sub,
					{ y: 24, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.7,
						ease: "power3.out",
						delay: 0.55,
					},
				);
			}
		}, h1);

		return () => ctx.revert();
	}, [reduceMotion]);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section || reduceMotion) return;

		const ctx = gsap.context(() => {
			const canvasEl = canvasContainerRef.current;
			if (!canvasEl) return;

			gsap.to(canvasEl, {
				yPercent: 16,
				ease: "none",
				scrollTrigger: {
					trigger: section,
					start: "top top",
					end: "bottom top",
					scrub: true,
					onUpdate: (self) => {
						scrollProgressRef.current = self.progress;
					},
				},
			});
		}, section);

		return () => {
			ctx.revert();
			scrollProgressRef.current = 0;
		};
	}, [reduceMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative flex h-[100dvh] max-h-[100dvh] min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden"
		>
			{/* Warm center wash — static; WebGL (when loaded) sits above for motion users */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-0 bg-bg"
			>
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_50%_at_50%_42%,var(--color-hero-radial-mid)_0%,transparent_68%)]" />
			</div>
			<div
				ref={canvasContainerRef}
				className="absolute inset-0 z-[1] h-full w-full min-h-0 min-w-0"
			>
				{reduceMotion ? (
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 bg-bg"
					>
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_52%_48%_at_50%_38%,var(--color-hero-radial-mid)_0%,transparent_72%)] opacity-90" />
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,var(--color-surface)_0%,transparent_55%)] opacity-40" />
					</div>
				) : WebGLCanvas ? (
					<>
						<WebGLCanvas scrollProgressRef={scrollProgressRef} />
						<div
							aria-hidden
							className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/50 via-bg/40 to-bg/65"
						/>
					</>
				) : (
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 bg-bg/55"
					/>
				)}
			</div>

			<div className="pointer-events-none relative z-20 mx-auto h-full w-full max-w-7xl px-4 sm:px-6">
				<PublicHeader />

				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-60 text-center sm:px-0 sm:pb-0 sm:pt-0">
					<h1
						ref={h1Ref}
						className="type-marketing-hero mb-6 leading-none drop-shadow-[0_2px_48px_rgba(0,0,0,0.85)]"
					>
						<span className="hero-enter-line block">STRATEGY,</span>
						<span className="hero-enter-line block">
							BY DESIGN
							<span className="text-[var(--color-marketing-cta)]">.</span>
						</span>
					</h1>
					<p
						ref={subcopyRef}
						className="type-marketing-kicker mx-auto max-w-md rounded border border-border-strong/60 bg-surface/70 px-5 py-4 text-ink-secondary shadow-[0_12px_40px_-20px_rgba(0,0,0,0.75)] backdrop-blur-md"
					>
						MULTIFACETED. DRIVEN. INCLUSIVE.
					</p>
					{onScrollToImpact ? (
						<div className="pointer-events-auto mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
							<Link
								to="/signup"
								className="btn-marketing-primary min-h-12 px-8 text-center sm:min-h-11 sm:min-w-[12rem]"
							>
								Start your application
							</Link>
							<motion.button
								type="button"
								onClick={onScrollToImpact}
								whileTap={reduceMotion ? undefined : { scale: 0.98 }}
								transition={{ type: "spring", stiffness: 400, damping: 28 }}
								className="text-technical text-muted hover:text-accent min-h-12 rounded-[var(--radius-marketing)] border border-border-strong bg-bg/55 px-6 py-3 backdrop-blur-sm transition-[color,box-shadow,border-color] duration-200 hover:border-accent/40 hover:shadow-[var(--shadow-marketing-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring cursor-pointer sm:min-h-11"
							>
								Explore the firm
							</motion.button>
						</div>
					) : null}
				</div>

				{onScrollToImpact && !reduceMotion ? (
					<motion.div
						aria-hidden
						className="pointer-events-none fixed bottom-[max(2rem,env(safe-area-inset-bottom,0px))] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-accent/65"
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.65 }}
						transition={{ delay: 1.2, duration: 0.6 }}
					>
						<span className="type-marketing-kicker tracking-[0.2em] text-accent/80">
							SCROLL
						</span>
						<motion.span
							className="block h-6 w-px bg-accent/45"
							animate={{ scaleY: [1, 0.35, 1], opacity: [0.5, 1, 0.5] }}
							transition={{
								duration: 2.2,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>
					</motion.div>
				) : null}
			</div>
		</section>
	);
}
