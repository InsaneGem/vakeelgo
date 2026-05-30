import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Scale,
  ArrowRight,
  Calendar,
  Clock3,
  TrendingUp,
  Landmark,
  Shield,
  Gavel,
  ExternalLink,
  Newspaper,
  Sparkles, ArrowLeft
} from 'lucide-react';

const featuredArticle = {
  title: 'Digital Personal Data Protection Act: What Every Indian Citizen Should Know',
  category: 'Technology Law',
  author: 'LEGALMATE Editorial',
  date: 'May 2026',
  readTime: '8 min read',
  image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop',
  content: 'India’s Digital Personal Data Protection framework introduces stricter obligations for businesses collecting personal information while giving users stronger privacy rights and grievance protections.',
};

const articleSections = [
  { title: '1. Stronger User Privacy Rights', description: 'Citizens now have clearer rights regarding consent, access to personal information, and correction or deletion of their stored data.', icon: Shield },
  { title: '2. Business Compliance Obligations', description: 'Organizations handling personal data must adopt transparent policies, security safeguards, and grievance redressal mechanisms.', icon: Landmark },
  { title: '3. Penalties for Data Breaches', description: 'Companies failing to protect sensitive user data may face heavy financial penalties and regulatory action.', icon: Gavel },
  { title: '4. Impact on Startups & Apps', description: 'Indian startups and digital platforms must update privacy policies and implement stronger cybersecurity measures.', icon: TrendingUp },
];

const latestArticles = [
  { title: 'Consumer Protection Rules for Online Marketplaces Explained', category: 'Consumer Law', date: 'May 2026' },
  { title: 'Property Registration Digitization Across Indian States', category: 'Property Law', date: 'April 2026' },
  { title: 'Latest Supreme Court Observations on Freedom of Speech', category: 'Constitutional Law', date: 'April 2026' },
  { title: 'Women Workplace Safety & POSH Compliance Updates', category: 'Employment Law', date: 'March 2026' },
];

const legalSources = [
  { title: 'Supreme Court of India', url: 'https://main.sci.gov.in' },
  { title: 'India Code', url: 'https://www.indiacode.nic.in' },
  { title: 'PRS Legislative Research', url: 'https://prsindia.org' },
  { title: 'e-Courts Services', url: 'https://ecourts.gov.in' },
];

const Articles = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-slate-50/60 min-h-screen text-slate-600 font-sans antialiased">
      {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
      <button
        onClick={() => navigate(-1)}
        className="hidden md:flex absolute top-20 left-8 z-50 items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>
      {/* EXOTIC PREMIUM DARK HEADER */}
      <header className="relative bg-slate-950 py-24 border-b border-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-6">
            <Newspaper className="h-3 w-3" />
            <span>Legal Research Hub</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">Legal Articles & <br /><span className="text-slate-400">In-Depth Analysis</span></h1>
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Explore expert legal analysis, law reforms, and policy updates shaping India’s legal system with precision.
          </p>
        </div>
      </header>

      {/* Featured Article */}
      <section className="py-24 container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="h-6 w-6 text-slate-900" />
          <h2 className="font-serif text-2xl font-bold text-slate-900">Featured Article</h2>
        </div>
        <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl">
          <div className="grid lg:grid-cols-2">
            <div className="relative h-64 lg:h-full min-h-[350px]">
              <img src={featuredArticle.image} alt={featuredArticle.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center bg-white">
              <div className="flex items-center gap-4 text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
                <span>{featuredArticle.category}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">{featuredArticle.date}</span>
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4 text-slate-900">{featuredArticle.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light">{featuredArticle.content}</p>
              <Button className="w-fit rounded-xl gap-2 font-medium">Read Article <ArrowRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Insights Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-slate-900 mb-4">Understanding the Impact</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">Key legal reforms and judicial developments for individuals and businesses.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {articleSections.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title} className="border border-slate-100 shadow-none rounded-xl p-6 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-4"><Icon className="h-5 w-5 text-slate-700" /></div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-light">{s.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-24 container mx-auto px-4 max-w-4xl">
        <h2 className="font-serif text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3"><BookOpen className="h-6 w-6" /> Latest Updates</h2>
        <div className="space-y-4">
          {latestArticles.map((a) => (
            <div key={a.title} className="flex items-center justify-between p-6 bg-white border border-slate-200/60 rounded-xl hover:border-slate-300 transition-all">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{a.category}</span>
                <h3 className="font-serif text-lg font-bold text-slate-900 mt-1">{a.title}</h3>
              </div>
              <Button variant="ghost" size="sm" className="hidden sm:flex">Read <ArrowRight className="h-3 w-3 ml-2" /></Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="bg-slate-950 text-slate-200 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          <div className="relative z-10 max-w-lg mx-auto">
            <Scale className="h-10 w-10 text-white mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-bold text-white mb-4">Need Professional Legal Advice?</h2>
            <p className="text-slate-400 text-sm mb-8 font-light">Consult verified experts on LEGALMATE for personalized guidance.</p>
            <Button onClick={() => navigate('/signup?role=client')} className="bg-white text-slate-950 hover:bg-slate-100 rounded-xl px-8">Consult a Lawyer</Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Articles;