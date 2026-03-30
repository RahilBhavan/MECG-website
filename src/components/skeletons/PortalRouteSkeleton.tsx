/** Shown while lazy portal chunks load after navigation. */
export default function PortalRouteSkeleton() {
	return (
		<div className="min-h-screen bg-bg text-ink cursor-auto animate-pulse px-6 py-10 max-w-5xl mx-auto space-y-8">
			<div className="h-10 w-48 bg-ink/10 rounded" />
			<div className="h-4 w-full max-w-md bg-ink/5 rounded" />
			<div className="h-64 border border-border bg-ink/5 rounded" />
			<div className="space-y-3">
				<div className="h-4 bg-ink/5 rounded w-3/4" />
				<div className="h-4 bg-ink/5 rounded w-1/2" />
				<div className="h-4 bg-ink/5 rounded w-5/6" />
			</div>
		</div>
	);
}
