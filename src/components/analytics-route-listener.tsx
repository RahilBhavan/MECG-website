import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import {
	funnelStepForPathname,
	trackFunnelStep,
	trackPageView,
} from "@/src/lib/analytics.ts";

/** Tracks SPA navigations for Plausible / first-party beacons. Mount inside `BrowserRouter`. */
export function AnalyticsRouteListener() {
	const location = useLocation();
	const prev = useRef<string | null>(null);

	useEffect(() => {
		const path = `${location.pathname}${location.search}`;
		if (prev.current === path) return;
		prev.current = path;
		trackPageView(path);
		const funnel = funnelStepForPathname(location.pathname);
		if (funnel) trackFunnelStep(funnel);
	}, [location.pathname, location.search]);

	return null;
}
