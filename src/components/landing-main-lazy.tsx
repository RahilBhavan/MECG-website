import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lazy, Suspense, useEffect } from "react";

import ImpactSection from "@/src/components/ImpactSection";
import { LandingSubNav } from "@/src/components/landing-sub-nav";

const FirmSection = lazy(() => import("@/src/components/FirmSection"));
const RecruitmentSection = lazy(
	() => import("@/src/components/RecruitmentSection"),
);
const ContactSection = lazy(() => import("@/src/components/ContactSection"));

function BelowFoldFallback({
	deepLinkTargetId,
}: {
	deepLinkTargetId: string | null;
}) {
	return (
		<div className="w-full">
			{deepLinkTargetId ? (
				<p
					role="status"
					aria-live="polite"
					aria-busy="true"
					className="type-marketing-body-sm border-b border-border bg-surface/30 px-4 py-2.5 text-center text-muted"
				>
					Loading this section…
				</p>
			) : null}
			<div
				className="min-h-[40vh] w-full animate-pulse bg-ink/5"
				aria-hidden={!!deepLinkTargetId}
			/>
		</div>
	);
}

type LandingMainLazyProps = {
	onNavigate: (sectionId: string) => void;
	/** Deep link anchor (e.g. section-join) — shows loading copy in Suspense fallbacks */
	deepLinkTargetId?: string | null;
};

/** Below-the-fold landing sections — lazy-loaded from `LandingPage` to trim initial bundle. */
export function LandingMainLazy({
	onNavigate,
	deepLinkTargetId = null,
}: LandingMainLazyProps) {
	useEffect(() => {
		ScrollTrigger.refresh();
		const id = requestAnimationFrame(() => {
			ScrollTrigger.refresh();
		});
		return () => cancelAnimationFrame(id);
	}, []);

	return (
		<>
			<LandingSubNav onNavigate={onNavigate} />
			<ImpactSection />
			<Suspense
				fallback={<BelowFoldFallback deepLinkTargetId={deepLinkTargetId} />}
			>
				<FirmSection />
			</Suspense>
			<Suspense
				fallback={<BelowFoldFallback deepLinkTargetId={deepLinkTargetId} />}
			>
				<RecruitmentSection />
			</Suspense>
			<Suspense
				fallback={<BelowFoldFallback deepLinkTargetId={deepLinkTargetId} />}
			>
				<ContactSection />
			</Suspense>
		</>
	);
}
