/**
 * Map Supabase Auth errors to short, actionable copy for users.
 */
export function mapAuthErrorMessage(raw: string): {
	friendly: string;
	detail: string;
} {
	const lower = raw.toLowerCase();
	const detail = raw;

	if (
		lower.includes("invalid login credentials") ||
		lower.includes("invalid credentials")
	) {
		return {
			friendly:
				"Email or password is incorrect. Try again or reset your password.",
			detail,
		};
	}
	if (lower.includes("email not confirmed")) {
		return {
			friendly:
				"Confirm your email before signing in. Check your inbox and spam folder.",
			detail,
		};
	}
	if (
		lower.includes("user already registered") ||
		lower.includes("already been registered")
	) {
		return {
			friendly: "An account with this email already exists. Sign in instead.",
			detail,
		};
	}
	if (lower.includes("password") && lower.includes("least")) {
		return {
			friendly:
				"Password does not meet requirements. Use a longer or stronger password.",
			detail,
		};
	}
	if (lower.includes("rate limit") || lower.includes("too many")) {
		return {
			friendly: "Too many attempts. Wait a few minutes and try again.",
			detail,
		};
	}
	if (lower.includes("network") || lower.includes("fetch")) {
		return {
			friendly: "Network error. Check your connection and try again.",
			detail,
		};
	}

	return {
		friendly:
			"Something went wrong. Try again or contact support if it keeps happening.",
		detail,
	};
}

export type LoginAuthErrorTarget = "email" | "password" | "form";

/** Which control should own the error + focus for sign-in failures. */
export function classifyLoginAuthError(raw: string): {
	friendly: string;
	detail: string;
	target: LoginAuthErrorTarget;
} {
	const mapped = mapAuthErrorMessage(raw);
	const lower = raw.toLowerCase();

	if (lower.includes("email not confirmed")) {
		return { ...mapped, target: "email" };
	}
	if (
		lower.includes("invalid login credentials") ||
		lower.includes("invalid credentials")
	) {
		return { ...mapped, target: "password" };
	}

	return { ...mapped, target: "form" };
}

export type SignUpAuthErrorTarget =
	| "displayName"
	| "email"
	| "password"
	| "form";

/** Which control should own the error + focus for sign-up failures. */
export function classifySignUpAuthError(raw: string): {
	friendly: string;
	detail: string;
	target: SignUpAuthErrorTarget;
} {
	const mapped = mapAuthErrorMessage(raw);
	const lower = raw.toLowerCase();

	if (
		lower.includes("user already registered") ||
		lower.includes("already been registered")
	) {
		return { ...mapped, target: "email" };
	}
	if (lower.includes("password") && lower.includes("least")) {
		return { ...mapped, target: "password" };
	}

	return { ...mapped, target: "form" };
}
