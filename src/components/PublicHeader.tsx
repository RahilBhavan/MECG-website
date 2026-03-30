import { Link } from "react-router-dom";

/** Top bar for the public marketing site (links into the authenticated portal). */
export default function PublicHeader() {
	return (
		<header className="pointer-events-none absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 text-technical sm:top-8 sm:left-6 sm:right-6 sm:gap-6">
			<Link
				to="/"
				className="pointer-events-auto interactive relative inline-flex min-h-11 min-w-11 max-w-[min(100%,14rem)] shrink items-center justify-center px-2 text-left leading-tight transition-colors tracking-[0.12em] after:absolute after:bottom-1 after:left-2 after:right-2 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-accent hover:after:scale-x-100 sm:max-w-none sm:tracking-[0.14em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm"
			>
				MECG <span className="text-muted">//</span> CONSULTING
			</Link>
			<div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
				<Link
					to="/signup"
					className="pointer-events-auto btn-marketing-outline min-h-11 border-ink/35 bg-bg/55 px-4 py-3 backdrop-blur-sm min-w-[6.5rem]"
				>
					Join
				</Link>
				<Link
					to="/apply"
					className="pointer-events-auto btn-marketing-primary min-w-[6.5rem] px-5"
				>
					Apply
				</Link>
				<Link
					to="/login"
					className="pointer-events-auto btn-marketing-outline min-h-11 border-ink/35 bg-bg/55 px-4 py-3 backdrop-blur-sm min-w-[6.5rem]"
				>
					Sign in
				</Link>
			</div>
		</header>
	);
}
