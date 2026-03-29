import { useState } from 'react';

const timelineEvents = [
  { date: 'SEP 05', name: 'Mass Meeting I', location: 'EECS 1311, 7:00 PM' },
  { date: 'SEP 07', name: 'Mass Meeting II', location: 'DOW 1013, 7:00 PM' },
  { date: 'SEP 09', name: 'Coffee Chats', location: 'Duderstadt Center, 1:00 PM' },
  { date: 'SEP 12', name: 'Application Deadline', location: 'Online, 11:59 PM' },
  { date: 'SEP 15', name: 'First Round Interviews', location: 'Invite Only' },
  { date: 'SEP 18', name: 'Final Round Interviews', location: 'Invite Only' },
];

const faqs = [
  { q: 'What majors do you accept?', a: 'We accept all majors. While our roots are in engineering, we value diverse perspectives and analytical minds from any discipline.' },
  { q: 'What is the time commitment?', a: 'Expect 5-8 hours per week, including general body meetings, project work, and professional development workshops.' },
  { q: 'Do I need prior consulting experience?', a: 'No prior experience is required. We provide comprehensive training during your first semester as an Analyst.' },
  { q: 'How are projects sourced?', a: 'We partner with a range of clients, from local startups to Fortune 500 companies, focusing on data-driven strategy and operational improvements.' },
];

export default function RecruitmentSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="w-full bg-bg text-ink py-32 px-6 border-t border-[#333]">
      <div className="max-w-7xl mx-auto">
        
        {/* The Pitch */}
        <div className="mb-32">
          <h2 className="text-technical text-muted mb-4">[04] JOIN THE FIRM</h2>
          <h3 className="text-5xl md:text-7xl font-display mb-8 leading-none">
            WE ARE LOOKING FOR<br />
            EXCEPTIONAL TALENT.
          </h3>
          <p className="text-lg font-sans font-light text-muted max-w-2xl">
            Our recruitment process is rigorous, designed to identify individuals who possess both analytical horsepower and creative vision. We seek those who are ready to shape the future of business and entertainment.
          </p>
        </div>

        {/* Recruitment Timeline */}
        <div className="mb-32 border-t border-[#333] pt-32">
          <h2 className="text-technical text-muted mb-16">[05] RECRUITMENT TIMELINE</h2>
          
          <div className="flex flex-col border-t border-[#333]">
            {timelineEvents.map((event, i) => (
              <div key={i} className="flex flex-col md:flex-row justify-between items-baseline py-6 border-b border-[#333] hover:bg-white/5 transition-colors group px-4">
                <div className="text-technical text-muted w-32 shrink-0 mb-2 md:mb-0 group-hover:text-white transition-colors">
                  {event.date}
                </div>
                <div className="flex-grow text-xl md:text-2xl font-display tracking-wide mb-2 md:mb-0">
                  {event.name}
                </div>
                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-technical text-muted text-right">
                    {event.location}
                  </span>
                  <button className="text-technical text-white hover:text-muted transition-colors whitespace-nowrap">
                    [+] Calendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="border-t border-[#333] pt-32">
          <h2 className="text-technical text-muted mb-16">[06] FREQUENTLY ASKED QUESTIONS</h2>
          
          <div className="flex flex-col border-t border-[#333]">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-[#333]">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center py-8 px-4 hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xl md:text-2xl font-display tracking-wide">{faq.q}</span>
                  <span className="text-technical text-muted">{openFaq === i ? '[-]' : '[+]'}</span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out px-4 ${
                    openFaq === i ? 'max-h-40 pb-8 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-muted font-sans font-light leading-relaxed max-w-3xl">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
