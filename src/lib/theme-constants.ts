/** Must match ThemeProvider `storageKey` and the inline script in `index.html`. */
export const THEME_STORAGE_KEY = "mecg-theme";

/** Browser chrome / meta theme-color (aligned with --mecg-theme-color). */
export const THEME_COLOR_HEX = {
	dark: "#111111",
	light: "#fafaf9",
} as const;
