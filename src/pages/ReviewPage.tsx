import {
	BadgeCheck,
	Bookmark,
	CircleDot,
	Eye,
	EyeOff,
	HelpCircle,
	LayoutGrid,
	List,
	X,
} from "lucide-react";
import {
	motion,
	type PanInfo,
	useMotionValue,
	useTransform,
} from "motion/react";
import {
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "@/src/auth/AuthProvider";
import { ReviewPageSkeleton } from "@/src/components/skeletons/ReviewPageSkeleton";
import { useToast } from "@/src/components/toast/ToastProvider";
import { usePrefersReducedMotion } from "@/src/hooks/use-prefers-reduced-motion";
import { usePretextTextareaRows } from "@/src/hooks/use-pretext-textarea-rows";
import { useReviewCardStackMinHeight } from "@/src/hooks/use-review-card-stack-min-height";
import { createApplicationHeadshotSignedUrl } from "@/src/lib/application-headshot-storage";
import {
	type AssignmentFilter,
	filterByAssignment,
	filterByCohort,
	filterByTagsAll,
	isEligibleFinalQueue,
	type QueueSort,
	sortApplications,
} from "@/src/lib/review-queue";
import { supabase } from "@/src/lib/supabase";
import type {
	ApplicationAnswers,
	ApplicationReviewRow,
	ApplicationRow,
	ReviewPhase,
	ReviewRubricScores,
	ReviewVerdict,
} from "@/src/types/database";

const SWIPE_X = 140;
const LEGEND_KEY = "mecg.review.keys.dismissed";
const SWIPE_HINT_KEY = "mecg.review.swipeHint.dismissed";
const BLIND_PREF_KEY = "mecg.review.blindMode";

function envReviewBatchIds(): string[] {
	const raw = String(import.meta.env.VITE_REVIEW_BATCH_IDS ?? "").trim();
	if (!raw) return ["default"];
	const parts = raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	return parts.length ? Array.from(new Set(parts)) : ["default"];
}

function normalizeAppRow(r: ApplicationRow): ApplicationRow {
	return {
		...r,
		tags: r.tags ?? [],
		cohort: r.cohort ?? null,
		assigned_reviewer_id: r.assigned_reviewer_id ?? null,
	};
}

interface UndoEntry {
	reviewId: string;
	application: ApplicationRow;
	phase: ReviewPhase;
}

function ReviewApplicantHeadshot({
	path,
	fullName,
	blind,
}: {
	path: string;
	fullName: string;
	blind: boolean;
}) {
	const [src, setSrc] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setSrc(null);
		setFailed(false);
		if (blind) return;
		void createApplicationHeadshotSignedUrl(supabase, path).then((url) => {
			if (cancelled) return;
			if (!url) {
				setFailed(true);
				return;
			}
			setSrc(url);
		});
		return () => {
			cancelled = true;
		};
	}, [path, blind]);

	const label = blind
		? "Hidden photo for blind review"
		: fullName.trim()
			? `Headshot of ${fullName.trim()}`
			: "Applicant headshot";

	if (blind) {
		return (
			<div
				className="h-28 w-28 shrink-0 rounded border border-border bg-ink/15 flex items-center justify-center text-center text-technical text-xs text-muted p-2"
				role="img"
				aria-hidden
			>
				Photo hidden
			</div>
		);
	}

	if (failed) {
		return (
			<div
				className="h-28 w-28 shrink-0 rounded border border-border bg-ink/5 flex items-center justify-center text-center text-technical text-xs text-muted p-2"
				role="img"
				aria-label={label}
			>
				Photo unavailable
			</div>
		);
	}

	if (!src) {
		return (
			<div
				role="img"
				aria-busy="true"
				aria-label={`Loading ${label}`}
				className="h-28 w-28 shrink-0 rounded border border-border bg-ink/10 motion-safe:animate-pulse"
			/>
		);
	}

	return (
		<img
			src={src}
			alt={label}
			width={112}
			height={112}
			decoding="async"
			className="h-28 w-28 shrink-0 rounded border border-border object-cover"
		/>
	);
}

const CardContent = forwardRef<
	HTMLDivElement,
	{
		answers: ApplicationAnswers;
		blind: boolean;
		onReveal: () => void;
	}
