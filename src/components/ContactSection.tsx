export default function ContactSection() {
  return (
    <section className="w-full bg-bg text-ink py-32 px-6 border-t border-[#333]">
      <div className="max-w-7xl mx-auto">
        
        {/* Contact Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
          <div className="md:col-span-4">
            <h2 className="text-technical text-muted mb-4">[07] ENGAGEMENT</h2>
            <h3 className="text-4xl md:text-5xl font-display leading-tight mb-8">
              INITIATE<br />CONTACT.
            </h3>
            <p className="text-muted font-sans font-light max-w-sm">
              Whether you are a prospective client or a student looking to join the firm, we welcome your inquiry.
            </p>
          </div>
          <div className="md:col-span-8">
            <form className="flex flex-col gap-12">
              <div className="relative">
                <input 
                  type="text" 
                  id="name" 
                  placeholder="First & Last Name" 
                  className="w-full bg-transparent border-b border-[#333] py-4 text-xl font-sans font-light text-white placeholder:text-muted/50 focus:outline-none focus:border-white focus:border-b-2 transition-all peer"
                  required
                />
              </div>
              <div className="relative">
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Email Address" 
                  className="w-full bg-transparent border-b border-[#333] py-4 text-xl font-sans font-light text-white placeholder:text-muted/50 focus:outline-none focus:border-white focus:border-b-2 transition-all peer"
                  required
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  id="subject" 
                  placeholder="Subject" 
                  className="w-full bg-transparent border-b border-[#333] py-4 text-xl font-sans font-light text-white placeholder:text-muted/50 focus:outline-none focus:border-white focus:border-b-2 transition-all peer"
                  required
                />
              </div>
              <div className="relative">
                <textarea 
                  id="message" 
                  placeholder="Message" 
                  rows={4}
                  className="w-full bg-transparent border-b border-[#333] py-4 text-xl font-sans font-light text-white placeholder:text-muted/50 focus:outline-none focus:border-white focus:border-b-2 transition-all resize-none peer"
                  required
                />
              </div>
              <div className="flex justify-end mt-8">
                <button 
                  type="submit" 
                  className="text-technical text-white border border-white px-8 py-4 hover:bg-white hover:text-black transition-colors uppercase tracking-widest"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Firm Details (Brutalist Footer) */}
        <footer className="border-t border-[#333] pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="flex flex-col gap-4">
            <h4 className="text-technical text-muted mb-4">MECG // MICHIGAN ENGINEERING CONSULTING GROUP</h4>
            <div className="text-sm font-sans font-light text-muted">
              1221 Beal Ave<br />
              Ann Arbor, MI 48109<br />
              United States
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 md:gap-24">
            <div className="flex flex-col gap-4">
              <h5 className="text-technical text-muted mb-2">INQUIRIES</h5>
              <a href="mailto:mecg-board@umich.edu" className="text-sm font-sans font-light text-white hover:text-muted transition-colors">
                mecg-board@umich.edu
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="text-technical text-muted mb-2">SOCIAL</h5>
              <a href="https://instagram.com/mecgmichigan" target="_blank" rel="noreferrer" className="text-sm font-sans font-light text-white hover:text-muted transition-colors">
                Instagram (@mecgmichigan)
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-sm font-sans font-light text-white hover:text-muted transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
          
          <div className="text-technical text-muted text-right mt-12 md:mt-0">
            © 2026 MECG.<br />ALL RIGHTS RESERVED.
          </div>
        </footer>

      </div>
    </section>
  );
}
