/**
 * Product analytics: optional Plausible (`VITE_PLAUSIBLE_DOMAIN`) and/or first-party
 * funnel beacons (`VITE_ANALYTICS_EVENTS_ENDPOINT`, HTTPS, production only).
 * Does not duplicate Core Web Vitals (`report-web-vitals.ts`).
 */

export type FunnelStep =
	| "landing"
	| "signup_view"
	| "signup_success"
	| "apply_view"
	| "apply_submit_success";

declare global {
	interface Window {
		plausible?: (
			event: string,
			options?: {
				props?: Record<string, string | number | boolean>;
				u?: string;
			},
		) => void;
	}
}

let plausibleInjected = false;

function injectPlausibleScript(): void {
	const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN?.trim();
	if (!domain || plausibleInjected) return;
	plausibleInjected = true;
	const scriptUrl =
		import.meta.env.VITE_PLAUSIBLE_SCRIPT_URL?.trim() ||
		"https://plausible.io/js/script.js";
	const s = document.createElement("script");
	s.defer = true;
	s.src = scriptUrl;
	s.dataset.domain = domain;
	document.head.appendChild(s);
}

function postEventBeacon(body: Record<string, unknown>): void {
	const endpoint = import.meta.env.VITE_ANALYTICS_EVENTS_ENDPOINT?.trim();
	if (!import.meta.env.PROD || !endpoint?.startsWith("https://")) return;
	try {
		void navigator.sendBeacon?.(endpoint, JSON.stringify(body));
	} catch {
		/* ignore */
	}
}

/** Load third-party script when configured; call once from `main.tsx`. */
export function initAnalytics(): void {
	injectPlausibleScript();
}

/** SPA page views (Plausible custom location + optional beacon). */
export function trackPageView(pathname: string): void {
	const u = `${globalThis.location.origin}${pathname}`;
	window.plausible?.("pageview", { u });
	postEventBeacon({
		type: "pageview",
		path: pathname,
		ts: Date.now(),
	});
}

/** Funnel milestones for drop-off analysis. */
export function trackFunnelStep(
	step: FunnelStep,
	props?: Record<string, string>,
): void {
	window.plausible?.("Funnel", {
		props: { step, ...props },
	});
	postEventBeacon({
		type: "funnel",
		step,
		path: globalThis.location.pathname,
		ts: Date.now(),
		...props,
	});
}

/** Map public routes to funnel steps (signup_success / apply_submit_success are explicit calls). */
export function funnelStepForPathname(pathname: string): FunnelStep | null {
	if (pathname === "/") return "landing";
	if (pathname === "/signup") return "signup_view";
	if (pathname === "/apply") return "apply_view";
	return null;
}
