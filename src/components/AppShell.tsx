import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { getPostLoginPath, hasRole, useAuth } from "@/src/auth/AuthProvider";
import type { AppRole } from "@/src/types/database";

const STORAGE_HINT = "mecg.portalHint.dismissed.v1";

function roleDestinations(
	roleList: AppRole[],
): { to: string; label: string }[] {
	const items: { to: string; label: string }[] = [];
	if (hasRole(roleList, "admin")) items.push({ to: "/admin", label: "Admin" });
	if (hasRole(roleList, "reviewer"))
		items.push({ to: "/review", label: "Review" });
	if (hasRole(roleList, "alumni"))
		items.push({ to: "/network", label: "Network" });
	if (hasRole(roleList, "applicant"))
		items.push({ to: "/apply", label: "Apply" });
	return items;
}

function portalHintText(roles: AppRole[]): string | null {
	if (hasRole(roles, "admin")) {
		return "Assign roles from Admin; new signups default to applicant.";
	}
	if (hasRole(roles, "reviewer")) {
		return "Review submitted applications in your batch—use keyboard ← pass, → yes, ↑ maybe.";
	}
	if (hasRole(roles, "alumni")) {
		return "Turn on directory visibility in Network so other alumni can find you.";
	}
	if (hasRole(roles, "applicant")) {
		return "Save your draft anytime; after submit you won’t be able to edit.";
	}
	return null;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	`inline-flex items-center justify-center min-h-11 px-3 rounded text-technical transition-colors border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
		isActive
			? "border-accent bg-ink/10 text-accent font-medium"
			: "border-transparent text-ink/70 hover:text-ink hover:border-border-strong/40"
	}`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
	`flex items-center min-h-12 px-4 text-technical border-b border-border border-l-4 ${
		isActive
			? "border-l-accent bg-ink/10 text-accent font-medium"
			: "border-l-transparent text-ink/70"
	}`;

export default function AppShell() {
	const { user, roles, signOut } = useAuth();
	const destinations = roleDestinations(roles);
	const home = getPostLoginPath(roles);
	const [menuOpen, setMenuOpen] = useState(false);
	const [hintDismissed, setHintDismissed] = useState(() =>
		typeof localStorage !== "undefined"
			? localStorage.getItem(STORAGE_HINT) === "1"
			: false,
	);

	const hint = useMemo(
		() => (hintDismissed ? null : portalHintText(roles)),
		[roles, hintDismissed],
	);

	useEffect(() => {
		if (menuOpen) document.body.classList.add("overflow-hidden");
		else document.body.classList.remove("overflow-hidden");
		return () => document.body.classList.remove("overflow-hidden");
	}, [menuOpen]);

	function dismissHint() {
		localStorage.setItem(STORAGE_HINT, "1");
		setHintDismissed(true);
	}

	return (
		<div className="min-h-screen bg-bg text-ink cursor-auto">
			<header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-border-strong bg-bg-raised/92 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] shadow-[0_10px_36px_-20px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-6">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<Link
						to={home}
						className="text-technical hover:text-ink transition-colors truncate focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded px-1"
					>
						MECG // PORTAL
					</Link>
				</div>

				<nav
					className="hidden lg:flex flex-wrap items-center gap-1 justify-end"
					aria-label="Portal"
				>
					{destinations.map(({ to, label }) => (
						<NavLink key={to} to={to} className={navLinkClass}>
							{label}
						</NavLink>
					))}
					<Link
						to="/"
						className="inline-flex items-center justify-center min-h-11 px-3 rounded text-technical text-ink/70 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					>
						Site
					</Link>
					<details className="relative ml-2">
						<summary className="list-none cursor-pointer inline-flex items-center justify-center min-h-11 px-3 rounded border border-border text-technical hover:border-ink [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
							Account
						</summary>
						<div className="absolute right-0 mt-2 w-64 border border-border bg-bg p-4 shadow-xl z-50 text-technical text-muted space-y-3">
							<p className="text-xs break-all" title={user?.email ?? ""}>
								{user?.email}
							</p>
							<button
								type="button"
								onClick={() => void signOut()}
								className="w-full border border-border py-2 min-h-11 text-technical hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								Sign out
							</button>
						</div>
					</details>
				</nav>

				<div className="flex items-center gap-2 lg:hidden">
					<details className="relative">
						<summary className="list-none cursor-pointer inline-flex items-center justify-center min-h-11 px-3 border border-border rounded text-technical text-xs hover:border-ink [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
							Account
						</summary>
						<div className="absolute right-0 mt-2 w-64 border border-border bg-bg p-4 shadow-xl z-50 text-technical text-muted space-y-3">
							<p className="text-xs break-all">{user?.email}</p>
							<button
								type="button"
								onClick={() => void signOut()}
								className="w-full border border-border py-2 min-h-11 text-technical hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
							>
								Sign out
							</button>
						</div>
					</details>
					<button
						type="button"
						className="min-h-11 min-w-11 inline-flex items-center justify-center border border-border rounded hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						aria-expanded={menuOpen}
						aria-label={menuOpen ? "Close menu" : "Open menu"}
						onClick={() => setMenuOpen((o) => !o)}
					>
						{menuOpen ? (
							<X className="h-5 w-5" aria-hidden />
						) : (
							<Menu className="h-5 w-5" aria-hidden />
						)}
					</button>
				</div>
			</header>

			{/* Mobile drawer */}
			{menuOpen ? (
				<div className="fixed inset-0 z-[100] lg:hidden">
					<button
						type="button"
						className="absolute inset-0 bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						aria-label="Close menu"
						onClick={() => setMenuOpen(false)}
					/>
					<nav
						className="absolute top-0 right-0 bottom-0 flex w-[min(100%,320px)] flex-col border-l border-border bg-bg pt-4 pb-[env(safe-area-inset-bottom,0px)] shadow-xl"
						aria-label="Mobile navigation"
					>
						{destinations.map(({ to, label }) => (
							<NavLink
								key={to}
								to={to}
								className={mobileLinkClass}
								onClick={() => setMenuOpen(false)}
							>
								{label}
							</NavLink>
						))}
						<Link
							to="/"
							className="flex items-center min-h-12 px-4 text-technical text-ink/70 border-b border-border"
							onClick={() => setMenuOpen(false)}
						>
							Site
						</Link>
						<div className="p-4 mt-auto border-t border-border text-technical text-xs text-muted break-all">
							{user?.email}
						</div>
						<button
							type="button"
							onClick={() => {
								setMenuOpen(false);
								void signOut();
							}}
							className="m-4 border border-border py-3 min-h-11 text-technical hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						>
							Sign out
						</button>
					</nav>
				</div>
			) : null}

			<main className="mx-auto max-w-6xl px-4 pb-[max(4rem,env(safe-area-inset-bottom,0px))] pt-10 sm:px-6">
				{hint ? (
					<div
						role="status"
						className="mb-8 flex flex-col gap-3 rounded-lg border border-border-strong bg-surface/25 px-4 py-4 text-sm text-technical text-muted sm:flex-row sm:items-center"
					>
						<p className="flex-1 leading-relaxed">{hint}</p>
						<button
							type="button"
							onClick={dismissHint}
							className="min-h-11 shrink-0 cursor-pointer rounded-md border border-border px-4 py-2 text-technical transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
						>
							Dismiss
						</button>
					</div>
				) : null}
				<Outlet />
			</main>
		</div>
	);
}
