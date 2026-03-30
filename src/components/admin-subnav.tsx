import { NavLink } from "react-router-dom";

const subNavClass = ({ isActive }: { isActive: boolean }) =>
	`inline-flex min-h-11 items-center justify-center rounded border px-4 text-technical transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
		isActive
			? "border-accent bg-ink/10 text-accent"
			: "border-border text-muted hover:border-ink hover:text-ink"
	}`;

export function AdminSubnav() {
	return (
		<nav
			className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4"
			aria-label="Admin sections"
		>
			<NavLink to="/admin" end className={subNavClass}>
				Roles
			</NavLink>
			<NavLink to="/admin/applications" className={subNavClass}>
				Applications
			</NavLink>
			<NavLink
				to="/admin/reviews"
				className={subNavClass}
				title="Reviewer submissions and audit log"
			>
				Review audit
			</NavLink>
			<NavLink to="/admin/directory" className={subNavClass}>
				Directory
			</NavLink>
			<NavLink to="/admin/network-events" className={subNavClass}>
				Events
			</NavLink>
		</nav>
	);
}
