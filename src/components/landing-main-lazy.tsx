import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

import ContactSection from "@/src/components/ContactSection";
import FirmSection from "@/src/components/FirmSection";
import ImpactSection from "@/src/components/ImpactSection";
import { LandingSubNav } from "@/src/components/landing-sub-nav";
import RecruitmentSection from "@/src/components/RecruitmentSection";

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
			<FirmSection />
			<RecruitmentSection />
			<ContactSection />
		</>
	);
}
