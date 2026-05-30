import { ShieldCheck, Users, Target, Scale, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

const AboutUs = () => {
    const navigate = useNavigate();
    return (
        <main className="bg-white min-h-screen font-sans">
            {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
            <button
                onClick={() => navigate(-1)}
                className="hidden md:flex absolute top-20 left-8 z-50 items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
            </button>


            {/* DARK HERO HEADER */}
            <section className="bg-slate-950 py-24 border-b border-slate-900">

                <div className="container mx-auto px-4 text-center">

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-6">
                        <Scale className="h-3 w-3" />
                        <span>Our Mission</span>
                    </div>
                    <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
                        Democratizing Legal Access
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        LegalMate was founded on the belief that everyone deserves transparent,
                        secure, and instant access to professional legal expertise.
                    </p>
                </div>
            </section>

            {/* STORY & MISSION */}
            <section className="py-24 container mx-auto px-4 max-w-4xl">
                <div className="space-y-16">
                    <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-slate-950 mb-6">The LegalMate Vision</h2>
                        <p className="text-slate-600 leading-relaxed text-lg font-light">
                            We bridge the gap between people in need of legal guidance and the professionals
                            best equipped to provide it. By removing the traditional barriers of hidden costs
                            and complex booking systems, we make legal consultation as simple as a conversation.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: ShieldCheck, title: "Trust-First", desc: "Every professional on our platform is verified for your peace of mind." },
                            { icon: Users, title: "Client-Centric", desc: "Designed for seamless, direct communication regardless of location." },
                            { icon: Target, title: "Transparent", desc: "Rates are displayed upfront, ensuring no surprises after your session." }
                        ].map((value, i) => (
                            <div key={i} className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <value.icon className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="font-bold text-slate-950 mb-2">{value.title}</h3>
                                <p className="text-xs text-slate-500 font-light">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl font-serif font-bold text-slate-950 mb-4">Join our growing community</h3>
                    <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                        Whether you are a client seeking advice or a lawyer looking to expand your reach,
                        LegalMate is here to support you.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => navigate('/signup?role=client')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all">
                            Find a Lawyer
                        </button>
                        <button onClick={() => navigate('/signup?role=lawyer')}
                            className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold hover:border-slate-300 transition-all">
                            Apply to Join
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AboutUs;