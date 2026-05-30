import { useState, useMemo, ComponentType, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Home,
  Briefcase,
  Car,
  Heart,
  Building,
  Scale,
  BookOpen,
  ClipboardList,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Search,
  Filter, ArrowLeft
} from 'lucide-react';

interface LegalGuideItem {
  icon: ComponentType<{ className?: string }>;
  title: string;
  category: string;
  steps: string[];
  important: string;
}

interface QuickLinkItem {
  title: string;
  description: string;
  url: string;
}

const legalGuides: LegalGuideItem[] = [
  {
    icon: ClipboardList,
    title: 'Filing an FIR (First Information Report)',
    category: 'Criminal Law',
    steps: [
      'Visit the nearest police station with jurisdiction over the area where the offence occurred.',
      'Provide a written or oral complaint describing the incident in detail.',
      'The officer in charge is legally bound to register an FIR for cognizable offences under Section 154 of CrPC.',
      'If the police refuse, you can send a written complaint to the Superintendent of Police or file a complaint before the Magistrate under Section 156(3) CrPC.',
      'Obtain a free copy of the FIR as per your right under law.',
      'Zero FIR can be filed at any police station regardless of jurisdiction.'
    ],
    important: 'Under Section 154 CrPC, the police cannot refuse to register an FIR for a cognizable offence. If refused, you can approach the Superintendent of Police or a Judicial Magistrate.'
  },
  {
    icon: Home,
    title: 'Property Registration Process',
    category: 'Property Law',
    steps: [
      'Verify the property title by conducting a title search at the Sub-Registrar office for at least 30 years.',
      'Obtain an Encumbrance Certificate (EC) to ensure the property is free from legal dues or mortgages.',
      'Draft a Sale Deed on stamp paper of the appropriate value as per state stamp duty rates.',
      'Both buyer and seller must visit the Sub-Registrar office with two witnesses for document registration.',
      'Pay the applicable stamp duty (typically 5–7% of property value) and registration fee (1%).',
      'After registration, apply for mutation of property records at the local municipal office.',
      'Obtain a certified copy of the registered Sale Deed for your records.'
    ],
    important: 'Always verify the RERA registration for under-construction properties. Check for any pending litigation using the e-Courts portal.'
  },
  {
    icon: Heart,
    title: 'Filing for Divorce',
    category: 'Family Law',
    steps: [
      'Determine the type of divorce: Mutual Consent (Section 13B, Hindu Marriage Act) or Contested Divorce.',
      'For Mutual Consent: Both spouses jointly file a petition before the Family Court with required documents.',
      'A mandatory cooling-off period of 6 months (waivable by court) is required after the first motion.',
      'After the cooling period, file the second motion to confirm the intention to divorce.',
      'For Contested Divorce: File a petition on specified grounds such as cruelty, adultery, desertion (2+ years), mental disorder, or conversion.',
      'The court may refer the case for mediation before proceeding to trial.',
      'Gather evidence, witness testimonies, and relevant documents to support your case.'
    ],
    important: 'Mediation is encouraged by courts before proceeding with contested divorces. Free legal aid is available for those who cannot afford a lawyer.'
  },
  {
    icon: Briefcase,
    title: 'Filing a Labour Complaint',
    category: 'Employment Law',
    steps: [
      'Document the violation: unpaid wages, wrongful termination, harassment, or unsafe conditions.',
      "File a complaint with the Labour Commissioner's office in your district.",
      'For wage disputes, approach the Authority under the Payment of Wages Act within 12 months.',
      'For wrongful termination, file a case before the Industrial Tribunal or Labour Court.',
      'Sexual harassment complaints should be filed with the Internal Complaints Committee (ICC) or Local Complaints Committee (LCC).',
      'Under the Industrial Disputes Act, a conciliation proceeding is initiated before the matter goes to court.',
      'Keep copies of employment contracts, salary slips, and all correspondence as evidence.'
    ],
    important: 'Employees in establishments with 10+ workers are protected under the Sexual Harassment of Women at Workplace Act, 2013.'
  },
  {
    icon: Car,
    title: 'Motor Accident Claim',
    category: 'Insurance Law',
    steps: [
      'Report the accident to the nearest police station and obtain an FIR copy.',
      'Get a medical examination report documenting all injuries sustained.',
      'File a claim petition before the Motor Accident Claims Tribunal (MACT) in the district where the accident occurred.',
      'The claim can be filed by the victim, legal heirs (in case of death), or an authorized agent.',
      'Submit supporting documents: FIR, medical bills, income proof, vehicle registration, insurance details.',
      'The Tribunal determines compensation based on the multiplier method considering age, income, and disability.',
      'Claims under Section 166 MV Act have no cap on compensation amount.'
    ],
    important: 'There is no limitation period for filing a motor accident claim, but it is advisable to file within 6 months of the accident.'
  },
  {
    icon: Building,
    title: 'Consumer Complaint Filing',
    category: 'Consumer Law',
    steps: [
      'Send a legal notice to the opposite party detailing the deficiency in service or defect in goods.',
      'If unresolved, file a complaint on the e-Daakhil portal (edaakhil.nic.in) or directly at the Consumer Forum.',
      'District Forum: Claims up to ₹1 crore. State Commission: ₹1 crore to ₹10 crore. National Commission: Above ₹10 crore.',
      'Attach supporting documents: bills, receipts, warranty cards, correspondence, photographs.',
      'No court fee is required for claims up to ₹5 lakhs. Nominal fees for higher amounts.',
      'The complaint must be filed within 2 years from the date of the cause of action.',
      'Hearings are conducted, and the Forum can order compensation, replacement, refund, or punitive damages.'
    ],
    important: 'E-filing is available through the e-Daakhil portal. The Consumer Protection Act, 2019 also covers e-commerce transactions and unfair trade practices.'
  },
];

