import { getPrefersReducedMotion } from "@/src/lib/motion-preference";

/** Focus and bring the control into view without surprising motion when reduced-motion is on. */
export function focusFormControl(el: HTMLElement | null): void {
	if (!el) return;
	el.focus();
	el.scrollIntoView({
		block: "nearest",
		behavior: getPrefersReducedMotion() ? "auto" : "smooth",
	});
}
