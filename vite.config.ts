import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/** Canonical site origin for OG tags, canonical link, and share previews. */
function siteUrlFromEnv(mode: string): string {
	const env = loadEnv(mode, process.cwd(), "VITE_");
	const raw = (env.VITE_SITE_URL ?? "").trim().replace(/\/$/, "");
	if (raw) return raw;
	// Dev fallback; set VITE_SITE_URL in production (e.g. https://your-domain.com).
	return "http://localhost:3000";
}

/**
 * Vercel Supabase (Marketplace) syncs `NEXT_PUBLIC_SUPABASE_URL` and often
 * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not `..._ANON_KEY`). It may also set
 * `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` without `NEXT_PUBLIC_`, which Vite
 * will not expose to the client unless we map them at build time.
 * Never map service-role or other server secrets here.
 */
function supabaseDefineFromEnv(mode: string): Record<string, string> {
	const merged = loadEnv(mode, process.cwd(), "");
	const url = (
		merged.VITE_SUPABASE_URL ||
		merged.NEXT_PUBLIC_SUPABASE_URL ||
		merged.SUPABASE_URL ||
		""
	).trim();
	const anonOrPublishable = (
		merged.VITE_SUPABASE_ANON_KEY ||
		merged.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
		merged.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
		merged.SUPABASE_PUBLISHABLE_KEY ||
		""
	).trim();
	const define: Record<string, string> = {};
	if (url) {
		define["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(url);
	}
	if (anonOrPublishable) {
		define["import.meta.env.VITE_SUPABASE_ANON_KEY"] =
			JSON.stringify(anonOrPublishable);
	}
	return define;
}

export default defineConfig(({ mode }) => {
	const siteUrl = siteUrlFromEnv(mode);
	return {
		envPrefix: ["VITE_", "NEXT_PUBLIC_"],
		// Non-empty only — avoids wiping `.env.local` with empty strings.
		define: supabaseDefineFromEnv(mode),
		plugins: [
			react(),
			tailwindcss(),
			{
				name: "html-site-url",
				transformIndexHtml(html) {
					return html.replaceAll("__SITE_URL__", siteUrl);
				},
			},
		],
		build: {
			chunkSizeWarningLimit: 1300,
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (!id.includes("node_modules")) return;
						if (id.includes("three") || id.includes("@react-three")) {
							return "vendor-three";
						}
						if (id.includes("gsap")) return "vendor-gsap";
						if (id.includes("@supabase")) return "vendor-supabase";
						if (id.includes("@fontsource")) return "vendor-fonts";
					},
				},
			},
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "."),
			},
		},
		server: {
			// HMR is disabled in AI Studio via DISABLE_HMR env var.
			// Do not modify — file watching is disabled to prevent flickering during agent edits.
			hmr: process.env.DISABLE_HMR !== "true",
		},
	};
});
