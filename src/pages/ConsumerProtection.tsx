import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, FileText, Phone, Globe,
  ShoppingCart, CreditCard, Wifi, Home, Car,
  Scale, CheckCircle, ArrowLeft
} from 'lucide-react';

const consumerRights = [
  { title: 'Right to Safety', description: 'Protection against goods and services that are hazardous to life and property.', icon: Shield },
  { title: 'Right to Be Informed', description: 'Right to be informed about quality, quantity, potency, purity, standard, and price of goods or services.', icon: FileText },
  { title: 'Right to Choose', description: 'Right to access a variety of goods and services at competitive prices.', icon: ShoppingCart },
  { title: 'Right to Be Heard', description: 'Right to be heard and assured that consumer interests will receive due consideration.', icon: Phone },
  { title: 'Right to Seek Redressal', description: 'Right to seek redressal against unfair trade practices, exploitation, or restrictive trade practices.', icon: Scale },
  { title: 'Right to Consumer Education', description: 'Right to acquire knowledge and skills to be an informed consumer throughout life.', icon: Globe },
];

const commonFrauds = [
  { icon: CreditCard, title: 'Online Banking & UPI Fraud', description: 'Fraudsters impersonate bank officials and request sensitive details or fake payment requests.', prevention: ['Never share OTP or PIN', 'Verify UPI requests', 'Call 1930 for support'] },
  { icon: Wifi, title: 'E-Commerce Fraud', description: 'Fake websites, counterfeit products, or non-delivery of ordered goods.', prevention: ['Use verified platforms', 'Check seller ratings', 'Prefer Cash on Delivery'] },
  { icon: Home, title: 'Real Estate Fraud', description: 'Misrepresentation of project details or delays in possession beyond RERA timelines.', prevention: ['Verify RERA registration', 'Perform title search', 'Registered agreements only'] },
  { icon: Car, title: 'Insurance Fraud', description: 'Mis-selling of policies, hidden terms, or unreasonable claim rejections.', prevention: ['Read documents carefully', 'Verify agent license', 'Use 15-day look-in period'] },
];

const filingSteps = [
  { step: 1, title: 'Send a Legal Notice', description: 'Formally notify the opposite party of your grievance via registered post.' },
  { step: 2, title: 'Register on e-Daakhil', description: 'Create an account on the official portal for filing consumer complaints.' },
  { step: 3, title: 'Choose the Right Forum', description: 'Determine jurisdiction based on the claim value (District, State, or National).' },
  { step: 4, title: 'Prepare Your Complaint', description: 'Collate bills, receipts, and supporting evidence of the deficiency.' },
  { step: 5, title: 'Pay the Court Fee', description: 'Process nominal fees online through the e-Daakhil gateway.' },
  { step: 6, title: 'Attend Hearings', description: 'Present your arguments and evidence before the commission.' },
];

const ConsumerProtection = () => {
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
      {/* HERO SECTION */}
      <section className="relative bg-slate-950 py-16 sm:py-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4">
            Consumer Protection Act, 2019
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">Consumer Protection</h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed font-light tracking-wide">
            Know your rights as a consumer, learn how to identify structural fraud patterns, and safely navigate the official channels for grievance redressal.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 max-w-6xl py-16 sm:py-24 space-y-24">

        {/* Rights */}
        <div>
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Protection Mandates</span>
            <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Your 6 Fundamental Rights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consumerRights.map((right) => (
              <Card key={right.title} className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-4 shadow-3xs">
                    <right.icon className="h-4 w-4 text-slate-700" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-slate-900 mb-2">{right.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-light">{right.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Frauds */}
        <div>
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Risk Mitigations</span>
            <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Common Frauds & Prevention</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commonFrauds.map((fraud) => (
              <Card key={fraud.title} className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shadow-3xs">
                      <fraud.icon className="h-4 w-4 text-slate-700" />
                    </div>
                    <h3 className="font-serif font-bold text-slate-900">{fraud.title}</h3>
                  </div>
                  <p className="text-slate-500 text-xs mb-6 font-light">{fraud.description}</p>
                  <ul className="space-y-2 border-t border-slate-100 pt-4">
                    {fraud.prevention.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-xs text-slate-600 font-light">
                        <CheckCircle className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" /> {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Procedural Pipeline</span>
            <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">How to File a Complaint</h2>
          </div>
          <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-slate-200">
            {filingSteps.map((item) => (
              <div key={item.step} className="flex gap-5 relative">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-800 font-mono font-bold flex items-center justify-center shrink-0 text-xs shadow-3xs z-10">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="font-serif font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-xs font-light leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER ACTION */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-6" />
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">Encountered Discrepancies?</h2>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/lawyers')} className="bg-slate-950 text-white hover:bg-slate-900 h-10 px-6 rounded-lg text-xs">Consult a Specialist</Button>
            <Button variant="outline" onClick={() => navigate('/legal-guides')} className="border-slate-200 h-10 px-6 rounded-lg text-xs">Read Guides</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsumerProtection;