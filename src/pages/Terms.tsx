import { useState, useEffect } from 'react';
import {
  FileText, Scale, AlertTriangle, CheckCircle,
  XCircle, Gavel, Wallet, Clock, ShieldCheck, ChevronDown, ArrowLeft
} from 'lucide-react';

const Terms = () => {
  const lastUpdated = 'May 29, 2026';
  const [activeSection, setActiveSection] = useState('acceptance');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'acceptance', title: '1. Acceptance', icon: Scale },
    { id: 'services', title: '2. Consultations', icon: Clock },
    { id: 'accounts', title: '3. Accounts', icon: CheckCircle },
    { id: 'verification', title: '4. Verification', icon: Gavel },
    { id: 'payments', title: '5. Billing & Rates', icon: Wallet },
    { id: 'conduct', title: '6. Conduct Rules', icon: XCircle },
    { id: 'liability', title: '7. Liability', icon: AlertTriangle },
    { id: 'disputes', title: '8. Jurisdiction', icon: ShieldCheck },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPosition && el.offsetTop + el.offsetHeight > scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveSection(id);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="bg-slate-50/60 min-h-screen text-slate-600 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
      <button
        onClick={() => navigate(-1)}
        className="hidden md:flex absolute top-20 left-8 z-50 items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>
      {/* Exotic Premium Dark Header Section */}
      <header className="relative bg-slate-950 py-16 sm:py-20 overflow-hidden border-b border-slate-900">
        {/* Subtle Luxury Textures & Ambient Lights */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900/80 border border-slate-800 rounded-2xl mb-5 text-slate-400 shadow-2xl">
            <Scale className="h-6 w-6 text-slate-300" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Please review these binding rules before using LegalMate. By executing live sessions, you accept these platform parameters.
          </p>
          <div className="inline-block mt-5 px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[11px] font-mono tracking-wider uppercase">
            Updated: {lastUpdated}
          </div>
        </div>
      </header>

      {/* Sticky Mobile Menu Bar (Light Mode Style Below Header) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs transition-all"
        >
          <span className="flex items-center gap-2">
            <span className="text-slate-400 font-normal">Navigation:</span>
            {sections.find(s => s.id === activeSection)?.title}
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMobileMenuOpen && (
          <div className="absolute left-4 right-4 mt-2 p-1.5 bg-white border border-slate-200/90 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors ${isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Premium White Content Canvas Container */}
      <main className="container mx-auto px-4 max-w-6xl py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Side Bar Controls */}
          <nav className="lg:col-span-4 sticky top-8 bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs hidden lg:block backdrop-blur-xs">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 px-2.5">
              Document Map
            </p>
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs font-medium transition-all duration-300 ${isActive
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 translate-x-1'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Premium White Content Canvas Area */}
          <div className="group lg:col-span-8 relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm hover:shadow-md transition-all duration-500 ease-out overflow-hidden">

            {/* Subtle light geometric grid pattern overlay matching design */}
            <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

            <div className="relative z-10 space-y-8">

              {/* 1. Acceptance of Terms */}
              <section id="acceptance" className="scroll-mt-28 border-b border-slate-100 pb-7 transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Scale className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">1. Acceptance of Terms</h2>
                </div>
                <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
                  <p>By accessing, setting up an profile, or utilizing LegalMate (&quot;the Platform&quot;), you agree to be governed by these Terms of Service, along with all applicable state and federal bar parameters.</p>
                  <p>If you disagree with any segment, rule, or mechanism, you are entirely prohibited from entering or triggering interactions across our system interfaces.</p>
                </div>
              </section>

              {/* 2. Per-Minute Digital Consultations */}
              <section id="services" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">2. Per-Minute Digital Consultations</h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-4">
                  LegalMate operates strictly as an intermediary technology framework linking verified legal independent practitioners with active consumers. We provide low-latency channels specifically measured on a granular <span className="text-slate-950 font-semibold underline underline-offset-2 decoration-slate-200">pay-per-minute</span> architecture.
                </p>
                <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3.5 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 shadow-inner">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full" /> Per-Minute Chat Channels</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full" /> Secure Audio Streams</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full" /> Encrypted Video Rooms</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full" /> Vault Document Locker</div>
                </div>
                <div className="border-l-2 border-slate-900 bg-slate-50 rounded-r-xl p-3.5">
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">Notice:</strong> LegalMate does not distribute legal advice. All actions, answers, opinions, and legal filings made remain the direct responsibility of the independent counsel.
                  </p>
                </div>
              </section>

              {/* 3. User Profiles & Accounts */}
              <section id="accounts" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">3. User Profiles &amp; Accounts</h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-4">To connect to our live communication lines, clients and registered bar professionals must set up an active legal vault identity profile subject to validation.</p>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex gap-2.5 items-start"><span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">3.1</span><p className="leading-relaxed">You must be at least 18 years of age or possess valid domestic legal authority.</p></div>
                  <div className="flex gap-2.5 items-start"><span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">3.2</span><p className="leading-relaxed">You agree to supply authentic KYC data to ensure payment clearing and profile transparency.</p></div>
                </div>
              </section>

              {/* 4. Bar Council Verification */}
              <section id="verification" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Gavel className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">4. Bar Council Verification</h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-3.5">Practitioners must complete our onboarding vetting funnel prior to listing rates:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-xl transition-all duration-300 hover:bg-slate-50">
                    <span className="font-semibold text-slate-900 block mb-1">Licensure Auditing</span>
                    <span className="text-slate-500 text-[11px] leading-relaxed block">Manual review of active state bar council records and clean history arrays.</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-xl transition-all duration-300 hover:bg-slate-50">
                    <span className="font-semibold text-slate-900 block mb-1">Identity Proofing</span>
                    <span className="text-slate-500 text-[11px] leading-relaxed block">Government biometric verification coupled with address mapping pipelines.</span>
                  </div>
                </div>
              </section>

              {/* 5. Billing & Pay-As-You-Go Framework */}
              <section id="payments" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">5. Billing Framework</h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-3.5">Payments are processed entirely via secure integrated card networks under these logics:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                    <span className="font-semibold text-slate-900 block mb-1">Rate Setting:</span>
                    <span className="text-slate-500 text-[11px] leading-relaxed block">Attorneys determine their own baseline micro-billing rules per minute, previewed clearly before line connections.</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                    <span className="font-semibold text-slate-900 block mb-1">Pre-Authorizations:</span>
                    <span className="text-slate-500 text-[11px] leading-relaxed block">A temporal authorization balance hold is reserved on your card node to cover the estimated connection room length safely.</span>
                  </div>
                </div>
              </section>

              {/* 6. Prohibited Operational Conduct */}
              <section id="conduct" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">6. Prohibited Conduct</h2>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 pl-4 list-disc marker:text-slate-300">
                  <li className="leading-relaxed">Recording streams, ripping digital metadata, or taking device captures without express clearance tokens from endpoints.</li>
                  <li className="leading-relaxed">Attempting transaction bypass routes or handling fee operations outside the designated gateway framework.</li>
                </ul>
              </section>

              {/* 7. Limitation of Liability */}
              <section id="liability" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">7. Limitation of Liability</h2>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl">
                  LegalMate carries zero direct liability for missing data arrays, server dropouts, malpractice committed by independent counselors, dropped RTC lines, or financial damages resulting from direct contract interpretations.
                </p>
              </section>

              {/* 8. Governing Law & Operational Disputes */}
              <section id="disputes" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">8. Jurisdiction &amp; Disputes</h2>
                </div>
                <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 mt-4 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.005]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 rounded-full blur-2xl opacity-40" />
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Compliance Directory</h4>
                  <p className="text-sm font-semibold text-white">LegalMate Technologies Corp.</p>
                  <div className="text-xs text-slate-300 mt-2 space-y-1">
                    <p>Contact Email: <span className="text-white underline underline-offset-4 decoration-slate-800 font-medium">legal@legalmate.com</span></p>
                    <p className="text-slate-500 text-[11px] pt-2.5 mt-2.5 border-t border-slate-900">Corporate Address: 123 Legal Avenue, New York, NY 10001</p>
                  </div>
                </div>
              </section>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;