const quickLinks: QuickLinkItem[] = [
  { title: 'e-Courts Services', description: 'Check case status online', url: 'https://ecourts.gov.in' },
  { title: 'e-Daakhil Portal', description: 'File consumer complaints online', url: 'https://edaakhil.nic.in' },
  { title: 'NALSA Services', description: 'Free legal aid services', url: 'https://nalsa.gov.in' },
  { title: 'India Code Engine', description: 'Access all Indian laws', url: 'https://www.indiacode.nic.in' },
];

const LegalGuides = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const list = new Set(legalGuides.map(g => g.category));
    return ['All', ...Array.from(list)];
  }, []);

  const filteredGuides = useMemo(() => {
    return legalGuides.filter((guide) => {
      const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
      const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    // Styled exactly to replicate the Slate theme profile from your Terms configuration
    <div className="bg-slate-50/60 min-h-screen text-slate-600 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
      <button
        onClick={() => navigate(-1)}
        className="hidden md:flex absolute top-20 left-8 z-50 items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* EXOTIC PREMIUM DARK HEADER AREA (Aligned with image_c6440c.png) */}
      <header className="relative bg-slate-950 py-16 sm:py-20 overflow-hidden border-b border-slate-900 text-center">
        {/* Luxury Textures & Grid Alignments */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 max-w-5xl">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900/80 border border-slate-800 rounded-2xl mb-5 text-slate-400 shadow-2xl">
            <BookOpen className="h-6 w-6 text-slate-300" />
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Legal Guides &amp; Blueprints
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Comprehensive step-by-step documentation for everyday legal procedures in India. Understand operational protocol configurations before onboarding firm counsel.
          </p>

          {/* Interactive Dynamic Search Architecture Nodes */}
          <div className="max-w-md mx-auto mt-8 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl opacity-30 group-focus-within:opacity-70 blur-xs transition duration-300" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search procedures, laws, or keywords..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-11 pr-4 py-6 bg-slate-900/90 border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0 text-xs sm:text-sm transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      {/* PREMIUM WHITE BODY CANVAS CONTAINER */}
      <main className="container mx-auto px-4 max-w-5xl py-10 sm:py-16">

        {/* Filter Segment System Selection Track */}
        <div className="flex flex-col gap-3 mb-10 pb-4 border-b border-slate-200/70">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
            <Filter className="h-3 w-3" />
            <span>Jurisdiction Track</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${selectedCategory === category
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 translate-y-[-1px]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Master White Cards Architecture Node */}
        <div className="grid grid-cols-1 gap-8 relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden">

          {/* Subtle light geometric grid pattern matching Terms look */}
          <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

          <div className="relative z-10 space-y-12">
            {filteredGuides.length > 0 ? (
              filteredGuides.map((guide) => {
                const IconComponent = guide.icon;
                return (
                  <section key={guide.title} className="border-b border-slate-100 pb-10 last:border-b-0 last:pb-0 transition-all duration-300">

                    {/* Header Block inside Section */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-900 border border-slate-100 shadow-xs">
                        <IconComponent className="h-5 w-5 text-slate-700" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                          {guide.category}
                        </span>
                        <h2 className="font-serif text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                          {guide.title}
                        </h2>
                      </div>
                    </div>

                    {/* Content Process Maps */}
                    <div className="space-y-6 pl-1.5">
                      <ol className="space-y-4">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-4 group/step">
                            <span className="w-5 h-5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-mono font-bold text-slate-500 flex items-center justify-center shrink-0 mt-0.5 group-hover/step:border-slate-400 group-hover/step:text-slate-800 transition-colors">
                              {(stepIndex + 1).toString().padStart(2, '0')}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5 transition-colors group-hover/step:text-slate-900">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>

                      {/* Framework Alert Provisions Box */}
                      <div className="border-l-2 border-slate-900 bg-slate-50 rounded-r-xl p-4 flex gap-3 shadow-inner">
                        <AlertCircle className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 text-xs font-mono uppercase tracking-wide block mb-0.5">Statutory Provision Note:</strong>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-light">
                            {guide.important}
                          </p>
                        </div>
                      </div>
                    </div>

                  </section>
                );
              })
            ) : (
              <div className="text-center py-16 bg-slate-50/50 border border-slate-200/60 border-dashed rounded-xl">
                <Scale className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium text-sm">No procedural blueprints found.</p>
                <p className="text-slate-400 text-xs mt-1">Try resetting or loosening your active search filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Public Utility Portals Grid Area */}
        <div className="mt-16 border-t border-slate-200/60 pt-12">
          <div className="text-center sm:text-left mb-8">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Useful Government Portals
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Direct structural pipelines to sovereign digital platforms and verification data clusters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-between p-4 bg-white border border-slate-200/70 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all duration-300 group text-left"
              >
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-slate-950 transition-colors mb-1">
                    {link.title}
                  </h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed mb-4 font-light">
                    {link.description}
                  </p>
                </div>

                <span className="text-[10px] font-mono tracking-wider text-slate-400 font-medium inline-flex items-center gap-1 mt-auto uppercase">
                  Open Portal
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Action Conversion Pipeline Panel */}
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-6 sm:p-10 mt-16 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.002]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-900 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10 max-w-2xl">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Advisory Pipeline</h4>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">Need Professional Legal Assistance?</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
              These blueprints act strictly as informational maps. For granular advisory workflows or litigation defense actions, initiate secure lines with verified legal teams across the LegalMate cluster.
            </p>

            <Button

              onClick={() => navigate('/signup?role=client')}
              className="bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs px-5 py-5 tracking-wide rounded-xl transition-all shadow-md group"
            >
              Consult a Lawyer Now
              <ChevronRight className="h-3.5 w-3.5 ml-1 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LegalGuides;