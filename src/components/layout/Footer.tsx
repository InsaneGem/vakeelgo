import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// export const Footer = () => {
//   // Fetch real-time stats from database
//   const { data: stats } = useQuery({
//     queryKey: ['footer-stats'],
//     queryFn: async () => {
//       const [lawyersResult, consultationsResult, reviewsResult] = await Promise.all([
//         supabase.from('lawyer_profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
//         supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
//         supabase.from('reviews').select('rating'),
//       ]);
//       // Log to see exact API errors or counts
//       console.log("Lawyers error/data:", lawyersResult.error, lawyersResult.count);
//       console.log("Consultations error/data:", consultationsResult.error, consultationsResult.count);
//       console.log("Reviews error/data:", reviewsResult.error, reviewsResult.data);

//       const lawyerCount = lawyersResult.count || 0;
//       const consultationCount = consultationsResult.count || 0;
//       const reviews = reviewsResult.data || [];
//       const avgRating = reviews.length > 0
//         ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
//         : '4.9';

//       return {
//         lawyers: lawyerCount > 0 ? `${lawyerCount}+` : '500+',
//         consultations: consultationCount > 0 ? `${(consultationCount / 1000).toFixed(0)}K+` : '50K+',
//         rating: avgRating,
//         clients: consultationCount > 0 ? `${Math.floor(consultationCount * 0.8)}+` : '10K+'
//       };
//     },
//     staleTime: 1000 * 60 * 5,
//   });

export const Footer = () => {
  // Helper to format counts smoothly (e.g., 2 -> "2+", 1500 -> "1.5K+")
  const formatCount = (count: number, defaultText: string) => {
    if (!count || count === 0) return defaultText;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K+`;
    return `${count}+`;
  };

  const { data: stats } = useQuery({
    queryKey: ['footer-stats'],
    queryFn: async () => {
      const [lawyersResult, consultationsResult, reviewsResult] = await Promise.all([
        supabase.from('lawyer_profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('reviews').select('rating'),
      ]);

      const lawyerCount = lawyersResult.count || 0;
      const consultationCount = consultationsResult.count || 0;
      const reviews = reviewsResult.data || [];

      const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
        : '4.9';

      return {
        lawyers: formatCount(lawyerCount, '500+'),
        consultations: formatCount(consultationCount, '50K+'),
        rating: avgRating,
        clients: formatCount(Math.floor(consultationCount * 0.8) || consultationCount, '10K+'),
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  // ... rest of your component

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-200 border-t border-zinc-800/60 font-sans tracking-tight">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Column: Spans full width on mobile/tablet */}
          <div className="col-span-2 lg:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90">
                <Scale className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="font-serif text-lg font-bold tracking-wider text-white">VakeelGo</span>
              </Link>
              <p className="mt-3 text-xs text-zinc-400 leading-relaxed max-w-sm">
                Connect with verified lawyers for expert legal advice via chat, audio, or video consultations.
                Your trusted partner for all legal matters.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <a href="mailto:vakeelgo.official@gmail.com" className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white transition-colors w-fit">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                vakeelgo.official@gmail.com
              </a>
              <a href="tel:+919281472291" className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white transition-colors w-fit">
                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                +91 9281472291
              </a>
              <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                Basavanna Nagar - 560066, Bangalore
              </div>
            </div>
          </div>

          {/* Link Columns: Each takes 1 column, forcing 2-per-row layout on mobile/tablet */}
          <div className="col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3.5">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/signup?role=client", label: "Find Lawyers" },
                { to: "/categories", label: "Practice Areas" },
                { to: "/how-it-works", label: "How It Works" },
                { to: "/signup?role=lawyer", label: "Join as Lawyer" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-zinc-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3.5">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-xs text-zinc-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Help Center</Link></li>
              <li><Link to="/contact" className="text-xs text-zinc-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Contact Us</Link></li>
              <li><Link to="/faq" className="text-xs text-zinc-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">FAQs</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3.5">Legal</h4>
            <ul className="space-y-2">
              {[
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms of Service" },
                { to: "/refund", label: "Refund Policy" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-zinc-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-t border-zinc-900 bg-zinc-950/40">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x md:divide-zinc-900 divide-none">
            <div className="px-2"><div className="text-xl md:text-2xl font-bold font-serif text-white">{stats?.clients || '10K+'}</div><div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">Happy Clients</div></div>
            <div className="px-2 border-zinc-900"><div className="text-xl md:text-2xl font-bold font-serif text-white">{stats?.lawyers || '500+'}</div><div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">Verified Lawyers</div></div>
            <div className="px-2 border-zinc-900"><div className="text-xl md:text-2xl font-bold font-serif text-white">{stats?.consultations || '50K+'}</div><div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">Consultations</div></div>
            <div className="px-2 border-zinc-900"><div className="text-xl md:text-2xl font-bold font-serif text-white">★ {stats?.rating || '4.9'}</div><div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">Average Rating</div></div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-900 bg-zinc-950/80">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 text-center sm:text-left order-2 sm:order-1">© {currentYear} VakeelGo. All rights reserved.</p>
            <div className="flex items-center gap-4 order-1 sm:order-2">
              {[{ href: "https://facebook.com", icon: Facebook }, { href: "https://twitter.com", icon: Twitter }, { href: "https://linkedin.com", icon: Linkedin }, { href: "https://www.instagram.com/vakeelgo.com_/", icon: Instagram }].map((social, idx) => { const Icon = social.icon; return (<a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-900 rounded-md"><Icon className="h-4 w-4" /></a>); })}
            </div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 text-center sm:text-right hidden md:block order-3">Trusted by thousands worldwide</p>
          </div>
        </div>
      </div>
    </footer>
  );
};