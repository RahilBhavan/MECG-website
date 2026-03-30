import { useEffect, useState } from "react";

/**
 * `window.matchMedia` subscription — `true` when the query matches (client only).
 */
export function useMediaMinWidth(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia(query);
		const onChange = () => setMatches(mq.matches);
		onChange();
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [query]);

	return matches;
}
