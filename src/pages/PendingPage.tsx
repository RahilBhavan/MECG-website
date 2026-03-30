import { Link } from "react-router-dom";

import { useAuth } from "@/src/auth/AuthProvider";

/** Shown when a signed-in user has no roles (edge case if trigger was skipped). */
export default function PendingPage() {
	const { roles, signOut } = useAuth();

	if (roles.length > 0) {
		return (
			<div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center px-6 cursor-auto">
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
		<div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center px-6 cursor-auto max-w-lg mx-auto text-center space-y-6">
			<h1 className="type-auth-title">Access pending</h1>
			<p className="text-technical text-muted">
				Your account has no roles yet. If you just signed up, ensure the
				database trigger created your profile and default applicant role.
				Otherwise ask an admin to assign roles.
			</p>
			<button
				type="button"
				onClick={() => void signOut()}
				className="border border-accent px-6 py-3 text-technical text-accent hover:bg-accent hover:text-bg"
			>
				Sign out
			</button>
			<Link to="/" className="text-technical text-muted hover:text-ink">
				← Back to site
			</Link>
		</div>
	);
}
