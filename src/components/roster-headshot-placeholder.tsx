/**
 * Initials-based portrait stand-in using MECG palette tokens (no /headshots assets required).
 * Real URLs in roster data are ignored while placeholders are enabled in FirmSection.
 */

type RosterHeadshotPlaceholderProps = {
	displayName: string;
	/** President column (tall) vs roster row (circle). */
	size: "hero" | "card";
	className?: string;
};

/** Strip parentheticals, then use first + last word initials. */
function initialsFromDisplayName(name: string): string {
	const cleaned = name.replace(/\([^)]*\)/g, " ").trim();
	const words = cleaned
		.split(/\s+/)
		.filter((w) => w.length > 0 && /^[A-Za-z]/.test(w));
	if (words.length === 0) return "?";
	if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
	const first = words[0]![0]!;
	const last = words[words.length - 1]![0]!;
	return (first + last).toUpperCase();
}

function variantIndex(name: string): number {
	let h = 0;
	for (let i = 0; i < name.length; i++)
		h = Math.imul(31, h) + name.charCodeAt(i) || 0;
	return Math.abs(h) % 3;
}

const VARIANT_CLASS: Record<number, string> = {
	0: "bg-accent-muted text-accent border-accent/40",
	1: "bg-surface text-ink-secondary border-border-strong/50",
	2: "bg-bg-raised text-accent border-border",
};

export function RosterHeadshotPlaceholder({
	displayName,
	size,
	className = "",
}: RosterHeadshotPlaceholderProps) {
	const initials = initialsFromDisplayName(displayName);
	const tones = VARIANT_CLASS[variantIndex(displayName)] ?? VARIANT_CLASS[0];
	const textSize =
		size === "hero"
			? "text-4xl sm:text-5xl md:text-6xl"
			: "text-sm font-semibold sm:text-base";

	return (
		<div
			role="img"
			aria-label={`Portrait placeholder for ${displayName}`}
			className={`flex h-full w-full min-h-0 min-w-0 items-center justify-center border font-display uppercase tracking-[0.12em] antialiased ${tones} ${textSize} ${className}`}
		>
			{initials}
		</div>
	);
}
