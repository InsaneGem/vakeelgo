import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Scale,
  Users,
  Home,
  Briefcase,
  Heart,
  GraduationCap,
  Vote,
  FileText,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Gavel, ArrowLeft
} from 'lucide-react';

const fundamentalRights = [
  {
    icon: Shield,
    title: 'Right to Equality (Articles 14–18)',
    description: 'Every citizen is equal before the law. Discrimination on grounds of religion, race, caste, sex, or place of birth is prohibited. Untouchability is abolished and equality of opportunity in public employment is guaranteed.',
    details: [
      'Equal protection under the law for all persons',
      'No discrimination by the State on grounds of religion, race, caste, sex, or place of birth',
      'Equal opportunity in matters of public employment',
      'Abolition of untouchability and its practice in any form',
      'Abolition of titles except military and academic distinctions'
    ]
  },
  {
    icon: Users,
    title: 'Right to Freedom (Articles 19–22)',
    description: 'Citizens enjoy six fundamental freedoms including freedom of speech and expression, peaceful assembly, forming associations, movement throughout India, residence, and practicing any profession or business.',
    details: [
      'Freedom of speech and expression',
      'Right to assemble peacefully without arms',
      'Right to form associations or unions',
      'Right to move freely throughout India',
      'Right to reside and settle in any part of India',
      'Protection against arrest and detention in certain cases'
    ]
  },
  {
    icon: AlertTriangle,
    title: 'Right Against Exploitation (Articles 23–24)',
    description: 'Human trafficking, forced labour, and child labour in factories are strictly prohibited. No child below 14 years shall be employed in any hazardous occupation.',
    details: [
      'Prohibition of traffic in human beings and forced labour',
      'Prohibition of employment of children below 14 years in hazardous jobs',
      'Protection against bonded labour practices',
      'Right to fair wages and humane working conditions'
    ]
  },
  {
    icon: Heart,
    title: 'Right to Freedom of Religion (Articles 25–28)',
    description: 'Every person has the right to freely profess, practice, and propagate any religion. Religious communities can manage their own affairs and establish institutions.',
    details: [
      'Freedom of conscience and free profession, practice, and propagation of religion',
      'Freedom to manage religious affairs',
      'Freedom from taxation for promotion of any particular religion',
      'Freedom from religious instruction in certain educational institutions'
    ]
  },
  {
    icon: GraduationCap,
    title: 'Cultural & Educational Rights (Articles 29–30)',
    description: 'Minorities have the right to conserve their culture, language, and script. They also have the right to establish and administer educational institutions of their choice.',
    details: [
      'Protection of interests of minorities',
      'Right of minorities to establish and administer educational institutions',
      'Protection of language, script, and culture of minorities',
      'No citizen denied admission to educational institutions on grounds of religion, race, caste, or language'
    ]
  },
  {
    icon: Gavel,
    title: 'Right to Constitutional Remedies (Article 32)',
    description: 'Citizens can approach the Supreme Court or High Courts for enforcement of fundamental rights. Dr. B.R. Ambedkar called this the "heart and soul" of the Constitution.',
    details: [
      'Right to move the Supreme Court for enforcement of fundamental rights',
      'Power of Supreme Court to issue writs including habeas corpus, mandamus, prohibition, certiorari, and quo warranto',
      'Parliament may empower any other court to exercise these powers',
      'Right cannot be suspended except during a national emergency'
    ]
  }
];

const additionalRights = [
  {
    icon: FileText,
    title: 'Right to Information (RTI)',
    description: 'Under the RTI Act 2005, any citizen can request information from public authorities, promoting transparency and accountability in government.',
  },
  {
    icon: Home,
    title: 'Consumer Rights',
    description: 'The Consumer Protection Act 2019 provides rights including right to safety, right to be informed, right to choose, right to be heard, right to seek redressal, and right to consumer education.',
  },
  {
    icon: Briefcase,
    title: 'Labour Rights',
    description: 'Workers are protected under various labour laws ensuring minimum wages, safe working conditions, social security benefits, and protection against unfair dismissal.',
  },
  {
    icon: Vote,
    title: 'Right to Vote',
    description: 'Every citizen of India who is 18 years or above is entitled to vote in elections. The right to vote is a constitutional right under Article 326.',
  },
];

