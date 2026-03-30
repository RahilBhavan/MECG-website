import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/src/auth/AuthProvider";
import { AdminSubnav } from "@/src/components/admin-subnav";
import { useToast } from "@/src/components/toast/ToastProvider";
import { supabase } from "@/src/lib/supabase";
import type { NetworkEventKind, NetworkEventRow } from "@/src/types/database";

function toLocalInputValue(iso: string): string {
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminNetworkEventsPage() {
	const { user } = useAuth();
	const { pushToast } = useToast();
	const [events, setEvents] = useState<NetworkEventRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [kind, setKind] = useState<NetworkEventKind>("event");
	const [startsLocal, setStartsLocal] = useState("");
	const [endsLocal, setEndsLocal] = useState("");
	const [location, setLocation] = useState("");
	const [meetLink, setMeetLink] = useState("");
	const [capacity, setCapacity] = useState("");

	const load = useCallback(async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("network_events")
			.select("*")
			.order("starts_at", { ascending: false });
		setLoading(false);
		if (error) {
			pushToast(error.message, "error");
			return;
		}
		setEvents((data ?? []) as NetworkEventRow[]);
	}, [pushToast]);

	useEffect(() => {
		void load();
	}, [load]);

	function resetForm() {
		setEditingId(null);
		setTitle("");
		setBody("");
		setKind("event");
		setStartsLocal("");
		setEndsLocal("");
		setLocation("");
		setMeetLink("");
		setCapacity("");
	}

	function startEdit(ev: NetworkEventRow) {
		setEditingId(ev.id);
		setTitle(ev.title);
		setBody(ev.body ?? "");
		setKind(ev.kind);
		setStartsLocal(toLocalInputValue(ev.starts_at));
		setEndsLocal(toLocalInputValue(ev.ends_at));
		setLocation(ev.location ?? "");
		setMeetLink(ev.meet_link ?? "");
		setCapacity(ev.capacity != null ? String(ev.capacity) : "");
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!user) return;
		if (!title.trim() || !startsLocal || !endsLocal) {
			pushToast("Title, start, and end are required.", "error");
			return;
		}
		const starts_at = new Date(startsLocal).toISOString();
		const ends_at = new Date(endsLocal).toISOString();
		if (new Date(ends_at) <= new Date(starts_at)) {
			pushToast("End time must be after start time.", "error");
			return;
		}
		const cap =
			capacity.trim() === ""
				? null
				: Math.max(1, Number.parseInt(capacity, 10));
		if (capacity.trim() !== "" && Number.isNaN(cap ?? NaN)) {
			pushToast("Capacity must be a positive number.", "error");
			return;
		}
		setSaving(true);
		const payload = {
			title: title.trim(),
			body: body.trim() || null,
			kind,
			starts_at,
			ends_at,
			location: location.trim() || null,
			meet_link: meetLink.trim() || null,
			capacity: cap,
		};
		if (editingId) {
			const { error } = await supabase
				.from("network_events")
				.update(payload)
				.eq("id", editingId);
			setSaving(false);
			if (error) {
				pushToast(error.message, "error");
				return;
			}
			pushToast("Event updated.", "success");
		} else {
			const { error } = await supabase.from("network_events").insert({
				...payload,
				created_by: user.id,
			});
			setSaving(false);
			if (error) {
				pushToast(error.message, "error");
				return;
			}
			pushToast("Event created.", "success");
		}
		resetForm();
		void load();
	}

	async function remove(id: string) {
		if (!confirm("Delete this event? RSVPs will be removed.")) return;
		const { error } = await supabase
			.from("network_events")
			.delete()
			.eq("id", id);
		if (error) {
			pushToast(error.message, "error");
			return;
		}
		pushToast("Deleted.", "success");
		if (editingId === id) resetForm();
		void load();
	}

	if (loading) {
		return (
			<div className="space-y-4 animate-pulse">
				<div className="h-10 w-64 rounded bg-ink/10" />
				<div className="h-48 rounded border border-border bg-ink/5" />
			</div>
		);
	}

	return (
		<div className="space-y-10">
			<AdminSubnav />
			<div>
				<h1 className="type-portal-title-sans">Network events</h1>
				<p className="mt-2 max-w-3xl font-sans text-sm text-muted">
					Create and manage events and office hours shown on the alumni Network
					page.
				</p>
			</div>

			<form
				onSubmit={(e) => void submit(e)}
				className="max-w-2xl space-y-4 border border-border p-4 sm:p-6"
			>
				<h2 className="text-technical text-muted">
					{editingId ? "Edit event" : "New event"}
				</h2>
				<label className="block space-y-1">
					<span className="text-technical text-muted text-xs">Title</span>
					<input
						required
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					/>
				</label>
				<label className="block space-y-1">
					<span className="text-technical text-muted text-xs">Description</span>
					<textarea
						value={body}
						onChange={(e) => setBody(e.target.value)}
						rows={3}
						className="w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					/>
				</label>
				<label className="block space-y-1">
					<span className="text-technical text-muted text-xs">Kind</span>
					<select
						value={kind}
						onChange={(e) => setKind(e.target.value as NetworkEventKind)}
						className="min-h-11 w-full border border-border bg-bg px-3 py-2 font-sans"
					>
						<option value="event">Event</option>
						<option value="office_hours">Office hours</option>
					</select>
				</label>
				<div className="grid gap-4 sm:grid-cols-2">
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Starts</span>
						<input
							required
							type="datetime-local"
							value={startsLocal}
							onChange={(e) => setStartsLocal(e.target.value)}
							className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
					<label className="block space-y-1">
						<span className="text-technical text-muted text-xs">Ends</span>
						<input
							required
							type="datetime-local"
							value={endsLocal}
							onChange={(e) => setEndsLocal(e.target.value)}
							className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						/>
					</label>
				</div>
				<label className="block space-y-1">
					<span className="text-technical text-muted text-xs">Location</span>
					<input
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					/>
				</label>
				<label className="block space-y-1">
					<span className="text-technical text-muted text-xs">
						Meet link (optional)
					</span>
					<input
						type="url"
						value={meetLink}
						onChange={(e) => setMeetLink(e.target.value)}
						className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					/>
				</label>
				<label className="block space-y-1">
					<span className="text-technical text-muted text-xs">
						Capacity (optional)
					</span>
					<input
						type="number"
						min={1}
						value={capacity}
						onChange={(e) => setCapacity(e.target.value)}
						placeholder="Unlimited if empty"
						className="min-h-11 w-full border border-border bg-transparent px-3 py-2 font-sans outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					/>
				</label>
				<div className="flex flex-wrap gap-3">
					<button
						type="submit"
						disabled={saving}
						className="min-h-11 border border-accent px-6 py-3 font-sans text-technical text-accent hover:bg-accent hover:text-bg disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					>
						{saving ? "Saving…" : editingId ? "Save changes" : "Create"}
					</button>
					{editingId ? (
						<button
							type="button"
							onClick={resetForm}
							className="min-h-11 border border-border px-6 py-3 font-sans text-technical hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						>
							Cancel edit
						</button>
					) : null}
				</div>
			</form>

			<div className="overflow-x-auto border border-border">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-border text-technical text-muted">
						<tr>
							<th className="p-3 font-normal">Title</th>
							<th className="p-3 font-normal">Kind</th>
							<th className="p-3 font-normal">Starts</th>
							<th className="p-3 font-normal">Actions</th>
						</tr>
					</thead>
					<tbody>
						{events.map((ev) => (
							<tr key={ev.id} className="border-b border-border last:border-0">
								<td className="p-3 align-top">{ev.title}</td>
								<td className="p-3 align-top">{ev.kind}</td>
								<td className="p-3 align-top font-data text-xs">
									{new Date(ev.starts_at).toLocaleString()}
								</td>
								<td className="p-3 align-top">
									<div className="flex flex-wrap gap-2">
										<button
											type="button"
											onClick={() => startEdit(ev)}
											className="min-h-11 border border-border px-3 py-2 text-technical text-xs hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
										>
											Edit
										</button>
										<button
											type="button"
											onClick={() => void remove(ev.id)}
											className="min-h-11 border border-border px-3 py-2 text-technical text-xs hover:border-destructive hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
										>
											Delete
										</button>
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
