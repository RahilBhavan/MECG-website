/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL?: string;
	readonly VITE_SUPABASE_ANON_KEY?: string;
	/** Set by Vercel Supabase integration when using Next-style env names. */
	readonly NEXT_PUBLIC_SUPABASE_URL?: string;
	readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
	/** Vercel Marketplace Supabase sync often uses this instead of `..._ANON_KEY`. */
	readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
	/** Public site origin for SEO / Open Graph (build-time). No trailing slash. */
	readonly VITE_SITE_URL?: string;
	/** Optional comma-separated batch ids for Review page dropdown (e.g. default,w26). */
	readonly VITE_REVIEW_BATCH_IDS?: string;
	/** Optional HTTPS endpoint for `navigator.sendBeacon` Core Web Vitals (production only). */
	readonly VITE_WEB_VITALS_ENDPOINT?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
