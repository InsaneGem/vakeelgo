import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  UserCheck,
  Calendar,
  MessageSquare,
  Video,
  Shield,
  ChevronRight,
  CheckCircle2, ArrowLeft
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Find Your Lawyer',
    description: 'Browse our verified network of experienced lawyers. Filter by practice area, language, experience, and ratings to find the perfect match for your legal needs.',
    details: ['Search by specialization', 'View detailed profiles', 'Check verified credentials', 'Read client reviews']
  },
  {
    icon: UserCheck,
    title: 'Review & Select',
    description: 'Compare lawyer profiles, check their qualifications, bar council verification, and read reviews from previous clients to make an informed decision.',
    details: ['Bar council verified', 'Experience details', 'Success rate stats', 'Client testimonials']
  },
  {
    icon: Calendar,
    title: 'Book Consultation',
    description: 'Choose your preferred consultation type - chat, audio, or video call. Select a convenient time slot and make a secure payment to confirm your booking.',
    details: ['Flexible scheduling', 'Multiple modes', 'Secure payments', 'Instant confirmation']
  },
  {
    icon: MessageSquare,
    title: 'Get Legal Advice',
    description: 'Connect with your lawyer through our secure platform. Discuss your case, get expert legal advice, and receive guidance on your next steps.',
    details: ['End-to-end encrypted', 'Private & confidential', 'Document sharing', 'Session recording']
  },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Lawyers',
    description: 'All lawyers on our platform undergo strict verification including Bar Council registration and credential checks.'
  },
  {
    icon: Video,
    title: 'Multiple Consultation Modes',
    description: 'Choose from chat, audio, or video consultations based on your preference and the complexity of your case.'
  },
  {
    icon: CheckCircle2,
    title: 'Secure & Confidential',
    description: 'Your conversations are protected with end-to-end encryption. We take attorney-client privilege seriously.'
  },
];

const HowItWorks = () => {
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
            Operational Blueprint
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            How VakeelGo Works
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Getting expert legal advice has been streamlined into structured workflow pathways. Follow our simple sequential pipeline to connect directly with verified counsel.
          </p>
        </div>
      </header>

      {/* MAIN PREMIUM LIGHT CANVAS AREA */}
      <main className="container mx-auto px-4 max-w-5xl py-16 sm:py-24 space-y-24">

        {/* Steps Pipeline Section */}
        <section className="space-y-16 md:space-y-24">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.title}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}
              >
                {/* Step Info */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                      <StepIcon className="h-5 w-5 text-slate-800" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-mono font-bold text-slate-300 tracking-wider">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-slate-900 tracking-tight">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed md:pl-16 font-light">
                    {step.description}
                  </p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:pl-16 pt-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2.5 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-light">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Minimal Layout Vector Container */}
                <div className="flex-1 w-full group">
                  <Card className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs group-hover:border-slate-300 group-hover:shadow-sm transition-all duration-300">
                    <CardContent className="p-8 flex items-center justify-center min-h-[220px] sm:min-h-[240px] relative">
                      {/* Grid Dot Overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
                      <StepIcon className="h-16 w-16 text-slate-200 group-hover:text-slate-950/5 transition-colors duration-300 stroke-[1.25] relative z-10" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </section>

        {/* Core Attributes Framework Box */}
        <section className="relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-xs overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Ecosystem Standards</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Why Choose VakeelGo?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, fIdx) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={fIdx} className="p-6 bg-slate-50/40 border border-slate-200/60 rounded-xl text-center space-y-3.5 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300">
                    <div className="w-11 h-11 rounded-full bg-white border border-slate-200/80 flex items-center justify-center mx-auto shadow-xs">
                      <FeatureIcon className="h-5 w-5 text-slate-700" />
                    </div>
                    <h3 className="font-serif text-sm text-slate-900 font-bold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HIGH CONTRAST ACTION CALL VECTOR HUB */}
        <section className="bg-slate-950 text-slate-200 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.001]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-900 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto text-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Instant Onboarding Pipeline
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-8 max-w-md mx-auto">
              Initialize your triage framework to leverage our comprehensive, end-to-end legal consultation ecosystem today.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                onClick={() => navigate('/signup?role=client')}
                className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs px-5 h-11 tracking-wide rounded-xl transition-all shadow-md group inline-flex items-center justify-center"
              >
                Find a Lawyer
                <ChevronRight className="ml-1 h-3.5 w-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/signup?role=lawyer')}
                className="w-full sm:w-auto border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900 hover:text-white font-medium text-xs px-5 h-11 tracking-wide rounded-xl transition-all"
              >
                Join as Lawyer
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default HowItWorks;