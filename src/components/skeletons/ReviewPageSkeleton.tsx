/** Initial load layout for Review — mirrors header tools, stacked cards, and notes column. */
export function ReviewPageSkeleton() {
	return (
		<div role="status" aria-live="polite" className="space-y-8">
			<span className="sr-only">Loading review queue…</span>
			<div className="animate-pulse pb-44 lg:pb-0" aria-hidden>
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
					<div className="space-y-2">
						<div className="h-10 w-48 rounded bg-ink/10" />
						<div className="h-4 max-w-xl rounded bg-ink/5" />
					</div>
					<div className="flex flex-wrap gap-3 items-center">
						<div className="h-11 w-11 rounded border border-border bg-ink/5" />
						<div className="h-11 w-40 rounded border border-border bg-ink/5" />
						<div className="h-11 w-36 rounded border border-border bg-ink/5" />
						<div className="h-11 w-24 rounded border border-border bg-ink/5" />
						<div className="h-11 max-w-[10rem] flex-1 rounded border border-border bg-ink/5 sm:flex-none sm:w-40" />
					</div>
				</div>

				<div className="h-11 w-full rounded border border-border bg-ink/5 lg:hidden mt-2" />

				<div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start mt-6">
					<div className="relative min-h-[420px] flex items-center justify-center px-2">
						<div className="relative w-full max-w-lg mx-auto">
							<div className="absolute inset-x-4 top-6 z-0 h-64 scale-[0.96] border border-border bg-ink/5 opacity-60" />
							<div className="relative z-10 w-full min-h-[300px] border border-border bg-bg shadow-2xl p-6 space-y-4">
								<div className="flex justify-center sm:justify-start">
									<div className="h-28 w-28 shrink-0 rounded border border-border bg-ink/10" />
								</div>
								<div className="h-8 w-2/3 max-w-xs rounded bg-ink/10" />
								<div className="h-3 w-48 rounded bg-ink/10" />
								<div className="space-y-2 pt-1">
									<div className="h-3 w-full rounded bg-ink/10" />
									<div className="h-3 w-full rounded bg-ink/10" />
									<div className="h-3 w-[88%] rounded bg-ink/10" />
								</div>
							</div>
						</div>
					</div>

					<div className="hidden lg:block space-y-4 border border-border p-4">
						<div className="h-4 w-36 rounded bg-ink/10" />
						<div className="h-11 w-full rounded border border-border bg-ink/5" />
						<div className="h-3 w-28 rounded bg-ink/10" />
						<div className="h-28 w-full rounded border border-border bg-ink/5" />
						<div className="grid grid-cols-3 gap-2 pt-2">
							<div className="h-16 rounded border border-border bg-ink/5" />
							<div className="h-16 rounded border border-border bg-ink/5" />
							<div className="h-16 rounded border border-border bg-ink/5" />
						</div>
					</div>
				</div>

				<div className="fixed bottom-0 left-0 right-0 z-[120] border-t border-border bg-bg p-4 space-y-3 shadow-sticky-up-soft lg:hidden">
					<div className="h-4 w-32 rounded bg-ink/10" />
					<div className="h-11 w-full rounded border border-border bg-ink/5" />
					<div className="h-24 w-full rounded border border-border bg-ink/5" />
					<div className="grid grid-cols-3 gap-2">
						<div className="h-14 rounded border border-border bg-ink/5" />
						<div className="h-14 rounded border border-border bg-ink/5" />
						<div className="h-14 rounded border border-border bg-ink/5" />
					</div>
				</div>
			</div>
		</div>
	);
}
