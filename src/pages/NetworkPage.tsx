import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/src/auth/AuthProvider";
import { useToast } from "@/src/components/toast/ToastProvider";
import { supabase } from "@/src/lib/supabase";
import type { ProfileDirectoryRow } from "@/src/types/database";

/** Columns used by the form and directory cards — avoids `*` payload over the wire. */
const PROFILE_COLUMNS =
	"id, display_name, cohort, industry, open_to_mentoring, linkedin_url, directory_visible" as const;

export default function NetworkPage() {
	const { user } = useAuth();
	const { pushToast } = useToast();
	const [mine, setMine] = useState<ProfileDirectoryRow | null>(null);
	const [directory, setDirectory] = useState<ProfileDirectoryRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [cohortFilter, setCohortFilter] = useState("");
	const [industryFilter, setIndustryFilter] = useState("");

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setMessage(null);

		const [selfRes, dirRes] = await Promise.all([
			supabase
				.from("profiles")
				.select(PROFILE_COLUMNS)
				.eq("id", user.id)
				.maybeSingle(),
			supabase
				.from("profiles")
				.select(PROFILE_COLUMNS)
				.eq("directory_visible", true),
		]);

		if (selfRes.error) {
			setMessage(selfRes.error.message);
			setLoading(false);
			return;
		}
		setMine(selfRes.data as ProfileDirectoryRow | null);

		if (dirRes.error) {
			setMessage(dirRes.error.message);
			setLoading(false);
			return;
		}
		setDirectory((dirRes.data as ProfileDirectoryRow[]) ?? []);
		setLoading(false);
	}, [user]);

	useEffect(() => {
		void load();
	}, [load]);

	const peers = useMemo(
		() => directory.filter((p) => p.id !== user?.id),
		[directory, user?.id],
	);

	const filteredPeers = useMemo(() => {
		const c = cohortFilter.trim().toLowerCase();
		const i = industryFilter.trim().toLowerCase();
		return peers.filter((p) => {
			const cohortOk = !c || (p.cohort ?? "").toLowerCase().includes(c);
			const indOk = !i || (p.industry ?? "").toLowerCase().includes(i);
			return cohortOk && indOk;
		});
	}, [peers, cohortFilter, industryFilter]);

	async function saveProfile(e: React.FormEvent) {
		e.preventDefault();
		if (!user || !mine) return;
		setSaving(true);
		setMessage(null);
		const { error } = await supabase
			.from("profiles")
			.update({
				display_name: mine.display_name,
				cohort: mine.cohort,
				industry: mine.industry,
				open_to_mentoring: mine.open_to_mentoring,
				linkedin_url: mine.linkedin_url,
				directory_visible: mine.directory_visible,
			} as Record<string, unknown>)
			.eq("id", user.id);
		setSaving(false);
		if (error) {
			setMessage(error.message);
			pushToast(error.message, "error");
			return;
		}
		pushToast("Profile updated.", "success");
		void load();
	}

	if (loading) {
		return (
			<div className="space-y-4 animate-pulse">
				<div className="h-10 w-56 bg-ink/10 rounded" />
				<div className="h-48 border border-border bg-ink/5 rounded" />
			</div>
		);
	}

	const showEmptyDirectoryHelp = peers.length === 0;

	return (
		<div className="space-y-10">
			<div>
				<h1 className="type-portal-title">Alumni network</h1>
				<p className="text-technical text-muted max-w-2xl">
					Update your profile and choose whether to appear in the directory.
					Only members with the alumni role can browse profiles marked visible.
				</p>
			</div>

			{message ? (
				<p className="text-sm border border-border px-4 py-2">{message}</p>
			) : null}

			{mine ? (
				<form
					onSubmit={(e) => void saveProfile(e)}
					className="space-y-6 border border-border p-6 max-w-xl"
				>
					<h2 className="text-technical text-muted">My profile</h2>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">
							Display name
						</span>
						<input
							type="text"
							value={mine.display_name ?? ""}
							onChange={(e) =>
								setMine({ ...mine, display_name: e.target.value })
							}
							className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-sans focus:border-ink outline-none"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Cohort</span>
						<input
							type="text"
							value={mine.cohort ?? ""}
							onChange={(e) => setMine({ ...mine, cohort: e.target.value })}
							className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-sans focus:border-ink outline-none"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Industry</span>
						<input
							type="text"
							value={mine.industry ?? ""}
							onChange={(e) => setMine({ ...mine, industry: e.target.value })}
							className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-sans focus:border-ink outline-none"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">
							LinkedIn URL
						</span>
						<input
							type="url"
							value={mine.linkedin_url ?? ""}
							onChange={(e) =>
								setMine({ ...mine, linkedin_url: e.target.value })
							}
							className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-sans focus:border-ink outline-none"
						/>
					</label>
					<label className="flex items-center gap-3 text-technical text-muted min-h-11">
						<input
							type="checkbox"
							checked={mine.open_to_mentoring}
							onChange={(e) =>
								setMine({ ...mine, open_to_mentoring: e.target.checked })
							}
						/>
						Open to mentoring
					</label>
					<label className="flex items-center gap-3 text-technical text-muted min-h-11">
						<input
							type="checkbox"
							checked={mine.directory_visible}
							onChange={(e) =>
								setMine({ ...mine, directory_visible: e.target.checked })
							}
						/>
						Show me in the alumni directory
					</label>
					<button
						type="submit"
						disabled={saving}
						className="border border-accent px-6 py-3 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg transition-colors disabled:opacity-50"
					>
						{saving ? "Saving…" : "Save profile"}
					</button>
				</form>
			) : null}

			{mine && showEmptyDirectoryHelp ? (
				<div className="border border-border p-6 space-y-4">
					<h2 className="text-technical text-muted">Directory is empty</h2>
					<p className="text-sm text-muted font-sans leading-relaxed">
						Other alumni won&apos;t see you until you turn on{" "}
						<strong className="text-ink">
							Show me in the alumni directory
						</strong>{" "}
						above and save. Here&apos;s a preview of how your card will look:
					</p>
					<div className="border border-ink/20 p-4 max-w-md">
						<p className="font-display text-xl">
							{mine.display_name ?? "Your name"}
						</p>
						<p className="text-technical text-muted text-sm mt-1">
							{mine.cohort ?? "Cohort"} · {mine.industry ?? "Industry"}
						</p>
						{mine.open_to_mentoring ? (
							<span className="inline-block mt-2 text-technical text-xs border border-success/50 text-success px-2 py-1">
								Open to mentoring
							</span>
						) : null}
					</div>
				</div>
			) : null}

			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row gap-4 flex-wrap">
					<h2 className="text-technical text-muted shrink-0">Directory</h2>
					<label className="flex-1 min-w-[140px] text-technical text-muted text-xs flex flex-col gap-1">
						Filter cohort
						<input
							type="text"
							value={cohortFilter}
							onChange={(e) => setCohortFilter(e.target.value)}
							placeholder="contains…"
							className="bg-transparent border border-border px-3 py-2 min-h-11 font-sans text-sm"
						/>
					</label>
					<label className="flex-1 min-w-[140px] text-technical text-muted text-xs flex flex-col gap-1">
						Filter industry
						<input
							type="text"
							value={industryFilter}
							onChange={(e) => setIndustryFilter(e.target.value)}
							placeholder="contains…"
							className="bg-transparent border border-border px-3 py-2 min-h-11 font-sans text-sm"
						/>
					</label>
				</div>

				<ul className="grid gap-4 sm:grid-cols-2">
					{filteredPeers.map((p) => (
						<li
							key={p.id}
							className="border border-border p-5 flex flex-col gap-3"
						>
							<div>
								<p className="font-display text-xl">
									{p.display_name ?? "Member"}
								</p>
								<p className="text-technical text-muted text-sm mt-1">
									{p.cohort ?? "—"} · {p.industry ?? "—"}
								</p>
							</div>
							{p.open_to_mentoring ? (
								<span className="text-technical text-xs border border-success/50 text-success px-2 py-1 w-fit">
									Open to mentoring
								</span>
							) : null}
							{p.linkedin_url ? (
								<a
									href={p.linkedin_url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-technical text-ink hover:underline w-fit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded"
								>
									LinkedIn
									<ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
								</a>
							) : null}
						</li>
					))}
				</ul>
				{filteredPeers.length === 0 && !showEmptyDirectoryHelp ? (
					<p className="text-technical text-muted border border-border p-6">
						No profiles match these filters.
					</p>
				) : null}
			</div>
		</div>
	);
}
