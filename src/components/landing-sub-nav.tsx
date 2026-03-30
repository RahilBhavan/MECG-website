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
		<nav
			aria-label="Page sections"
			className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-md px-4 py-2 sm:px-6"
		>
			<ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-1 sm:gap-2 md:justify-start">
				{NAV_ITEMS.map(({ id, label }) => (
					<li key={id}>
						<a
							href={`#${id}`}
							className="text-technical text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded px-3 py-2 transition-[color,transform] duration-200 [@media(pointer:fine)]:hover:scale-[1.03]"
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
	);
}
