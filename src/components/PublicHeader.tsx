import { Link } from "react-router-dom";

import { ThemeToggle } from "@/src/components/theme-toggle.tsx";

/** Top bar for the public marketing site (links into the authenticated portal). */
export default function PublicHeader() {
	return (
		<header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pt-[max(1rem,env(safe-area-inset-top,0px))] text-technical after:pointer-events-none after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-accent/45 after:to-transparent sm:inset-x-6 sm:top-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:px-0 sm:pt-0 sm:after:-bottom-3">
			<Link
				to="/"
				className="pointer-events-auto interactive relative inline-flex min-h-11 min-w-11 max-w-[min(100%,14rem)] shrink items-center justify-center px-2 text-left leading-tight transition-colors tracking-[0.12em] after:absolute after:bottom-1 after:left-2 after:right-2 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-accent hover:after:scale-x-100 sm:max-w-none sm:tracking-[0.14em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm"
			>
				MECG <span className="text-muted">//</span> CONSULTING
			</Link>
			{/* Apply → login if needed, then back to /apply; new accounts via Sign up on login */}
			<div className="pointer-events-auto flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end sm:gap-1.5">
				<div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
					<ThemeToggle className="min-h-12 sm:min-h-11" />
					<Link
						to="/apply"
						className="btn-marketing-primary min-h-12 w-full px-5 text-center sm:min-h-11 sm:w-auto sm:min-w-[6.5rem]"
					>
						Apply
					</Link>
					<Link
						to="/login"
						className="btn-marketing-outline min-h-12 w-full border-ink/35 bg-bg/55 px-4 py-3 text-center backdrop-blur-sm sm:min-h-11 sm:w-auto sm:min-w-[6.5rem]"
					>
						Sign in
					</Link>
				</div>
				<p className="text-technical text-muted hidden max-w-xs text-right leading-snug opacity-90 sm:block sm:max-w-[16rem]">
					Alumni network & reviewer tools: use Sign in.
				</p>
			</div>
		</header>
	);
}
