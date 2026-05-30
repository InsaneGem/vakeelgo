import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Users,
  CreditCard,
  Shield,
  HelpCircle,
  ChevronRight,
  ExternalLink, ArrowLeft
} from 'lucide-react';

const helpCategories = [
  {
    icon: Users,
    title: 'Getting Started',
    description: 'Learn how to create an account, find lawyers, and book your first consultation.',
    articles: ['How to sign up', 'Finding the right lawyer', 'Booking a consultation'],
    link: '/faq#getting-started'
  },
  {
    icon: MessageCircle,
    title: 'Consultations',
    description: 'Everything about chat, audio, and video consultations on our platform.',
    articles: ['Joining a consultation', 'Consultation types', 'Recording sessions'],
    link: '/faq#consultations'
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    description: 'Information about payment methods, pricing, invoices, and refunds.',
    articles: ['Payment methods', 'Understanding pricing', 'Requesting refunds'],
    link: '/faq#payments'
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'How we protect your data and ensure confidential attorney-client communication.',
    articles: ['Data protection', 'End-to-end encryption', 'Privacy practices'],
    link: '/privacy'
  },
  {
    icon: FileText,
    title: 'For Lawyers',
    description: 'Resources for lawyers joining our platform and managing their practice.',
    articles: ['Joining as a lawyer', 'Setting up your profile', 'Managing bookings'],
    link: '/faq#lawyers'
  },
  {
    icon: HelpCircle,
    title: 'Technical Support',
    description: 'Troubleshooting common issues with video calls, audio, and the platform.',
    articles: ['Video call issues', 'Audio problems', 'Browser compatibility'],
    link: '/faq#technical'
  },
];

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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
        {/* Ambient Grid Lines & Glow Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4">
            Knowledge Ecosystem
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            Help Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed font-light tracking-wide mb-10">
            Locate analytical solution frameworks or navigate straight into direct specialist triage pathways.
          </p>

          {/* Structured Dark Search Input */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              className="pl-11 h-12 text-xs sm:text-sm bg-slate-900/40 border-slate-800 focus:border-slate-700 text-slate-200 placeholder:text-slate-600 rounded-xl w-full shadow-2xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* MAIN PREMIUM LIGHT CANVAS AREA */}
      <main className="container mx-auto px-4 max-w-6xl py-16 sm:py-24 space-y-24">

        {/* Help Categories Grid */}
        <section className="space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Knowledge Directory</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Browse Help Topics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
              <Card
                key={category.title}
                className="bg-white border border-slate-200/80 rounded-2xl hover:border-slate-300 shadow-xs hover:shadow-sm cursor-pointer transition-all duration-300 flex flex-col justify-between group"
                onClick={() => navigate(category.link)}
              >
                <CardHeader className="p-6 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-4 shadow-2xs group-hover:bg-slate-950 group-hover:border-slate-950 transition-colors duration-300">
                    <category.icon className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <CardTitle className="font-serif text-base text-slate-900 font-bold tracking-tight">
                    {category.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-5 flex-1 flex flex-col justify-between">
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
                    {category.description}
                  </p>

                  <div className="border-t border-slate-100 pt-4">
                    <ul className="space-y-2.5">
                      {category.articles.map((article) => (
                        <li key={article} className="flex items-center gap-2 text-xs text-slate-600">
                          <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                          <span className="truncate font-light">{article}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technical Triage and Support Hub */}
        <section className="relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-xs overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Direct Assistance</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Still Need Help?
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed font-light">
                Our infrastructure monitoring teams are configured to streamline continuous edge case resolution operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Email Support Card */}
              <Card className="bg-slate-50/40 border border-slate-200/60 rounded-xl text-center flex flex-col justify-between transition-all duration-300 hover:bg-slate-50 hover:border-slate-300">
                <CardContent className="p-6 sm:p-8 space-y-5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mx-auto shadow-xs">
                    <Mail className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-sm text-slate-900 font-bold tracking-tight">Email Triage</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      Comprehensive tracking parameters. Resolved within 24 hours.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/contact')}
                    className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium text-xs h-9 tracking-wide rounded-lg shadow-2xs transition-colors"
                  >
                    Send Request
                  </Button>
                </CardContent>
              </Card>

              {/* Live Chat Card */}
              <Card className="bg-slate-50/40 border border-slate-200/60 rounded-xl text-center flex flex-col justify-between transition-all duration-300 hover:bg-slate-50 hover:border-slate-300">
                <CardContent className="p-6 sm:p-8 space-y-5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mx-auto shadow-xs">
                    <MessageCircle className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-sm text-slate-900 font-bold tracking-tight">Live Framework</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      Direct operations layer. Available Mon-Sat, 9am-6pm.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium text-xs h-9 tracking-wide rounded-lg shadow-2xs transition-colors"
                  >
                    Initialize Chat
                  </Button>
                </CardContent>
              </Card>

              {/* Phone Support Card */}
              <Card className="bg-slate-50/40 border border-slate-200/60 rounded-xl text-center flex flex-col justify-between transition-all duration-300 hover:bg-slate-50 hover:border-slate-300">
                <CardContent className="p-6 sm:p-8 space-y-5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mx-auto shadow-xs">
                    <Phone className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-sm text-slate-900 font-bold tracking-tight">Urgent Hotline</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      Real-time high-priority routing pipeline systems.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-950 font-mono text-xs h-9 tracking-wide rounded-lg shadow-2xs transition-colors"
                  >
                    +1 (800) 123-4567
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* HIGH CONTRAST DOCUMENTATION MANIFEST LINK HUB */}
        <section className="bg-slate-950 text-slate-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-900 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-4">
              Global Manifest Documentation
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/faq')}
                className="text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-colors px-4 h-9 rounded-lg"
              >
                FAQ <ExternalLink className="ml-1.5 h-3 w-3 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/terms')}
                className="text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-colors px-4 h-9 rounded-lg"
              >
                Terms of Service <ExternalLink className="ml-1.5 h-3 w-3 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/privacy')}
                className="text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-colors px-4 h-9 rounded-lg"
              >
                Privacy Policy <ExternalLink className="ml-1.5 h-3 w-3 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/refund')}
                className="text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-colors px-4 h-9 rounded-lg"
              >
                Refund Matrix <ExternalLink className="ml-1.5 h-3 w-3 text-slate-600" />
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Help;