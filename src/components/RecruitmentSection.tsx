import { ChevronDown } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useBalancedTextMaxWidth } from "@/src/hooks/use-balanced-text-max-width";
import {
	useRevealStaggerChildren,
	useRevealUp,
} from "@/src/hooks/use-landing-scroll-reveals";

const RECRUITMENT_PITCH_COPY =
	"Winter 2026 recruitment is open to all majors. MECG is a pro-bono consulting group—if you want to learn consulting by doing real project work with a strong community, we want to meet you.";

const WINTER_2026_INTEREST_FORM_URL =
	"https://docs.google.com/forms/d/e/1FAIpQLSfl5DsinBYuXXCRe3C1dmurOyTKD39Tny6amT-_UPNt87cQSg/viewform?usp=header";

/** Winter 2026 timeline — aligned with mecgmichigan.com/join. */
const timelineEvents = [
	{
		date: "JAN 13",
		name: "Winterfest",
		location: "Pendleton (Table 16), 4:00–7:00 PM",
	},
	{
		date: "JAN 16",
		name: "Mass meeting",
		location: "CCCB B0420, 6:00–7:00 PM",
	},
	{
		date: "JAN 16",
		name: "Application opens",
		location: "Online, 8:00 PM",
	},
	{
		date: "JAN 20",
		name: "Career panel",
		location: "NUB 1528, 8:00–9:00 PM",
	},
	{
		date: "JAN 22",
		name: "Meet the members",
		location: "Weiser 110, 6:00–7:30 PM",
	},
	{
		date: "JAN 23",
		name: "Office hours",
		location: "Zoom, 4:00–6:00 PM",
	},
	{
		date: "JAN 24",
		name: "Application closes",
		location: "Online, 11:59 PM",
	},
	{
		date: "JAN 27",
		name: "Speed dating",
		location: "Invite only",
	},
	{
		date: "JAN 29",
		name: "Group case activity",
		location: "Invite only",
	},
	{
		date: "FEB 02–03",
		name: "Interviews",
		location: "Invite only",
	},
];

const faqs = [
	{
		q: "What prior experience do I need to join MECG?",
		a: "None. We teach consulting fundamentals through training, mentorship, and project work—many members join with no prior consulting background.",
	},
	{
		q: "What is the expected time commitment for members?",
		a: "Plan for roughly 5–8 hours per week across general body meetings, client project work, and professional development.",
	},
	{
		q: "Who is eligible to apply—are there restrictions by major or year?",
		a: "We are open to all majors at the University of Michigan. Specific term details are posted with each application cycle.",
	},
	{
		q: "What will my first semester as a member look like?",
		a: "New analysts onboard through team meetings, skills workshops, and real engagements alongside mentors and project leads.",
	},
	{
		q: "What does the recruitment process look like?",
		a: "Open rush events and an application, followed by invite-only activities (such as interviews) for selected candidates—see the timeline above.",
	},
	{
		q: "What kind of professional development does MECG offer?",
		a: "Workshops, case practice, and client-facing experience across our pillars: Professional Development, Education, Project Experience, and Community.",
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
					<h2 className="reveal-up type-marketing-kicker marketing-section-accent-rail mb-4 text-muted">
						<span className="text-accent">[04]</span> JOIN THE FIRM
					</h2>
					<h3 className="type-marketing-display-xl reveal-up mb-8">
						WE ARE LOOKING FOR
						<br />
						<span className="text-accent">EXCEPTIONAL</span> TALENT.
					</h3>
					<p
						className={`type-marketing-body-lg reveal-up w-full text-muted ${balancedPitchMaxWidthPx == null ? "max-w-2xl" : "max-w-full"}`}
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
							className="btn-marketing-outline w-full border-border-strong bg-surface/30 sm:w-auto"
						>
							Already recruiting? Sign in
						</Link>
						<a
							href={WINTER_2026_INTEREST_FORM_URL}
							target="_blank"
							rel="noreferrer"
							className="btn-marketing-outline w-full border-border-strong/60 text-center sm:w-auto"
						>
							Winter 2026 interest form
						</a>
					</div>
				</div>
			</div>

			{/* Full-bleed band: timeline + FAQs */}
			<div className="marketing-full-bleed border-y border-border bg-surface/25 py-16 light:bg-surface/50 md:py-24">
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
										className="pointer-events-none absolute left-0 top-0 bottom-0 w-0.5 bg-transparent transition-colors duration-200 group-hover:bg-accent/40 group-focus-within:bg-accent/40"
									/>
									<div className="mb-0 w-32 shrink-0 text-technical text-muted transition-colors group-hover:text-ink">
										{event.date}
									</div>
									<div className="type-marketing-subhead-display min-w-0 flex-1 text-ink-secondary">
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
										<h3 className="type-marketing-subhead-display text-ink">
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
											<p className="type-marketing-body max-w-3xl text-muted">
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
