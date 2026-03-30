import type { Metric } from "web-vitals";

/**
 * Optional RUM: when `VITE_WEB_VITALS_ENDPOINT` is an https URL, POST Core Web Vitals via `sendBeacon`.
 * Wire your collector to accept small JSON bodies; no-op if unset.
 */
export function initReportWebVitals(): void {
	const endpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT?.trim();
	if (!import.meta.env.PROD || !endpoint?.startsWith("https://")) return;

	void import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
		const send = (metric: Metric) => {
			const payload = JSON.stringify({
				name: metric.name,
				value: metric.value,
				id: metric.id,
				rating: metric.rating,
				path: globalThis.location.pathname,
			});
			void navigator.sendBeacon?.(endpoint, payload);
		};
		onCLS(send);
		onINP(send);
		onLCP(send);
		onFCP(send);
		onTTFB(send);
	});
}
