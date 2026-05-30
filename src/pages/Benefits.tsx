import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
    BriefcaseBusiness,
    Globe,
    ShieldCheck,
    Clock3,
    TrendingUp,
    Headset,
    ArrowLeft,
    Scale // Icon for the badge
} from 'lucide-react';

const Benefits = () => {
    const benefits = [
        { icon: Globe, title: "Global Reach", desc: "Connect with clients across the country, expanding your practice beyond local boundaries." },
        { icon: TrendingUp, title: "Grow Your Practice", desc: "Focus on providing legal expertise while we handle the marketing and client acquisition." },
        { icon: Clock3, title: "Flexible Scheduling", desc: "Manage your own availability and set your own rates to match your professional lifestyle." },
        { icon: ShieldCheck, title: "Secure & Compliant", desc: "Work within a platform designed to protect your data and facilitate professional ethics." },
        { icon: BriefcaseBusiness, title: "Professional Management", desc: "Streamlined dashboard to manage your appointments, documents, and billing in one place." },
        { icon: Headset, title: "Dedicated Support", desc: "Our team provides the support you need to ensure every client interaction is seamless." }
    ];
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
            {/* DARK HERO HEADER - Styled to match image_b9ef1e.png */}
            <section className="bg-slate-950 py-24 border-b border-slate-900">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-6">
                        <Scale className="h-3 w-3" />
                        <span>Why LegalMate</span>
                    </div>
                    <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
                        Empowering Your Legal Practice
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        We provide the infrastructure and reach you need to grow your practice,
                        streamline client interactions, and focus on what matters most—delivering justice.
                    </p>
                </div>
            </section>

            {/* BENEFITS GRID */}
            <section className="py-20 container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((item, i) => (
                        <Card key={i} className="p-8 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-lg group">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                                <item.icon className="h-7 w-7 text-slate-700 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <h3 className="font-bold text-xl text-slate-950 mb-3">{item.title}</h3>
                            <p className="text-slate-500 font-light leading-relaxed text-sm">
                                {item.desc}
                            </p>
                        </Card>
                    ))}
                </div>

                {/* CTA FOOTER */}
                <div className="mt-24 p-12 bg-slate-950 rounded-[2rem] text-center">
                    <h3 className="text-white font-serif text-3xl font-bold mb-6">
                        Ready to digitize your practice?
                    </h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Join a network of verified legal experts and start connecting with clients today.
                    </p>
                    <button onClick={() => navigate('/signup?role=client')}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all">
                        Apply to Join
                    </button>
                </div>
            </section>
        </main>
    );
};

export default Benefits;