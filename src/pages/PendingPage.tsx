import { Link } from "react-router-dom";

import { useAuth } from "@/src/auth/AuthProvider";
import { Seo } from "@/src/components/seo.tsx";

/** Shown when a signed-in user has no roles (edge case if trigger was skipped). */
export default function PendingPage() {
	const { roles, signOut } = useAuth();

	if (roles.length > 0) {
		return (
			<div className="min-h-dvh-screen page-safe-insets flex cursor-auto flex-col items-center justify-center bg-bg text-ink">
				<Seo
					title="Access — MECG"
					description="MECG portal access."
					pathname="/pending"
					noindex
				/>
				<p className="text-technical text-muted mb-4">
					You already have access.
				</p>
				<Link to="/" className="text-ink underline">
					Go home
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto flex max-w-lg cursor-auto flex-col items-center justify-center space-y-6 bg-bg text-center text-ink min-h-dvh-screen page-safe-insets">
			<Seo
				title="Access pending — MECG"
				description="Your MECG account is waiting for role assignment."
				pathname="/pending"
				noindex
			/>
			<h1 className="type-auth-title">Access pending</h1>
			<p className="text-technical text-muted">
				Your account has no roles yet. If you just signed up, ensure the
				database trigger created your profile and default applicant role.
				Otherwise ask an admin to assign roles.
			</p>
			<button
				type="button"
				onClick={() => void signOut()}
				className="min-h-12 border border-accent px-6 py-3 text-technical text-accent hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
			>
				Sign out
			</button>
			<Link to="/" className="text-technical text-muted hover:text-ink">
				← Back to site
			</Link>
		</div>
	);
}
