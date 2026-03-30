import { useCallback, useState } from "react";

import { AdminSubnav } from "@/src/components/admin-subnav";
import { useToast } from "@/src/components/toast/ToastProvider";
import { supabase } from "@/src/lib/supabase";
import type { ProfileRow } from "@/src/types/database";

function escapeCsvCell(v: string | number | null | undefined): string {
	const s = v === null || v === undefined ? "" : String(v);
	if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
	return s;
}

/** Conservative export: only members who opted into the directory (`directory_visible`). */
export default function AdminDirectoryPage() {
	const { pushToast } = useToast();
	const [busy, setBusy] = useState(false);

	const downloadCsv = useCallback(async () => {
		setBusy(true);
		const { data, error } = await supabase
			.from("profiles")
			.select(
				"id, display_name, cohort, graduation_year, industry, interests, linkedin_url, open_to_mentoring, open_to_coffee_chats, directory_visible, show_linkedin, show_interests, show_cohort, show_industry",
			)
			.eq("directory_visible", true)
			.order("display_name", { ascending: true, nullsFirst: false });
		setBusy(false);
		if (error) {
			pushToast(error.message, "error");
			return;
		}
		const rows = (data ?? []) as ProfileRow[];
		const header = [
			"user_id",
			"display_name",
			"cohort",
			"graduation_year",
			"industry",
			"interests",
			"linkedin_url",
			"open_to_mentoring",
			"open_to_coffee_chats",
			"show_cohort",
			"show_industry",
			"show_interests",
			"show_linkedin",
		];
		const lines = [
			header.join(","),
			...rows.map((p) =>
				[
					p.id,
					p.display_name,
					p.cohort,
					p.graduation_year,
					p.industry,
					Array.isArray(p.interests) ? p.interests.join(";") : "",
					p.linkedin_url,
					p.open_to_mentoring,
					p.open_to_coffee_chats,
					p.show_cohort,
					p.show_industry,
					p.show_interests,
					p.show_linkedin,
				]
					.map((c) => escapeCsvCell(c as string | number | null | undefined))
					.join(","),
			),
		];
		const blob = new Blob([lines.join("\n")], {
			type: "text/csv;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `mecg-directory-consented-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		pushToast("Download started.", "success");
	}, [pushToast]);

	return (
		<div className="space-y-8">
			<AdminSubnav />
			<div>
				<h1 className="type-portal-title-sans">Directory export</h1>
				<p className="mt-2 max-w-3xl font-sans text-sm text-muted">
					Download a CSV of profiles that have{" "}
					<strong className="text-ink">directory visibility</strong> turned on.
					Uses the same consent scope alumni see in the masked directory RPC
					(field-level visibility flags are included for auditing).
				</p>
			</div>
			<button
				type="button"
				disabled={busy}
				onClick={() => void downloadCsv()}
				className="min-h-11 border border-accent bg-transparent px-6 py-3 font-sans text-technical text-accent hover:bg-accent hover:text-bg disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
			>
				{busy ? "Preparing…" : "Download CSV (consented directory only)"}
			</button>
		</div>
	);
}
