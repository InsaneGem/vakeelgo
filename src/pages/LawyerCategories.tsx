import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Scale,
  Building2,
  Users,
  FileText,
  Briefcase,
  Shield,
  Home,
  Car,
  Landmark,
  Heart,
  Globe,
  Gavel,
  ChevronRight,
  HelpCircle, ArrowLeft
} from 'lucide-react';

const categories = [
  {
    icon: Users,
    name: 'Family Law',
    description: 'Divorce, child custody, adoption, domestic violence, alimony, and matrimonial disputes.',
    lawyers: 45
  },
  {
    icon: Briefcase,
    name: 'Corporate Law',
    description: 'Business formation, contracts, mergers & acquisitions, compliance, and corporate governance.',
    lawyers: 38
  },
  {
    icon: Gavel,
    name: 'Criminal Law',
    description: 'Criminal defense, bail matters, white-collar crimes, cybercrime, and fraud cases.',
    lawyers: 52
  },
  {
    icon: Home,
    name: 'Property Law',
    description: 'Real estate transactions, property disputes, tenant rights, land acquisition, and title verification.',
    lawyers: 41
  },
  {
    icon: FileText,
    name: 'Civil Litigation',
    description: 'Contract disputes, debt recovery, defamation, consumer protection, and injunctions.',
    lawyers: 36
  },
  {
    icon: Building2,
    name: 'Employment Law',
    description: 'Wrongful termination, workplace harassment, employment contracts, and labor disputes.',
    lawyers: 29
  },
  {
    icon: Shield,
    name: 'Insurance Law',
    description: 'Insurance claims, policy disputes, medical insurance, and accident claims.',
    lawyers: 24
  },
  {
    icon: Landmark,
    name: 'Tax Law',
    description: 'Income tax, GST, tax planning, tax disputes, and regulatory compliance.',
    lawyers: 31
  },
  {
    icon: Globe,
    name: 'Immigration Law',
    description: 'Visa applications, citizenship, deportation defense, and work permits.',
    lawyers: 22
  },
  {
    icon: Heart,
    name: 'Medical Law',
    description: 'Medical malpractice, patient rights, healthcare regulations, and insurance disputes.',
    lawyers: 18
  },
  {
    icon: Car,
    name: 'Motor Accident Claims',
    description: 'Vehicle accidents, insurance claims, personal injury, and compensation recovery.',
    lawyers: 27
  },
  {
    icon: Scale,
    name: 'Constitutional Law',
    description: 'Fundamental rights, PIL, judicial review, and constitutional remedies.',
    lawyers: 15
  },
];

const Categories = () => {
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

        {/* Ambient Grid Lines & Glow Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">

          <div className="inline-block px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4">
            Taxonomy Catalog
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            Practice Areas
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Find specialized legal counsel mapped to your distinct regulatory requirements. Our vetted legal ecosystem matches your specific problem directly with industry specialists.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT CANVAS AREA */}
      <main className="container mx-auto px-4 max-w-6xl py-12 sm:py-16 space-y-16">

        {/* Categories Structured Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card
                  key={category.name}
                  className="bg-white border border-slate-200/80 rounded-2xl group cursor-pointer transition-all duration-300 hover:border-slate-400 hover:shadow-md flex flex-col justify-between overflow-hidden relative"
                  onClick={() => navigate(`/lawyers?category=${encodeURIComponent(category.name)}`)}
                >
                  {/* Subtle Geometric Background Dot Texture on Hover */}
                  <div className="absolute inset-0 bg-[radial-gradient(#f8fafc_1px,transparent_1px)] [background-size:16px_16px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <CardHeader className="p-6 pb-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-950 group-hover:border-slate-950 transition-all duration-300">
                        <CategoryIcon className="h-5 w-5 text-slate-700 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase">
                        {category.lawyers} Specialists
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between space-y-4 relative z-10">
                    <div>
                      <CardTitle className="font-serif text-base sm:text-lg text-slate-900 font-bold tracking-tight mb-2 group-hover:text-black transition-colors">
                        {category.name}
                      </CardTitle>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
                        {category.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex items-center text-xs font-mono tracking-wider uppercase font-semibold text-slate-400 group-hover:text-slate-950 transition-colors">
                      Locate Counsel
                      <ChevronRight className="ml-1 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-950 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Institutional Core Metrics Section */}
        <section className="relative bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-xs overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 text-center">
            <div>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight mb-1">12+</div>
              <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold">Legal Domains</div>
            </div>
            <div className="border-l border-slate-100 max-sm:border-none">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight mb-1">500+</div>
              <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold">Verified Advocates</div>
            </div>
            <div className="border-l border-slate-100 max-md:border-none">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight mb-1">50K+</div>
              <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold">Resolved Briefs</div>
            </div>
            <div className="border-l border-slate-100 max-sm:border-none">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight mb-1">4.9</div>
              <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold">Average Rating</div>
            </div>
          </div>
        </section>

        {/* HIGH CONTRAST ACTION VECTOR BOX */}
        <section className="bg-slate-950 text-slate-200 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.001]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-900 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5 shadow-inner">
              <HelpCircle className="h-5 w-5 text-slate-400" />
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Complex Resolution Matrix
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">
              Encountering a Bespoke Matter?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
              If your structural dispute spans multiple complex jurisdictions or falls outside standard parameters, reach out to our triage support layer to identify correct professional alignment.
            </p>

            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs px-5 h-11 tracking-wide rounded-xl transition-colors inline-flex items-center shadow-md"
            >
              Contact Advisory Unit
              <ChevronRight className="h-3.5 w-3.5 ml-1 text-slate-950" />
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Categories;