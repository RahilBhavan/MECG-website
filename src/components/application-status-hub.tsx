import { APPLICATION_STATUS_HUB } from "@/src/content/application-status";
import {
	getSupportContactDescription,
	getSupportContactUrl,
	getSupportMailtoHref,
} from "@/src/lib/support-contact";
import type { ApplicationStatus } from "@/src/types/database";

type ApplicationStatusHubProps = {
	status: ApplicationStatus;
	submittedAt: string | null;
};

export function ApplicationStatusHub({
	status,
	submittedAt,
}: ApplicationStatusHubProps) {
	if (status === "draft") return null;

	const content = APPLICATION_STATUS_HUB[status];
	const mailto = getSupportMailtoHref();
	const contactUrl = getSupportContactUrl();
	const contactDesc = getSupportContactDescription();

	return (
		<section
			className="border border-border-strong bg-surface/20 p-5 sm:p-6 space-y-4"
			aria-labelledby="application-status-hub-title"
		>
			<div className="space-y-2">
				<h2
					id="application-status-hub-title"
					className="type-portal-title-sans text-lg sm:text-xl text-ink"
				>
					{content.title}
				</h2>
				<p className="font-sans text-sm leading-relaxed text-muted">
					{content.body}
				</p>
				{submittedAt ? (
					<p className="text-technical text-xs text-muted">
						Submitted {new Date(submittedAt).toLocaleString()}
					</p>
				) : null}
			</div>
			<div>
				<h3 className="text-technical text-muted mb-2">What to expect</h3>
				<ul className="list-disc pl-5 space-y-1.5 font-sans text-sm text-ink/90">
					{content.nextSteps.map((step) => (
						<li key={step}>{step}</li>
					))}
				</ul>
			</div>
			<div className="border-t border-border pt-4 space-y-2">
				<h3 className="text-technical text-muted">Something wrong?</h3>
				<p className="font-sans text-sm text-muted leading-relaxed">
					If your status doesn’t match what you expected or you need help with
					your account, contact {contactDesc}.
				</p>
				<div className="flex flex-wrap gap-3">
					{mailto ? (
						<a
							href={mailto}
							className="inline-flex min-h-11 items-center justify-center border border-accent px-4 text-technical text-accent hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						>
							Email support
						</a>
					) : null}
					{contactUrl ? (
						<a
							href={contactUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex min-h-11 items-center justify-center border border-border px-4 text-technical text-ink hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						>
							Contact page
						</a>
					) : null}
				</div>
			</div>
		</section>
	);
}
