import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Users,
  Scale,
  Shield,
  Phone,
  ArrowRight,
  BookOpen,
  HandHeart,
  Gavel,
  Globe,
  ExternalLink,
  ChevronRight, ArrowLeft
} from 'lucide-react';

const eligibilityCriteria = [
  'Members of Scheduled Castes or Scheduled Tribes',
  'Victims of trafficking or bonded labour',
  'Women and children',
  'Persons with disabilities (mental or physical)',
  'Persons in custody (including protective custody)',
  'Industrial workmen',
  'Victims of mass disasters, ethnic violence, caste atrocity, flood, drought, earthquake, or industrial disaster',
  'Persons whose annual income does not exceed ₹3,00,000 (Supreme Court) or ₹1,00,000 (other courts, varies by state)',
];

const legalAidBodies = [
  {
    icon: Gavel,
    title: 'National Legal Services Authority (NALSA)',
    description: 'The apex body constituted under the Legal Services Authorities Act, 1987 to provide free legal services to eligible persons and organize Lok Adalats for amicable settlement of disputes.',
    website: 'https://nalsa.gov.in',
    services: ['Free legal representation', 'Lok Adalats', 'Legal awareness camps', 'Victim compensation schemes']
  },
  {
    icon: Scale,
    title: 'State Legal Services Authorities (SLSA)',
    description: 'Each state has its own Legal Services Authority that works under NALSA to provide free legal aid at the state level. They coordinate with District Legal Services Authorities.',
    services: ['State-level free legal aid', 'Permanent Lok Adalats', 'Para-legal volunteer programs', 'Legal literacy missions']
  },
  {
    icon: Users,
    title: 'District Legal Services Authorities (DLSA)',
    description: 'Established in every district, DLSAs are the most accessible point for free legal aid. They operate front offices in district courts where any eligible person can walk in and seek help.',
    services: ['Front office legal assistance', 'District Lok Adalats', 'Legal aid clinics', 'ADR (Alternative Dispute Resolution) centres']
  },
  {
    icon: BookOpen,
    title: 'Legal Aid Clinics in Law Schools',
    description: 'Many law universities run free legal aid clinics where law students, supervised by faculty, provide basic legal advice and assistance to the community.',
    services: ['Free legal consultations', 'Drafting of legal documents', 'Legal awareness workshops', 'Community outreach programs']
  },
];

const proBonoInfo = [
  {
    icon: HandHeart,
    title: 'What is Pro Bono?',
    description: 'Pro bono legal work refers to professional legal services provided voluntarily and without charge. Many advocates in India dedicate a portion of their practice to pro bono work for the underprivileged.'
  },
  {
    icon: Globe,
    title: 'Bar Council Guidelines',
    description: 'The Bar Council of India encourages advocates to undertake pro bono work. Several High Courts and Bar Associations maintain panels of advocates willing to appear pro bono in deserving cases.'
  },
  {
    icon: Shield,
    title: 'VakeelGo Pro Bono Initiative',
    description: 'On VakeelGo, select lawyers offer free initial consultations for eligible clients. Look for the "Pro Bono Available" badge on lawyer profiles to find lawyers offering free legal assistance.'
  },
];

const helplineNumbers = [
  { name: 'NALSA Helpline', number: '15100', description: 'National toll-free legal aid helpline' },
  { name: 'Women Helpline', number: '181', description: 'For women in distress' },
  { name: 'Child Helpline', number: '1098', description: 'For children in need of care and protection' },
  { name: 'Senior Citizen Helpline', number: '14567', description: 'Elder abuse and assistance' },
  { name: 'Cyber Crime Helpline', number: '1930', description: 'Report cyber crimes and online fraud' },
  { name: 'Consumer Helpline', number: '1915', description: 'Consumer grievance redressal' },
];

