import type { ReactNode } from "react";

import { AuthThemeCorner } from "@/src/components/auth-theme-corner.tsx";

/** Card shell shared by login, sign-up, reset, and forgot-password panels */
export function AuthFormCard({ children }: { children: ReactNode }) {
	return (
		<div className="w-full max-w-md space-y-6 rounded-lg border border-border-strong bg-surface/30 p-6 shadow-[var(--shadow-marketing-md)] sm:p-8">
			{children}
		</div>
	);
}

/** Full-viewport auth wrapper with corner motif */
export function AuthPortalScreen({ children }: { children: ReactNode }) {
	return (
		<div className="relative flex min-h-dvh-screen flex-col items-center justify-center bg-bg px-0 text-ink page-safe-insets">
			<AuthThemeCorner />
			{children}
		</div>
	);
}

/** Form-level auth error (Supabase / network) */
export function AuthFormAlert({
	id,
	children,
}: {
	id?: string;
	children: ReactNode;
}) {
	return (
		<p
			id={id}
			className="rounded-sm border border-danger/40 bg-danger-bg/15 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{children}
		</p>
	);
}

/** Inline field validation message */
export function AuthFieldError({
	id,
	children,
}: {
	id: string;
	children: ReactNode;
}) {
	return (
		<span id={id} className="mt-1 block text-xs text-danger">
			{children}
		</span>
	);
}

/** Text inputs on auth pages — matches portal-field-focus in index.css */
export const AUTH_TEXT_INPUT_CLASS =
	"portal-field-focus w-full rounded-md border border-border bg-transparent px-3 py-2 font-sans disabled:opacity-50";
