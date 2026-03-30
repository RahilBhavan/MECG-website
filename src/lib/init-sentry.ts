import * as Sentry from "@sentry/react";

/** Client error reporting when `VITE_SENTRY_DSN` is set. Skips in dev unless `VITE_SENTRY_DEV=true`. */
export function initSentry(): void {
	const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
	if (!dsn) return;
	if (import.meta.env.DEV && import.meta.env.VITE_SENTRY_DEV !== "true") {
		return;
	}

	Sentry.init({
		dsn,
		environment: import.meta.env.MODE,
		sendDefaultPii: false,
		integrations: [Sentry.browserTracingIntegration()],
		tracePropagationTargets: [],
		tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,
	});
}
