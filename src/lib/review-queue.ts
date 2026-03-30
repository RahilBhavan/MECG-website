import type {
	ApplicationReviewRow,
	ApplicationRow,
	ReviewVerdict,
} from "@/src/types/database";

export type AssignmentFilter = "all" | "mine" | "unassigned";
export type QueueSort = "submitted_at" | "created_at" | "batch_id" | "random";

/** Seeded shuffle (Fisher–Yates) for stable random order per session. */
export function shuffleWithSeed<T>(items: T[], seed: number): T[] {
	const arr = [...items];
	let s = seed % 2147483647;
	if (s <= 0) s += 2147483646;
	const next = () => {
		s = (s * 16807) % 2147483647;
		return s / 2147483647;
	};
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(next() * (i + 1));
		[arr[i], arr[j]] = [arr[j]!, arr[i]!];
	}
	return arr;
}

export function sortApplications(
	apps: ApplicationRow[],
	sort: QueueSort,
	dir: "asc" | "desc",
	randomSeed: number,
): ApplicationRow[] {
	if (sort === "random") return shuffleWithSeed(apps, randomSeed);
	const mult = dir === "asc" ? 1 : -1;
	const list = [...apps];
	list.sort((a, b) => {
		if (sort === "batch_id") {
			return mult * a.batch_id.localeCompare(b.batch_id);
		}
		const ta =
			sort === "created_at"
				? new Date(a.created_at).getTime()
				: new Date(a.submitted_at ?? a.created_at).getTime();
		const tb =
			sort === "created_at"
				? new Date(b.created_at).getTime()
				: new Date(b.submitted_at ?? b.created_at).getTime();
		return mult * (ta - tb);
	});
	return list;
}

export function filterByAssignment(
	apps: ApplicationRow[],
	filter: AssignmentFilter,
	reviewerId: string,
): ApplicationRow[] {
	if (filter === "all") return apps;
	if (filter === "unassigned")
		return apps.filter((a) => a.assigned_reviewer_id == null);
	return apps.filter((a) => a.assigned_reviewer_id === reviewerId);
}

export function filterByCohort(
	apps: ApplicationRow[],
	cohort: string,
): ApplicationRow[] {
	const c = cohort.trim();
	if (!c) return apps;
	return apps.filter((a) => (a.cohort ?? "").trim() === c);
}

/** Every selected tag must appear on the application. */
export function filterByTagsAll(
	apps: ApplicationRow[],
	tags: string[],
): ApplicationRow[] {
	if (tags.length === 0) return apps;
	return apps.filter((app) => {
		const set = new Set(app.tags ?? []);
		return tags.every((t) => set.has(t));
	});
}

/** Final deck: screening completed, not pass, no final row yet. */
export function isEligibleFinalQueue(
	screening: ApplicationReviewRow | undefined,
	hasFinal: boolean,
): boolean {
	if (hasFinal) return false;
	if (!screening || screening.review_phase !== "screening") return false;
	return screening.verdict !== "pass";
}

/** Verdicts allowed in UI for final phase (no shortlist). */
export const FINAL_VERDICTS: ReviewVerdict[] = ["pass", "maybe", "yes"];
