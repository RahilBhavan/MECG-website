import { useEffect, useMemo, useRef, useState } from "react";
import { FirmRosterVirtualList } from "@/src/components/firm-roster-virtual-list";
import { rosterW26 } from "@/src/data/roster-w26";
import {
	useRevealStaggerChildren,
	useRevealUp,
} from "@/src/hooks/use-landing-scroll-reveals";
import { ROSTER_TAB_ORDER, type RosterCategory } from "@/src/types/roster";

/** President's welcome — aligned with mecgmichigan.com (body); sign-off uses live roster name. */
const PRESIDENT_WELCOME_PARAGRAPHS = [
	"Welcome to the Michigan Engineering Consulting Group! I'm thrilled to introduce you to our dynamic community of passionate students and professionals.",
	"At MECG, we believe in delivering high-impact solutions to real-world challenges. Our diverse team of consultants works with clients across all industries, from startups to Fortune 500 companies, providing strategic insights and actionable recommendations.",
	"What sets MECG apart is our commitment to excellence and our eagerness to learn. Every project is an opportunity to grow, innovate, and make a meaningful impact. Whether you're interested in strategy, operations, technology, or any other consulting domain, MECG provides the platform to develop your skills and build your network.",
	"Our members come from various backgrounds and majors, bringing unique perspectives to every engagement. This diversity of thought, combined with our rigorous training and mentorship programs, enables us to tackle complex business challenges with creativity and precision.",
	"I invite you to explore our website, attend our events, and connect with our team. Whether you're a potential client looking for strategic guidance or a student eager to join our community, we'd love to hear from you.",
] as const;

