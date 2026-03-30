import { ChevronDown } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useBalancedTextMaxWidth } from "@/src/hooks/use-balanced-text-max-width";
import {
	useRevealStaggerChildren,
	useRevealUp,
} from "@/src/hooks/use-landing-scroll-reveals";

const RECRUITMENT_PITCH_COPY =
	"Our recruitment process is rigorous, designed to identify individuals who possess both analytical horsepower and creative vision. We seek those who are ready to shape the future of business and entertainment.";

const timelineEvents = [
	{ date: "SEP 05", name: "Mass Meeting I", location: "EECS 1311, 7:00 PM" },
	{ date: "SEP 07", name: "Mass Meeting II", location: "DOW 1013, 7:00 PM" },
	{
		date: "SEP 09",
		name: "Coffee Chats",
		location: "Duderstadt Center, 1:00 PM",
	},
	{
		date: "SEP 12",
		name: "Application Deadline",
		location: "Online, 11:59 PM",
	},
	{ date: "SEP 15", name: "First Round Interviews", location: "Invite Only" },
	{ date: "SEP 18", name: "Final Round Interviews", location: "Invite Only" },
];

const faqs = [
	{
		q: "What majors do you accept?",
		a: "We accept all majors. While our roots are in engineering, we value diverse perspectives and analytical minds from any discipline.",
	},
	{
		q: "What is the time commitment?",
		a: "Expect 5-8 hours per week, including general body meetings, project work, and professional development workshops.",
	},
	{
		q: "Do I need prior consulting experience?",
		a: "No prior experience is required. We provide comprehensive training during your first semester as an Analyst.",
	},
	{
		q: "How are projects sourced?",
		a: "We partner with a range of clients, from local startups to Fortune 500 companies, focusing on data-driven strategy and operational improvements.",
	},
];

export default function RecruitmentSection() {
	const faqGroupId = useId();
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const pitchRef = useRef<HTMLDivElement>(null);
	const balancedPitchMaxWidthPx = useBalancedTextMaxWidth({
		text: RECRUITMENT_PITCH_COPY,
		font: '300 18px "Inter"',
		minWidthPx: 280,
		maxWidthCapPx: 672,
		scopeRef: pitchRef,
	});
	const timelineRef = useRef<HTMLDivElement>(null);
	const timelineListRef = useRef<HTMLDivElement>(null);
	const faqRef = useRef<HTMLDivElement>(null);

	useRevealUp(pitchRef);
	useRevealUp(timelineRef);
	useRevealStaggerChildren(timelineListRef, ".recruit-timeline-row");
	useRevealUp(faqRef);

	const toggleFaq = (index: number) => {
		setOpenFaq(openFaq === index ? null : index);
	};

	return (
		<section
			id="section-join"
			className="w-full scroll-mt-20 border-t border-border bg-bg py-24 text-ink md:scroll-mt-14 md:py-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				{/* The Pitch */}
				<div ref={pitchRef} className="mb-20 md:mb-28">
					<h2 className="reveal-up type-marketing-kicker mb-4 text-muted">
						<span className="text-accent">[04]</span> JOIN THE FIRM
					</h2>
					<h3 className="type-marketing-display-xl reveal-up mb-8">
						WE ARE LOOKING FOR
						<br />
						EXCEPTIONAL TALENT.
					</h3>
					<p
						className={`reveal-up w-full text-lg font-sans font-light text-muted ${balancedPitchMaxWidthPx == null ? "max-w-2xl" : "max-w-full"}`}
						style={
							balancedPitchMaxWidthPx != null
								? { maxWidth: balancedPitchMaxWidthPx }
								: undefined
						}
					>
						{RECRUITMENT_PITCH_COPY}
					</p>
					<div className="reveal-up mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
						<Link
							to="/signup"
							className="btn-marketing-primary w-full sm:w-auto"
						>
							Create account to apply
						</Link>
						<Link
							to="/login"
							className="btn-marketing-outline w-full border-accent/35 bg-surface/30 sm:w-auto"
						>
							Already recruiting? Sign in
						</Link>
					</div>
				</div>
			</div>

			{/* Full-bleed band: timeline + FAQs */}
			<div className="marketing-full-bleed border-y border-border bg-surface/25 py-16 md:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div ref={timelineRef}>
						<h2 className="reveal-up type-marketing-kicker mb-12 text-muted md:mb-16">
							<span className="text-accent">[05]</span> RECRUITMENT TIMELINE
						</h2>

						<div
							ref={timelineListRef}
							className="flex flex-col border-t border-border"
						>
							{timelineEvents.map((event, i) => (
								<div
									key={i}
									className="recruit-timeline-row group relative flex flex-col items-start justify-between gap-3 border-b border-border px-4 py-6 transition-colors hover:bg-ink/[0.04] lg:flex-row lg:items-baseline lg:gap-0"
								>
									<div
										aria-hidden
										className="pointer-events-none absolute left-0 top-0 bottom-0 w-0.5 bg-transparent transition-colors duration-200 group-hover:bg-[var(--color-marketing-cta)]/70"
									/>
									<div className="mb-0 w-32 shrink-0 text-technical text-muted transition-colors group-hover:text-ink">
										{event.date}
									</div>
									<div className="min-w-0 flex-1 text-xl font-display tracking-wide text-ink-secondary md:text-2xl">
										{event.name}
									</div>
									<div className="w-full lg:w-auto lg:text-right">
										<span className="text-technical text-muted">
											{event.location}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					<div
						ref={faqRef}
						className="mt-20 border-t border-border pt-16 md:mt-24 md:pt-20"
					>
						<h2 className="reveal-up type-marketing-kicker mb-12 text-muted md:mb-16">
							<span className="text-accent">[06]</span> FREQUENTLY ASKED
							QUESTIONS
						</h2>

						<section
							className="flex flex-col border-t border-border"
							aria-label="Frequently asked questions"
						>
							{faqs.map((faq, i) => {
								const panelId = `${faqGroupId}-panel-${i}`;
								const headerId = `${faqGroupId}-header-${i}`;
								const isOpen = openFaq === i;
								return (
									<div key={i} className="reveal-up border-b border-border">
										<h3 className="font-display text-xl md:text-2xl tracking-wide">
											<button
												type="button"
												id={headerId}
												aria-expanded={isOpen}
												aria-controls={panelId}
												onClick={() => toggleFaq(i)}
												className="flex w-full cursor-pointer items-start justify-between gap-4 py-8 px-4 text-left transition-colors hover:bg-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
											>
												<span className="min-w-0 flex-1">{faq.q}</span>
												<ChevronDown
													className={`mt-1 h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
													aria-hidden
												/>
											</button>
										</h3>
										<section
											id={panelId}
											aria-labelledby={headerId}
											hidden={!isOpen}
											className="border-t border-border/60 bg-bg/40 px-4 pb-8 pt-4"
										>
											<p className="max-w-3xl font-sans font-light leading-relaxed text-muted">
												{faq.a}
											</p>
										</section>
									</div>
								);
							})}
						</section>
					</div>
				</div>
			</div>
		</section>
	);
}
