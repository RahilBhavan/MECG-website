import { BadgeCheck, CircleDot, HelpCircle, X } from "lucide-react";
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
import { Link } from "react-router-dom";

import { useAuth } from "@/src/auth/AuthProvider";
import { ReviewPageSkeleton } from "@/src/components/skeletons/ReviewPageSkeleton";
import { useToast } from "@/src/components/toast/ToastProvider";
import { usePrefersReducedMotion } from "@/src/hooks/use-prefers-reduced-motion";
import { usePretextTextareaRows } from "@/src/hooks/use-pretext-textarea-rows";
import { useReviewCardStackMinHeight } from "@/src/hooks/use-review-card-stack-min-height";
import { createApplicationHeadshotSignedUrl } from "@/src/lib/application-headshot-storage";
import { supabase } from "@/src/lib/supabase";
import type {
	ApplicationAnswers,
	ApplicationReviewRow,
	ApplicationRow,
	ReviewVerdict,
} from "@/src/types/database";

const SWIPE_X = 140;
const LEGEND_KEY = "mecg.review.keys.dismissed";
const SWIPE_HINT_KEY = "mecg.review.swipeHint.dismissed";

function envReviewBatchIds(): string[] {
	const raw = String(import.meta.env.VITE_REVIEW_BATCH_IDS ?? "").trim();
	if (!raw) return ["default"];
	const parts = raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	return parts.length ? Array.from(new Set(parts)) : ["default"];
}

interface UndoEntry {
	reviewId: string;
	application: ApplicationRow;
}

function ReviewApplicantHeadshot({
	path,
	fullName,
}: {
	path: string;
	fullName: string;
}) {
	const [src, setSrc] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setSrc(null);
		setFailed(false);
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
	}, [path]);

	const label = fullName.trim()
		? `Headshot of ${fullName.trim()}`
		: "Applicant headshot";

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

