import type { SupabaseClient } from "@supabase/supabase-js";

export const APPLICATION_HEADSHOTS_BUCKET = "application-headshots";

/** Align with bucket `file_size_limit` in migration. */
export const APPLICATION_HEADSHOT_MAX_BYTES = 5 * 1024 * 1024;

export const APPLICATION_HEADSHOT_ACCEPT = [
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;

export type ApplicationHeadshotMime =
	(typeof APPLICATION_HEADSHOT_ACCEPT)[number];

const MIME_TO_EXT: Record<ApplicationHeadshotMime, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

export function isApplicationHeadshotMime(
	mime: string,
): mime is ApplicationHeadshotMime {
	return (APPLICATION_HEADSHOT_ACCEPT as readonly string[]).includes(mime);
}

export function headshotStoragePath(
	userId: string,
	mime: ApplicationHeadshotMime,
) {
	const ext = MIME_TO_EXT[mime];
	return `${userId}/headshot.${ext}`;
}

type CachedSigned = { url: string; expiresAt: number };

const signedHeadshotUrlCache = new Map<string, CachedSigned>();

/** Reuse signed URLs briefly to avoid N duplicate Storage calls while swiping the review deck. */
export async function createApplicationHeadshotSignedUrl(
	client: SupabaseClient,
	path: string,
	expiresInSec = 3600,
): Promise<string | null> {
	const now = Date.now();
	const skewMs = 120_000;
	const hit = signedHeadshotUrlCache.get(path);
	if (hit && hit.expiresAt > now + 30_000) return hit.url;

	const { data, error } = await client.storage
		.from(APPLICATION_HEADSHOTS_BUCKET)
		.createSignedUrl(path, expiresInSec);
	if (error || !data?.signedUrl) return null;

	signedHeadshotUrlCache.set(path, {
		url: data.signedUrl,
		expiresAt: now + Math.max(0, expiresInSec * 1000 - skewMs),
	});
	return data.signedUrl;
}
