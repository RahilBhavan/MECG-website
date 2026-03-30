import { Calendar, ExternalLink, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/auth/AuthProvider";
import { useToast } from "@/src/components/toast/ToastProvider";
import { supabase } from "@/src/lib/supabase";
import type {
	NetworkEventRow,
	NetworkEventRsvpRow,
	NetworkEventRsvpStatus,
} from "@/src/types/database";

function formatRange(starts: string, ends: string): string {
	const s = new Date(starts);
	const e = new Date(ends);
	const opts: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	};
	return `${s.toLocaleString(undefined, opts)} – ${e.toLocaleString(undefined, { ...opts, month: "short" })}`;
}

export function NetworkEventsSection() {
	const { user } = useAuth();
	const { pushToast } = useToast();
	const [events, setEvents] = useState<NetworkEventRow[]>([]);
	const [rsvpByEvent, setRsvpByEvent] = useState<
		Map<string, NetworkEventRsvpRow>
	>(new Map());
	const [goingCount, setGoingCount] = useState<Map<string, number>>(new Map());
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		const now = new Date().toISOString();
		const { data: evs, error: e1 } = await supabase
			.from("network_events")
			.select("*")
			.gte("ends_at", now)
			.order("starts_at", { ascending: true })
			.limit(24);
		if (e1) {
			pushToast(e1.message, "error");
			setLoading(false);
			return;
		}
		const list = (evs ?? []) as NetworkEventRow[];
		setEvents(list);

		const { data: mine, error: e2 } = await supabase
			.from("network_event_rsvps")
			.select("*")
			.eq("user_id", user.id);
		if (e2) {
			pushToast(e2.message, "error");
			setLoading(false);
			return;
		}
		const map = new Map<string, NetworkEventRsvpRow>();
		for (const r of (mine ?? []) as NetworkEventRsvpRow[]) {
			map.set(r.event_id, r);
		}
		setRsvpByEvent(map);

		const counts = new Map<string, number>();
		await Promise.all(
			list.map(async (ev) => {
				const { data: c } = await supabase.rpc("network_event_going_count", {
					p_event_id: ev.id,
				});
				counts.set(ev.id, typeof c === "number" ? c : 0);
			}),
		);
		setGoingCount(counts);
		setLoading(false);
	}, [user, pushToast]);

	useEffect(() => {
		void load();
	}, [load]);

	async function setRsvpStatus(
		event: NetworkEventRow,
		status: NetworkEventRsvpStatus,
	) {
		if (!user) return;
		const current = rsvpByEvent.get(event.id);
		if (status === "cancelled") {
			if (!current) return;
			const { error } = await supabase
				.from("network_event_rsvps")
				.update({ status: "cancelled" })
				.eq("event_id", event.id)
				.eq("user_id", user.id);
			if (error) {
				pushToast(error.message, "error");
				return;
			}
			pushToast("RSVP cancelled.", "success");
			void load();
			return;
		}

		const going = goingCount.get(event.id) ?? 0;
		const cap = event.capacity;
		let nextStatus: NetworkEventRsvpStatus = status;
		if (status === "going" && cap != null && going >= cap) {
			nextStatus = "waitlist";
		}

		if (current) {
			const { error } = await supabase
				.from("network_event_rsvps")
				.update({ status: nextStatus })
				.eq("event_id", event.id)
				.eq("user_id", user.id);
			if (error) {
				pushToast(error.message, "error");
				return;
			}
		} else {
			const { error } = await supabase.from("network_event_rsvps").insert({
				event_id: event.id,
				user_id: user.id,
				status: nextStatus,
			});
			if (error) {
				pushToast(error.message, "error");
				return;
			}
		}
		pushToast(
			nextStatus === "waitlist"
				? "You’re on the waitlist."
				: "You’re signed up.",
			"success",
		);
		void load();
	}

	if (loading) {
		return (
			<div className="space-y-3 animate-pulse">
				<div className="h-8 w-48 rounded bg-ink/10" />
				<div className="h-24 rounded border border-border bg-ink/5" />
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-border-strong bg-surface/15 p-6">
				<h2 className="text-technical text-muted">Events & office hours</h2>
				<p className="mt-2 font-sans text-sm text-muted">
					No upcoming sessions scheduled. Check back later.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="type-portal-title text-2xl sm:text-3xl">
					Events & office hours
				</h2>
				<p className="mt-2 max-w-2xl font-sans text-sm text-muted">
					RSVP for upcoming alumni programming. Capacity is first-come; you may
					be placed on a waitlist when full.
				</p>
			</div>
			<ul className="space-y-4">
				{events.map((ev) => {
					const rsvp = rsvpByEvent.get(ev.id);
					const going = goingCount.get(ev.id) ?? 0;
					const cap = ev.capacity;
					const full = cap != null && going >= cap;
					const isOffice = ev.kind === "office_hours";
					return (
						<li
							key={ev.id}
							className="rounded-lg border border-border bg-bg-raised/40 p-5 sm:p-6"
						>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div className="min-w-0 space-y-2">
									<div className="flex flex-wrap items-center gap-2">
										<span
											className={`border px-2 py-0.5 text-technical text-xs ${
												isOffice
													? "border-accent/50 text-accent"
													: "border-border text-muted"
											}`}
										>
											{isOffice ? "Office hours" : "Event"}
										</span>
										<span className="inline-flex items-center gap-1.5 font-sans text-sm text-muted">
											<Calendar className="h-4 w-4 shrink-0" aria-hidden />
											{formatRange(ev.starts_at, ev.ends_at)}
										</span>
									</div>
									<h3 className="font-display text-xl text-ink-secondary">
										{ev.title}
									</h3>
									{ev.body ? (
										<p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted">
											{ev.body}
										</p>
									) : null}
									{ev.location ? (
										<p className="inline-flex items-start gap-2 font-sans text-sm text-muted">
											<MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
											{ev.location}
										</p>
									) : null}
									{ev.meet_link ? (
										<a
											href={ev.meet_link}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex min-h-11 items-center gap-2 font-sans text-sm text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
										>
											Join link
											<ExternalLink className="h-4 w-4" aria-hidden />
										</a>
									) : null}
									{cap != null ? (
										<p className="font-sans text-xs text-muted">
											{going} / {cap} spots filled
											{full ? " (waitlist available)" : ""}
										</p>
									) : null}
								</div>
								<div className="flex shrink-0 flex-col gap-2 sm:items-end">
									{rsvp?.status === "going" || rsvp?.status === "waitlist" ? (
										<>
											<span className="text-technical text-xs text-success">
												{rsvp.status === "waitlist"
													? "On waitlist"
													: "Registered"}
											</span>
											<Button
												type="button"
												variant="outline"
												className="min-h-11 w-full sm:w-auto"
												onClick={() => void setRsvpStatus(ev, "cancelled")}
											>
												Cancel RSVP
											</Button>
										</>
									) : (
										<Button
											type="button"
											className="min-h-11 w-full sm:w-auto"
											onClick={() => void setRsvpStatus(ev, "going")}
										>
											{rsvp?.status === "cancelled" ? "RSVP again" : "RSVP"}
										</Button>
									)}
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
