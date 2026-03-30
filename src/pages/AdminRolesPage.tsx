import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/src/auth/AuthProvider";
import { supabase } from "@/src/lib/supabase";
import type { AppRole, ProfileRow, UserRoleRow } from "@/src/types/database";

const ASSIGNABLE_ROLES: AppRole[] = [
	"applicant",
	"alumni",
	"reviewer",
	"admin",
];

export default function AdminRolesPage() {
	const { refreshRoles } = useAuth();
	const [profiles, setProfiles] = useState<ProfileRow[]>([]);
	const [roles, setRoles] = useState<UserRoleRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [userId, setUserId] = useState("");
	const [roleToAdd, setRoleToAdd] = useState<AppRole>("alumni");
	const [pending, setPending] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		setMessage(null);
		const { data: p, error: e1 } = await supabase
			.from("profiles")
			.select("*")
			.order("created_at", { ascending: false });
		if (e1) {
			setMessage(e1.message);
			setLoading(false);
			return;
		}
		const { data: r, error: e2 } = await supabase
			.from("user_roles")
			.select("*");
		if (e2) {
			setMessage(e2.message);
			setLoading(false);
			return;
		}
		setProfiles((p as ProfileRow[]) ?? []);
		setRoles((r as UserRoleRow[]) ?? []);
		setLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const rolesByUser = useMemo(() => {
		const map = new Map<string, AppRole[]>();
		for (const row of roles) {
			const list = map.get(row.user_id) ?? [];
			list.push(row.role);
			map.set(row.user_id, list);
		}
		return map;
	}, [roles]);

	async function addRole(e: React.FormEvent) {
		e.preventDefault();
		setPending(true);
		setMessage(null);
		const uid = userId.trim();
		if (!uid) {
			setMessage("Paste a profile user id (UUID).");
			setPending(false);
			return;
		}
		const { error } = await supabase
			.from("user_roles")
			.insert({ user_id: uid, role: roleToAdd });
		setPending(false);
		if (error) {
			setMessage(error.message);
			return;
		}
		setUserId("");
		setMessage(`Added role “${roleToAdd}”.`);
		void load();
		void refreshRoles();
	}

	async function removeRole(uid: string, role: AppRole) {
		setMessage(null);
		const { error } = await supabase
			.from("user_roles")
			.delete()
			.eq("user_id", uid)
			.eq("role", role);
		if (error) {
			setMessage(error.message);
			return;
		}
		setMessage(`Removed “${role}”.`);
		void load();
		void refreshRoles();
	}

	if (loading) {
		return (
			<div className="space-y-4 animate-pulse">
				<div className="h-10 w-64 bg-ink/10 rounded" />
				<div className="h-32 border border-border bg-ink/5 rounded" />
				<div className="h-48 border border-border bg-ink/5 rounded" />
			</div>
		);
	}

	return (
		<div className="space-y-10">
			<div>
				<h1 className="type-portal-title-sans">Role administration</h1>
				<p className="text-technical text-muted max-w-3xl">
					Grant alumni, reviewer, or admin access by user id. The first admin
					must be inserted in the Supabase SQL editor:{" "}
					<code className="text-ink">
						insert into user_roles (user_id, role) values
						(&apos;YOUR_USER_UUID&apos;, &apos;admin&apos;);
					</code>
				</p>
			</div>

			{message ? (
				<p className="text-sm border border-border px-4 py-2">{message}</p>
			) : null}

			<form
				onSubmit={(e) => void addRole(e)}
				className="flex flex-col md:flex-row md:items-end gap-4 border border-border p-4"
			>
				<label className="flex-1 space-y-1">
					<span className="text-technical text-muted text-xs">
						User id (from table below)
					</span>
					<input
						value={userId}
						onChange={(e) => setUserId(e.target.value)}
						placeholder="uuid"
						className="w-full bg-transparent border border-border px-3 py-2 min-h-11 font-data focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					/>
				</label>
				<label className="space-y-1">
					<span className="text-technical text-muted text-xs">Role</span>
					<select
						value={roleToAdd}
						onChange={(e) => setRoleToAdd(e.target.value as AppRole)}
						className="bg-bg border border-border px-3 py-2 min-h-11 font-sans"
					>
						{ASSIGNABLE_ROLES.map((r) => (
							<option key={r} value={r}>
								{r}
							</option>
						))}
					</select>
				</label>
				<button
					type="submit"
					disabled={pending}
					className="border border-accent px-6 py-3 min-h-11 font-sans text-technical text-accent hover:bg-accent hover:text-bg disabled:opacity-50"
				>
					Add role
				</button>
			</form>

			<div className="overflow-x-auto border border-border">
				<table className="w-full text-left text-sm">
					<thead className="text-technical text-muted border-b border-border">
						<tr>
							<th className="p-3 font-normal">Display name</th>
							<th className="p-3 font-normal">User id</th>
							<th className="p-3 font-normal">Roles</th>
						</tr>
					</thead>
					<tbody>
						{profiles.map((p) => (
							<tr key={p.id} className="border-b border-border last:border-0">
								<td className="p-3 align-top">{p.display_name ?? "—"}</td>
								<td className="p-3 align-top font-data break-all max-w-[200px]">
									{p.id}
								</td>
								<td className="p-3 align-top">
									<div className="flex flex-wrap gap-2">
										{(rolesByUser.get(p.id) ?? []).map((r) => (
											<button
												key={r}
												type="button"
												onClick={() => void removeRole(p.id, r)}
												className="border border-border px-3 py-2 min-h-11 text-technical text-xs hover:border-ink"
												title="Remove role"
											>
												{r} ×
											</button>
										))}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
