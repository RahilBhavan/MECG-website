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
	/** Sentry browser DSN; dev only if `VITE_SENTRY_DEV=true`. */
	readonly VITE_SENTRY_DSN?: string;
	readonly VITE_SENTRY_DEV?: string;
	readonly VITE_PLAUSIBLE_DOMAIN?: string;
	readonly VITE_PLAUSIBLE_SCRIPT_URL?: string;
	readonly VITE_ANALYTICS_EVENTS_ENDPOINT?: string;
	/** Applicant support / admissions email (mailto in Apply + status hub). */
	readonly VITE_SUPPORT_EMAIL?: string;
	readonly VITE_CONTACT_EMAIL?: string;
	/** Optional public contact page URL. */
	readonly VITE_CONTACT_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
