/**
 * Hex literals for WebGL/Canvas where CSS variables are unavailable.
 * When changing the palette, update `src/index.css` `@theme` and mirror values here.
 */
export const brandColors = {
	bg: "#111111",
	bgRaised: "#181818",
	surface: "#212121",
	ink: "#fafafa",
	border: "#404040",
	borderStrong: "#5c5c5c",
	accent: "#c9a962",
	/** Mirrors `@theme` — hover chrome, links */
	accentHover: "#e2c77e",
	/** Mirrors `@theme` — dark copper wash */
	accentMuted: "#352e1f",
	/** Lines / wireframe: between border and surface for depth */
	graphLine: "#5a5a5a",
	/**
	 * Hero graph edges only: graphLine nudged toward accent (not a new brand ramp).
	 */
	graphLineWarm: "#6b5e52",
	wireframe: "#2a2a2a",
	/** Hero icosahedron: wireframe tinted toward accent */
	wireframeAccentTint: "#2f2922",
	emissiveDim: "#404040",
	/** Hemisphere light (upper sky tone) */
	hemisphereHigh: "#383838",
	/**
	 * Hero upper hemisphere: neutral warmed so skylight isn’t cold vs IBL.
	 */
	hemisphereWarm: "#423a32",
} as const;
