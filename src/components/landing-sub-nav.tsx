/**
 * Sticky in-page anchors for the marketing landing (scroll order: Impact → History → …).
 * Parent passes scroll handler so Lenis offset matches when smooth scroll is active.
 */

const NAV_ITEMS = [
	{ id: "section-impact", label: "Impact" },
	{ id: "section-history", label: "History" },
	{ id: "section-firm", label: "Firm" },
	{ id: "section-join", label: "Join" },
	{ id: "section-contact", label: "Contact" },
] as const;

type LandingSubNavProps = {
	onNavigate: (sectionId: string) => void;
};

export function LandingSubNav({ onNavigate }: LandingSubNavProps) {
	return (
		<div className="sticky top-3 z-20 scroll-mt-4 px-2 sm:top-4 sm:px-4">
			<nav
				aria-label="Page sections"
				className="mx-auto max-w-7xl rounded-lg border border-border-strong border-t-2 border-t-accent/35 bg-bg/92 py-2 shadow-nav-dock backdrop-blur-md supports-[backdrop-filter]:bg-bg/85 light:border-border-strong light:bg-surface/90"
			>
				<ul className="flex max-w-7xl snap-x snap-mandatory flex-nowrap items-center justify-start gap-0.5 overflow-x-auto overscroll-x-contain px-2 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:gap-1 sm:overflow-visible sm:px-4 md:justify-start [&::-webkit-scrollbar]:hidden">
					{NAV_ITEMS.map(({ id, label }) => (
						<li key={id} className="snap-start">
							<a
								href={`#${id}`}
								className="text-technical text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring cursor-pointer inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 py-2 transition-colors duration-200"
								onClick={(e) => {
									e.preventDefault();
									onNavigate(id);
								}}
							>
								{label}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}