>(function CardContent({ answers, blind, onReveal }, ref) {
	const headshotPath = answers.headshotPath?.trim();
	const displayName = blind ? "Applicant" : answers.fullName || "Applicant";
	const blindMajor = "Program details hidden · year hidden";

	return (
		<div
			ref={ref}
			className="space-y-5 border-l-4 border-l-accent/45 p-6 sm:p-8"
		>
			{headshotPath ? (
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex justify-center sm:justify-start">
						<ReviewApplicantHeadshot
							path={headshotPath}
							fullName={answers.fullName ?? ""}
							blind={blind}
						/>
					</div>
					{blind ? (
						<button
							type="button"
							onClick={onReveal}
							className="min-h-11 w-full sm:w-auto shrink-0 border border-border px-4 py-2 text-technical text-sm hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring inline-flex items-center justify-center gap-2"
						>
							<Eye className="size-4" aria-hidden />
							Reveal identity
						</button>
					) : null}
				</div>
			) : null}
			<h2 className="font-display text-2xl tracking-tight text-ink-secondary sm:text-3xl">
				{displayName}
			</h2>
			<p className="type-marketing-kicker text-muted">
				{blind ? blindMajor : `${answers.major} · ${answers.academicYear}`}
			</p>
			<p className="whitespace-pre-wrap font-sans font-light leading-relaxed text-muted">
				{answers.whyMecg}
			</p>
			{answers.resumeUrl && !blind ? (
				<a
					href={answers.resumeUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="text-technical text-ink hover:underline inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded"
				>
					Open resume link
				</a>
			) : null}
			{answers.resumeUrl && blind ? (
				<p className="text-technical text-xs text-muted">
					Resume link hidden in blind mode — reveal to open.
				</p>
			) : null}
		</div>
	);
});

function flashClass(verdict: ReviewVerdict | null): string {
	if (!verdict) return "";
	if (verdict === "pass") return "bg-danger-bg/55";
	if (verdict === "yes") return "bg-success-bg/55";
	if (verdict === "shortlist") return "bg-accent/25";
	return "bg-warning-bg/55";
}

export default function ReviewPage() {
	const { user } = useAuth();
	const { pushToast } = useToast();
	const reduceMotion = usePrefersReducedMotion();
	const [searchParams, setSearchParams] = useSearchParams();

	const reviewPhase: ReviewPhase =
		searchParams.get("phase") === "final" ? "final" : "screening";

	const sortParam = (searchParams.get("sort") ?? "submitted_at") as QueueSort;
	const sort: QueueSort = [
		"submitted_at",
		"created_at",
		"batch_id",
		"random",
	].includes(sortParam)
		? sortParam
		: "submitted_at";
	const dir = searchParams.get("dir") === "desc" ? "desc" : "asc";
	const cohortFilter = searchParams.get("cohort") ?? "";
	const tagsFilterRaw = searchParams.get("tags") ?? "";
	const tagsFilter = useMemo(
		() =>
			tagsFilterRaw
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		[tagsFilterRaw],
	);
	const assignmentFilter = (
		["all", "mine", "unassigned"].includes(searchParams.get("assign") ?? "")
			? searchParams.get("assign")
			: "all"
	) as AssignmentFilter;

	function setParam(key: string, value: string | null) {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value == null || value === "") next.delete(key);
				else next.set(key, value);
				return next;
			},
			{ replace: true },
		);
	}

	const [batchSelect, setBatchSelect] = useState("all");
	const [batchCustom, setBatchCustom] = useState("");
	const batchFilter = useMemo(() => {
		const custom = batchCustom.trim();
		if (custom) return custom;
		return batchSelect;
	}, [batchSelect, batchCustom]);

	const [knownBatches, setKnownBatches] = useState<string[]>(() =>
		envReviewBatchIds(),
	);
	const [queue, setQueue] = useState<ApplicationRow[]>([]);
	const [eligibleCount, setEligibleCount] = useState(0);
	const [screeningRemaining, setScreeningRemaining] = useState(0);
	const [finalRemaining, setFinalRemaining] = useState(0);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [notes, setNotes] = useState("");
	const [score, setScore] = useState<string>("3");
	const [fitScore, setFitScore] = useState("3");
	const [commScore, setCommScore] = useState("3");
	const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
	const [flashVerdict, setFlashVerdict] = useState<ReviewVerdict | null>(null);
	const [notesOpen, setNotesOpen] = useState(false);
	const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(() =>
		typeof localStorage !== "undefined"
			? localStorage.getItem(LEGEND_KEY) !== "1"
			: true,
	);
	const [swipeHintDismissed, setSwipeHintDismissed] = useState(() =>
		typeof localStorage !== "undefined"
			? localStorage.getItem(SWIPE_HINT_KEY) === "1"
			: false,
	);
	const [viewMode, setViewMode] = useState<"deck" | "table">("deck");
	const [blindMode, setBlindMode] = useState(() =>
		typeof localStorage !== "undefined"
			? localStorage.getItem(BLIND_PREF_KEY) === "1"
			: false,
	);
	const [localReveal, setLocalReveal] = useState(false);
	const [randomSeed] = useState(() =>
		Math.floor(Math.random() * 2147483646 + 1),
	);
	const [peerReviews, setPeerReviews] = useState<ApplicationReviewRow[]>([]);
	const [blindPassLoaded, setBlindPassLoaded] = useState<Set<string>>(
		() => new Set(),
	);
	const [cohortOptions, setCohortOptions] = useState<string[]>([]);

	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-8, 8]);
	const hintLeft = useTransform(x, [-SWIPE_X, 0], [1, 0]);
	const hintRight = useTransform(x, [0, SWIPE_X], [0, 1]);

	const current = queue[0] ?? null;
	const nextApp = queue[1] ?? null;
	const answers = useMemo(
		() =>
			current
				? (current.answers as unknown as ApplicationAnswers)
				: ({} as ApplicationAnswers),
		[current],
	);

	const nextAnswers = useMemo(
		() =>
			nextApp
				? (nextApp.answers as unknown as ApplicationAnswers)
				: ({} as ApplicationAnswers),
		[nextApp],
	);

	const cardContentRef = useRef<HTMLDivElement>(null);
	const screeningNotesRef = useRef<HTMLTextAreaElement>(null);
	const screeningNotesRows = usePretextTextareaRows({
		textareaRef: screeningNotesRef,
		value: notes,
		minRows: 4,
		maxRows: 14,
	});

	const reviewStackMinHeightPx = useReviewCardStackMinHeight(
		answers,
		nextApp ? nextAnswers : null,
		cardContentRef,
	);

	const blindEffective = useMemo(() => {
		if (!current || !user) return false;
		if (!blindMode) return false;
		if (blindPassLoaded.has(current.id)) return false;
		return !localReveal;
	}, [blindMode, blindPassLoaded, current, localReveal, user]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset blind reveal when the active application changes
	useEffect(() => {
		setLocalReveal(false);
	}, [current?.id]);

	useEffect(() => {
		if (!user?.id || !current?.id) {
			setPeerReviews([]);
			return;
		}
		let cancelled = false;
		void (async () => {
			const { data, error } = await supabase
				.from("application_reviews")
				.select("*")
				.eq("application_id", current.id)
				.neq("reviewer_id", user.id);
			if (cancelled) return;
			if (error) {
				setPeerReviews([]);
				return;
			}
			setPeerReviews((data as ApplicationReviewRow[]) ?? []);
		})();
		return () => {
			cancelled = true;
		};
	}, [current?.id, user?.id]);

	useEffect(() => {
		if (!user?.id || !current?.id) return;
		let cancelled = false;
		void (async () => {
			const { data } = await supabase
				.from("review_blind_pass")
				.select("application_id")
				.eq("application_id", current.id)
				.eq("reviewer_id", user.id)
				.maybeSingle();
			if (cancelled) return;
			if (data) {
				setBlindPassLoaded((s) => new Set(s).add(current.id));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [current?.id, user?.id]);

	const refreshQueue = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setMessage(null);

		const { data: apps, error: appsError } = await supabase
			.from("applications")
			.select("*")
			.in("status", ["submitted", "under_review"])
			.neq("user_id", user.id);

		if (appsError) {
			setMessage(appsError.message);
			setLoading(false);
			return;
		}

		const rawList = ((apps as ApplicationRow[]) ?? []).map(normalizeAppRow);
		const assignFiltered = filterByAssignment(
			rawList,
			assignmentFilter,
			user.id,
		);
		const cohortFiltered = filterByCohort(assignFiltered, cohortFilter);
		const tagFiltered = filterByTagsAll(cohortFiltered, tagsFilter);

		const cohortSet = new Set<string>();
		for (const a of tagFiltered) {
			const c = (a.cohort ?? "").trim();
			if (c) cohortSet.add(c);
		}
		setCohortOptions([...cohortSet].sort());

		setEligibleCount(assignFiltered.length);

		const { data: mine, error: revError } = await supabase
			.from("application_reviews")
			.select("*")
			.eq("reviewer_id", user.id);

		if (revError) {
			setMessage(revError.message);
			setLoading(false);
			return;
		}

		const myReviews = (mine as ApplicationReviewRow[]) ?? [];
		const mineByApp = new Map<
			string,
			{ screening?: ApplicationReviewRow; final?: ApplicationReviewRow }
		>();
		for (const r of myReviews) {
			const cur = mineByApp.get(r.application_id) ?? {};
			if (r.review_phase === "screening") cur.screening = r;
			if (r.review_phase === "final") cur.final = r;
			mineByApp.set(r.application_id, cur);
		}

		let screeningList = tagFiltered.filter((a) => {
			const m = mineByApp.get(a.id);
			return !m?.screening;
		});
		let finalList = tagFiltered.filter((a) => {
			const m = mineByApp.get(a.id);
			return isEligibleFinalQueue(m?.screening, Boolean(m?.final));
		});

		if (batchFilter !== "all") {
			screeningList = screeningList.filter((a) => a.batch_id === batchFilter);
			finalList = finalList.filter((a) => a.batch_id === batchFilter);
		}

		screeningList = sortApplications(screeningList, sort, dir, randomSeed);
		finalList = sortApplications(finalList, sort, dir, randomSeed);

		setScreeningRemaining(screeningList.length);
		setFinalRemaining(finalList.length);

		setQueue(reviewPhase === "final" ? finalList : screeningList);
		setLoading(false);
	}, [
		user,
		batchFilter,
		reviewPhase,
		sort,
		dir,
		randomSeed,
		assignmentFilter,
		cohortFilter,
		tagsFilter,
	]);

	useEffect(() => {
		void refreshQueue();
	}, [refreshQueue]);

	useEffect(() => {
		if (!user) return;
		void (async () => {
			const { data, error } = await supabase
				.from("applications")
				.select("batch_id");
			if (error) return;
			const fromDb = ((data ?? []) as { batch_id: string }[]).map(
				(r) => r.batch_id,
			);
			setKnownBatches([...new Set([...envReviewBatchIds(), ...fromDb])].sort());
		})();
	}, [user]);

	const dismissKeyboardHelp = useCallback(() => {
		localStorage.setItem(LEGEND_KEY, "1");
		setKeyboardHelpOpen(false);
	}, []);

	const dismissSwipeHint = useCallback(() => {
		localStorage.setItem(SWIPE_HINT_KEY, "1");
		setSwipeHintDismissed(true);
	}, []);

	const persistBlindPass = useCallback(async () => {
		if (!user || !current) return;
		const { error } = await supabase.from("review_blind_pass").insert({
			application_id: current.id,
			reviewer_id: user.id,
		});
		if (
			!error ||
			(error as { code?: string }).code === "23505" ||
			String(error.message).includes("duplicate key")
		) {
			setBlindPassLoaded((s) => new Set(s).add(current.id));
		}
	}, [current, user]);

	const handleRevealIdentity = useCallback(() => {
		setLocalReveal(true);
		void persistBlindPass();
	}, [persistBlindPass]);

	const undoLast = useCallback(async () => {
		const last = undoStack[undoStack.length - 1];
		if (!last) return;
		const { error } = await supabase
			.from("application_reviews")
			.delete()
			.eq("id", last.reviewId);
		if (error) {
			setMessage(error.message);
			pushToast(error.message, "error");
			return;
		}
		setUndoStack((s) => s.slice(0, -1));
		setQueue((q) => [last.application, ...q]);
		x.set(0);
		pushToast("Review removed.", "success", 9000);
	}, [undoStack, pushToast, x]);

	const recordVerdict = useCallback(
		async (verdict: ReviewVerdict) => {
			if (!user) return;
			if (reviewPhase === "final" && verdict === "shortlist") return;
			const cur = queue[0];
			if (!cur) return;
			setMessage(null);
			const scoreNum = Number.parseInt(score, 10);
			const rubric: ReviewRubricScores = {
				fit: Number.parseInt(fitScore, 10),
				communication: Number.parseInt(commScore, 10),
			};
			const payload = {
				application_id: cur.id,
				reviewer_id: user.id,
				review_phase: reviewPhase,
				verdict,
				score: Number.isFinite(scoreNum) ? scoreNum : null,
				scores: rubric,
				notes: notes.trim() || null,
			};

			const { data, error } = await supabase
				.from("application_reviews")
				.insert(payload as never)
				.select("*")
				.single();

			if (error) {
				setMessage(error.message);
				pushToast(error.message, "error");
				return;
			}

			if (blindEffective) void persistBlindPass();

			localStorage.setItem(SWIPE_HINT_KEY, "1");
			setSwipeHintDismissed(true);

			const review = data as ApplicationReviewRow;
			setFlashVerdict(verdict);
			const delay = reduceMotion ? 0 : 260;
			window.setTimeout(() => {
				setUndoStack((s) => [
					...s,
					{ reviewId: review.id, application: cur, phase: reviewPhase },
				]);
				setNotes("");
				setQueue((q) => q.slice(1));
				setFlashVerdict(null);
				x.set(0);
			}, delay);
		},
		[
			user,
			queue,
			notes,
			score,
			fitScore,
			commScore,
			x,
			reduceMotion,
			pushToast,
			reviewPhase,
			blindEffective,
			persistBlindPass,
		],
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const t = e.target;
			if (
				t instanceof HTMLInputElement ||
				t instanceof HTMLTextAreaElement ||
				t instanceof HTMLSelectElement
			)
				return;
			if (e.key === "?" || (e.shiftKey && e.key === "/")) {
				e.preventDefault();
				setKeyboardHelpOpen((o) => !o);
				return;
			}
			if (e.key === "u" && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				void undoLast();
				return;
			}
			if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				screeningNotesRef.current?.focus();
				return;
			}
			if (!queue[0]) return;
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				void recordVerdict("pass");
			}
			if (e.key === "ArrowRight") {
				e.preventDefault();
				void recordVerdict("yes");
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				void recordVerdict("maybe");
			}
			if (e.key === "ArrowDown" && reviewPhase === "screening") {
				e.preventDefault();
				void recordVerdict("shortlist");
			}
			if (e.key >= "1" && e.key <= "4" && reviewPhase === "screening") {
				e.preventDefault();
				const map: ReviewVerdict[] = ["pass", "maybe", "shortlist", "yes"];
				const v = map[Number.parseInt(e.key, 10) - 1];
				if (v) void recordVerdict(v);
			}
			if (e.key >= "1" && e.key <= "3" && reviewPhase === "final") {
				e.preventDefault();
				const map: ReviewVerdict[] = ["pass", "maybe", "yes"];
				const v = map[Number.parseInt(e.key, 10) - 1];
				if (v) void recordVerdict(v);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [queue, recordVerdict, reviewPhase, undoLast]);

	function onDragEnd(_: unknown, info: PanInfo) {
		if (reduceMotion) return;
		if (info.offset.x > SWIPE_X) void recordVerdict("yes");
		else if (info.offset.x < -SWIPE_X) void recordVerdict("pass");
		else if (info.offset.y < -SWIPE_X) void recordVerdict("maybe");
		else if (info.offset.y > SWIPE_X && reviewPhase === "screening")
			void recordVerdict("shortlist");
		else x.set(0);
	}

	const emptyKind =
		!loading && eligibleCount === 0
			? "none_submitted"
			: !loading &&
					reviewPhase === "screening" &&
					screeningRemaining === 0 &&
					eligibleCount > 0
				? "all_reviewed"
				: !loading &&
						reviewPhase === "final" &&
						finalRemaining === 0 &&
						eligibleCount > 0
					? "final_empty"
					: !loading &&
							queue.length === 0 &&
							eligibleCount > 0 &&
							batchFilter !== "all"
						? "batch_empty"
						: !loading && queue.length === 0
							? "empty"
							: null;

	if (loading) {
		return <ReviewPageSkeleton />;
	}

	return (
		<div className="space-y-8 relative">
			{flashVerdict ? (
				<div
					className={`pointer-events-none fixed inset-0 z-[150] transition-opacity duration-200 ${flashClass(flashVerdict)}`}
					aria-hidden
				/>
			) : null}

			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="type-portal-title">Review queue</h1>
					<p className="text-technical text-muted max-w-xl">
						{queue.length} left in this view
						{reviewPhase === "screening" ? (
							<span className="ml-2">
								· Screening backlog: {screeningRemaining}
							</span>
						) : (
							<span className="ml-2">· Final queue: {finalRemaining}</span>
						)}
						{batchFilter !== "all" ? (
							<span className="ml-2">
								· Batch: <span className="text-ink">{batchFilter}</span>
							</span>
						) : null}
						<span className="ml-2">
							· {eligibleCount} eligible (after assignment filter)
						</span>
					</p>
					<p className="sr-only" aria-live="polite" aria-atomic="true">
						{queue.length} {queue.length === 1 ? "application" : "applications"}{" "}
						left in your review queue.
					</p>
				</div>
				<div className="flex flex-wrap gap-3 items-center">
					<div className="flex rounded border border-border overflow-hidden">
						<button
							type="button"
							className={`min-h-11 px-3 text-technical inline-flex items-center gap-1 ${viewMode === "deck" ? "bg-ink/10" : ""}`}
							onClick={() => setViewMode("deck")}
							aria-pressed={viewMode === "deck"}
						>
							<LayoutGrid className="size-4" aria-hidden />
							Deck
						</button>
						<button
							type="button"
							className={`min-h-11 px-3 text-technical inline-flex items-center gap-1 border-l border-border ${viewMode === "table" ? "bg-ink/10" : ""}`}
							onClick={() => setViewMode("table")}
							aria-pressed={viewMode === "table"}
						>
							<List className="size-4" aria-hidden />
							Table
						</button>
					</div>
					<button
						type="button"
						className={`min-h-11 min-w-11 border border-border flex items-center justify-center hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded`}
						onClick={() => {
							const next = !blindMode;
							setBlindMode(next);
							localStorage.setItem(BLIND_PREF_KEY, next ? "1" : "0");
						}}
						aria-pressed={blindMode}
						aria-label={
							blindMode
								? "Blind mode on — hide identity until reveal"
								: "Blind mode off"
						}
					>
						{blindMode ? (
							<EyeOff className="h-5 w-5" aria-hidden />
						) : (
							<Eye className="h-5 w-5" aria-hidden />
						)}
					</button>
					<button
						type="button"
						className="min-h-11 min-w-11 border border-border flex items-center justify-center hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded"
						aria-expanded={keyboardHelpOpen}
						aria-label="Toggle keyboard shortcuts help"
						onClick={() => setKeyboardHelpOpen((o) => !o)}
					>
						<HelpCircle className="h-5 w-5" aria-hidden />
					</button>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 flex-wrap">
						<label className="text-technical text-muted flex flex-wrap items-center gap-2 min-h-11">
							Phase
							<select
								value={reviewPhase}
								onChange={(e) =>
									setParam("phase", e.target.value === "final" ? "final" : null)
								}
								className="bg-bg border border-border px-2 py-2 min-h-11 font-sans w-36 max-w-full focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								<option value="screening">Screening</option>
								<option value="final">Final</option>
							</select>
						</label>
						<label className="text-technical text-muted flex flex-wrap items-center gap-2 min-h-11">
							Assignment
							<select
								value={assignmentFilter}
								onChange={(e) => setParam("assign", e.target.value)}
								className="bg-bg border border-border px-2 py-2 min-h-11 font-sans w-40 max-w-full focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								<option value="all">All</option>
								<option value="mine">Assigned to me</option>
								<option value="unassigned">Unassigned pool</option>
							</select>
						</label>
						<label className="text-technical text-muted flex flex-wrap items-center gap-2 min-h-11">
							Sort
							<select
								value={sort}
								onChange={(e) => setParam("sort", e.target.value)}
								className="bg-bg border border-border px-2 py-2 min-h-11 font-sans w-40 max-w-full focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								<option value="submitted_at">Submitted</option>
								<option value="created_at">Created</option>
								<option value="batch_id">Batch id</option>
								<option value="random">Random</option>
							</select>
						</label>
						<label className="text-technical text-muted flex flex-wrap items-center gap-2 min-h-11">
							Dir
							<select
								value={dir}
								onChange={(e) => setParam("dir", e.target.value)}
								className="bg-bg border border-border px-2 py-2 min-h-11 font-sans w-28 max-w-full focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								<option value="asc">Ascending</option>
								<option value="desc">Descending</option>
							</select>
						</label>
						<label className="text-technical text-muted flex flex-wrap items-center gap-2 min-h-11">
							Cohort
							<select
								value={cohortFilter}
								onChange={(e) => setParam("cohort", e.target.value)}
								className="bg-bg border border-border px-2 py-2 min-h-11 font-sans w-36 max-w-full focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								<option value="">Any</option>
								{cohortOptions.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</label>
						<label className="text-technical text-muted flex flex-wrap items-center gap-2 min-h-11">
							Tags (all)
							<input
								type="text"
								value={tagsFilterRaw}
								onChange={(e) => setParam("tags", e.target.value)}
								placeholder="comma,separated"
								className="bg-transparent border border-border px-2 py-2 min-h-11 font-sans w-44 max-w-full focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							/>
						</label>
						<label className="text-technical text-muted flex flex-wrap items-center gap-2 min-h-11">
							Batch
							<select
								value={batchSelect}
								onChange={(e) => setBatchSelect(e.target.value)}
								className="bg-bg border border-border px-2 py-2 min-h-11 font-sans w-40 max-w-full focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								<option value="all">All batches</option>
								{knownBatches.map((id) => (
									<option key={id} value={id}>
										{id}
									</option>
								))}
							</select>
						</label>
						<label className="text-technical text-muted flex flex-wrap items-center gap-2 min-h-11">
							<span className="sr-only sm:not-sr-only sm:inline">
								Custom id
							</span>
							<input
								type="text"
								value={batchCustom}
								onChange={(e) => setBatchCustom(e.target.value)}
								placeholder="Custom id (overrides menu)"
								className="bg-transparent border border-border px-2 py-2 min-h-11 font-sans w-40 sm:w-36 focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							/>
						</label>
					</div>
					<button
						type="button"
						onClick={() => void refreshQueue()}
						className="border border-border px-4 py-2 min-h-11 text-technical hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					>
						Refresh
					</button>
					<button
						type="button"
						disabled={!undoStack.length}
						onClick={() => void undoLast()}
						className="border border-border px-4 py-2 min-h-11 text-technical hover:border-ink disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					>
						Undo last review
					</button>
				</div>
			</div>

			{keyboardHelpOpen ? (
				<div className="border border-border px-4 py-3 text-technical text-muted text-sm space-y-2">
					<p>
						<strong className="text-ink">Screening:</strong> ← pass · → strong
						yes · ↑ maybe · ↓ shortlist (or swipe). Keys 1–4 = pass / maybe /
						shortlist / yes.{" "}
						<kbd className="px-1 border border-border rounded">u</kbd> undo,{" "}
						<kbd className="px-1 border border-border rounded">n</kbd> focus
						notes, <kbd className="px-1 border border-border rounded">?</kbd>{" "}
						toggle this panel.
					</p>
					<p>
						<strong className="text-ink">Final:</strong> 1–3 = pass / maybe /
						strong yes. No shortlist.
					</p>
					<button
						type="button"
						onClick={dismissKeyboardHelp}
						className="border border-border px-3 py-2 min-h-11 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					>
						Got it
					</button>
				</div>
			) : null}

			{message ? (
				<div className="space-y-1 border border-danger/40 bg-danger-bg/20 px-4 py-3">
					<p className="text-sm text-danger">{message}</p>
					<p className="text-technical text-xs text-muted">
						Something went wrong talking to the database or validating your
						session. Try refresh; if it persists, check Supabase status and your
						network.
					</p>
				</div>
			) : null}

			<div className="lg:hidden">
				<button
					type="button"
					aria-expanded={notesOpen}
					onClick={() => setNotesOpen((o) => !o)}
					className="w-full border border-border py-3 min-h-11 text-technical hover:border-ink mb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
				>
					{notesOpen ? "Hide screening notes" : "Screening notes"}
				</button>
			</div>

			<div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
				<div className="relative min-h-[420px] flex items-center justify-center px-2">
					{emptyKind === "none_submitted" ? (
						<div className="text-center space-y-4 max-w-md">
							<p className="text-technical text-muted">
								No submitted applications yet.
							</p>
							<p className="text-sm text-muted font-sans">
								When applicants submit, they will appear here.
							</p>
							<Link
								to="/"
								className="inline-flex min-h-11 items-center justify-center border border-accent px-4 py-2 text-technical text-accent hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								Back to site
							</Link>
						</div>
					) : null}
					{emptyKind === "all_reviewed" ? (
						<div className="text-center space-y-3 max-w-md">
							<p className="text-technical text-ink">Screening caught up.</p>
							<p className="text-sm text-muted font-sans">
								Switch to Final for the second pass, or adjust filters.
							</p>
							<button
								type="button"
								onClick={() => void refreshQueue()}
								className="border border-accent px-4 py-2 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								Refresh queue
							</button>
						</div>
					) : null}
					{emptyKind === "final_empty" ? (
						<div className="text-center space-y-3 max-w-md">
							<p className="text-technical text-ink">Nothing in final queue.</p>
							<p className="text-sm text-muted font-sans">
								Complete screening (non-pass) to surface apps here, or adjust
								filters.
							</p>
							<button
								type="button"
								onClick={() => setParam("phase", null)}
								className="border border-accent px-4 py-2 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								Go to screening
							</button>
						</div>
					) : null}
					{emptyKind === "batch_empty" ? (
						<div className="text-center space-y-4 max-w-md">
							<p className="text-technical text-muted">
								No applications in this batch.
							</p>
							<p className="text-sm text-muted font-sans">
								Clear the custom id or choose &quot;All batches&quot; to see
								every pending application.
							</p>
							<button
								type="button"
								onClick={() => {
									setBatchSelect("all");
									setBatchCustom("");
								}}
								className="border border-accent px-4 py-2 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								Clear batch filter
							</button>
						</div>
					) : null}
					{emptyKind === "empty" && !current ? (
						<p className="text-technical text-muted">
							No applications in this queue.
						</p>
					) : null}

					{viewMode === "table" && queue.length > 0 ? (
						<div className="w-full overflow-x-auto border border-border">
							<table className="w-full text-left text-sm font-sans">
								<thead className="text-technical text-muted border-b border-border">
									<tr>
										<th className="p-2">Batch</th>
										<th className="p-2">Cohort</th>
										<th className="p-2">Tags</th>
										<th className="p-2">Name</th>
									</tr>
								</thead>
								<tbody>
									{queue.map((row) => {
										const ans = row.answers as unknown as ApplicationAnswers;
										return (
											<tr key={row.id} className="border-b border-border/60">
												<td className="p-2 font-mono text-xs">
													{row.batch_id}
												</td>
												<td className="p-2">{row.cohort ?? "—"}</td>
												<td className="p-2">
													{(row.tags ?? []).join(", ") || "—"}
												</td>
												<td className="p-2">{ans.fullName || "—"}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
							<p className="text-technical text-xs text-muted p-2">
								Deck view is for decisions; use Admin → Reviews for batch tags
								and assignment.
							</p>
						</div>
					) : null}

					{current && viewMode === "deck" ? (
						<div
							className="relative w-full max-w-lg mx-auto"
							style={{ minHeight: reviewStackMinHeightPx }}
						>
							{current && !swipeHintDismissed ? (
								<div className="absolute -top-2 left-1/2 z-20 w-[min(100%,22rem)] -translate-x-1/2 -translate-y-full px-3">
									<div className="border border-border bg-bg-raised/95 px-3 py-2 text-center shadow-lg backdrop-blur-sm">
										<p className="text-technical text-[0.65rem] text-muted leading-snug">
											Drag: ← pass · → yes · ↑ maybe
											{reviewPhase === "screening" ? " · ↓ shortlist" : ""}.
										</p>
										<button
											type="button"
											onClick={dismissSwipeHint}
											className="mt-2 inline-flex min-h-11 items-center justify-center px-2 text-technical text-xs text-accent hover:text-accent-hover underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded"
										>
											Don&apos;t show again
										</button>
									</div>
								</div>
							) : null}
							{nextApp && viewMode === "deck" ? (
								<div
									className="absolute inset-x-4 top-6 z-0 scale-[0.96] opacity-40 border border-border bg-bg pointer-events-none"
									aria-hidden
								>
									<CardContent
										answers={nextAnswers}
										blind={false}
										onReveal={() => {}}
									/>
								</div>
							) : null}
							<motion.div
								style={
									reduceMotion
										? undefined
										: {
												x,
												rotate,
											}
								}
								drag={!reduceMotion && viewMode === "deck"}
								dragConstraints={{
									left: -220,
									right: 220,
									top: -160,
									bottom: 160,
								}}
								dragElastic={0.85}
								onDragEnd={onDragEnd}
								className={`relative z-10 w-full border border-border-strong bg-bg shadow-[var(--shadow-marketing-lg)] ${
									reduceMotion ? "" : "cursor-grab active:cursor-grabbing"
								} touch-pan-y`}
								layout={!reduceMotion}
								transition={
									reduceMotion
										? { duration: 0 }
										: { type: "spring", stiffness: 420, damping: 28 }
								}
							>
								{!reduceMotion && viewMode === "deck" ? (
									<>
										<motion.div
											className="absolute inset-0 pointer-events-none flex justify-between items-center px-6 text-technical"
											style={{ opacity: hintLeft }}
										>
											<span className="text-danger border border-danger/50 px-2 py-1">
												PASS
											</span>
										</motion.div>
										<motion.div
											className="absolute inset-0 pointer-events-none flex justify-between items-center px-6 text-technical"
											style={{ opacity: hintRight }}
										>
											<span />
											<span className="text-success border border-success/50 px-2 py-1">
												YES
											</span>
										</motion.div>
									</>
								) : null}
								<CardContent
									ref={cardContentRef}
									answers={answers}
									blind={blindEffective}
									onReveal={handleRevealIdentity}
								/>
							</motion.div>
						</div>
					) : null}
				</div>

				<div
					className={`space-y-4 border border-border p-4 max-h-[55vh] overflow-y-auto lg:max-h-none
            fixed bottom-0 left-0 right-0 z-[120] bg-bg border-t shadow-[0_-12px_40px_rgba(0,0,0,0.45)]
            lg:static lg:z-auto lg:border lg:shadow-none lg:rounded-none
            ${notesOpen ? "block" : "hidden lg:block"}`}
				>
					<h3 className="type-portal-title-sans text-muted">
						Rubric &amp; notes
					</h3>
					<p className="text-technical text-[11px] text-muted">
						Notes are private to reviewers and admins; applicants never see
						them.
					</p>
					{peerReviews.length > 0 ? (
						<div className="border border-border/60 p-3 space-y-2 bg-bg-raised/30">
							<p className="text-technical text-xs text-muted">
								Other reviewers
							</p>
							<ul className="space-y-2 text-xs font-sans text-muted max-h-32 overflow-y-auto">
								{peerReviews.map((pr) => (
									<li key={pr.id}>
										<span className="text-ink">{pr.verdict}</span> ·{" "}
										{pr.review_phase} ·{" "}
										{pr.notes?.trim()
											? pr.notes.slice(0, 120) +
												(pr.notes.length > 120 ? "…" : "")
											: "—"}
									</li>
								))}
							</ul>
						</div>
					) : null}
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">
							Legacy score (1–5)
						</span>
						<select
							value={score}
							onChange={(e) => setScore(e.target.value)}
							className="w-full bg-bg border border-border px-2 py-2 min-h-11 font-sans"
						>
							{["1", "2", "3", "4", "5"].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Fit</span>
						<select
							value={fitScore}
							onChange={(e) => setFitScore(e.target.value)}
							className="w-full bg-bg border border-border px-2 py-2 min-h-11 font-sans"
						>
							{["1", "2", "3", "4", "5"].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">
							Communication
						</span>
						<select
							value={commScore}
							onChange={(e) => setCommScore(e.target.value)}
							className="w-full bg-bg border border-border px-2 py-2 min-h-11 font-sans"
						>
							{["1", "2", "3", "4", "5"].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">
							Private notes
						</span>
						<textarea
							ref={screeningNotesRef}
							id="review-screening-notes"
							rows={screeningNotesRows}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							aria-describedby="review-screening-notes-hint"
							className="w-full max-h-64 overflow-y-auto bg-transparent border border-border px-2 py-2 font-sans text-sm"
						/>
						<p
							id="review-screening-notes-hint"
							className="text-technical text-[11px] text-muted leading-snug"
						>
							Expands up to 14 lines with your text, then scrolls.
						</p>
					</label>
					<div
						className={`grid gap-3 ${reviewPhase === "screening" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}
					>
						<button
							type="button"
							onClick={() => void recordVerdict("pass")}
							disabled={!current}
							className="flex min-h-12 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-danger/50 bg-danger-bg/20 px-3 py-3 text-technical text-xs text-danger transition-colors duration-200 hover:bg-danger-bg/35 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:min-h-11 sm:flex-row sm:gap-2"
						>
							<X className="size-4 shrink-0" aria-hidden />
							Pass
						</button>
						<button
							type="button"
							onClick={() => void recordVerdict("maybe")}
							disabled={!current}
							className="flex min-h-12 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-warning/50 bg-warning-bg/20 px-3 py-3 text-technical text-xs text-warning transition-colors duration-200 hover:bg-warning-bg/35 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:min-h-11 sm:flex-row sm:gap-2"
						>
							<CircleDot className="size-4 shrink-0" aria-hidden />
							Maybe
						</button>
						{reviewPhase === "screening" ? (
							<button
								type="button"
								onClick={() => void recordVerdict("shortlist")}
								disabled={!current}
								className="flex min-h-12 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-accent/50 bg-accent/10 px-3 py-3 text-technical text-xs text-ink transition-colors duration-200 hover:bg-accent/20 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:min-h-11 sm:flex-row sm:gap-2"
							>
								<Bookmark className="size-4 shrink-0" aria-hidden />
								Shortlist
							</button>
						) : null}
						<button
							type="button"
							onClick={() => void recordVerdict("yes")}
							disabled={!current}
							className="flex min-h-12 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-success/50 bg-success-bg/20 px-3 py-3 text-technical text-xs text-success transition-colors duration-200 hover:bg-success-bg/35 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:min-h-11 sm:flex-row sm:gap-2"
						>
							<BadgeCheck className="size-4 shrink-0" aria-hidden />
							Strong yes
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
