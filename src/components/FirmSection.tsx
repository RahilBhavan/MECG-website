import { useState } from 'react';

const teamMembers = [
  { name: 'Annie Callum', role: 'President', category: 'Exec Board', image: 'https://picsum.photos/seed/annie/400/500?grayscale' },
  { name: 'Jonathan Ray', role: 'Co-Founder', category: 'Exec Board', image: 'https://picsum.photos/seed/jonathan/400/500?grayscale' },
  { name: 'Aaryan Singh', role: 'Co-Founder', category: 'Exec Board', image: 'https://picsum.photos/seed/aaryan/400/500?grayscale' },
  { name: 'Sarah Jenkins', role: 'Project Manager', category: 'PMs', image: 'https://picsum.photos/seed/sarah/400/500?grayscale' },
  { name: 'David Chen', role: 'Project Manager', category: 'PMs', image: 'https://picsum.photos/seed/david/400/500?grayscale' },
  { name: 'Emily Thorne', role: 'Analyst', category: 'Analysts', image: 'https://picsum.photos/seed/emily/400/500?grayscale' },
  { name: 'Michael Ross', role: 'Analyst', category: 'Analysts', image: 'https://picsum.photos/seed/michael/400/500?grayscale' },
];

export default function FirmSection() {
  const [activeTab, setActiveTab] = useState('Exec Board');
  const tabs = ['Exec Board', 'PMs', 'Analysts'];

  const filteredTeam = teamMembers.filter(member => member.category === activeTab);

  return (
    <section className="w-full bg-bg text-ink py-32 px-6 border-t border-[#333]">
      <div className="max-w-7xl mx-auto">
        
        {/* Our History */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
          <div className="md:col-span-4">
            <h2 className="text-technical text-muted mb-4">[01] OUR HISTORY</h2>
          </div>
          <div className="md:col-span-8">
            <h3 className="text-4xl md:text-6xl font-display mb-8 leading-tight">
              FOUNDED IN 2023 BY JONATHAN RAY & AARYAN SINGH.
            </h3>
            <p className="text-lg md:text-xl font-sans font-light text-muted leading-relaxed max-w-3xl">
              We established the Michigan Engineering Consulting Group not as a traditional student organization, but as a boutique agency. Our manifesto is simple: bridge the gap between rigorous engineering principles and high-level strategic consulting. We operate at the intersection of data, design, and business, delivering solutions that are as elegant as they are effective.
            </p>
          </div>
        </div>

        {/* President's Welcome */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32 border-t border-[#333] pt-32">
          <div className="md:col-span-4">
            <h2 className="text-technical text-muted mb-4">[02] PRESIDENT'S WELCOME</h2>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden">
              <img 
                src="https://picsum.photos/seed/president/600/800?grayscale" 
                alt="Annie Callum" 
                className="object-cover w-full h-full grayscale contrast-125 opacity-80 hover:opacity-100 transition-opacity duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <blockquote className="flex flex-col justify-center">
              <p className="text-2xl md:text-3xl font-display italic leading-snug mb-8">
                "Our vision is to cultivate a space where analytical rigor meets creative problem-solving. We don't just analyze data; we craft narratives that drive strategic decisions."
              </p>
              <footer className="text-technical">
                <span className="text-white block mb-1">ANNIE CALLUM</span>
                <span className="text-muted">PRESIDENT, MECG</span>
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Meet the Team */}
        <div className="border-t border-[#333] pt-32">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16">
            <h2 className="text-technical text-muted mb-8 md:mb-0">[03] THE FIRM</h2>
            
            {/* Tab Navigation */}
            <div className="flex gap-8 text-technical">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`uppercase tracking-widest pb-1 border-b transition-colors ${
                    activeTab === tab 
                      ? 'border-white text-white' 
                      : 'border-transparent text-muted hover:text-white hover:border-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Team Directory (List-based) */}
          <div className="flex flex-col border-t border-[#333]">
            {filteredTeam.map((member, i) => (
              <div key={i} className="group flex flex-col md:flex-row items-center justify-between py-6 border-b border-[#333] hover:bg-white/5 transition-colors px-4 cursor-pointer">
                <div className="flex items-center gap-8 w-full md:w-auto mb-4 md:mb-0">
                  <div className="w-16 h-16 overflow-hidden rounded-full shrink-0 border border-transparent group-hover:border-white/30 transition-colors duration-500">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover grayscale contrast-125 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-display tracking-wide">{member.name}</h4>
                </div>
                <div className="text-technical text-muted w-full md:w-auto text-left md:text-right">
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
