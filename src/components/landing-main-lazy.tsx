import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lazy, Suspense, useEffect } from "react";

import ImpactSection from "@/src/components/ImpactSection";
import { LandingSubNav } from "@/src/components/landing-sub-nav";

const FirmSection = lazy(() => import("@/src/components/FirmSection"));
const RecruitmentSection = lazy(
	() => import("@/src/components/RecruitmentSection"),
);
const ContactSection = lazy(() => import("@/src/components/ContactSection"));

function BelowFoldFallback() {
	return (
		<div className="min-h-[40vh] w-full animate-pulse bg-ink/5" aria-hidden />
	);
}

type LandingMainLazyProps = {
	onNavigate: (sectionId: string) => void;
};

/** Below-the-fold landing sections — lazy-loaded from `LandingPage` to trim initial bundle. */
export function LandingMainLazy({ onNavigate }: LandingMainLazyProps) {
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
			<Suspense fallback={<BelowFoldFallback />}>
				<FirmSection />
			</Suspense>
			<Suspense fallback={<BelowFoldFallback />}>
				<RecruitmentSection />
			</Suspense>
			<Suspense fallback={<BelowFoldFallback />}>
				<ContactSection />
			</Suspense>
		</>
	);
}
