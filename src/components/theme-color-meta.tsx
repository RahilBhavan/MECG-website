import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { THEME_COLOR_HEX } from "@/src/lib/theme-constants";

/** Keeps `<meta name="theme-color">` in sync with resolved light/dark (browser chrome). */
export function ThemeColorMeta() {
	const { resolvedTheme } = useTheme();

	const hex =
		resolvedTheme === "light" ? THEME_COLOR_HEX.light : THEME_COLOR_HEX.dark;

	useEffect(() => {
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute("content", hex);
	}, [hex]);

	return (
		<Helmet>
			<meta name="theme-color" content={hex} />
		</Helmet>
	);
}
