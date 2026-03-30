import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { type SimpleIcon, siGeneralmotors, siIntuit } from "simple-icons";

import { ImpactClientLogo } from "@/src/components/impact-client-logo";
import { usePrefersReducedMotion } from "@/src/hooks/use-prefers-reduced-motion";
import { getPrefersReducedMotion } from "@/src/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger);

type CaseStudyLogo =
	| { readonly source: "simple-icon"; readonly icon: SimpleIcon }
	| { readonly source: "image"; readonly src: string };

/** Winter 2026 client engagements — GM & Intuit via Simple Icons; others are local SVGs in public/impact-logos. */
const WINTER_2026_CASE_STUDIES: readonly {
	id: string;
	name: string;
	blurb: string;
	logo: CaseStudyLogo;
}[] = [
	{
		id: "gm",
		name: "GM",
		blurb: "Automotive strategy and operations.",
		logo: { source: "simple-icon", icon: siGeneralmotors },
	},
	{
		id: "koops",
		name: "Koops",
		blurb: "Automation and industrial growth.",
		logo: { source: "image", src: "/impact-logos/koops.svg" },
	},
	{
		id: "intuit",
		name: "Intuit",
		blurb: "Product and go-to-market lens.",
		logo: { source: "simple-icon", icon: siIntuit },
	},
	{
		id: "lsx",
		name: "LSX",
		blurb: "Sports and experience platforms.",
		logo: { source: "image", src: "/impact-logos/lsx.svg" },
	},
	{
		id: "amstron",
		name: "Amstron",
		blurb: "Manufacturing and supply touchpoints.",
		logo: { source: "image", src: "/impact-logos/amstron.svg" },
	},
	{
		id: "glo-skin",
		name: "Glo Skin",
		blurb: "Consumer wellness and brand.",
		logo: { source: "image", src: "/impact-logos/glo-skin.svg" },
	},
];

const COHORT_LABEL = "Winter 2026";

export default function ImpactSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);
	const prefersReducedMotion = usePrefersReducedMotion();

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;

		const elements = section.querySelectorAll(".animate-up");

		if (getPrefersReducedMotion()) {
			gsap.set(elements, { y: 0, opacity: 1 });
			return;
		}

		const ctx = gsap.context(() => {
			gsap.fromTo(
				elements,
				{ y: 50, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 1,
					stagger: 0.1,
					ease: "power3.out",
					scrollTrigger: {
						trigger: section,
						start: "top 80%",
					},
				},
			);
		}, section);

		return () => {
			ctx.revert();
		};
	}, []);

	const scrollStrip = useCallback(
		(direction: 1 | -1) => {
			const el = scrollerRef.current;
			if (!el) return;
			const delta = Math.min(el.clientWidth * 0.72, 420) * direction;
			el.scrollBy({
				left: delta,
				behavior: prefersReducedMotion ? "auto" : "smooth",
			});
		},
		[prefersReducedMotion],
	);

	return (
		<section
			ref={sectionRef}
			id="section-impact"
			aria-labelledby="impact-section-heading"
			className="w-full scroll-mt-20 border-t border-border bg-bg py-24 text-ink md:scroll-mt-14 md:py-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<div className="animate-up mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<h2
						id="impact-section-heading"
						className="type-marketing-kicker text-muted"
					>
						<span className="text-accent">[00]</span> IMPACT
					</h2>
					<p className="max-w-md text-sm leading-relaxed text-muted">
						<span className="type-marketing-kicker text-ink/90">
							{COHORT_LABEL} engagements
						</span>
						{" — "}
						scroll the strip or use the previous and next controls.
					</p>
				</div>
			</div>

			{/* Full-bleed horizontal strip — must sit outside padded column */}
			<section
				className="marketing-full-bleed animate-up"
				aria-labelledby="impact-case-studies-heading"
			>
				<h3 id="impact-case-studies-heading" className="sr-only">
					{COHORT_LABEL} client case studies
				</h3>
				<div className="mx-auto mb-3 flex max-w-7xl justify-end gap-2 px-4 sm:px-6">
					<button
						type="button"
						className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded border border-border text-technical text-muted transition-colors hover:border-[var(--color-marketing-cta)]/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						aria-controls="impact-case-scroll"
						onClick={() => scrollStrip(-1)}
					>
						<ChevronLeft className="h-5 w-5" aria-hidden />
						<span className="sr-only">Show previous case studies</span>
					</button>
					<button
						type="button"
						className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded border border-border text-technical text-muted transition-colors hover:border-[var(--color-marketing-cta)]/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						aria-controls="impact-case-scroll"
						onClick={() => scrollStrip(1)}
					>
						<ChevronRight className="h-5 w-5" aria-hidden />
						<span className="sr-only">Show next case studies</span>
					</button>
				</div>
				<div className="relative">
					<div
						className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-bg to-transparent sm:w-14"
						aria-hidden
					/>
					<div
						className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-bg to-transparent sm:w-14"
						aria-hidden
					/>

					<div
						ref={scrollerRef}
						id="impact-case-scroll"
						className="impact-case-scroll flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-6 pt-1 [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] sm:scroll-px-6 sm:px-6"
					>
						{WINTER_2026_CASE_STUDIES.map((project, index) => (
							<article
								key={project.id}
								aria-label={`${project.name}, ${COHORT_LABEL}`}
								className="group relative flex w-[min(100%,19rem)] shrink-0 snap-start flex-col border border-border bg-bg-raised/80 backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 sm:w-[22rem] [@media(pointer:fine)]:hover:-translate-y-0.5 [@media(pointer:fine)]:hover:border-accent/40 [@media(pointer:fine)]:hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)]"
							>
								<div className="h-1 w-full bg-accent/80" aria-hidden />
								<div className="flex flex-1 flex-col gap-5 p-6">
									<div className="flex items-start justify-between gap-4">
										<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-border-strong bg-ink p-2 transition-colors duration-300 group-hover:border-accent/50">
											{project.logo.source === "simple-icon" ? (
												<ImpactClientLogo
													kind="simple-icon"
													icon={project.logo.icon}
												/>
											) : (
												<ImpactClientLogo kind="image" src={project.logo.src} />
											)}
										</div>
										<span className="text-technical text-muted pt-1">
											[{String(index + 1).padStart(2, "0")}]
										</span>
									</div>
									<div>
										<h4 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
											{project.name}
										</h4>
										<p className="type-marketing-kicker mt-3 text-muted">
											{COHORT_LABEL}
										</p>
										<p className="mt-4 text-sm leading-relaxed text-muted">
											{project.blurb}
										</p>
									</div>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<div className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 md:mt-28">
				{/* Strategic Foundations (Pillars) */}
				<div className="animate-up">
					<h3 className="type-marketing-section mb-16 uppercase tracking-tight">
						Strategic Foundations
					</h3>
					<div className="flex flex-col border-t border-border">
						{[
							{ num: "01", title: "Professional Development" },
							{ num: "02", title: "Education" },
							{ num: "03", title: "Project Experience" },
							{ num: "04", title: "Community" },
						].map((pillar, i) => (
							<div
								key={i}
								className="flex min-w-0 items-start gap-4 py-8 border-b border-border hover:bg-ink/5 transition-colors group cursor-default"
							>
								<span className="text-technical text-muted w-24 shrink-0 group-hover:text-ink transition-colors">
									[{pillar.num}]
								</span>
								<h4 className="text-2xl md:text-4xl font-sans font-medium tracking-tight text-ink-secondary">
									{pillar.title}
								</h4>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
