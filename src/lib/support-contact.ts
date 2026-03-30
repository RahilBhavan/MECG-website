/** Support / admissions contact for applicant-facing copy (env-driven). */

function trimEnv(value: string | undefined): string | undefined {
	const v = value?.trim();
	return v || undefined;
}

/** Primary support email (mailto). */
export function getSupportEmail(): string | undefined {
	return (
		trimEnv(import.meta.env.VITE_SUPPORT_EMAIL) ??
		trimEnv(import.meta.env.VITE_CONTACT_EMAIL)
	);
}

/** Optional public URL for contact (e.g. form or site page). */
export function getSupportContactUrl(): string | undefined {
	return trimEnv(import.meta.env.VITE_CONTACT_URL);
}

export function getSupportMailtoHref(): string | undefined {
	const email = getSupportEmail();
	if (!email) return undefined;
	return `mailto:${encodeURIComponent(email)}`;
}

/** Short label for buttons/links (falls back if no env). */
export function getSupportContactDescription(): string {
	const email = getSupportEmail();
	const url = getSupportContactUrl();
	if (email && url) return `${email} or the contact page linked below`;
	if (email) return email;
	if (url) return "the contact page linked below";
	return "the admissions team (ask your program contact for the right email)";
}