const CardContent = forwardRef<HTMLDivElement, { answers: ApplicationAnswers }>(
	function CardContent({ answers }, ref) {
		const headshotPath = answers.headshotPath?.trim();
		return (
			<div ref={ref} className="space-y-4 p-6">
				{headshotPath ? (
					<div className="flex justify-center sm:justify-start">
						<ReviewApplicantHeadshot
							path={headshotPath}
							fullName={answers.fullName ?? ""}
						/>
					</div>
				) : null}
				<h2 className="text-2xl font-display">
					{answers.fullName || "Applicant"}
				</h2>
				<p className="text-technical text-muted">
					{answers.major} · {answers.academicYear}
				</p>
				<p className="font-sans font-light text-muted leading-relaxed whitespace-pre-wrap">
					{answers.whyMecg}
				</p>
				{answers.resumeUrl ? (
					<a
						href={answers.resumeUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-technical text-ink hover:underline inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded"
					>
						Open resume link
					</a>
				) : null}
			</div>
		);
	},
);

function flashClass(verdict: ReviewVerdict | null): string {
	if (!verdict) return "";
	if (verdict === "pass") return "bg-danger-bg/55";
	if (verdict === "yes") return "bg-success-bg/55";
	return "bg-warning-bg/55";
}

export default function ReviewPage() {
	const { user } = useAuth();
	const { pushToast } = useToast();
	const reduceMotion = usePrefersReducedMotion();
	/** Menu choice when custom field is empty. */
	const [batchSelect, setBatchSelect] = useState("all");
	/** When non-empty, overrides `batchSelect` for filtering. */
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
	const [unreviewedCount, setUnreviewedCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [notes, setNotes] = useState("");
	const [score, setScore] = useState<string>("3");
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

		const eligible = (apps as ApplicationRow[]) ?? [];
		setEligibleCount(eligible.length);

		const { data: mine, error: revError } = await supabase
			.from("application_reviews")
			.select("application_id")
			.eq("reviewer_id", user.id);

		if (revError) {
			setMessage(revError.message);
			setLoading(false);
			return;
		}

		const reviewed = new Set(
			((mine ?? []) as { application_id: string }[]).map(
				(r) => r.application_id,
			),
		);
		const unreviewed = eligible.filter((a) => !reviewed.has(a.id));
		setUnreviewedCount(unreviewed.length);

		let list = unreviewed;
		if (batchFilter !== "all") {
			list = list.filter((a) => a.batch_id === batchFilter);
		}

		setQueue(list);
		setLoading(false);
	}, [user, batchFilter]);

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

	const recordVerdict = useCallback(
		async (verdict: ReviewVerdict) => {
			if (!user) return;
			const cur = queue[0];
			if (!cur) return;
			setMessage(null);
			const scoreNum = Number.parseInt(score, 10);
			const payload = {
				application_id: cur.id,
				reviewer_id: user.id,
				verdict,
				score: Number.isFinite(scoreNum) ? scoreNum : null,
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

			localStorage.setItem(SWIPE_HINT_KEY, "1");
			setSwipeHintDismissed(true);

			const review = data as ApplicationReviewRow;
			setFlashVerdict(verdict);
			const delay = reduceMotion ? 0 : 260;
			window.setTimeout(() => {
				setUndoStack((s) => [...s, { reviewId: review.id, application: cur }]);
				setNotes("");
				setQueue((q) => q.slice(1));
				setFlashVerdict(null);
				x.set(0);
			}, delay);
		},
		[user, queue, notes, score, x, reduceMotion, pushToast],
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
			if (!queue[0]) return;
			if (e.key === "ArrowLeft") void recordVerdict("pass");
			if (e.key === "ArrowRight") void recordVerdict("yes");
			if (e.key === "ArrowUp") void recordVerdict("maybe");
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [queue, recordVerdict]);

	async function undoLast() {
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
	}

	function onDragEnd(_: unknown, info: PanInfo) {
		if (reduceMotion) return;
		if (info.offset.x > SWIPE_X) void recordVerdict("yes");
		else if (info.offset.x < -SWIPE_X) void recordVerdict("pass");
		else if (info.offset.y < -SWIPE_X) void recordVerdict("maybe");
		else x.set(0);
	}

	const emptyKind =
		!loading && eligibleCount === 0
			? "none_submitted"
			: !loading && unreviewedCount === 0 && eligibleCount > 0
				? "all_reviewed"
				: !loading &&
						queue.length === 0 &&
						unreviewedCount > 0 &&
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
						{queue.length} left in queue
						{batchFilter !== "all" ? (
							<span className="ml-2">
								· Batch filter: <span className="text-ink">{batchFilter}</span>
							</span>
						) : null}
						<span className="ml-2">
							· {eligibleCount} submitted (excl. yours), {unreviewedCount} not
							yet reviewed by you
						</span>
					</p>
					<p className="sr-only" aria-live="polite" aria-atomic="true">
						{queue.length} {queue.length === 1 ? "application" : "applications"}{" "}
						left in your review queue.
					</p>
				</div>
				<div className="flex flex-wrap gap-3 items-center">
					<button
						type="button"
						className="min-h-11 min-w-11 border border-border flex items-center justify-center hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded"
						aria-expanded={keyboardHelpOpen}
						aria-label="Toggle keyboard shortcuts help"
						onClick={() => setKeyboardHelpOpen((o) => !o)}
					>
						<HelpCircle className="h-5 w-5" aria-hidden />
					</button>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
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
				<div className="border border-border px-4 py-3 text-technical text-muted text-sm flex flex-wrap items-center justify-between gap-2">
					<span>
						Keyboard: ← pass · → strong yes · ↑ maybe (not while typing in
						notes)
					</span>
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
							<p className="text-technical text-ink">You&apos;re caught up.</p>
							<p className="text-sm text-muted font-sans">
								Every eligible application already has your review.
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

					{current ? (
						<div
							className="relative w-full max-w-lg mx-auto"
							style={{ minHeight: reviewStackMinHeightPx }}
						>
							{current && !swipeHintDismissed ? (
								<div className="absolute -top-2 left-1/2 z-20 w-[min(100%,22rem)] -translate-x-1/2 -translate-y-full px-3">
									<div className="border border-border bg-bg-raised/95 px-3 py-2 text-center shadow-lg backdrop-blur-sm">
										<p className="text-technical text-[0.65rem] text-muted leading-snug">
											Drag the card or use keys: ← pass · → yes · ↑ maybe.
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
							{nextApp ? (
								<div
									className="absolute inset-x-4 top-6 z-0 scale-[0.96] opacity-40 border border-border bg-bg pointer-events-none"
									aria-hidden
								>
									<CardContent answers={nextAnswers} />
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
								drag={!reduceMotion}
								dragConstraints={{
									left: -220,
									right: 220,
									top: -160,
									bottom: 160,
								}}
								dragElastic={0.85}
								onDragEnd={onDragEnd}
								className={`relative z-10 w-full border border-border bg-bg shadow-2xl ${
									reduceMotion ? "" : "cursor-grab active:cursor-grabbing"
								} touch-pan-y`}
								layout={!reduceMotion}
								transition={
									reduceMotion
										? { duration: 0 }
										: { type: "spring", stiffness: 420, damping: 28 }
								}
							>
								{!reduceMotion ? (
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
								<CardContent ref={cardContentRef} answers={answers} />
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
					<h3 className="text-technical text-muted">Screening notes</h3>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">
							Score (1–5)
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
					<div className="grid grid-cols-3 gap-2">
						<button
							type="button"
							onClick={() => void recordVerdict("pass")}
							disabled={!current}
							className="flex min-h-11 flex-col items-center justify-center gap-1 border border-danger/50 px-1 py-2 text-technical text-xs text-danger disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:flex-row sm:gap-1.5"
						>
							<X className="size-4 shrink-0" aria-hidden />
							Pass
						</button>
						<button
							type="button"
							onClick={() => void recordVerdict("maybe")}
							disabled={!current}
							className="flex min-h-11 flex-col items-center justify-center gap-1 border border-warning/50 px-1 py-2 text-technical text-xs text-warning disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:flex-row sm:gap-1.5"
						>
							<CircleDot className="size-4 shrink-0" aria-hidden />
							Maybe
						</button>
						<button
							type="button"
							onClick={() => void recordVerdict("yes")}
							disabled={!current}
							className="flex min-h-11 flex-col items-center justify-center gap-1 border border-success/50 px-1 py-2 text-technical text-xs text-success disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:flex-row sm:gap-1.5"
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
