import { useEffect, useMemo, useRef, useState } from "react";
import { FirmRosterVirtualList } from "@/src/components/firm-roster-virtual-list";
import { rosterW26 } from "@/src/data/roster-w26";
import { useBalancedTextMaxWidth } from "@/src/hooks/use-balanced-text-max-width";
import {
	useRevealStaggerChildren,
	useRevealUp,
} from "@/src/hooks/use-landing-scroll-reveals";
import { useMediaMinWidth } from "@/src/hooks/use-media-min-width";
import { ROSTER_TAB_ORDER, type RosterCategory } from "@/src/types/roster";

const PRESIDENT_QUOTE_COPY =
	"Our vision is to cultivate a space where analytical rigor meets creative problem-solving. We don't just analyze data; we craft narratives that drive strategic decisions.";

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
	const presidentQuoteScopeRef = useRef<HTMLQuoteElement>(null);
	const firmIntroRef = useRef<HTMLDivElement>(null);
	const teamListRef = useRef<HTMLDivElement>(null);

	const isMdQuote = useMediaMinWidth("(min-width: 768px)");
	const presidentQuoteFont = isMdQuote
		? 'italic 400 30px "Playfair Display"'
		: 'italic 400 24px "Playfair Display"';

	const balancedPresidentQuoteWidthPx = useBalancedTextMaxWidth({
		text: president ? PRESIDENT_QUOTE_COPY : "",
		font: presidentQuoteFont,
		minWidthPx: 260,
		maxWidthCapPx: 640,
		scopeRef: presidentQuoteScopeRef,
		stepPx: 12,
	});

	useRevealUp(historyRef);
	useRevealUp(presidentRef);
	useRevealUp(firmIntroRef);
	useRevealStaggerChildren(teamListRef, ".firm-row", {}, activeTab);

	return (
		<section className="w-full border-t border-border bg-bg py-32 text-ink md:py-40">
			<div className="mx-auto max-w-7xl px-6">
				{/* Our History */}
				<div
					ref={historyRef}
					id="section-history"
					className="mb-32 grid scroll-mt-14 grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12"
				>
					<div className="reveal-up min-w-0 lg:col-span-4">
						<h2 className="text-technical text-muted mb-4">
							<span className="text-accent">[01]</span> OUR HISTORY
						</h2>
					</div>
					<div className="min-w-0 border-border lg:col-span-8 lg:border-l-2 lg:border-accent/35 lg:pl-10">
						<div className="reveal-up space-y-6 lg:pl-0">
							<h3 className="type-marketing-section text-balance break-words text-ink-secondary">
								FOUNDED IN 2023 BY JONATHAN RAY & AARYAN SINGH.
							</h3>
							<p className="max-w-3xl text-lg font-sans font-light leading-relaxed text-muted md:text-xl">
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

				{/* President's Welcome */}
				{president ? (
					<div
						ref={presidentRef}
						className="mb-32 grid grid-cols-1 gap-10 border-t border-border pt-32 lg:grid-cols-12 lg:gap-12"
					>
						<div className="reveal-up min-w-0 lg:col-span-4">
							<h2 className="text-technical text-muted mb-4">
								<span className="text-accent">[02]</span> PRESIDENT&apos;S
								WELCOME
							</h2>
						</div>
						<div className="reveal-up grid min-w-0 grid-cols-1 items-center gap-10 rounded-sm border border-border bg-surface/35 p-6 lg:col-span-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
							<div className="relative mx-auto aspect-[3/4] w-full max-w-sm min-w-0 overflow-hidden rounded-sm ring-1 ring-accent/20">
								<img
									src={president.imageSrc}
									alt={president.displayName}
									width={800}
									height={1067}
									loading="lazy"
									decoding="async"
									className="h-full w-full object-cover grayscale contrast-125 opacity-80 transition-opacity duration-500 hover:opacity-100"
									referrerPolicy="no-referrer"
								/>
							</div>
							<blockquote
								ref={presidentQuoteScopeRef}
								className="flex min-w-0 flex-col justify-center"
							>
								<p
									className={`mb-8 font-display text-2xl italic leading-snug md:text-3xl ${balancedPresidentQuoteWidthPx == null ? "max-w-xl" : "max-w-full"}`}
									style={
										balancedPresidentQuoteWidthPx != null
											? { maxWidth: balancedPresidentQuoteWidthPx }
											: undefined
									}
								>
									&ldquo;{PRESIDENT_QUOTE_COPY}&rdquo;
								</p>
								<footer className="text-technical">
									<span className="text-ink block mb-1">
										{president.displayName.toUpperCase()}
									</span>
									<span className="text-muted">PRESIDENT, MECG</span>
								</footer>
							</blockquote>
						</div>
					</div>
				) : null}

				{/* Meet the Team */}
				<div
					id="section-firm"
					className="scroll-mt-14 border-t border-border pt-32"
				>
					<div ref={firmIntroRef} className="mb-16 space-y-12">
						<div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-baseline">
							<h2 className="reveal-up mb-8 text-technical text-muted lg:mb-0">
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
												? "border-accent text-accent"
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
								className="aspect-[8/5] h-auto w-full object-contain object-top grayscale contrast-[1.05] opacity-90"
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
