import { Card } from '@/components/ui/card';
import { ShieldCheck, BadgePercent, Zap, Lock, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingInfo = () => {
    // Corrected: Hook must be inside the component function
    const navigate = useNavigate();

    return (
        <main className="bg-white min-h-screen text-slate-900 font-sans antialiased pt-10 pb-24">
            {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
            <button
                onClick={() => navigate(-1)}
                className="hidden md:flex absolute top-20 left-8 z-50 items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
            </button>
            <div className="container mx-auto px-4 max-w-4xl">
                {/* HEADER */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-mono tracking-widest uppercase mb-6">
                        <BadgePercent className="h-3 w-3" />
                        <span>Consultation Pricing</span>
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-950 mb-6">
                        Simple, Transparent Rates
                    </h1>
                    <p className="text-slate-500 text-lg font-light max-w-xl mx-auto">
                        We believe in complete clarity. You always see the total consultation fee upfront,
                        with no hidden costs or surprise charges after your session.
                    </p>
                </div>

                {/* MAIN FEATURE CARD */}
                <Card className="rounded-3xl border border-slate-900 bg-slate-950 shadow-2xl p-8 lg:p-12">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="font-serif text-2xl font-bold text-white mb-4">
                                Designed for Trust
                            </h3>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Whether it's chat, audio, or video, our platform ensures your consultation
                                is handled with the highest level of security and professional support.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Secure Transactions", desc: "Your payment is protected until the session concludes." },
                                    { title: "Direct Communication", desc: "Connect instantly with verified legal professionals." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{item.title}</h4>
                                            <p className="text-xs text-slate-500 font-light">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center">
                            <Zap className="h-10 w-10 text-indigo-400 mx-auto mb-6" />
                            <p className="text-slate-400 uppercase tracking-widest text-[10px] mb-2">Starting from</p>
                            <div className="text-5xl font-bold text-white mb-6">₹10 <span className="text-2xl text-slate-600">/ min</span></div>
                            <p className="text-sm text-slate-500 font-light mb-8">
                                Pricing is set by the lawyer and clearly displayed before you confirm your request.
                            </p>
                            <button
                                onClick={() => navigate('/signup?role=client')}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
                            >
                                Find a Lawyer
                            </button>
                        </div>
                    </div>
                </Card>



            </div>
        </main>
    );
};

export default PricingInfo;