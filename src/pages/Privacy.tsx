import { useState, useEffect, ComponentType } from 'react';
import {
  Shield, Lock, Eye, UserCheck, Database, Bell,
  ChevronDown, Key, Scale, ShieldAlert, FileCheck2, Landmark, ArrowLeft
} from 'lucide-react';

interface PolicySection {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
}

const Privacy = () => {
  const lastUpdated = 'February 7, 2026';
  const [activeSection, setActiveSection] = useState<string>('collection');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const sections: PolicySection[] = [
    { id: 'collection', title: '1. Data Collection', icon: Database },
    { id: 'usage', title: '2. Processing Logic', icon: Eye },
    { id: 'privilege', title: '3. Legal Privilege', icon: Scale },
    { id: 'security', title: '4. Cryptographic Security', icon: Lock },
    { id: 'rights', title: '5. Regulatory Rights', icon: UserCheck },
    { id: 'updates', title: '6. Policy Revisions', icon: Bell },
    { id: 'contact', title: '7. Data Protection Officer', icon: Landmark },
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
    <div className="bg-slate-50/60 min-h-screen text-slate-700 font-sans antialiased selection:bg-slate-900 selection:text-white">
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
        {/* Luxury Textures & Ambient Lights */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl mb-5 text-slate-400 shadow-2xl">
            <Shield className="h-6 w-6 text-slate-200 animate-pulse" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Your trust is our highest priority. Learn how VakeelGo protects your confidential personal records, session meta-data, and enterprise communications using globally recognized compliance structures.
          </p>
          <div className="inline-block mt-5 px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[11px] font-mono tracking-wider uppercase">
            Last Updated: {lastUpdated}
          </div>
        </div>
      </header>

      {/* Privacy Highlights Segment */}
      <section className="bg-white border-b border-slate-200/60 py-10 relative z-20 shadow-xs">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md">
              <Lock className="h-7 w-7 text-slate-950 mb-3" />
              <h3 className="font-serif font-bold text-slate-900 text-sm mb-1.5">Zero-Knowledge Architecture</h3>
              <p className="text-slate-600 text-xs leading-relaxed max-w-xs">
                RTC streaming lines utilize point-to-point cryptographic keys. We hold zero decryption capability over your live rooms.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md">
              <Eye className="h-7 w-7 text-slate-950 mb-3" />
              <h3 className="font-serif font-bold text-slate-900 text-sm mb-1.5">No Commercial Monetization</h3>
              <p className="text-slate-600 text-xs leading-relaxed max-w-xs">
                VakeelGo has never sold or rented user behavior graphs, profile definitions, or query variables to brokerage pipelines.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md">
              <UserCheck className="h-7 w-7 text-slate-950 mb-3" />
              <h3 className="font-serif font-bold text-slate-900 text-sm mb-1.5">Granular Control Panel</h3>
              <p className="text-slate-600 text-xs leading-relaxed max-w-xs">
                Instantly trigger complete portfolio purges, download portability schema, or suspend third-party telemetry flags.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Navigation Selector */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs transition-all"
        >
          <span className="flex items-center gap-2">
            <span className="text-slate-400 font-normal">Section:</span>
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

      {/* Main Layout Grid */}
      <main className="container mx-auto px-4 max-w-6xl py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Desktop Left-Hand Map Navigation */}
          <nav className="lg:col-span-4 sticky top-8 bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs hidden lg:block">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 px-2.5">
              Policy Architecture
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

          {/* Premium White Content Canvas Card */}
          <div className="group lg:col-span-8 relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm hover:shadow-md transition-all duration-500 ease-out overflow-hidden">
            {/* Geometric Micro-dot Grid Texture Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* 1. Information We Collect */}
              <section id="collection" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Database className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    1. Information We Collect
                  </h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-4">
                  In compliance with global data principles, we categorize points of verification and application interactions into specific data tracks depending on user type (Clients vs. Legal Professionals):
                </p>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex gap-2.5 items-start">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded-md mt-0.5 whitespace-nowrap">Account Setup</span>
                    <p className="leading-relaxed text-slate-600">Legal name, structural email address protocols, verified active phone paths, and cryptographically hashed credential parameters.</p>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded-md mt-0.5 whitespace-nowrap">Bar Dossiers</span>
                    <p className="leading-relaxed text-slate-600">State or Federal Bar Association license IDs, historical verification clearances, corporate practice structures, and professional qualifications.</p>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded-md mt-0.5 whitespace-nowrap">Payment Nodes</span>
                    <p className="leading-relaxed text-slate-600">PCI-DSS compliant tokens processed by payment partners (Stripe / Adyen). We do not store raw credit card numbers or banking hashes directly.</p>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded-md mt-0.5 whitespace-nowrap">Metadata Logs</span>
                    <p className="leading-relaxed text-slate-600">IP topology, transaction metrics, connection intervals, dynamic timestamps, and usage tracking logs.</p>
                  </li>
                </ul>
              </section>

              {/* 2. How We Use Your Information */}
              <section id="usage" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Eye className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    2. How We Use Your Information
                  </h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-4">
                  We process data points strictly under the legal grounds of **Contractual Necessity** and **Legitimate Operational Interests** as outlined by standard global frameworks:
                </p>
                <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-4 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full flex-shrink-0" /> Provision of live real-time rooms</div>
                  <div className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full flex-shrink-0" /> Smart matches across bar segments</div>
                  <div className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full flex-shrink-0" /> Dynamic anti-fraud pattern auditing</div>
                  <div className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 bg-slate-900 rounded-full flex-shrink-0" /> Technical telemetry fault monitoring</div>
                </div>
              </section>

              {/* 3. Attorney-Client Privilege */}
              <section id="privilege" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Key className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    3. Attorney-Client Privilege
                  </h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-3">
                  All communication tracks executing through our real-time video, audio, or text streams are structurally isolated to satisfy rigorous **Attorney-Client Privilege** parameters.
                </p>
                <div className="border-l-2 border-slate-950 bg-slate-50 border-y border-r border-slate-200/50 rounded-r-xl p-4 shadow-xs">
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-950 block mb-0.5">Zero Interception Guarantee:</strong> Consultation recordings or transcripts are strictly encrypted at the source layer. VakeelGo systems cannot access, monitor, index, or parse the legal substance of your counsel rooms.
                  </p>
                </div>
              </section>

              {/* 4. Data Security */}
              <section id="security" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    4. Data Security &amp; Compliance Standards
                  </h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-3.5">
                  Our network framework is engineered to align with premier institutional standards (**SOC 2 Type II Audited Architecture**):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                    <span className="font-semibold text-slate-950 block mb-1">AES-GCM-256 Encryption</span>
                    <span className="text-slate-600 text-[11px] leading-relaxed block">Applied to all static relational data tables, legal vault file uploads, and session attachments.</span>
                  </div>
                  <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                    <span className="font-semibold text-slate-950 block mb-1">Continuous Pentesting</span>
                    <span className="text-slate-600 text-[11px] leading-relaxed block">External threat monitoring teams run automatic hourly exploit discovery tests on routing points.</span>
                  </div>
                </div>
              </section>

              {/* 5. Regulatory Rights */}
              <section id="rights" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    5. Your Rights (GDPR / CCPA / CPRA)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-3">
                  Regardless of your domestic geolocation, VakeelGo grants all registered users standard sovereign control over their records:
                </p>
                <ul className="space-y-2 text-xs text-slate-600 pl-4 list-disc marker:text-slate-400">
                  <li className="leading-relaxed"><strong className="text-slate-900">Right to Erasure (Forgotten):</strong> Submit a system request to permanently scrub relational references within 30 processing days.</li>
                  <li className="leading-relaxed"><strong className="text-slate-900">Data Portability Array:</strong> Request structural exports of payment milestones, timing tokens, and consultation metrics in universal JSON format.</li>
                </ul>
              </section>

              {/* 6. Updates to This Policy */}
              <section id="updates" className="scroll-mt-28 border-b border-slate-100 pb-7">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Bell className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    6. Updates to This Policy
                  </h2>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                  We modify this data governance map occasionally to keep pace with evolving legal frameworks. For material structural updates, we push dashboard alerts directly to active user interfaces and update the document stamp above.
                </p>
              </section>

              {/* 7. Contact Data Protection Officer */}
              <section id="contact" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-900 border border-slate-100">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    7. Data Protection Officer (DPO)
                  </h2>
                </div>
                <div className="bg-slate-950 text-slate-200 rounded-2xl p-6 mt-4 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.005]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 rounded-full blur-2xl opacity-40" />
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Privacy Taskforce</h4>
                  <p className="text-sm font-semibold text-white">VakeelGo Technologies Corp.</p>
                  <div className="text-xs text-slate-300 mt-3 space-y-1">
                    <p>Inquiries: <span className="text-white underline underline-offset-4 decoration-slate-800 font-medium">privacy@VakeelGo.com</span></p>
                    <p className="text-slate-500 text-[11px] pt-3 mt-3 border-t border-slate-900">Corporate Address: 123 Legal Avenue, Suite 500, New York, NY 10001</p>
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

export default Privacy;