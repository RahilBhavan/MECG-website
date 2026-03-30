/** Shown by Sentry error boundary on uncaught render errors. */
export function AppErrorFallback({
	error: _error,
	resetError,
}: {
	error: unknown;
	resetError: () => void;
	componentStack?: string;
	eventId?: string;
}) {
	void _error;
	return (
		<div className="min-h-dvh-screen page-safe-insets flex flex-col items-center justify-center bg-bg px-6 text-center text-ink">
			<h1 className="type-portal-title-sans mb-3">Something went wrong</h1>
			<p className="text-technical text-muted mb-6 max-w-md">
				Please refresh the page or try again. If this keeps happening, contact
				support.
			</p>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					className="inline-flex min-h-11 min-w-44 items-center justify-center rounded border border-border-strong bg-surface px-4 text-technical text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
					onClick={() => resetError()}
				>
					Try again
				</button>
				<a
					href="/"
					className="inline-flex min-h-11 min-w-44 items-center justify-center rounded border border-border bg-bg px-4 text-technical text-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
				>
					Home
				</a>
			</div>
		</div>
	);
}
