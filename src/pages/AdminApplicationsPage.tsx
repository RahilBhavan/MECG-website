import { useCallback, useEffect, useState } from "react";

import { AdminSubnav } from "@/src/components/admin-subnav";
import { useToast } from "@/src/components/toast/ToastProvider";
import { normalizeAnswers } from "@/src/lib/application-form";
import { supabase } from "@/src/lib/supabase";
import type { ApplicationRow, ApplicationStatus } from "@/src/types/database";

const STATUS_OPTIONS: ApplicationStatus[] = [
	"draft",
	"submitted",
	"under_review",
	"accepted",
	"rejected",
];

export default function AdminApplicationsPage() {
	const { pushToast } = useToast();
	const [rows, setRows] = useState<ApplicationRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setMessage(null);
		const { data, error } = await supabase
			.from("applications")
			.select("*")
			.order("updated_at", { ascending: false });
		setLoading(false);
		if (error) {
			setMessage(error.message);
			return;
		}
		const list = (data ?? []) as ApplicationRow[];
		setRows(
			list.map((r) => ({
				...r,
				tags: r.tags ?? [],
				cohort: r.cohort ?? null,
				assigned_reviewer_id: r.assigned_reviewer_id ?? null,
			})),
		);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	async function updateStatus(id: string, status: ApplicationStatus) {
		setUpdatingId(id);
		setMessage(null);
		const { error } = await supabase
			.from("applications")
			.update({ status })
			.eq("id", id);
		setUpdatingId(null);
		if (error) {
			setMessage(error.message);
			pushToast(error.message, "error");
			return;
		}
		pushToast("Status updated.", "success");
		void load();
	}

	async function copyId(id: string) {
		try {
			await navigator.clipboard.writeText(id);
			pushToast("User id copied.", "success");
		} catch {
			pushToast("Could not copy to clipboard.", "error");
		}
	}

	if (loading) {
		return (
			<div className="space-y-4 animate-pulse">
				<div className="h-10 w-64 bg-ink/10 rounded" />
				<div className="h-48 border border-border bg-ink/5 rounded" />
			</div>
		);
	}

	return (
		<div className="space-y-10">
			<AdminSubnav />
			<div>
				<h1 className="type-portal-title-sans">Applications</h1>
				<p className="text-technical text-muted max-w-3xl">
					Set pipeline status for each applicant. Applicants only see updates
					after you save — they cannot change decision states themselves.
				</p>
			</div>

			{message ? (
				<p className="text-sm border border-danger/40 px-4 py-2 text-danger">
					{message}
				</p>
			) : null}

			<div className="overflow-x-auto border border-border">
				<table className="w-full text-left text-sm min-w-[640px]">
					<thead className="text-technical text-muted border-b border-border">
						<tr>
							<th className="p-3 font-normal">Name</th>
							<th className="p-3 font-normal">User id</th>
							<th className="p-3 font-normal">Status</th>
							<th className="p-3 font-normal">Submitted</th>
							<th className="p-3 font-normal">Action</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => {
							const name = normalizeAnswers(row.answers).fullName.trim() || "—";
							const pending = updatingId === row.id;
							return (
								<tr
									key={row.id}
									className="border-b border-border last:border-0"
								>
									<td className="p-3 align-top font-sans">{name}</td>
									<td className="p-3 align-top font-data text-xs break-all max-w-[220px]">
										<button
											type="button"
											onClick={() => void copyId(row.user_id)}
											className="text-left underline text-ink hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring min-h-11"
											title="Copy full user id"
										>
											{row.user_id.slice(0, 8)}…
										</button>
									</td>
									<td className="p-3 align-top text-technical">{row.status}</td>
									<td className="p-3 align-top text-muted">
										{row.submitted_at
											? new Date(row.submitted_at).toLocaleDateString()
											: "—"}
									</td>
									<td className="p-3 align-top">
										<label className="flex flex-col gap-1 text-technical text-xs text-muted">
											<span className="sr-only">Set status for {name}</span>
											<select
												value={row.status}
												disabled={pending}
												onChange={(e) =>
													void updateStatus(
														row.id,
														e.target.value as ApplicationStatus,
													)
												}
												className="min-h-11 max-w-[11rem] bg-bg border border-border px-2 py-2 font-sans text-ink"
											>
												{STATUS_OPTIONS.map((s) => (
													<option key={s} value={s}>
														{s}
													</option>
												))}
											</select>
										</label>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				{rows.length === 0 ? (
					<p className="p-6 text-technical text-muted">No applications yet.</p>
				) : null}
			</div>
		</div>
	);
}
