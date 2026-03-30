import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";

import { brandColors } from "@/src/lib/brand-colors";

/** Matches hero subcopy theme; decorative only (DOM headline stays primary). */
export const HERO_WEBGL_AMBIENT_COPY = "MULTIFACETED · DRIVEN · INCLUSIVE";

const MAX_WIDTH_PX = 480;
const LINE_HEIGHT_PX = 34;
const CANVAS_PAD_PX = 20;

function ambientFontCss(): string {
	const sizePx = Math.round(LINE_HEIGHT_PX * 0.88);
	return `400 ${sizePx}px "Playfair Display", "Playfair Display Fallback", serif`;
}

export type HeroPretextCanvasResult = {
	canvas: HTMLCanvasElement;
	planeWidth: number;
	planeHeight: number;
};

/**
 * Rasterize Pretext line layout to a 2D canvas for use as a Three.js `CanvasTexture`.
 * Call after `document.fonts.ready` so measurements match the marketing Playfair load.
 */
export function buildHeroAmbientPretextCanvas(
	worldPlaneWidth: number,
): HeroPretextCanvasResult | null {
	if (typeof document === "undefined") return null;

	const text = HERO_WEBGL_AMBIENT_COPY.trim();
	if (!text) return null;

	const font = ambientFontCss();
	const prepared = prepareWithSegments(text, font);
	const { lines, height } = layoutWithLines(
		prepared,
		MAX_WIDTH_PX,
		LINE_HEIGHT_PX,
	);

	if (lines.length === 0) return null;

	const maxLineW = Math.max(...lines.map((l) => l.width), 1);
	const cssW = Math.ceil(maxLineW + CANVAS_PAD_PX * 2);
	const cssH = Math.ceil(height + CANVAS_PAD_PX * 2);
	const dpr = Math.min(2, window.devicePixelRatio || 1);

	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.floor(cssW * dpr));
	canvas.height = Math.max(1, Math.floor(cssH * dpr));

	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	ctx.scale(dpr, dpr);
	ctx.textBaseline = "top";
	ctx.font = font;
	ctx.fillStyle = brandColors.accent;

	let y = CANVAS_PAD_PX;
	for (const line of lines) {
		ctx.fillText(line.text, CANVAS_PAD_PX, y);
		y += LINE_HEIGHT_PX;
	}

	const aspect = cssW / cssH;
	const planeWidth = worldPlaneWidth;
	const planeHeight = worldPlaneWidth / aspect;

	return { canvas, planeWidth, planeHeight };
}