export default function FirmSection() {
	const tabs = useMemo(
		() =>
			ROSTER_TAB_ORDER.filter((c) => rosterW26.some((m) => m.category === c)),
		[],
	);

	const president = useMemo(
		() =>
			rosterW26.find((m) => m.role.toLowerCase().includes("president")) ??
			rosterW26.find((m) => m.category === "Exec Board") ??
			rosterW26[0],
		[],
	);

	const [activeTab, setActiveTab] = useState<RosterCategory>(
		() => tabs[0] ?? "Exec Board",
	);

	useEffect(() => {
		if (!tabs.includes(activeTab)) {
			setActiveTab(tabs[0] ?? "Exec Board");
		}
	}, [tabs, activeTab]);

	const filteredTeam = useMemo(
		() => rosterW26.filter((m) => m.category === activeTab),
		[activeTab],
	);

	const historyRef = useRef<HTMLDivElement>(null);
	const presidentRef = useRef<HTMLDivElement>(null);
	const firmIntroRef = useRef<HTMLDivElement>(null);
	const teamListRef = useRef<HTMLDivElement>(null);

	useRevealUp(historyRef);
	useRevealUp(presidentRef);
	useRevealUp(firmIntroRef);
	useRevealStaggerChildren(teamListRef, ".firm-row", {}, activeTab);

	return (
		<section className="w-full border-t border-border bg-bg-subtle py-32 text-ink md:py-40">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				{/* Our History */}
				<div
					ref={historyRef}
					id="section-history"
					className="mb-32 grid scroll-mt-20 grid-cols-1 gap-10 md:scroll-mt-14 lg:grid-cols-12 lg:gap-12"
				>
					<div className="reveal-up marketing-section-accent-rail min-w-0 lg:col-span-4">
						<h2 className="text-technical text-muted mb-4">
							<span className="text-accent">[01]</span> OUR HISTORY
						</h2>
					</div>
					<div className="min-w-0 border-border lg:col-span-8 lg:border-l-2 lg:border-accent/25 lg:pl-10">
						<div className="reveal-up space-y-6 lg:pl-0">
							<h3 className="type-marketing-section text-balance break-words text-ink-secondary">
								FOUNDED IN 2023 BY JONATHAN RAY & AARYAN SINGH.
							</h3>
							<p className="type-marketing-body-lg max-w-3xl text-muted">
								We established the Michigan Engineering Consulting Group not as
								a traditional student organization, but as a boutique agency.
								Our manifesto is simple: bridge the gap between rigorous
								engineering principles and high-level strategic consulting. We
								operate at the intersection of data, design, and business,
								delivering solutions that are as elegant as they are effective.
							</p>
						</div>
					</div>
				</div>

				{/* President's Welcome — centered stack; portrait in full colour */}
				{president ? (
					<div
						ref={presidentRef}
						className="mb-32 flex flex-col items-center border-t border-border pt-32"
					>
						<h2 className="reveal-up mb-8 flex flex-col items-center gap-3 text-center text-technical text-muted">
							<span
								className="h-1 w-16 max-w-[40%] rounded-full bg-gradient-to-r from-transparent via-accent/40 to-transparent"
								aria-hidden
							/>
							<span>
								<span className="text-accent">[02]</span> PRESIDENT&apos;S
								WELCOME
							</span>
						</h2>
						<div className="reveal-up grid w-full max-w-5xl grid-cols-1 items-center gap-10 rounded-sm border border-border bg-surface/35 p-6 light:bg-surface/60 lg:grid-cols-2 lg:gap-12 lg:p-10">
							<div className="relative mx-auto aspect-[3/4] w-full max-w-sm min-w-0 overflow-hidden rounded-sm ring-1 ring-accent/15">
								<img
									src={president.imageSrc}
									alt={president.displayName}
									width={800}
									height={1067}
									loading="lazy"
									decoding="async"
									className="h-full w-full object-cover"
									referrerPolicy="no-referrer"
								/>
							</div>
							<blockquote className="flex min-w-0 max-w-none flex-col justify-center space-y-5 text-center lg:text-left">
								<div className="type-marketing-quote space-y-5 text-ink-secondary">
									{PRESIDENT_WELCOME_PARAGRAPHS.map((paragraph, index) => (
										<p key={index}>{paragraph}</p>
									))}
								</div>
								<footer className="border-t border-border-strong/40 pt-6 text-technical">
									<p className="type-marketing-quote mb-3 text-ink-secondary">
										Best,
									</p>
									<span className="text-ink mb-1 block">
										{president.displayName.toUpperCase()}
									</span>
									<span className="text-muted">PRESIDENT OF MECG, 2026</span>
								</footer>
							</blockquote>
						</div>
					</div>
				) : null}

				{/* Meet the Team */}
				<div
					id="section-firm"
					className="scroll-mt-20 border-t border-border pt-32 md:scroll-mt-14"
				>
					<div ref={firmIntroRef} className="mb-16 space-y-12">
						<div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-baseline">
							<h2 className="reveal-up marketing-section-accent-rail mb-8 text-technical text-muted lg:mb-0">
								<span className="text-accent">[03]</span> THE FIRM
							</h2>

							<div
								className="reveal-up flex flex-wrap gap-8 text-technical"
								role="tablist"
								aria-label="Firm directory sections"
							>
								{tabs.map((tab) => (
									<button
										key={tab}
										type="button"
										role="tab"
										aria-selected={activeTab === tab}
										onClick={() => setActiveTab(tab)}
										className={`min-h-11 min-w-11 uppercase tracking-widest pb-1 border-b transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm ${
											activeTab === tab
												? "border-accent/80 text-accent"
												: "border-transparent text-muted hover:text-ink hover:border-border-strong/50"
										}`}
									>
										{tab}
									</button>
								))}
							</div>
						</div>

						<figure className="reveal-up mx-auto w-full max-w-5xl overflow-hidden rounded-sm">
							<img
								src="/headshots/exec-board-group.webp"
								alt="MECG executive board group portrait"
								width={1600}
								height={1000}
								loading="lazy"
								decoding="async"
								className="aspect-[8/5] h-auto w-full object-contain object-top"
								sizes="(max-width: 1024px) 100vw, min(1024px, 100vw)"
							/>
							<figcaption className="sr-only">
								Group portrait of MECG executive board members
							</figcaption>
						</figure>
					</div>

					<div
						ref={teamListRef}
						className="flex flex-col border-t border-border"
					>
						<FirmRosterVirtualList
							members={filteredTeam}
							revalidateKey={activeTab}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
