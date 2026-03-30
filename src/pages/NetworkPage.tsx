import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/src/auth/AuthProvider";
import { useToast } from "@/src/components/toast/ToastProvider";
import { supabase } from "@/src/lib/supabase";
import type { ProfileDirectoryRow } from "@/src/types/database";

/** Columns used by the form and directory cards — avoids `*` payload over the wire. */
const PROFILE_COLUMNS =
	"id, display_name, cohort, industry, open_to_mentoring, linkedin_url, directory_visible" as const;

function profileInitials(name: string | null | undefined): string {
	const trimmed = (name ?? "").trim();
	if (!trimmed) return "?";
	const parts = trimmed.split(/\s+/).filter(Boolean);
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

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
				<div className="h-10 w-56 rounded bg-ink/10" />
				<div className="h-48 rounded-lg border border-border bg-ink/5" />
				<div className="h-32 rounded-lg border border-border bg-ink/5" />
			</div>
		);
	}

	const showEmptyDirectoryHelp = peers.length === 0;

	return (
		<div className="space-y-10">
			<div className="max-w-2xl border-b border-border pb-8">
				<h1 className="type-portal-title">Alumni network</h1>
				<p className="mt-2 text-sm font-sans font-light leading-relaxed text-muted">
					Update your profile and choose whether to appear in the directory.
					Only members with the alumni role can browse profiles marked visible.
				</p>
			</div>

			{message ? (
				<p
					className="rounded-md border border-border bg-surface/30 px-4 py-3 text-sm text-ink-secondary"
					role="status"
				>
					{message}
				</p>
			) : null}

			{mine ? (
				<form
					onSubmit={(e) => void saveProfile(e)}
					className="max-w-xl space-y-6 rounded-lg border border-border-strong bg-surface/20 p-6 sm:p-8"
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
							className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Cohort</span>
						<input
							type="text"
							value={mine.cohort ?? ""}
							onChange={(e) => setMine({ ...mine, cohort: e.target.value })}
							className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Industry</span>
						<input
							type="text"
							value={mine.industry ?? ""}
							onChange={(e) => setMine({ ...mine, industry: e.target.value })}
							className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
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
							className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
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
					<div className="space-y-2">
						<label className="flex min-h-11 cursor-pointer items-start gap-3 text-technical text-muted">
							<input
								type="checkbox"
								checked={mine.directory_visible}
								onChange={(e) =>
									setMine({ ...mine, directory_visible: e.target.checked })
								}
								className="mt-1"
							/>
							<span>
								Show me in the alumni directory
								<span className="mt-1 block font-sans text-xs font-normal normal-case tracking-normal text-muted">
									When off, other alumni cannot find your card; you can still
									edit your profile anytime.
								</span>
							</span>
						</label>
					</div>
					<Button
						type="submit"
						disabled={saving}
						className="min-h-11 text-technical uppercase tracking-[var(--tracking-technical)]"
					>
						{saving ? "Saving…" : "Save profile"}
					</Button>
				</form>
			) : null}

			{mine && showEmptyDirectoryHelp ? (
				<div className="space-y-4 rounded-lg border border-dashed border-border-strong bg-surface/15 p-6 sm:p-8">
					<h2 className="text-technical text-muted">Directory is empty</h2>
					<p className="font-sans text-sm leading-relaxed text-muted">
						Other alumni won&apos;t see you until you turn on{" "}
						<strong className="text-ink">
							Show me in the alumni directory
						</strong>{" "}
						above and save. Here&apos;s a preview of how your card will look:
					</p>
					<div className="flex max-w-md gap-4 rounded-lg border border-border bg-bg-raised/50 p-5">
						<div
							className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface font-display text-lg text-ink-secondary"
							aria-hidden
						>
							{profileInitials(mine.display_name)}
						</div>
						<div className="min-w-0">
							<p className="font-display text-xl text-ink-secondary">
								{mine.display_name ?? "Your name"}
							</p>
							<p className="type-marketing-kicker mt-1 text-muted">
								{mine.cohort ?? "Cohort"} · {mine.industry ?? "Industry"}
							</p>
							{mine.open_to_mentoring ? (
								<span className="mt-2 inline-block border border-success/50 px-2 py-1 text-technical text-xs text-success">
									Open to mentoring
								</span>
							) : null}
						</div>
					</div>
				</div>
			) : null}

			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-lg border border-border bg-surface/15 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 sm:p-5">
					<h2 className="text-technical text-muted shrink-0 sm:mr-2">
						Directory
					</h2>
					<label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs text-technical text-muted">
						Filter cohort
						<input
							type="text"
							value={cohortFilter}
							onChange={(e) => setCohortFilter(e.target.value)}
							placeholder="contains…"
							className="min-h-11 rounded-md border border-border bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs text-technical text-muted">
						Filter industry
						<input
							type="text"
							value={industryFilter}
							onChange={(e) => setIndustryFilter(e.target.value)}
							placeholder="contains…"
							className="min-h-11 rounded-md border border-border bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
				</div>

				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredPeers.map((p) => (
						<li
							key={p.id}
							className="flex flex-col gap-4 rounded-lg border border-border bg-bg-raised/40 p-5 transition-[border-color,box-shadow] duration-200 hover:border-accent/35 hover:shadow-[var(--shadow-marketing-md)]"
						>
							<div className="flex gap-4">
								<div
									className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface font-display text-base text-ink-secondary"
									aria-hidden
								>
									{profileInitials(p.display_name)}
								</div>
								<div className="min-w-0">
									<p className="font-display text-xl text-ink-secondary">
										{p.display_name ?? "Member"}
									</p>
									<p className="type-marketing-kicker mt-1 text-muted">
										{p.cohort ?? "—"} · {p.industry ?? "—"}
									</p>
								</div>
							</div>
							{p.open_to_mentoring ? (
								<span className="w-fit border border-success/50 px-2 py-1 text-technical text-xs text-success">
									Open to mentoring
								</span>
							) : null}
							{p.linkedin_url ? (
								<a
									href={p.linkedin_url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex w-fit min-h-11 cursor-pointer items-center gap-2 rounded text-technical text-ink transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
								>
									LinkedIn
									<ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
								</a>
							) : null}
						</li>
					))}
				</ul>
				{filteredPeers.length === 0 && !showEmptyDirectoryHelp ? (
					<p className="rounded-lg border border-border bg-surface/15 p-8 text-center text-technical text-muted">
						No profiles match these filters.
					</p>
				) : null}
			</div>
		</div>
	);
}
