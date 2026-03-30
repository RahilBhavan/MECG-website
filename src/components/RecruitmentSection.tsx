import { useRef, useState } from "react";
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
			className="w-full scroll-mt-14 border-t border-border bg-bg py-24 text-ink md:py-28"
		>
			<div className="mx-auto max-w-7xl px-6">
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
					<p className="reveal-up mt-8">
						<Link
							to="/apply"
							className="inline-block border border-accent px-6 py-3 text-technical text-accent hover:bg-accent hover:text-bg transition-colors"
						>
							Open application portal
						</Link>
					</p>
				</div>
			</div>

			{/* Full-bleed band: timeline + FAQs */}
			<div className="marketing-full-bleed border-y border-border bg-surface/25 py-16 md:py-24">
				<div className="mx-auto max-w-7xl px-6">
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
									className="recruit-timeline-row group flex flex-col items-start justify-between gap-3 border-b border-border px-4 py-6 transition-colors hover:bg-ink/5 lg:flex-row lg:items-baseline lg:gap-0"
								>
									<div className="mb-0 w-32 shrink-0 text-technical text-muted transition-colors group-hover:text-ink">
										{event.date}
									</div>
									<div className="min-w-0 flex-1 text-xl font-display tracking-wide md:text-2xl">
										{event.name}
									</div>
									<div className="flex w-full items-center justify-between gap-4 lg:w-auto lg:justify-end">
										<span className="text-technical text-muted text-right">
											{event.location}
										</span>
										<button
											type="button"
											className="text-technical text-ink hover:text-muted transition-colors whitespace-nowrap"
										>
											[+] Calendar
										</button>
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

						<div className="flex flex-col border-t border-border">
							{faqs.map((faq, i) => (
								<div key={i} className="reveal-up border-b border-border">
									<button
										type="button"
										onClick={() => toggleFaq(i)}
										className="w-full flex justify-between items-center py-8 px-4 hover:bg-ink/5 transition-colors text-left"
									>
										<span className="text-xl md:text-2xl font-display tracking-wide">
											{faq.q}
										</span>
										<span className="text-technical text-muted">
											{openFaq === i ? "[-]" : "[+]"}
										</span>
									</button>
									<div
										className={`overflow-hidden transition-all duration-300 ease-in-out px-4 ${
											openFaq === i
												? "max-h-40 pb-8 opacity-100"
												: "max-h-0 opacity-0"
										}`}
									>
										<p className="text-muted font-sans font-light leading-relaxed max-w-3xl">
											{faq.a}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
