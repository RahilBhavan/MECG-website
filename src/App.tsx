/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import CustomCursor from './components/CustomCursor';
import HeroSection from './components/HeroSection';
import ImpactSection from './components/ImpactSection';
import FirmSection from './components/FirmSection';
import RecruitmentSection from './components/RecruitmentSection';
import ContactSection from './components/ContactSection';

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-bg text-ink min-h-screen selection:bg-accent selection:text-bg">
      <CustomCursor />
      <HeroSection />
      <ImpactSection />
      <FirmSection />
      <RecruitmentSection />
      <ContactSection />
    </div>
  );
}
