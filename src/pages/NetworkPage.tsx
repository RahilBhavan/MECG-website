import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/src/auth/AuthProvider";
import { NetworkEventsSection } from "@/src/components/network-events-section";
import { useToast } from "@/src/components/toast/ToastProvider";
import { listDirectoryProfiles } from "@/src/lib/network-directory";
import { supabase } from "@/src/lib/supabase";
import type {
	DirectoryProfileRow,
	ProfileEditableRow,
} from "@/src/types/database";

const OWN_PROFILE_COLUMNS =
	"id, display_name, cohort, industry, interests, graduation_year, open_to_mentoring, open_to_coffee_chats, linkedin_url, directory_visible, show_linkedin, show_interests, show_cohort, show_industry" as const;

const MAX_INTEREST_TAGS = 10;

function profileInitials(name: string | null | undefined): string {
	const trimmed = (name ?? "").trim();
	if (!trimmed) return "?";
	const parts = trimmed.split(/\s+/).filter(Boolean);
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function parseInterestsInput(raw: string): string[] {
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)
		.slice(0, MAX_INTEREST_TAGS);
}

function normalizeOwnProfile(row: Record<string, unknown>): ProfileEditableRow {
	const interests = row.interests;
	return {
		id: String(row.id),
		display_name: (row.display_name as string | null) ?? null,
		cohort: (row.cohort as string | null) ?? null,
		industry: (row.industry as string | null) ?? null,
		interests: Array.isArray(interests)
			? (interests as string[])
			: typeof interests === "string"
				? parseInterestsInput(interests)
				: [],
		graduation_year:
			row.graduation_year === null || row.graduation_year === undefined
				? null
				: Number(row.graduation_year),
		open_to_mentoring: Boolean(row.open_to_mentoring),
		open_to_coffee_chats: Boolean(row.open_to_coffee_chats),
		linkedin_url: (row.linkedin_url as string | null) ?? null,
		directory_visible: Boolean(row.directory_visible),
		show_linkedin: Boolean(row.show_linkedin),
		show_interests: Boolean(row.show_interests),
		show_cohort: Boolean(row.show_cohort),
		show_industry: Boolean(row.show_industry),
	};
}

