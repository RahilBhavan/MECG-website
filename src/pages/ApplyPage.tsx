import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { hasRole, useAuth } from "@/src/auth/AuthProvider";
import {
	AcceptedOnboardingPanel,
	RejectedClosurePanel,
} from "@/src/components/application-post-decision-panels";
import { ApplicationStatusHub } from "@/src/components/application-status-hub";
import { ApplyPageSkeleton } from "@/src/components/skeletons/ApplyPageSkeleton";
import { useToast } from "@/src/components/toast/ToastProvider";
import { usePretextTextareaRows } from "@/src/hooks/use-pretext-textarea-rows";
import {
	blurFieldMessage,
	buildAnswersPayload,
	emptyAnswers,
	getApplicationSubmitFieldErrors,
	normalizeAnswers,
	resumeUrlFieldError,
	serializeDraftSnapshot,
} from "@/src/lib/application-form";
import {
	APPLICATION_HEADSHOT_ACCEPT,
	APPLICATION_HEADSHOT_MAX_BYTES,
	APPLICATION_HEADSHOTS_BUCKET,
	createApplicationHeadshotSignedUrl,
	headshotStoragePath,
	isApplicationHeadshotMime,
} from "@/src/lib/application-headshot-storage";
import { getPrefersReducedMotion } from "@/src/lib/motion-preference";
import { supabase } from "@/src/lib/supabase";
import type {
	ApplicationAnswers,
	ApplicationRow,
	ApplicationStatus,
} from "@/src/types/database";

const STEPS = ["About you", "Essay", "Links"] as const;

const AUTOSAVE_DEBOUNCE_MS = 1000;

const HEADSHOT_MAX_MB = Math.round(
	APPLICATION_HEADSHOT_MAX_BYTES / (1024 * 1024),
);

const TEXT_FIELD_ORDER = [
	"fullName",
	"major",
	"academicYear",
	"whyMecg",
] as const;

/** Order for submit validation focus (includes headshot after name). */
const SUBMIT_FOCUS_ORDER = [
	"fullName",
	"headshotPath",
	"major",
	"academicYear",
	"whyMecg",
	"resumeUrl",
] as const;

function RequiredMark() {
	return (
		<span className="text-danger ml-0.5" aria-hidden>
			*
		</span>
	);
}

function stepForField(
	key: (typeof TEXT_FIELD_ORDER)[number] | "headshotPath" | "resumeUrl",
): number {
	if (key === "whyMecg") return 1;
	if (key === "resumeUrl") return 2;
	return 0;
}

function SubmittedHeadshotSummary({ path }: { path: string }) {
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

	return (
		<div>
			<dt className="text-technical text-muted">Headshot</dt>
			<dd className="mt-2">
				{failed ? (
					<p className="text-sm text-muted">Could not load photo.</p>
				) : src ? (
					<img
						src={src}
						alt="Your submitted headshot"
						width={128}
						height={128}
						decoding="async"
						className="h-32 w-32 rounded border border-border object-cover"
					/>
				) : (
					<p className="text-sm text-muted">Loading photo…</p>
				)}
			</dd>
		</div>
	);
}

