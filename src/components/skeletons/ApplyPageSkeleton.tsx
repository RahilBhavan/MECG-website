/** Initial load layout for Apply — mirrors sticky step rail, fieldset, and mobile action bar. */
export function ApplyPageSkeleton() {
	return (
		<div role="status" aria-live="polite" className="space-y-10">
			<span className="sr-only">Loading application…</span>
			<div className="animate-pulse" aria-hidden>
				<div className="space-y-2">
					<div className="h-10 w-56 rounded bg-ink/10" />
					<div className="h-4 w-72 max-w-full rounded bg-ink/5" />
				</div>

				<div className="space-y-4 max-sm:pb-28 mt-8">
					<div className="sticky top-0 z-10 -mx-2 px-2 py-3 bg-bg/95 backdrop-blur border-b border-border space-y-3">
						<div className="h-4 w-52 rounded bg-ink/10" />
						<div className="h-3 max-w-md rounded bg-ink/5" />
						<div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
							<div className="h-full w-1/3 rounded-full bg-accent/40" />
						</div>
						<div className="flex flex-wrap gap-2">
							<div className="h-11 w-[7.5rem] rounded border border-border border-l-4 border-l-accent/50 bg-ink/10" />
							<div className="h-11 w-24 rounded border border-border bg-ink/5" />
							<div className="h-11 w-20 rounded border border-border bg-ink/5" />
						</div>
					</div>

					<div className="grid min-w-0 gap-4 border border-border p-4 sm:p-6 space-y-4">
						<div className="space-y-2">
							<div className="h-3 w-28 rounded bg-ink/10" />
							<div className="h-11 w-full max-w-lg rounded border border-border bg-ink/5" />
						</div>
						<div className="flex flex-wrap gap-4 items-start">
							<div className="h-32 w-32 shrink-0 rounded border border-border bg-ink/5" />
							<div className="flex flex-col gap-3 min-w-0 flex-1">
								<div className="h-3 w-24 rounded bg-ink/10" />
								<div className="h-11 w-44 rounded border border-border bg-ink/5" />
								<div className="h-11 w-40 rounded border border-border bg-ink/5" />
							</div>
						</div>
						<div className="space-y-2">
							<div className="h-3 w-32 rounded bg-ink/10" />
							<div className="h-11 w-full max-w-lg rounded border border-border bg-ink/5" />
						</div>
						<div className="space-y-2">
							<div className="h-3 w-36 rounded bg-ink/10" />
							<div className="h-11 w-full max-w-lg rounded border border-border bg-ink/5" />
						</div>
					</div>

					<div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg/95 backdrop-blur-md px-4 py-3 sm:hidden">
						<div className="max-w-6xl mx-auto flex gap-3">
							<div className="h-11 flex-1 rounded border border-border bg-ink/5" />
							<div className="h-11 flex-1 rounded border border-border bg-ink/5" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