const LegalAid = () => {
  const navigate = useNavigate();

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
      {/* EXOTIC PREMIUM DARK HEADER SECTION */}
      <header className="relative bg-slate-950 py-16 sm:py-20 overflow-hidden border-b border-slate-900">
        {/* Ambient Lights & Textures */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900/80 border border-slate-800 rounded-2xl mb-5 text-slate-400 shadow-2xl">
            <Heart className="h-6 w-6 text-slate-300" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Legal Aid &amp; Pro Bono
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Free and reduced-cost legal services are a constitutional right under Article 39A. Learn about public and platform frameworks established to guarantee equity for all.
          </p>
          <div className="inline-block mt-5 px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[11px] font-mono tracking-wider uppercase">
            Statutory Protocol Section
          </div>
        </div>
      </header>

      {/* MAIN PREMIUM LIGHT CANVAS AREA */}
      <main className="container mx-auto px-4 max-w-5xl py-12 sm:py-16 space-y-16">

        {/* Eligibility Canvas Card */}
        <section className="relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-all duration-500 ease-out overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col mb-8 border-b border-slate-100 pb-5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">Section 12 Classification Matrix</span>
              <h2 className="font-serif text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                Who Is Eligible for Free Legal Aid?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Under Section 12 of the Legal Services Authorities Act, 1987, the following classifications of citizens are legally entitled to free legal remedies:
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibilityCriteria.map((criteria, idx) => (
                <li key={idx} className="flex items-start gap-3 group/item">
                  <ArrowRight className="h-4 w-4 text-slate-400 mt-0.5 shrink-0 group-hover/item:text-slate-900 transition-colors" />
                  <span className="text-xs sm:text-sm text-slate-600 leading-relaxed transition-colors group-hover/item:text-slate-900">
                    {criteria}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Institutional Frameworks System */}
        <section className="space-y-6">
          <div className="text-left mb-6 pl-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Regulatory Framework</span>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Constitutional Institutional Bodies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalAidBodies.map((body, index) => {
              const BodyIcon = body.icon;
              return (
                <Card key={index} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                  <CardHeader className="p-6 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3.5 shadow-xs">
                      <BodyIcon className="h-5 w-5 text-slate-700" />
                    </div>
                    <CardTitle className="font-serif text-base text-slate-900 font-bold tracking-tight">
                      {body.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between space-y-5">
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
                      {body.description}
                    </p>

                    <div className="border-t border-slate-50 pt-4">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Assistance Modules
                      </h4>
                      <ul className="space-y-1.5">
                        {body.services.map((service, sIdx) => (
                          <li key={sIdx} className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {body.website && (
                      <div className="pt-2 border-t border-slate-100">
                        <Button variant="outline" size="sm" className="border-slate-200 bg-slate-50/50 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs px-3 h-8 rounded-lg group" asChild>
                          <a href={body.website} target="_blank" rel="noopener noreferrer">
                            Access Portal
                            <ExternalLink className="h-3 w-3 ml-1.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Pro Bono Canvas Panel */}
        <section className="relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-all duration-500 ease-out overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-left mb-8 border-b border-slate-100 pb-5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Voluntary Network</span>
              <h2 className="font-serif text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                Voluntary Pro Bono Practices
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {proBonoInfo.map((info, idx) => {
                const InfoIcon = info.icon;
                return (
                  <div key={idx} className="p-5 bg-slate-50/50 border border-slate-200/60 rounded-xl transition-all duration-300 hover:bg-slate-50">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center mb-3.5 shadow-xs">
                      <InfoIcon className="h-4.5 w-4.5 text-slate-700" />
                    </div>
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 mb-2 tracking-tight">
                      {info.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      {info.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Helpline Matrix Cluster */}
        <section className="space-y-6">
          <div className="text-center sm:text-left pl-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Emergency Operations</span>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Toll-Free Legal Assistance Helplines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {helplineNumbers.map((helpline, index) => (
              <Card key={index} className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="h-4 w-4 text-slate-600" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-medium text-xs text-slate-400 truncate">
                    {helpline.name}
                  </h3>
                  <p className="text-slate-950 font-mono font-bold text-base my-0.5 tracking-wider">
                    {helpline.number}
                  </p>
                  <p className="text-slate-500 text-[10px] leading-tight font-light truncate">
                    {helpline.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* INTERACTION CONVERSION CALLOUT BOX */}
        <section className="bg-slate-950 text-slate-200 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.002]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-900 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Equity Access Pipeline
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">
              Connect with Qualified Counsel
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
              Whether matching protocols qualify you for state-sponsored statutory assistance or you require flexible, tiered private billing options, VakeelGo bridges connection points seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/lawyers')}
                className="bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs px-5 py-5 tracking-wide rounded-xl transition-all shadow-md group"
              >
                Browse Lawyers
                <ChevronRight className="h-3.5 w-3.5 ml-1 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
                className="border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900 hover:text-white font-medium text-xs px-5 py-5 tracking-wide rounded-xl transition-all"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default LegalAid;