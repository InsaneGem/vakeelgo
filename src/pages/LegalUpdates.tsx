import { Card, CardContent } from '@/components/ui/card';
import {
    Scale, Gavel, Calendar, ArrowRight, AlertCircle,
    BookOpen, Shield, FileText, ExternalLink, Landmark, ArrowLeft
} from 'lucide-react';

// Data objects remain consistent with your requirements
const legalUpdates = [
    { title: 'Supreme Court Strengthens Digital Privacy Rights', category: 'Constitutional Law', date: 'May 2026', court: 'Supreme Court of India', summary: 'The Supreme Court reaffirmed that digital privacy and protection of personal data are fundamental rights under Article 21 of the Constitution.', impact: 'Companies handling user data must improve compliance and strengthen privacy protection measures.', icon: Shield },
    { title: 'New Consumer Protection Rules for E-Commerce Platforms', category: 'Consumer Law', date: 'April 2026', court: 'Ministry of Consumer Affairs', summary: 'Updated regulations now require marketplaces to provide faster grievance resolution and transparent seller disclosures.', impact: 'Consumers now have stronger protections against misleading listings and delayed refunds.', icon: Landmark },
    { title: 'Landmark Judgment on Workplace Harassment', category: 'Employment Law', date: 'March 2026', court: 'Delhi High Court', summary: 'The court emphasized stricter implementation of Internal Complaints Committees under workplace harassment laws.', impact: 'Private companies and startups must ensure active POSH compliance mechanisms.', icon: Gavel },
    { title: 'Property Registration Digitization Initiative', category: 'Property Law', date: 'February 2026', court: 'Government Notification', summary: 'Several states introduced fully online property registration and verification systems.', impact: 'Property buyers can now verify ownership records and encumbrance certificates online.', icon: FileText },
];

const amendments = [
    { title: 'Consumer Protection Amendment 2026', description: 'Expanded coverage for online marketplaces and digital products.' },
    { title: 'Data Protection Compliance Rules', description: 'Introduced stricter obligations for apps and businesses storing user data.' },
    { title: 'Labour Code Enforcement Updates', description: 'Simplified compliance requirements for employers and startups.' },
    { title: 'Motor Vehicle Compensation Reform', description: 'Faster claim settlement timelines for accident victims.' },
];

const resources = [
    { title: 'Supreme Court of India', url: 'https://main.sci.gov.in' },
    { title: 'India Code', url: 'https://www.indiacode.nic.in' },
    { title: 'e-Courts Services', url: 'https://ecourts.gov.in' },
    { title: 'PRS Legislative Research', url: 'https://prsindia.org' },
];

const LegalUpdates = () => {
    return (
        <div className="bg-slate-50/60 min-h-screen text-slate-600 font-sans antialiased">
            {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
            <button
                onClick={() => navigate(-1)}
                className="hidden md:flex absolute top-20 left-8 z-50 items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
            </button>
            {/* DARK HERO SECTION */}
            <section className="relative bg-slate-950 py-16 sm:py-24 border-b border-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
                <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800/60 rounded-full px-4 py-1.5 mb-6 shadow-xl">
                        <Scale className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-300 text-[10px] font-mono tracking-widest uppercase">Latest Case Laws & Amendments</span>
                    </div>
                    <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-6">Legal Updates</h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-light">
                        Stay updated with the latest judgments, legal reforms, and crucial amendments affecting Indian law and citizen rights.
                    </p>
                </div>
            </section>

            {/* DEVELOPMENTS SECTION */}
            <section className="container mx-auto px-4 max-w-4xl py-16 sm:py-24">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-3xs">
                        <BookOpen className="h-4 w-4 text-slate-700" />
                    </div>
                    <h2 className="font-serif text-xl font-bold text-slate-900 tracking-tight">Latest Developments</h2>
                </div>

                <div className="space-y-6">
                    {legalUpdates.map((update) => (
                        <Card key={update.title} className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                                        <update.icon className="h-4 w-4 text-slate-700" />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{update.category}</span>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> {update.date}</span>
                                        </div>
                                        <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">{update.title}</h3>
                                        <p className="text-xs italic text-slate-500 mt-1">{update.court}</p>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">{update.summary}</p>
                                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex gap-3">
                                    <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-800 mb-1">Practical Impact</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed font-light">{update.impact}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* AMENDMENTS MATRIX */}
            <section className="bg-white py-16 sm:py-20 border-y border-slate-200">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="font-serif text-xl font-bold text-slate-900 mb-10 flex items-center gap-3">
                        <Gavel className="h-5 w-5 text-slate-400" /> Recent Amendments
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {amendments.map((item) => (
                            <div key={item.title} className="p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                                <h3 className="font-bold text-sm text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-light">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* RESOURCES FOOTER */}
            <section className="py-16 bg-slate-50/60">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="font-serif text-lg font-bold text-slate-900 mb-6">Official Legal Portals</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {resources.map((res) => (
                            <a key={res.title} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-3xs hover:border-slate-300 transition-all text-xs font-medium text-slate-600">
                                {res.title} <ExternalLink className="h-3 w-3 text-slate-400" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LegalUpdates;