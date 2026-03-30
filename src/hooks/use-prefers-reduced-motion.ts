import { useEffect, useState } from "react";

import { getPrefersReducedMotion } from "@/src/lib/motion-preference";

export function usePrefersReducedMotion(): boolean {
	const [reduce, setReduce] = useState(() =>
		typeof window !== "undefined" ? getPrefersReducedMotion() : false,
	);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onChange = () => setReduce(mq.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	return reduce;
}
