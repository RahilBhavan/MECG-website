import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminSubnav } from "@/src/components/admin-subnav";
import { useToast } from "@/src/components/toast/ToastProvider";
import { supabase } from "@/src/lib/supabase";
import type {
	ApplicationReviewRow,
	ApplicationRow,
} from "@/src/types/database";

type ReviewWithApp = ApplicationReviewRow & {
	applications: Pick<
		ApplicationRow,
		"batch_id" | "cohort" | "tags" | "status" | "answers"
	> | null;
};

export default function AdminReviewsPage() {
	const { pushToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [reviews, setReviews] = useState<ReviewWithApp[]>([]);
	const [apps, setApps] = useState<ApplicationRow[]>([]);
	const [selected, setSelected] = useState<Set<string>>(() => new Set());
	const [tagsInput, setTagsInput] = useState("");
	const [assignInput, setAssignInput] = useState("");
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pending, setPending] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		setMessage(null);
		const { data: revData, error: e1 } = await supabase
			.from("application_reviews")
			.select(
				"*, applications(batch_id, cohort, tags, status, answers, user_id)",
			)
			.order("updated_at", { ascending: false })
			.limit(500);
		if (e1) {
			setMessage(e1.message);
			setLoading(false);
			return;
		}
		setReviews((revData as ReviewWithApp[]) ?? []);

		const { data: appData, error: e2 } = await supabase
			.from("applications")
			.select("*")
			.in("status", ["submitted", "under_review"])
			.order("submitted_at", { ascending: false });
		if (e2) {
			setMessage(e2.message);
			setLoading(false);
			return;
		}
		setApps(
			((appData as ApplicationRow[]) ?? []).map((r) => ({
				...r,
				tags: r.tags ?? [],
				cohort: r.cohort ?? null,
				assigned_reviewer_id: r.assigned_reviewer_id ?? null,
			})),
		);
		setLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const selectedList = useMemo(
		() => apps.filter((a) => selected.has(a.id)),
		[apps, selected],
	);

	function toggle(id: string) {
		setSelected((s) => {
			const next = new Set(s);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function toggleAllShown() {
		if (selected.size === apps.length) {
			setSelected(new Set());
			return;
		}
		setSelected(new Set(apps.map((a) => a.id)));
	}

	async function applyBatch() {
		if (selectedList.length === 0) {
			pushToast("Select at least one application.", "error");
			return;
		}
		setPending(true);
		setMessage(null);
		const tagParts = tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);
		const assignTrim = assignInput.trim();
		if (tagParts.length === 0 && assignTrim.length === 0) {
			pushToast("Enter tags and/or an assignee UUID.", "error");
			setPending(false);
			return;
		}
		let lastError: string | null = null;
		for (const a of selectedList) {
			const payload: Partial<ApplicationRow> = {};
			if (tagParts.length > 0) {
				payload.tags = [...new Set([...(a.tags ?? []), ...tagParts])];
			}
			if (assignTrim.length > 0) {
				payload.assigned_reviewer_id = assignTrim;
			}
			if (Object.keys(payload).length === 0) continue;
			const { error } = await supabase
				.from("applications")
				.update(payload as never)
				.eq("id", a.id);
			if (error) lastError = error.message;
		}
		setPending(false);
		setConfirmOpen(false);
		if (lastError) {
			setMessage(lastError);
			pushToast(lastError, "error");
			return;
		}
		pushToast(`Updated ${selectedList.length} application(s).`, "success");
		setSelected(new Set());
		setTagsInput("");
		setAssignInput("");
		void load();
	}

	if (loading) {
		return (
			<div className="space-y-4">
				<AdminSubnav />
				<h1 className="type-portal-title-sans">Reviews audit</h1>
				<p className="text-technical text-muted">Loading…</p>
			</div>
		);
	}

	return (
		<div className="space-y-10">
			<AdminSubnav />
			<div>
				<h1 className="type-portal-title-sans">Reviews audit</h1>
				<p className="mt-2 text-sm text-muted font-sans max-w-2xl">
					Who decided what and when — plus batch tags and assignment for the
					reviewer queue (admin only).
				</p>
			</div>

			{message ? (
				<div className="border border-danger/40 bg-danger-bg/20 px-4 py-3 text-sm text-danger">
					{message}
				</div>
			) : null}

			<section className="space-y-4">
				<h2 className="type-portal-title-sans text-lg">Review log</h2>
				<div className="overflow-x-auto border border-border">
					<table className="w-full text-left text-sm font-sans">
						<thead className="text-technical text-muted border-b border-border bg-bg-raised/40">
							<tr>
								<th className="p-2">Updated</th>
								<th className="p-2">Phase</th>
								<th className="p-2">Verdict</th>
								<th className="p-2">Reviewer</th>
								<th className="p-2">Application</th>
								<th className="p-2">Batch</th>
								<th className="p-2">Notes</th>
							</tr>
						</thead>
						<tbody>
							{reviews.map((r) => (
								<tr key={r.id} className="border-b border-border/50">
									<td className="p-2 whitespace-nowrap text-xs">
										{new Date(r.updated_at).toLocaleString()}
									</td>
									<td className="p-2 text-technical">{r.review_phase}</td>
									<td className="p-2">{r.verdict}</td>
									<td className="p-2 font-mono text-[11px] break-all max-w-[8rem]">
										{r.reviewer_id}
									</td>
									<td className="p-2 font-mono text-[11px] break-all max-w-[8rem]">
										{r.application_id}
									</td>
									<td className="p-2">{r.applications?.batch_id ?? "—"}</td>
									<td className="p-2 text-xs text-muted max-w-xs truncate">
										{r.notes ?? "—"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<button
					type="button"
					onClick={() => void load()}
					className="border border-border px-4 py-2 min-h-11 text-technical hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
				>
					Refresh
				</button>
			</section>

			<section className="space-y-4 border-t border-border pt-10">
				<h2 className="type-portal-title-sans text-lg">
					Batch tags &amp; assignment
				</h2>
				<p className="text-sm text-muted font-sans max-w-2xl">
					Select applications, set tags (replaces tags on each selected row)
					and/or assign a reviewer UUID. Confirm before applying.
				</p>
				<div className="flex flex-wrap gap-3 items-end">
					<label className="flex flex-col gap-1 text-technical text-muted text-xs">
						Tags (comma-separated)
						<input
							type="text"
							value={tagsInput}
							onChange={(e) => setTagsInput(e.target.value)}
							placeholder="e.g. priority,returning"
							className="bg-bg border border-border px-3 py-2 min-h-11 font-sans w-64 max-w-full focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="flex flex-col gap-1 text-technical text-muted text-xs">
						Assigned reviewer UUID
						<input
							type="text"
							value={assignInput}
							onChange={(e) => setAssignInput(e.target.value)}
							placeholder="auth.users id"
							className="bg-bg border border-border px-3 py-2 min-h-11 font-sans w-64 max-w-full font-mono text-xs focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<button
						type="button"
						disabled={pending || selectedList.length === 0}
						onClick={() => setConfirmOpen(true)}
						className="border border-accent px-4 py-2 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					>
						Apply to {selectedList.length} selected
					</button>
				</div>

				{confirmOpen ? (
					<div
						className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-mecg-overlay"
						role="dialog"
						aria-modal="true"
						aria-labelledby="batch-confirm-title"
					>
						<div className="bg-bg border border-border-strong max-w-lg w-full p-6 space-y-4 shadow-xl">
							<h3 id="batch-confirm-title" className="type-portal-title-sans">
								Confirm batch update
							</h3>
							<p className="text-sm text-muted font-sans">
								This will update {selectedList.length} application(s). Tags
								replace existing tags on each row. Assignment sets{" "}
								<code className="text-xs">assigned_reviewer_id</code>.
							</p>
							<div className="flex gap-3 justify-end">
								<button
									type="button"
									className="border border-border px-4 py-2 min-h-11 text-technical hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
									onClick={() => setConfirmOpen(false)}
								>
									Cancel
								</button>
								<button
									type="button"
									disabled={pending}
									className="border border-accent px-4 py-2 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
									onClick={() => void applyBatch()}
								>
									Apply
								</button>
							</div>
						</div>
					</div>
				) : null}

				<div className="overflow-x-auto border border-border">
					<table className="w-full text-left text-sm font-sans">
						<thead className="text-technical text-muted border-b border-border bg-bg-raised/40">
							<tr>
								<th className="p-2 w-10">
									<button
										type="button"
										className="min-h-11 min-w-11 border border-border rounded text-technical"
										onClick={toggleAllShown}
										aria-label={
											selected.size === apps.length
												? "Deselect all"
												: "Select all"
										}
									>
										All
									</button>
								</th>
								<th className="p-2">Batch</th>
								<th className="p-2">Cohort</th>
								<th className="p-2">Tags</th>
								<th className="p-2">Assigned</th>
								<th className="p-2">Status</th>
							</tr>
						</thead>
						<tbody>
							{apps.map((a) => (
								<tr key={a.id} className="border-b border-border/50">
									<td className="p-2">
										<input
											type="checkbox"
											className="min-h-11 min-w-11"
											checked={selected.has(a.id)}
											onChange={() => toggle(a.id)}
											aria-label={`Select application ${a.id}`}
										/>
									</td>
									<td className="p-2 font-mono text-xs">{a.batch_id}</td>
									<td className="p-2">{a.cohort ?? "—"}</td>
									<td className="p-2 text-xs">
										{(a.tags ?? []).join(", ") || "—"}
									</td>
									<td className="p-2 font-mono text-[10px] break-all max-w-[120px]">
										{a.assigned_reviewer_id ?? "—"}
									</td>
									<td className="p-2">{a.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