export default function ApplyPage() {
	const { user, roles } = useAuth();
	const { pushToast } = useToast();
	const isAdmin = hasRole(roles, "admin");
	const [row, setRow] = useState<ApplicationRow | null>(null);
	const [answers, setAnswers] = useState<ApplicationAnswers>(emptyAnswers());
	const [batchId, setBatchId] = useState("default");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [activeStep, setActiveStep] = useState(0);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [saveNotice, setSaveNotice] = useState<"idle" | "saving" | "saved">(
		"idle",
	);
	const [saveNoticeError, setSaveNoticeError] = useState<string | null>(null);
	const saveNoticeResetRef = useRef<number | null>(null);
	const answersRef = useRef(answers);
	const batchIdRef = useRef(batchId);
	const lastSyncedSnapshotRef = useRef("");
	const lastSaveFailedRef = useRef(false);
	const autosaveTimerRef = useRef<number | null>(null);
	const [headshotUploadStatus, setHeadshotUploadStatus] = useState("");
	const [submitBlockMessage, setSubmitBlockMessage] = useState("");

	const fullNameRef = useRef<HTMLInputElement>(null);
	const majorRef = useRef<HTMLInputElement>(null);
	const academicYearRef = useRef<HTMLInputElement>(null);
	const whyMecgRef = useRef<HTMLTextAreaElement>(null);
	const resumeUrlRef = useRef<HTMLInputElement>(null);
	const submitDialogRef = useRef<HTMLDialogElement>(null);
	const headshotPickRef = useRef<HTMLButtonElement>(null);
	const headshotInputRef = useRef<HTMLInputElement>(null);
	const localHeadshotObjectUrlRef = useRef<string | null>(null);

	const [headshotUploading, setHeadshotUploading] = useState(false);
	const [localHeadshotPreviewUrl, setLocalHeadshotPreviewUrl] = useState<
		string | null
	>(null);
	const [remoteHeadshotPreviewUrl, setRemoteHeadshotPreviewUrl] = useState<
		string | null
	>(null);

	const whyMecgRows = usePretextTextareaRows({
		textareaRef: whyMecgRef,
		value: answers.whyMecg,
		minRows: 8,
		maxRows: 24,
	});

	const fieldRefs = useMemo(
		() =>
			({
				fullName: fullNameRef,
				major: majorRef,
				academicYear: academicYearRef,
				whyMecg: whyMecgRef,
			}) as const,
		[],
	);

	const status: ApplicationStatus = row?.status ?? "draft";
	const isEditable = status === "draft";

	const submitReady = useMemo(() => {
		return (
			answers.fullName.trim().length > 0 &&
			(answers.headshotPath?.trim().length ?? 0) > 0 &&
			answers.major.trim().length > 0 &&
			answers.academicYear.trim().length > 0 &&
			answers.whyMecg.trim().length > 0
		);
	}, [answers]);

	const headshotDisplayUrl =
		localHeadshotPreviewUrl ?? remoteHeadshotPreviewUrl ?? null;

	function revokeLocalHeadshotPreview() {
		if (localHeadshotObjectUrlRef.current) {
			URL.revokeObjectURL(localHeadshotObjectUrlRef.current);
			localHeadshotObjectUrlRef.current = null;
		}
		setLocalHeadshotPreviewUrl(null);
	}

	function primeLocalHeadshotPreview(file: File) {
		revokeLocalHeadshotPreview();
		const url = URL.createObjectURL(file);
		localHeadshotObjectUrlRef.current = url;
		setLocalHeadshotPreviewUrl(url);
	}

	useEffect(() => {
		answersRef.current = answers;
		batchIdRef.current = batchId;
	}, [answers, batchId]);

	useEffect(() => {
		return () => {
			if (saveNoticeResetRef.current != null)
				window.clearTimeout(saveNoticeResetRef.current);
		};
	}, []);

	useEffect(() => {
		return () => {
			if (localHeadshotObjectUrlRef.current) {
				URL.revokeObjectURL(localHeadshotObjectUrlRef.current);
				localHeadshotObjectUrlRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		const path = answers.headshotPath?.trim();
		if (!path || localHeadshotPreviewUrl) {
			setRemoteHeadshotPreviewUrl(null);
			return;
		}
		void createApplicationHeadshotSignedUrl(supabase, path).then((url) => {
			if (!cancelled) setRemoteHeadshotPreviewUrl(url);
		});
		return () => {
			cancelled = true;
		};
	}, [answers.headshotPath, localHeadshotPreviewUrl]);

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		const { data, error } = await supabase
			.from("applications")
			.select("*")
			.eq("user_id", user.id)
			.maybeSingle();
		if (error) {
			setMessage(error.message);
			setLoading(false);
			return;
		}
		if (!data) {
			const insert = await supabase
				.from("applications")
				.insert({
					user_id: user.id,
					status: "draft",
					batch_id: "default",
					answers: emptyAnswers() as unknown as Record<string, unknown>,
				})
				.select("*")
				.single();
			if (insert.error) {
				setMessage(insert.error.message);
				setLoading(false);
				return;
			}
			if (!insert.data) {
				setMessage("Could not create application.");
				setLoading(false);
				return;
			}
			const created = insert.data as ApplicationRow;
			setRow({
				...created,
				tags: created.tags ?? [],
				cohort: created.cohort ?? null,
				assigned_reviewer_id: created.assigned_reviewer_id ?? null,
			});
			setAnswers(normalizeAnswers(created.answers));
			setBatchId(created.batch_id);
		} else {
			const app = data as ApplicationRow;
			setRow({
				...app,
				tags: app.tags ?? [],
				cohort: app.cohort ?? null,
				assigned_reviewer_id: app.assigned_reviewer_id ?? null,
			});
			setAnswers(normalizeAnswers(data.answers));
			setBatchId(data.batch_id);
		}
		setLoading(false);
	}, [user]);

	useEffect(() => {
		void load();
	}, [load]);

	const scheduleSaveNoticeReset = useCallback(() => {
		if (saveNoticeResetRef.current != null)
			window.clearTimeout(saveNoticeResetRef.current);
		saveNoticeResetRef.current = window.setTimeout(() => {
			setSaveNotice("idle");
			saveNoticeResetRef.current = null;
		}, 5000);
	}, []);

	/** Align snapshot when a draft row is loaded/refreshed from the server (not on each keystroke). */
	useEffect(() => {
		if (loading || !row || row.status !== "draft") return;
		lastSyncedSnapshotRef.current = serializeDraftSnapshot(
			answersRef.current,
			batchIdRef.current,
		);
	}, [loading, row]);

	function blurValidateField(
		field: (typeof TEXT_FIELD_ORDER)[number],
		value: string,
	) {
		const msg = blurFieldMessage(field, value);
		setFieldErrors((f) => ({ ...f, [field]: msg }));
	}

	function focusFirstFieldError(errors: Record<string, string>) {
		for (const key of SUBMIT_FOCUS_ORDER) {
			if (!errors[key]) continue;
			const step = stepForField(key);
			setActiveStep(step);
			if (key === "headshotPath") {
				window.requestAnimationFrame(() => {
					headshotPickRef.current?.focus();
					headshotPickRef.current?.scrollIntoView({
						block: "nearest",
						behavior: getPrefersReducedMotion() ? "auto" : "smooth",
					});
				});
				break;
			}
			if (key === "resumeUrl") {
				window.requestAnimationFrame(() => {
					resumeUrlRef.current?.focus();
					resumeUrlRef.current?.scrollIntoView({
						block: "nearest",
						behavior: getPrefersReducedMotion() ? "auto" : "smooth",
					});
				});
				break;
			}
			const ref = fieldRefs[key as keyof typeof fieldRefs];
			window.requestAnimationFrame(() => {
				const el = ref.current;
				if (!el) return;
				el.focus();
				el.scrollIntoView({
					block: "nearest",
					behavior: getPrefersReducedMotion() ? "auto" : "smooth",
				});
			});
			break;
		}
	}

	const persistDraft = useCallback(
		async (mode: "manual" | "auto") => {
			if (!user || !row || row.status !== "draft") return false;
			const a = answersRef.current;
			const b = batchIdRef.current;
			const payload = buildAnswersPayload(a);
			const snapshot = serializeDraftSnapshot(a, b);

			setSaving(true);
			if (mode === "manual") {
				setMessage(null);
				setSaveNoticeError(null);
				setSaveNotice("saving");
			}
			const { error } = await supabase
				.from("applications")
				.update({
					answers: payload as unknown as Record<string, unknown>,
					batch_id: b,
				})
				.eq("id", row.id)
				.eq("user_id", user.id);
			setSaving(false);
			if (error) {
				lastSaveFailedRef.current = true;
				if (mode === "manual") {
					setSaveNotice("idle");
					setSaveNoticeError(error.message);
					setMessage(error.message);
					pushToast(error.message, "error");
				} else {
					setSaveNoticeError(error.message);
					pushToast("Couldn’t autosave — check your connection.", "error");
				}
				return false;
			}
			lastSaveFailedRef.current = false;
			lastSyncedSnapshotRef.current = snapshot;
			if (mode === "manual") {
				setSaveNotice("saved");
				scheduleSaveNoticeReset();
				pushToast("Draft saved.", "success");
				void load();
			} else {
				setSaveNoticeError(null);
				setSaveNotice("saved");
				scheduleSaveNoticeReset();
			}
			return true;
		},
		[user, row, pushToast, load, scheduleSaveNoticeReset],
	);

	function saveDraft() {
		void persistDraft("manual");
	}

	useEffect(() => {
		if (!user || !row || row.status !== "draft" || loading) return;
		if (saving || headshotUploading) return;
		const snap = serializeDraftSnapshot(answers, batchId);
		if (snap === lastSyncedSnapshotRef.current) return;

		if (autosaveTimerRef.current != null)
			window.clearTimeout(autosaveTimerRef.current);
		autosaveTimerRef.current = window.setTimeout(() => {
			autosaveTimerRef.current = null;
			void persistDraft("auto");
		}, AUTOSAVE_DEBOUNCE_MS);

		return () => {
			if (autosaveTimerRef.current != null) {
				window.clearTimeout(autosaveTimerRef.current);
				autosaveTimerRef.current = null;
			}
		};
	}, [
		answers,
		batchId,
		user,
		row,
		loading,
		saving,
		headshotUploading,
		persistDraft,
	]);

	useEffect(() => {
		const onBeforeUnload = (e: BeforeUnloadEvent) => {
			if (!row || row.status !== "draft") return;
			const snap = serializeDraftSnapshot(answers, batchId);
			if (snap === lastSyncedSnapshotRef.current) return;
			if (!lastSaveFailedRef.current) return;
			e.preventDefault();
			e.returnValue = "";
		};
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, [row, answers, batchId]);

	function announceHeadshotStatus(msg: string) {
		setHeadshotUploadStatus(msg);
		window.setTimeout(() => setHeadshotUploadStatus(""), 6000);
	}

	async function uploadHeadshotFile(file: File) {
		if (!user) return;
		if (!isApplicationHeadshotMime(file.type)) {
			announceHeadshotStatus("Error: use JPEG, PNG, or WebP.");
			pushToast("Use a JPEG, PNG, or WebP image.", "error");
			return;
		}
		if (file.size > APPLICATION_HEADSHOT_MAX_BYTES) {
			announceHeadshotStatus("Error: image must be 5 megabytes or smaller.");
			pushToast("Image must be 5 MB or smaller.", "error");
			return;
		}
		const path = headshotStoragePath(user.id, file.type);
		const previousPath = answers.headshotPath?.trim();
		primeLocalHeadshotPreview(file);
		setHeadshotUploading(true);
		const { error } = await supabase.storage
			.from(APPLICATION_HEADSHOTS_BUCKET)
			.upload(path, file, { upsert: true, contentType: file.type });
		setHeadshotUploading(false);
		if (error) {
			revokeLocalHeadshotPreview();
			announceHeadshotStatus(`Error: ${error.message}`);
			pushToast(error.message, "error");
			return;
		}
		if (previousPath && previousPath !== path) {
			await supabase.storage
				.from(APPLICATION_HEADSHOTS_BUCKET)
				.remove([previousPath]);
		}
		revokeLocalHeadshotPreview();
		setAnswers((a) => ({ ...a, headshotPath: path }));
		setFieldErrors((f) => ({ ...f, headshotPath: "" }));
		announceHeadshotStatus("Headshot uploaded successfully.");
		pushToast("Headshot uploaded.", "success");
	}

	function onHeadshotFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		void uploadHeadshotFile(file);
	}

	async function removeHeadshot() {
		if (!user) return;
		const path = answers.headshotPath?.trim();
		if (!path) return;
		setHeadshotUploading(true);
		const { error } = await supabase.storage
			.from(APPLICATION_HEADSHOTS_BUCKET)
			.remove([path]);
		setHeadshotUploading(false);
		if (error) {
			announceHeadshotStatus(`Error: ${error.message}`);
			pushToast(error.message, "error");
			return;
		}
		revokeLocalHeadshotPreview();
		setAnswers((a) => ({ ...a, headshotPath: "" }));
		setRemoteHeadshotPreviewUrl(null);
		announceHeadshotStatus("Headshot removed.");
		pushToast("Headshot removed.", "success");
	}

	function openSubmitDialog() {
		if (!user || !row || !isEditable) return;
		setSubmitBlockMessage("");
		const submitErrors = getApplicationSubmitFieldErrors(answers);
		setFieldErrors(submitErrors);
		const keys = Object.keys(submitErrors);
		if (keys.length > 0) {
			const n = keys.length;
			setSubmitBlockMessage(
				n === 1
					? "Fix the highlighted field before submitting."
					: `Fix ${n} highlighted fields before submitting.`,
			);
			pushToast("Fill in all required fields before submitting.", "error");
			focusFirstFieldError(submitErrors);
			return;
		}
		submitDialogRef.current?.showModal();
	}

	function closeSubmitDialog() {
		submitDialogRef.current?.close();
	}

	async function performSubmit() {
		if (!user || !row || !isEditable) return;
		setSubmitBlockMessage("");
		const submitErrors = getApplicationSubmitFieldErrors(answers);
		if (Object.keys(submitErrors).length > 0) {
			setFieldErrors(submitErrors);
			const n = Object.keys(submitErrors).length;
			setSubmitBlockMessage(
				n === 1
					? "Fix the highlighted field before submitting."
					: `Fix ${n} highlighted fields before submitting.`,
			);
			pushToast("Fill in all required fields before submitting.", "error");
			focusFirstFieldError(submitErrors);
			return;
		}
		setSaving(true);
		setMessage(null);
		const payload = buildAnswersPayload(answers);

		const { data: profileRow } = await supabase
			.from("profiles")
			.select("cohort")
			.eq("id", user.id)
			.maybeSingle();
		const cohortAtSubmit =
			profileRow &&
			typeof profileRow === "object" &&
			"cohort" in profileRow &&
			typeof (profileRow as { cohort: unknown }).cohort === "string"
				? (profileRow as { cohort: string }).cohort.trim() || null
				: null;

		const { error } = await supabase
			.from("applications")
			.update({
				answers: payload as unknown as Record<string, unknown>,
				batch_id: batchId,
				status: "submitted",
				submitted_at: new Date().toISOString(),
				cohort: cohortAtSubmit,
			})
			.eq("id", row.id)
			.eq("user_id", user.id);
		setSaving(false);
		if (error) {
			setMessage(error.message);
			pushToast(error.message, "error");
			return;
		}
		pushToast("Application submitted.", "success");
		void load();
	}

	async function confirmSubmit() {
		closeSubmitDialog();
		await performSubmit();
	}

	if (loading) {
		return <ApplyPageSkeleton />;
	}

	return (
		<div className="space-y-10">
			<div className="sr-only" aria-live="assertive" aria-atomic="true">
				{submitBlockMessage}
			</div>
			<div className="max-w-3xl border-b border-border pb-8">
				<h1 className="type-portal-title">Application</h1>
				<p className="mt-2 text-sm font-sans font-light leading-relaxed text-muted">
					{isEditable ? (
						<>
							Answer in steps — your draft autosaves to your account shortly
							after you stop typing. You can also tap{" "}
							<span className="text-technical text-ink">Save draft</span>{" "}
							anytime.
						</>
					) : (
						<>Review your status and submitted answers below.</>
					)}{" "}
					Headshots stay private to reviewers.
				</p>
				{isEditable ? (
					<p className="text-technical mt-4 text-muted">
						Status: <span className="text-ink">Draft</span> — not submitted yet
					</p>
				) : null}
			</div>

			{row && status !== "draft" ? (
				<ApplicationStatusHub status={status} submittedAt={row.submitted_at} />
			) : null}

			{message ? (
				<div className="space-y-1 border border-danger/50 px-4 py-2">
					<p className="text-sm text-danger">{message}</p>
					<p className="text-technical text-xs text-muted">
						This message is from the server or network while loading or saving
						your application.
					</p>
				</div>
			) : null}

			{!isEditable && row ? (
				<div className="space-y-6">
					{status === "accepted" ? <AcceptedOnboardingPanel /> : null}
					{status === "rejected" ? <RejectedClosurePanel /> : null}
					<div className="border border-border p-6 space-y-4">
						<h2 className="text-technical text-muted">What you submitted</h2>
						<dl className="grid gap-3 font-sans text-sm">
							<div>
								<dt className="text-technical text-muted">Name</dt>
								<dd>{normalizeAnswers(row.answers).fullName}</dd>
							</div>
							{normalizeAnswers(row.answers).headshotPath?.trim() ? (
								<SubmittedHeadshotSummary
									path={normalizeAnswers(row.answers).headshotPath!.trim()}
								/>
							) : null}
							<div>
								<dt className="text-technical text-muted">Major · Year</dt>
								<dd>
									{normalizeAnswers(row.answers).major} ·{" "}
									{normalizeAnswers(row.answers).academicYear}
								</dd>
							</div>
							<div>
								<dt className="text-technical text-muted">Batch</dt>
								<dd>{row.batch_id}</dd>
							</div>
							<div>
								<dt className="text-technical text-muted">Why MECG?</dt>
								<dd className="whitespace-pre-wrap text-muted">
									{normalizeAnswers(row.answers).whyMecg}
								</dd>
							</div>
							{normalizeAnswers(row.answers).resumeUrl ? (
								<div>
									<dt className="text-technical text-muted">Resume</dt>
									<dd>
										<a
											href={normalizeAnswers(row.answers).resumeUrl}
											className="text-ink underline"
											target="_blank"
											rel="noreferrer"
										>
											Link
										</a>
									</dd>
								</div>
							) : null}
						</dl>
					</div>
				</div>
			) : null}

			{isEditable ? (
				<div className="max-sm:pb-[max(7rem,env(safe-area-inset-bottom,0px))] space-y-6">
					<div className="sticky top-0 z-10 -mx-1 rounded-b-lg border border-t-0 border-border bg-bg/95 px-4 py-4 shadow-sticky-down backdrop-blur-md supports-[backdrop-filter]:bg-bg/90 sm:-mx-0 sm:border-t sm:border-border">
						<p className="text-technical text-muted mb-1" id="apply-step-label">
							Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
						</p>
						<p
							id="apply-required-hint"
							className="text-technical text-xs text-ink/75 mb-2 leading-relaxed"
						>
							Fields marked <span className="text-danger">*</span> are required.
						</p>
						<div
							className="mb-3 h-1 w-full overflow-hidden rounded-full bg-ink/10"
							role="progressbar"
							aria-valuemin={1}
							aria-valuemax={STEPS.length}
							aria-valuenow={activeStep + 1}
							aria-labelledby="apply-step-label"
						>
							<div
								className="h-full bg-gradient-to-r from-accent to-accent-hover transition-[width] duration-300 ease-out"
								style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{STEPS.map((label, i) => (
								<button
									key={label}
									type="button"
									onClick={() => setActiveStep(i)}
									aria-current={i === activeStep ? "step" : undefined}
									className={`min-h-11 px-3 text-technical border rounded-l border-l-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
										i === activeStep
											? "border-accent border-l-accent bg-ink/10 text-ink"
											: "border-border border-l-transparent text-ink/70 hover:border-ink/40 hover:border-l-ink/20 hover:text-ink"
									}`}
								>
									{i + 1}. {label}
								</button>
							))}
						</div>
					</div>

					<fieldset
						className="grid min-w-0 gap-6 space-y-4 rounded-lg border border-border-strong bg-surface/25 p-5 sm:p-8"
						aria-labelledby="apply-step-label"
						aria-describedby="apply-required-hint"
					>
						{activeStep === 0 ? (
							<div className="space-y-4">
								{isAdmin ? (
									<div className="space-y-2">
										<label className="block space-y-1">
											<span className="text-technical text-muted">
												Cohort / batch id
											</span>
											<input
												type="text"
												value={batchId}
												onChange={(e) => setBatchId(e.target.value)}
												aria-describedby="apply-batch-admin-hint"
												className="portal-field-focus min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans"
											/>
										</label>
										<p
											id="apply-batch-admin-hint"
											className="text-technical text-xs text-muted leading-relaxed"
										>
											Recruitment batch key for reviewers. Leave as default
											unless you are routing this applicant to a specific
											cohort.
										</p>
									</div>
								) : null}
								<label
									className="block space-y-1"
									htmlFor="application-full-name"
								>
									<span className="text-technical text-muted">
										Full name
										<RequiredMark />
									</span>
									<input
										id="application-full-name"
										ref={fullNameRef}
										type="text"
										autoComplete="name"
										aria-required
										value={answers.fullName}
										aria-invalid={!!fieldErrors.fullName}
										aria-describedby={
											fieldErrors.fullName
												? "application-full-name-error"
												: undefined
										}
										onBlur={() =>
											blurValidateField("fullName", answers.fullName)
										}
										onChange={(e) => {
											setAnswers((a) => ({ ...a, fullName: e.target.value }));
											setFieldErrors((f) => ({ ...f, fullName: "" }));
										}}
										className="portal-field-focus min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans"
									/>
									{fieldErrors.fullName ? (
										<span
											id="application-full-name-error"
											className="text-xs text-danger"
										>
											{fieldErrors.fullName}
										</span>
									) : null}
								</label>
								<fieldset
									className="space-y-3 rounded-lg border-2 border-dashed border-border bg-bg/40 p-4 sm:p-5 min-w-0"
									aria-busy={headshotUploading}
								>
									<legend
										className="text-technical text-muted block px-0"
										id="application-headshot-label"
									>
										Headshot
										<RequiredMark />
									</legend>
									<p
										id="application-headshot-hint"
										className="text-technical text-xs text-muted leading-relaxed"
									>
										Shoulders and up, clear lighting, no heavy filters—same kind
										of photo you’d use on LinkedIn. Reviewers use this to
										recognize you; it is not shown on the public site.
									</p>
									<ul
										className="text-technical text-xs text-muted list-disc pl-5 space-y-0.5"
										aria-label="Headshot requirements"
									>
										<li>JPEG, PNG, or WebP</li>
										<li>Maximum file size {HEADSHOT_MAX_MB} MB</li>
										<li>
											Face visible, neutral or professional background preferred
										</li>
									</ul>
									<div
										className="sr-only"
										aria-live="polite"
										aria-atomic="true"
									>
										{headshotUploadStatus}
									</div>
									<input
										ref={headshotInputRef}
										type="file"
										accept={APPLICATION_HEADSHOT_ACCEPT.join(",")}
										className="sr-only"
										tabIndex={-1}
										aria-labelledby="application-headshot-label"
										aria-describedby={
											fieldErrors.headshotPath
												? "application-headshot-error application-headshot-hint"
												: "application-headshot-hint"
										}
										onChange={onHeadshotFileInputChange}
									/>
									{headshotDisplayUrl ? (
										<div className="overflow-hidden rounded-md border border-border-strong bg-bg-raised/50 p-1 w-fit">
											<img
												src={headshotDisplayUrl}
												alt="Headshot preview"
												width={160}
												height={160}
												decoding="async"
												className="h-36 w-36 rounded-sm object-cover sm:h-40 sm:w-40"
											/>
										</div>
									) : (
										<div
											aria-hidden
											className="flex h-36 w-36 items-center justify-center rounded-md border border-border bg-surface/30 text-technical text-muted sm:h-40 sm:w-40"
										>
											Preview
										</div>
									)}
									<div className="flex flex-wrap gap-3">
										<Button
											ref={headshotPickRef}
											type="button"
											variant="secondary"
											disabled={headshotUploading}
											aria-invalid={!!fieldErrors.headshotPath}
											aria-label={
												answers.headshotPath?.trim()
													? "Replace application headshot photo"
													: "Choose application headshot photo — required"
											}
											aria-describedby={
												fieldErrors.headshotPath
													? "application-headshot-error application-headshot-hint"
													: "application-headshot-hint"
											}
											className="min-h-11 px-6 text-technical uppercase tracking-[var(--tracking-technical)]"
											onClick={() => headshotInputRef.current?.click()}
										>
											{headshotUploading
												? "Uploading…"
												: answers.headshotPath?.trim()
													? "Replace photo"
													: "Choose photo"}
										</Button>
										{answers.headshotPath?.trim() ? (
											<Button
												type="button"
												variant="outline"
												disabled={headshotUploading}
												className="min-h-11 border-danger/40 text-danger hover:border-danger hover:bg-danger/10"
												onClick={() => void removeHeadshot()}
											>
												Remove photo
											</Button>
										) : null}
									</div>
									{fieldErrors.headshotPath ? (
										<p
											id="application-headshot-error"
											className="text-xs text-danger"
										>
											{fieldErrors.headshotPath}
										</p>
									) : null}
								</fieldset>
								<label className="block space-y-1" htmlFor="application-major">
									<span className="text-technical text-muted">
										Major
										<RequiredMark />
									</span>
									<input
										id="application-major"
										ref={majorRef}
										type="text"
										aria-required
										value={answers.major}
										aria-invalid={!!fieldErrors.major}
										aria-describedby={
											fieldErrors.major ? "application-major-error" : undefined
										}
										onBlur={() => blurValidateField("major", answers.major)}
										onChange={(e) => {
											setAnswers((a) => ({ ...a, major: e.target.value }));
											setFieldErrors((f) => ({ ...f, major: "" }));
										}}
										className="portal-field-focus min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans"
									/>
									{fieldErrors.major ? (
										<span
											id="application-major-error"
											className="text-xs text-danger"
										>
											{fieldErrors.major}
										</span>
									) : null}
								</label>
								<label
									className="block space-y-1"
									htmlFor="application-academic-year"
								>
									<span className="text-technical text-muted">
										Academic year
										<RequiredMark />
									</span>
									<input
										id="application-academic-year"
										ref={academicYearRef}
										type="text"
										placeholder="e.g. Sophomore"
										aria-required
										value={answers.academicYear}
										aria-invalid={!!fieldErrors.academicYear}
										aria-describedby={
											fieldErrors.academicYear
												? "application-academic-year-error"
												: undefined
										}
										onBlur={() =>
											blurValidateField("academicYear", answers.academicYear)
										}
										onChange={(e) => {
											setAnswers((a) => ({
												...a,
												academicYear: e.target.value,
											}));
											setFieldErrors((f) => ({ ...f, academicYear: "" }));
										}}
										className="portal-field-focus min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans"
									/>
									{fieldErrors.academicYear ? (
										<span
											id="application-academic-year-error"
											className="text-xs text-danger"
										>
											{fieldErrors.academicYear}
										</span>
									) : null}
								</label>
							</div>
						) : null}

						{activeStep === 1 ? (
							<label className="block space-y-1" htmlFor="application-why-mecg">
								<span className="text-technical text-muted">
									Why MECG?
									<RequiredMark />
								</span>
								<textarea
									id="application-why-mecg"
									ref={whyMecgRef}
									rows={whyMecgRows}
									aria-required
									value={answers.whyMecg}
									aria-invalid={!!fieldErrors.whyMecg}
									aria-describedby={
										fieldErrors.whyMecg
											? "application-why-mecg-error application-why-mecg-hint"
											: "application-why-mecg-hint"
									}
									onBlur={() => blurValidateField("whyMecg", answers.whyMecg)}
									onChange={(e) => {
										setAnswers((a) => ({ ...a, whyMecg: e.target.value }));
										setFieldErrors((f) => ({ ...f, whyMecg: "" }));
									}}
									className="portal-field-focus max-h-[min(70vh,36rem)] min-h-44 w-full overflow-y-auto border border-border bg-transparent px-3 py-2 font-sans"
								/>
								{fieldErrors.whyMecg ? (
									<span
										id="application-why-mecg-error"
										className="text-xs text-danger"
									>
										{fieldErrors.whyMecg}
									</span>
								) : null}
								<p
									id="application-why-mecg-hint"
									className="text-technical text-xs text-muted leading-relaxed"
								>
									The text area grows with your answer (up to 24 lines), then
									scrolls—same line breaks reviewers see.
								</p>
							</label>
						) : null}

						{activeStep === 2 ? (
							<div className="space-y-1">
								<label
									className="block space-y-1"
									htmlFor="application-resume-url"
								>
									<span className="text-technical text-muted">
										Resume URL (optional)
									</span>
									<input
										ref={resumeUrlRef}
										id="application-resume-url"
										type="url"
										placeholder="https://…"
										value={answers.resumeUrl ?? ""}
										aria-invalid={!!fieldErrors.resumeUrl}
										aria-describedby={
											fieldErrors.resumeUrl
												? "application-resume-error application-resume-hint"
												: "application-resume-hint"
										}
										onBlur={() => {
											const msg = resumeUrlFieldError(answers.resumeUrl);
											setFieldErrors((f) => ({ ...f, resumeUrl: msg }));
										}}
										onChange={(e) => {
											setAnswers((a) => ({
												...a,
												resumeUrl: e.target.value,
											}));
											setFieldErrors((f) => ({ ...f, resumeUrl: "" }));
										}}
										className="portal-field-focus min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans"
									/>
								</label>
								{fieldErrors.resumeUrl ? (
									<span
										id="application-resume-error"
										className="text-xs text-danger"
									>
										{fieldErrors.resumeUrl}
									</span>
								) : null}
								<p
									id="application-resume-hint"
									className="text-technical text-xs text-muted leading-relaxed"
								>
									Use a link anyone can open (PDF or cloud) without signing
									in—reviewers open it in a new tab.
								</p>
							</div>
						) : null}
					</fieldset>

					<div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur-md sm:static sm:z-auto sm:mt-4 sm:rounded-lg sm:border sm:bg-surface/20 sm:px-5 sm:py-4 sm:shadow-sticky-bar-sm sm:backdrop-blur-none">
						<div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
							<div className="flex flex-wrap gap-3 sm:gap-4">
								<Button
									type="button"
									variant="outline"
									disabled={saving}
									className="min-h-11 min-w-[9rem] text-technical uppercase tracking-[var(--tracking-technical)]"
									onClick={() => void saveDraft()}
								>
									Save draft
								</Button>
								<Button
									type="button"
									disabled={saving || !submitReady}
									className="min-h-11 min-w-[11rem] text-technical uppercase tracking-[var(--tracking-technical)]"
									aria-describedby="apply-submit-help"
									title={
										!submitReady
											? "Complete all required fields first"
											: undefined
									}
									onClick={() => openSubmitDialog()}
								>
									Submit application
								</Button>
							</div>
							<p
								id="apply-submit-help"
								className="text-technical text-xs text-ink/70 sm:max-w-md leading-relaxed order-first sm:order-none"
							>
								{!submitReady
									? "Complete name, headshot, major, academic year, and Why MECG to enable submit."
									: "Ready to submit — you'll confirm in the next step. After submit you cannot edit."}
							</p>
							<div
								className="text-technical text-xs text-muted min-h-6 sm:ml-auto"
								aria-live="polite"
								aria-atomic="true"
							>
								{saveNotice === "saving" ? "Saving draft…" : null}
								{saveNotice === "saved" ? "Draft saved." : null}
								{saveNoticeError ? (
									<span className="text-danger">{saveNoticeError}</span>
								) : null}
							</div>
						</div>
					</div>

					<dialog
						ref={submitDialogRef}
						className="w-[min(100%,28rem)] max-h-[min(90dvh,32rem)] rounded-lg border border-border-strong bg-bg-raised p-6 text-ink shadow-2xl backdrop:bg-bg/80 open:backdrop:backdrop-blur-sm"
						aria-labelledby="apply-submit-dialog-title"
					>
						<div className="space-y-4">
							<h2
								id="apply-submit-dialog-title"
								className="type-auth-state-title text-lg font-sans"
							>
								Submit application?
							</h2>
							<p className="text-sm leading-relaxed text-muted">
								This sends your application to the recruitment team. You will
								not be able to change your answers afterward. Use{" "}
								<span className="text-technical text-ink">Save draft</span> if
								you still need to edit.
							</p>
							<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
								<Button
									type="button"
									variant="outline"
									className="min-h-11 w-full text-technical sm:w-auto"
									onClick={closeSubmitDialog}
								>
									Keep editing
								</Button>
								<Button
									type="button"
									disabled={saving}
									className="min-h-11 w-full text-technical sm:w-auto"
									onClick={() => void confirmSubmit()}
								>
									{saving ? "Submitting…" : "Submit now"}
								</Button>
							</div>
						</div>
					</dialog>
				</div>
			) : null}
		</div>
	);
}
