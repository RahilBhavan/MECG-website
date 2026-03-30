/**
 * Skip heavy hero WebGL on constrained devices / data-saver so LCP and main thread stay calmer.
 * Does not replace prefers-reduced-motion handling (handled separately in HeroSection).
 */
export function shouldSkipHeroWebGLForDevice(): boolean {
	if (typeof window === "undefined") return false;
	try {
		if (window.matchMedia("(prefers-reduced-data: reduce)").matches)
			return true;
	} catch {
		/* matchMedia can throw in rare embed contexts */
	}
	const nav = navigator as Navigator & {
		connection?: { saveData?: boolean };
	};
	if (nav.connection?.saveData) return true;
	if (
		typeof nav.hardwareConcurrency === "number" &&
		nav.hardwareConcurrency <= 2
	)
		return true;
	return false;
}
