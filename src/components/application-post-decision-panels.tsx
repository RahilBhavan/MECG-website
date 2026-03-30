import { Link } from "react-router-dom";

import { hasRole, useAuth } from "@/src/auth/AuthProvider";
import {
	getSupportContactDescription,
	getSupportContactUrl,
	getSupportMailtoHref,
} from "@/src/lib/support-contact";

/** Shown when application status is accepted (onboarding checklist). */
export function AcceptedOnboardingPanel() {
	const { roles } = useAuth();
	const hasAlumni = hasRole(roles, "alumni");
	const mailto = getSupportMailtoHref();
	const contactUrl = getSupportContactUrl();

	return (
		<div className="border border-success/40 bg-success-bg/25 p-6 space-y-4">
			<h2 className="text-technical text-success">Onboarding checklist</h2>
			<ol className="list-decimal pl-5 space-y-2 font-sans text-sm text-ink/90 leading-relaxed">
				<li>Watch your email for official next steps and any deadlines.</li>
				<li>
					Complete any forms or confirmations your program sends — those are
					separate from this portal.
				</li>
				<li>
					Introduce yourself in whatever channel the team shares (e.g. Slack or
					GroupMe) when you’re invited.
				</li>
				<li>
					{hasAlumni ? (
						<>
							Update your{" "}
							<Link
								to="/network"
								className="text-ink underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								Network profile
							</Link>{" "}
							so other members can find you.
						</>
					) : (
						"When alumni access is added to your account, open Network from the header to complete your directory profile."
					)}
				</li>
			</ol>
			<p className="text-technical text-xs text-muted">
				Questions?{" "}
				{mailto ? (
					<a href={mailto} className="text-ink underline">
						Email us
					</a>
				) : contactUrl ? (
					<a
						href={contactUrl}
						target="_blank"
						rel="noreferrer"
						className="text-ink underline"
					>
						Contact us
					</a>
				) : (
					<span>Reach out to {getSupportContactDescription()}.</span>
				)}
			</p>
		</div>
	);
}

/** Shown when application status is rejected (respectful closure). */
export function RejectedClosurePanel() {
	const mailto = getSupportMailtoHref();
	const contactUrl = getSupportContactUrl();
	const contactDesc = getSupportContactDescription();

	return (
		<div className="border border-border p-6 space-y-4">
			<h2 className="text-technical text-muted">Thank you</h2>
			<p className="font-sans text-sm leading-relaxed text-muted">
				We know applying takes effort. This decision reflects a competitive pool
				and limited spots — not a full picture of your potential.
			</p>
			<p className="font-sans text-sm leading-relaxed text-muted">
				If you believe there’s an error with your application or account,
				contact {contactDesc}.
			</p>
			<div className="flex flex-wrap gap-3">
				{mailto ? (
					<a
						href={mailto}
						className="inline-flex min-h-11 items-center justify-center border border-border px-4 text-technical text-ink hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					>
						Contact admissions
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
			<div className="border-t border-border pt-4 space-y-2">
				<p className="text-technical text-xs text-muted">Optional feedback</p>
				<p className="font-sans text-sm text-muted leading-relaxed">
					We don’t collect detailed feedback through the portal right now. If we
					offer a short optional survey in the future, you’ll see it here.
				</p>
				<button
					type="button"
					disabled
					className="min-h-11 border border-border px-4 text-technical text-muted opacity-60 cursor-not-allowed"
					title="Not available yet"
				>
					Feedback survey (coming later)
				</button>
			</div>
		</div>
	);
}
