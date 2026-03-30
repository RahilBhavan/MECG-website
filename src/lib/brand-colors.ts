/**
 * Hex literals for WebGL/Canvas where CSS variables are unavailable.
 * Keep in sync with `--mecg-*` in `src/index.css` for each theme.
 *
 * The CSS file also defines extra marketing/UX tokens (depth, link ramp, info,
 * charts, glass, overlay, selection) exposed as Tailwind `mecg-*` colors — use
 * those in components; extend this module when a canvas needs the same value.
 */
export type BrandColorTheme = "dark" | "light";

export type BrandColors = {
	bg: string;
	bgRaised: string;
	surface: string;
	ink: string;
	border: string;
	borderStrong: string;
	accent: string;
	accentHover: string;
	accentMuted: string;
	graphLine: string;
	graphLineWarm: string;
	wireframe: string;
	wireframeAccentTint: string;
	emissiveDim: string;
	hemisphereHigh: string;
	hemisphereWarm: string;
	/** Instanced “cool” node color (warm white in dark, muted stone in light). */
	nodeNeutral: string;
};

const brandColorsDark: BrandColors = {
	bg: "#111111",
	bgRaised: "#181818",
	surface: "#212121",
	ink: "#fafafa",
	border: "#404040",
	borderStrong: "#5c5c5c",
	accent: "#c9a962",
	accentHover: "#e2c77e",
	accentMuted: "#352e1f",
	graphLine: "#5a5a5a",
	graphLineWarm: "#6b5e52",
	wireframe: "#2a2a2a",
	wireframeAccentTint: "#2f2922",
	emissiveDim: "#404040",
	hemisphereHigh: "#383838",
	hemisphereWarm: "#423a32",
	nodeNeutral: "#e5e5e5",
};

const brandColorsLight: BrandColors = {
	bg: "#fafaf9",
	bgRaised: "#fafaf9",
	surface: "#e7e5e4",
	ink: "#1c1917",
	border: "#d6d3d1",
	borderStrong: "#a8a29e",
	accent: "#a67c29",
	accentHover: "#8f6820",
	accentMuted: "#f5f0e6",
	graphLine: "#a8a29e",
	graphLineWarm: "#8b7d6e",
	wireframe: "#d6d3d1",
	wireframeAccentTint: "#c4b8a8",
	emissiveDim: "#a8a29e",
	hemisphereHigh: "#e7e5e4",
	hemisphereWarm: "#d4cec4",
	nodeNeutral: "#78716c",
};

/** WebGL / canvas palette for the active marketing theme. */
export function getBrandColors(theme: BrandColorTheme): BrandColors {
	return theme === "light" ? brandColorsLight : brandColorsDark;
}

/** @deprecated Prefer `getBrandColors("dark")` when theme-aware. */
export const brandColors = brandColorsDark;
