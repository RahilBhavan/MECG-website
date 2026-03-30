import { type FormEvent, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useRevealUp } from "@/src/hooks/use-landing-scroll-reveals";

type FormStatus = "idle" | "success" | "error";

function buildMailto(params: {
	to: string;
	subject: string;
	body: string;
}): string {
	const subject = encodeURIComponent(params.subject);
	const body = encodeURIComponent(params.body);
	return `mailto:${params.to}?subject=${subject}&body=${body}`;
}

export default function ContactSection() {
	const formRef = useRef<HTMLFormElement>(null);
	const contactIntroRef = useRef<HTMLDivElement>(null);
	const footerRef = useRef<HTMLElement>(null);
	const statusId = useId();
	const [status, setStatus] = useState<FormStatus>("idle");

	useRevealUp(contactIntroRef);
	useRevealUp(footerRef);
	const [errorMessage, setErrorMessage] = useState("");
	const [mailtoHref, setMailtoHref] = useState<string | null>(null);

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setErrorMessage("");
		const form = formRef.current;
		if (!form) return;

		if (!form.checkValidity()) {
			form.reportValidity();
			setStatus("error");
			setErrorMessage("Please fill in all fields correctly.");
			return;
		}

		const fd = new FormData(form);
		const name = String(fd.get("name") ?? "").trim();
		const email = String(fd.get("email") ?? "").trim();
		const subject = String(fd.get("subject") ?? "").trim();
		const message = String(fd.get("message") ?? "").trim();

		if (!name || !email || !subject || !message) {
			setStatus("error");
			setErrorMessage("All fields are required.");
			return;
		}

		const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
		setMailtoHref(
			buildMailto({
				to: "mecg-board@umich.edu",
				subject: `[MECG site] ${subject}`,
				body,
			}),
		);
		setStatus("success");
	}

	function handleResetForm() {
		setStatus("idle");
		setErrorMessage("");
		setMailtoHref(null);
		formRef.current?.reset();
	}

	return (
		<section
			id="section-contact"
			className="w-full scroll-mt-20 border-t border-border bg-bg-deep py-32 text-ink md:scroll-mt-14 md:py-40"
			aria-labelledby="contact-section-title"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<div
					id={statusId}
					aria-live="polite"
					aria-atomic="true"
					className="mb-8 min-h-[1.25rem] text-sm font-sans font-light"
				>
					{status === "error" && errorMessage ? (
						<p className="text-danger" role="alert">
							{errorMessage}
						</p>
					) : null}
					{status === "success" ? (
						<div className="rounded-sm border border-border bg-surface/40 p-6 text-ink-secondary">
							<p className="mb-4 text-ink">
								Thank you — your message is ready to send from your email app.
							</p>
							<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
								{mailtoHref ? (
									<a
										href={mailtoHref}
										className="btn-marketing-primary min-h-11 px-8"
									>
										Open in email app
									</a>
								) : null}
								<button
									type="button"
									onClick={handleResetForm}
									className="btn-marketing-outline text-technical text-muted min-h-11 px-6"
								>
									Send another inquiry
								</button>
							</div>
						</div>
					) : null}
				</div>

				{/* Contact Form */}
				<div
					ref={contactIntroRef}
					className="mb-32 grid grid-cols-1 gap-12 lg:grid-cols-12"
				>
					<div className="min-w-0 lg:col-span-4">
						<h2
							id="contact-section-title"
							className="reveal-up type-marketing-kicker marketing-section-accent-rail mb-4 text-muted"
						>
							<span className="text-accent">[07]</span> ENGAGEMENT
						</h2>
						<h3 className="type-marketing-section reveal-up mb-8 uppercase leading-tight">
							INITIATE
							<br />
							CONTACT.
						</h3>
						<p className="type-marketing-body reveal-up max-w-sm text-muted">
							Whether you are a prospective client or a student looking to join
							the firm, we welcome your inquiry.
						</p>
						<p className="type-marketing-body-sm reveal-up mt-6 max-w-sm text-muted">
							Current members and alumni:{" "}
							<Link
								to="/login"
								className="text-ink underline-offset-4 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm"
							>
								Sign in
							</Link>{" "}
							for the network directory and member resources.
						</p>
					</div>
					<div className="reveal-up min-w-0 lg:col-span-8">
						{status === "success" ? (
							<p className="type-marketing-body text-muted">
								Use the actions above to open your mail client, or reach us
								directly at{" "}
								<a
									href="mailto:mecg-board@umich.edu"
									className="text-ink underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
								>
									mecg-board@umich.edu
								</a>
								.
							</p>
						) : (
							<form
								ref={formRef}
								className="flex flex-col gap-12"
								onSubmit={handleSubmit}
							>
								<div className="relative">
									<label
										htmlFor="contact-name"
										className="text-technical text-muted mb-2 block"
									>
										Name
									</label>
									<input
										type="text"
										id="contact-name"
										name="name"
										placeholder="First & Last Name"
										autoComplete="name"
										className="type-marketing-body-lg w-full border-b border-border bg-transparent py-4 text-ink placeholder:text-muted/50 outline-none transition-all focus:border-b-2 focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring peer"
										required
									/>
								</div>
								<div className="relative">
									<label
										htmlFor="contact-email"
										className="text-technical text-muted mb-2 block"
									>
										Email
									</label>
									<input
										type="email"
										id="contact-email"
										name="email"
										placeholder="Email Address"
										autoComplete="email"
										className="type-marketing-body-lg w-full border-b border-border bg-transparent py-4 text-ink placeholder:text-muted/50 outline-none transition-all focus:border-b-2 focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring peer"
										required
									/>
								</div>
								<div className="relative">
									<label
										htmlFor="contact-subject"
										className="text-technical text-muted mb-2 block"
									>
										Subject
									</label>
									<input
										type="text"
										id="contact-subject"
										name="subject"
										placeholder="Subject"
										className="type-marketing-body-lg w-full border-b border-border bg-transparent py-4 text-ink placeholder:text-muted/50 outline-none transition-all focus:border-b-2 focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring peer"
										required
									/>
								</div>
								<div className="relative">
									<label
										htmlFor="contact-message"
										className="text-technical text-muted mb-2 block"
									>
										Message
									</label>
									<textarea
										id="contact-message"
										name="message"
										placeholder="Message"
										rows={4}
										className="type-marketing-body-lg w-full resize-none border-b border-border bg-transparent py-4 text-ink placeholder:text-muted/50 outline-none transition-all focus:border-b-2 focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring peer"
										required
									/>
								</div>
								<div className="mt-8 flex justify-end">
									<button
										type="submit"
										className="btn-marketing-primary min-h-12 px-10"
									>
										Submit inquiry
									</button>
								</div>
							</form>
						)}
					</div>
				</div>

				{/* Firm Details (Brutalist Footer) */}
				<footer
					ref={footerRef}
					className="flex flex-col items-start justify-between gap-12 border-t border-border pt-16 lg:flex-row lg:items-end"
				>
					<div className="reveal-up flex flex-col gap-4">
						<h4 className="text-technical text-muted mb-4">
							MECG // MICHIGAN ENGINEERING CONSULTING GROUP
						</h4>
						<div className="type-marketing-meta text-muted">
							College of Engineering
							<br />
							University of Michigan
							<br />
							1221 Beal Ave
							<br />
							Ann Arbor, MI 48109
							<br />
							United States
						</div>
					</div>

					<div className="reveal-up flex flex-col gap-12 lg:flex-row lg:gap-24">
						<div className="flex flex-col gap-4">
							<h5 className="text-technical text-muted mb-2">INQUIRIES</h5>
							<a
								href="mailto:mecg-board@umich.edu"
								className="type-marketing-meta text-ink transition-colors hover:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm"
							>
								mecg-board@umich.edu
							</a>
						</div>
						<div className="flex flex-col gap-4">
							<h5 className="text-technical text-muted mb-2">SOCIAL</h5>
							<a
								href="https://instagram.com/mecgmichigan"
								target="_blank"
								rel="noreferrer"
								className="type-marketing-meta text-ink transition-colors hover:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm"
							>
								Instagram (@mecgmichigan)
							</a>
							<a
								href="https://www.linkedin.com/company/michigan-engineering-consulting-group"
								target="_blank"
								rel="noreferrer"
								className="type-marketing-meta text-ink transition-colors hover:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm"
							>
								LinkedIn (Michigan Engineering Consulting Group)
							</a>
						</div>
					</div>

					<div className="reveal-up mt-12 text-right text-technical text-muted lg:mt-0">
						© 2026 MECG.
						<br />
						ALL RIGHTS RESERVED.
					</div>
				</footer>
			</div>
		</section>
	);
}
