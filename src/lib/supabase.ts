import { createClient } from "@supabase/supabase-js";

/** Trimmed env values; both must be set for real Supabase usage. */
function supabaseUrlFromImportMeta(): string {
	return (
		import.meta.env.VITE_SUPABASE_URL ||
		import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
		""
	).trim();
}

/** Anon or Vercel Marketplace "publishable" key (same client role as anon). */
function supabaseAnonKeyFromImportMeta(): string {
	return (
		import.meta.env.VITE_SUPABASE_ANON_KEY ||
		import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
		import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
		""
	).trim();
}

const supabaseUrlFromEnv = supabaseUrlFromImportMeta();
const supabaseAnonKeyFromEnv = supabaseAnonKeyFromImportMeta();

const supabaseConfigured = Boolean(
	supabaseUrlFromEnv && supabaseAnonKeyFromEnv,
);

/**
 * Valid placeholders so createClient does not throw when env is missing (local marketing / UI dev).
 * Auth and portal routes use isSupabaseConfigured() and show setup instructions instead.
 */
const PLACEHOLDER_SUPABASE_URL = "http://127.0.0.1:54321";
const PLACEHOLDER_SUPABASE_ANON_KEY = "dev-placeholder-supabase-not-configured";

const supabaseUrl = supabaseConfigured
	? supabaseUrlFromEnv
	: PLACEHOLDER_SUPABASE_URL;
const supabaseAnonKey = supabaseConfigured
	? supabaseAnonKeyFromEnv
	: PLACEHOLDER_SUPABASE_ANON_KEY;

/**
 * Browser Supabase client (anon key). RLS enforces access per role.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
});

export function isSupabaseConfigured(): boolean {
	return supabaseConfigured;
}
