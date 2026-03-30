import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

import { THEME_STORAGE_KEY } from "@/src/lib/theme-constants";

type MecgThemeProviderProps = {
	children: ReactNode;
};

/** next-themes: class on `html` (`light` / `dark`), persisted under `mecg-theme`. */
export function MecgThemeProvider({ children }: MecgThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="dark"
			themes={["dark", "light"]}
			enableSystem={false}
			enableColorScheme
			storageKey={THEME_STORAGE_KEY}
			disableTransitionOnChange
		>
			{children}
		</NextThemesProvider>
	);
}