export default function NetworkPage() {
	const { user } = useAuth();
	const { pushToast } = useToast();
	const [mine, setMine] = useState<ProfileEditableRow | null>(null);
	const [directoryRows, setDirectoryRows] = useState<DirectoryProfileRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [dirLoading, setDirLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [cohortFilter, setCohortFilter] = useState("");
	const [industryFilter, setIndustryFilter] = useState("");
	const [interestFilter, setInterestFilter] = useState("");
	const [gradYearFilter, setGradYearFilter] = useState("");

	useEffect(() => {
		const t = window.setTimeout(() => setDebouncedSearch(searchQuery), 320);
		return () => window.clearTimeout(t);
	}, [searchQuery]);

	const loadMine = useCallback(async () => {
		if (!user) return;
		const { data, error } = await supabase
			.from("profiles")
			.select(OWN_PROFILE_COLUMNS)
			.eq("id", user.id)
			.maybeSingle();
		if (error) {
			setMessage(error.message);
			return;
		}
		setMine(data ? normalizeOwnProfile(data as Record<string, unknown>) : null);
	}, [user]);

	const loadDirectory = useCallback(async () => {
		if (!user) return;
		setDirLoading(true);
		const gy =
			gradYearFilter.trim() === "" ? null : Number.parseInt(gradYearFilter, 10);
		const { data, error } = await listDirectoryProfiles({
			p_q: debouncedSearch.trim() || null,
			p_cohort_substr: cohortFilter.trim() || null,
			p_interest: interestFilter.trim() || null,
			p_graduation_year:
				gradYearFilter.trim() === "" || Number.isNaN(gy ?? NaN) ? null : gy,
			p_limit: 60,
			p_offset: 0,
		});
		setDirLoading(false);
		if (error) {
			setMessage(error.message);
			pushToast(error.message, "error");
			return;
		}
		setDirectoryRows((data ?? []).filter((p) => p.id !== user.id));
	}, [
		user,
		debouncedSearch,
		cohortFilter,
		interestFilter,
		gradYearFilter,
		pushToast,
	]);

	const filteredPeers = useMemo(() => {
		const ind = industryFilter.trim().toLowerCase();
		if (!ind) return directoryRows;
		return directoryRows.filter((p) =>
			(p.industry ?? "").toLowerCase().includes(ind),
		);
	}, [directoryRows, industryFilter]);

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setMessage(null);
		await loadMine();
		setLoading(false);
	}, [user, loadMine]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!user || loading) return;
		void loadDirectory();
	}, [user, loading, loadDirectory]);

	const showEmptyDirectoryHelp = directoryRows.length === 0;

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
				interests: mine.interests,
				graduation_year: mine.graduation_year,
				open_to_mentoring: mine.open_to_mentoring,
				open_to_coffee_chats: mine.open_to_coffee_chats,
				linkedin_url: mine.linkedin_url,
				directory_visible: mine.directory_visible,
				show_linkedin: mine.show_linkedin,
				show_interests: mine.show_interests,
				show_cohort: mine.show_cohort,
				show_industry: mine.show_industry,
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
		void loadDirectory();
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

	return (
		<div className="space-y-12">
			<div className="max-w-2xl border-b border-border pb-8">
				<h1 className="type-portal-title">Alumni network</h1>
				<p className="mt-2 text-sm font-sans font-light leading-relaxed text-muted">
					Update your profile, choose what appears in the directory, and connect
					with members who opt in. Only alumni (and admins) can browse masked
					directory results.
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
							className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Cohort</span>
						<input
							type="text"
							value={mine.cohort ?? ""}
							onChange={(e) => setMine({ ...mine, cohort: e.target.value })}
							className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">
							Graduation year (optional)
						</span>
						<input
							type="number"
							min={1990}
							max={2040}
							placeholder="e.g. 2026"
							value={mine.graduation_year ?? ""}
							onChange={(e) => {
								const v = e.target.value;
								setMine({
									...mine,
									graduation_year:
										v === "" ? null : Math.min(2040, Math.max(1990, Number(v))),
								});
							}}
							className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Industry</span>
						<input
							type="text"
							value={mine.industry ?? ""}
							onChange={(e) => setMine({ ...mine, industry: e.target.value })}
							className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">
							Interests (comma-separated, max {MAX_INTEREST_TAGS})
						</span>
						<input
							type="text"
							value={mine.interests.join(", ")}
							onChange={(e) =>
								setMine({
									...mine,
									interests: parseInterestsInput(e.target.value),
								})
							}
							className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
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
							className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<div className="space-y-3 border-t border-border pt-4">
						<p className="font-sans text-xs leading-relaxed text-muted">
							Choose what appears on your directory card for other alumni. Each
							toggle is opt-in; your email is never shown here.
						</p>
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
									Master switch — when off, other alumni cannot find your card.
								</span>
							</span>
						</label>
						<label
							className={`flex min-h-11 cursor-pointer items-start gap-3 text-technical text-muted ${!mine.directory_visible ? "opacity-50" : ""}`}
						>
							<input
								type="checkbox"
								disabled={!mine.directory_visible}
								checked={mine.show_cohort}
								onChange={(e) =>
									setMine({ ...mine, show_cohort: e.target.checked })
								}
								className="mt-1"
							/>
							<span>Show cohort & graduation year</span>
						</label>
						<label
							className={`flex min-h-11 cursor-pointer items-start gap-3 text-technical text-muted ${!mine.directory_visible ? "opacity-50" : ""}`}
						>
							<input
								type="checkbox"
								disabled={!mine.directory_visible}
								checked={mine.show_industry}
								onChange={(e) =>
									setMine({ ...mine, show_industry: e.target.checked })
								}
								className="mt-1"
							/>
							<span>Show industry</span>
						</label>
						<label
							className={`flex min-h-11 cursor-pointer items-start gap-3 text-technical text-muted ${!mine.directory_visible ? "opacity-50" : ""}`}
						>
							<input
								type="checkbox"
								disabled={!mine.directory_visible}
								checked={mine.show_interests}
								onChange={(e) =>
									setMine({ ...mine, show_interests: e.target.checked })
								}
								className="mt-1"
							/>
							<span>Show interests</span>
						</label>
						<label
							className={`flex min-h-11 cursor-pointer items-start gap-3 text-technical text-muted ${!mine.directory_visible ? "opacity-50" : ""}`}
						>
							<input
								type="checkbox"
								disabled={!mine.directory_visible}
								checked={mine.show_linkedin}
								onChange={(e) =>
									setMine({ ...mine, show_linkedin: e.target.checked })
								}
								className="mt-1"
							/>
							<span>Show LinkedIn link</span>
						</label>
					</div>
					<label className="flex min-h-11 items-center gap-3 text-technical text-muted">
						<input
							type="checkbox"
							checked={mine.open_to_mentoring}
							onChange={(e) =>
								setMine({ ...mine, open_to_mentoring: e.target.checked })
							}
						/>
						Open to mentoring
					</label>
					<label className="flex min-h-11 items-center gap-3 text-technical text-muted">
						<input
							type="checkbox"
							checked={mine.open_to_coffee_chats}
							onChange={(e) =>
								setMine({ ...mine, open_to_coffee_chats: e.target.checked })
							}
						/>
						Open to coffee chats
					</label>
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
						and save. Here&apos;s a preview of how your card can look:
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
								{mine.show_cohort
									? `${mine.cohort ?? "Cohort"}${mine.graduation_year ? ` · ${mine.graduation_year}` : ""}`
									: "Cohort hidden"}
								{" · "}
								{mine.show_industry
									? (mine.industry ?? "Industry")
									: "Industry hidden"}
							</p>
							<div className="mt-2 flex flex-wrap gap-2">
								{mine.open_to_coffee_chats ? (
									<span className="inline-block border border-accent/40 px-2 py-1 text-technical text-xs text-accent">
										Open to coffee chats
									</span>
								) : null}
								{mine.open_to_mentoring ? (
									<span className="inline-block border border-success/50 px-2 py-1 text-technical text-xs text-success">
										Open to mentoring
									</span>
								) : null}
							</div>
						</div>
					</div>
				</div>
			) : null}

			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-lg border border-border bg-surface/15 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 sm:p-5">
					<h2 className="text-technical text-muted shrink-0 sm:mr-2">
						Directory
					</h2>
					<label className="flex min-w-[160px] flex-1 flex-col gap-1 text-xs text-technical text-muted">
						Search
						<input
							type="search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Name, cohort, industry, interest…"
							className="min-h-11 rounded-md border border-border bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="flex min-w-[120px] flex-1 flex-col gap-1 text-xs text-technical text-muted">
						Filter cohort
						<input
							type="text"
							value={cohortFilter}
							onChange={(e) => setCohortFilter(e.target.value)}
							placeholder="contains…"
							className="min-h-11 rounded-md border border-border bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="flex min-w-[120px] flex-1 flex-col gap-1 text-xs text-technical text-muted">
						Filter industry
						<input
							type="text"
							value={industryFilter}
							onChange={(e) => setIndustryFilter(e.target.value)}
							placeholder="contains…"
							className="min-h-11 rounded-md border border-border bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="flex min-w-[120px] flex-1 flex-col gap-1 text-xs text-technical text-muted">
						Interest contains
						<input
							type="text"
							value={interestFilter}
							onChange={(e) => setInterestFilter(e.target.value)}
							placeholder="tag…"
							className="min-h-11 rounded-md border border-border bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="flex min-w-[100px] flex-1 flex-col gap-1 text-xs text-technical text-muted">
						Grad year
						<input
							type="number"
							min={1990}
							max={2040}
							value={gradYearFilter}
							onChange={(e) => setGradYearFilter(e.target.value)}
							placeholder="any"
							className="min-h-11 rounded-md border border-border bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
				</div>
				{dirLoading ? (
					<p className="text-technical text-muted text-sm">
						Loading directory…
					</p>
				) : null}

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
										{[
											p.cohort,
											p.graduation_year ? String(p.graduation_year) : null,
										]
											.filter(Boolean)
											.join(" · ") || "—"}
										{p.industry ? ` · ${p.industry}` : ""}
									</p>
								</div>
							</div>
							{p.interests && p.interests.length > 0 ? (
								<ul className="flex flex-wrap gap-1.5">
									{p.interests.map((tag) => (
										<li
											key={tag}
											className="rounded border border-border px-2 py-0.5 font-sans text-xs text-muted"
										>
											{tag}
										</li>
									))}
								</ul>
							) : null}
							<div className="flex flex-wrap gap-2">
								{p.open_to_coffee_chats ? (
									<span className="w-fit border border-accent/40 px-2 py-1 text-technical text-xs text-accent">
										Open to coffee chats
									</span>
								) : null}
								{p.open_to_mentoring ? (
									<span className="w-fit border border-success/50 px-2 py-1 text-technical text-xs text-success">
										Open to mentoring
									</span>
								) : null}
							</div>
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
				{!dirLoading &&
				filteredPeers.length === 0 &&
				!showEmptyDirectoryHelp ? (
					<p className="rounded-lg border border-border bg-surface/15 p-8 text-center text-technical text-muted">
						No profiles match these filters.
					</p>
				) : null}
			</div>

			<NetworkEventsSection />
		</div>
	);
}
