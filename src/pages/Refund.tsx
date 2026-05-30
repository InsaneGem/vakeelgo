import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCcw, CheckCircle, XCircle, Clock,
  AlertCircle, ArrowRight, ArrowLeft
} from 'lucide-react';

const Refund = () => {
  const navigate = useNavigate();
  const lastUpdated = 'May 29, 2026';

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
      {/* EXOTIC PREMIUM DARK HERO SECTION */}
      <section className="relative bg-slate-950 py-16 sm:py-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4">
            Policy Administration
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">Refund Policy</h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed font-light tracking-wide">
            We strive for fair and transparent resolutions. Learn about our consultation retention and refund parameters.
          </p>
          <div className="mt-6 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Last updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* POLICY MATRIX */}
      <section className="container mx-auto px-4 max-w-6xl py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: CheckCircle, title: 'Double Charges', desc: '100% returns for technical duplicate payment gateway runs.' },
            { icon: Clock, title: 'Partial Refund', desc: '70%-80% for lawyer absences or platform-side errors.' },
            { icon: XCircle, title: 'No Refund', desc: 'Applied to completed calls or user-side disconnections.' }
          ].map((item, i) => (
            <Card key={i} className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto mb-4 shadow-3xs">
                  <item.icon className="h-4 w-4 text-slate-700" />
                </div>
                <h3 className="text-sm font-serif font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs font-light leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DETAILED POLICY */}
        <div className="max-w-3xl mx-auto mt-16 space-y-12">
          {/* Partial Refund Details */}
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-4">Eligible for Partial Refund (70% - 80%)</h2>
            <p className="text-slate-500 text-xs leading-relaxed font-light mb-4">
              To maintain continuous communication networks and account for payment gateway routing costs, verified operational claims are subject to a 20% to 30% system retention fee.
            </p>
            <ul className="space-y-3">
              {[
                "Lawyer Absenteeism: Counselor fails to join within 10 minutes.",
                "Early Stream Termination: Professional ends communication before resolving issues.",
                "Disrupted Consultations: Severe technical anomalies proven via logs."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-600 font-light">
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" /> {text}
                </li>
              ))}
            </ul>
          </div>

          {/* How to Log a Claim */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-slate-900 mb-4">How to Log a Claim</h2>
            <div className="space-y-4">
              {[
                "Access your profile dashboard and navigate to Consultation History.",
                "Select the relevant connection and trigger 'Request Dispute Review'.",
                "Provide context regarding the technical or professional discrepancy.",
                "Internal engineering reviews verified logs within 5-7 business days."
              ].map((step, i) => (
                <div key={i} className="flex gap-4 text-xs">
                  <span className="font-mono font-bold text-slate-400">0{i + 1}.</span>
                  <span className="text-slate-600 font-light">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-20 bg-white border-t border-slate-200 text-center">
        <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">Questions About Retention?</h2>
        <div className="flex gap-3 justify-center mt-6">
          <Button onClick={() => navigate('/contact')} className="bg-slate-950 text-white hover:bg-slate-900 h-10 px-6 rounded-lg text-xs">Contact Support</Button>
          <Button variant="outline" onClick={() => navigate('/faq')} className="border-slate-200 h-10 px-6 rounded-lg text-xs">View FAQ</Button>
        </div>
      </section>
    </div>
  );
};

export default Refund;