const KnowYourRights = () => {
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
      <header className="relative bg-slate-950 py-16 sm:py-24 overflow-hidden border-b border-slate-900">
        {/* Subtle Ambient Matrix Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800/60 rounded-full px-4 py-1.5 mb-6 shadow-2xl">
            <Scale className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-300 text-[11px] font-mono tracking-wider uppercase">
              Constitutional Framework
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Know Your Rights
          </h1>

          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Understanding your fundamental legal protection parameters is the core baseline for navigating equity. Review the protections absolute and guaranteed to every citizen under the Constitution of India.
          </p>
        </div>
      </header>

      {/* MAIN PREMIUM LIGHT CANVAS AREA */}
      <main className="container mx-auto px-4 max-w-6xl py-12 sm:py-16 space-y-16">

        {/* Fundamental Rights Section */}
        <section className="space-y-10">
          <div className="text-center sm:text-left pl-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Part III Constitutional Charter</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Fundamental Protections
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl font-light">
              Articles 12–35 solidify structured legal protection lanes that remain non-negotiable to all citizens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundamentalRights.map((right, index) => {
              const RightIcon = right.icon;
              return (
                <Card
                  key={index}
                  className="bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3.5 shadow-xs group-hover:bg-slate-950 group-hover:border-slate-950 transition-all duration-300">
                      <RightIcon className="h-5 w-5 text-slate-700 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="font-serif text-base text-slate-900 font-bold tracking-tight group-hover:text-black transition-colors">
                      {right.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between space-y-5">
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
                      {right.description}
                    </p>

                    <div className="border-t border-slate-100 pt-4">
                      <ul className="space-y-2.5">
                        {right.details.map((detail, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-600 group/item">
                            <ChevronRight className="h-3.5 w-3.5 text-slate-300 mt-0.5 shrink-0 group-hover/item:text-slate-900 transition-colors" />
                            <span className="leading-relaxed transition-colors group-hover/item:text-slate-900">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Subsidiary Legal Frameworks Grid */}
        <section className="relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm overflow-hidden">
          {/* Geometric Dot Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-left mb-8 border-b border-slate-100 pb-5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Extended Jurisdictions</span>
              <h2 className="font-serif text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                Statutory &amp; Civic Mandates
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalRights.map((right, idx) => {
                const AddIcon = right.icon;
                return (
                  <div key={idx} className="p-5 bg-slate-50/40 border border-slate-200/60 rounded-xl transition-all duration-300 hover:bg-slate-50 hover:border-slate-300">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center mb-3.5 shadow-xs">
                      <AddIcon className="h-4.5 w-4.5 text-slate-700" />
                    </div>
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 mb-1.5 tracking-tight">
                      {right.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      {right.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HIGH CONTRAST ADVISORY ACTION VECTOR HUB */}
        <section className="bg-slate-950 text-slate-200 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.001]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-900 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5 shadow-inner">
              <BookOpen className="h-5 w-5 text-slate-400" />
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Infringement Remediation
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">
              Seeking Structural Redressal?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
              If you evaluate that your constitutional protections have faced unlawful infringement or state variance, match your profile parameters with certified specialists immediately.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/lawyers')}
                className="bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs px-5 h-11 tracking-wide rounded-xl transition-all shadow-md group"
              >
                Locate Counsel
                <ChevronRight className="h-3.5 w-3.5 ml-1 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/legal-guides')}
                className="border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900 hover:text-white font-medium text-xs px-5 h-11 tracking-wide rounded-xl transition-all"
              >
                Read Legal Guides
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default KnowYourRights;