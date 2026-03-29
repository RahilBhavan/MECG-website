import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const elements = section.querySelectorAll('.animate-up');

    gsap.fromTo(
      elements,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-bg text-ink py-32 px-6 border-t border-[#333]">
      <div className="max-w-7xl mx-auto">
        
        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-[#333] pb-24 mb-24">
          <div className="animate-up flex flex-col justify-center items-center md:items-start md:border-r border-[#333] md:pr-12 py-8 md:py-0">
            <div className="text-massive leading-none">8+</div>
            <div className="text-technical text-muted mt-4">Active Members</div>
          </div>
          <div className="animate-up flex flex-col justify-center items-center md:items-start md:border-r border-[#333] md:px-12 py-8 md:py-0">
            <div className="text-massive leading-none">2+</div>
            <div className="text-technical text-muted mt-4">Projects Completed</div>
          </div>
          <div className="animate-up flex flex-col justify-center items-center md:items-start md:pl-12 py-8 md:py-0">
            <div className="text-massive leading-none">1+</div>
            <div className="text-technical text-muted mt-4">Active Cohorts</div>
          </div>
        </div>

        {/* Strategic Foundations (Pillars) */}
        <div className="animate-up">
          <h2 className="text-4xl md:text-6xl font-display mb-16 uppercase tracking-tight">Strategic Foundations</h2>
          <div className="flex flex-col border-t border-[#333]">
            {[
              { num: '01', title: 'Professional Development' },
              { num: '02', title: 'Education' },
              { num: '03', title: 'Project Experience' },
              { num: '04', title: 'Community' }
            ].map((pillar, i) => (
              <div key={i} className="flex items-baseline py-8 border-b border-[#333] hover:bg-white/5 transition-colors group cursor-default">
                <span className="text-technical text-muted w-24 shrink-0 group-hover:text-ink transition-colors">[{pillar.num}]</span>
                <h3 className="text-2xl md:text-4xl font-sans font-light tracking-tight">{pillar.title}</h3>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
