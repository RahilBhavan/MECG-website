/** Public site origin (no trailing slash). Aligns with `VITE_SITE_URL` / `vite.config` `siteUrlFromEnv`. */
export function getSiteOrigin(): string {
	const raw = (import.meta.env.VITE_SITE_URL ?? "").trim().replace(/\/$/, "");
	if (raw) return raw;
	return "http://localhost:3000";
}

export function absoluteUrl(pathnameOrUrl: string): string {
	const origin = getSiteOrigin();
	if (pathnameOrUrl.startsWith("http")) return pathnameOrUrl;
	const path = pathnameOrUrl.startsWith("/")
		? pathnameOrUrl
		: `/${pathnameOrUrl}`;
	return `${origin}${path}`;
}
