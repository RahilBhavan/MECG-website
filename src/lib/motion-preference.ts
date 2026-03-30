/** True when the user prefers reduced UI motion (OS / browser setting). */
export function getPrefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
