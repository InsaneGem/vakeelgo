import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Briefcase, BookOpen, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const LawyerFooter = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const { data: lawyerStats } = useQuery({
    queryKey: ['lawyer-footer-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [walletRes, profileRes, consultationsRes, reviewsRes] = await Promise.all([
        supabase.from('wallets').select('balance').eq('user_id', user.id).single(),
        supabase.from('lawyer_profiles').select('rating, total_consultations, total_reviews, status').eq('user_id', user.id).single(),
        supabase.from('consultations').select('status').eq('lawyer_id', user.id),
        supabase.from('reviews').select('rating').eq('lawyer_id', user.id),
      ]);
      const consultations = consultationsRes.data || [];
      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '0.0';
      return {
        balance: walletRes.data?.balance || 0,
        rating: avgRating,
        totalConsultations: consultations.length,
        completedConsultations: consultations.filter(c => c.status === 'completed').length,
        activeConsultations: consultations.filter(c => c.status === 'active').length,
        pendingConsultations: consultations.filter(c => c.status === 'pending').length,
        totalReviews: reviews.length,
        profileStatus: profileRes.data?.status || 'pending',
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <footer className="bg-zinc-950 text-zinc-200 border-t border-zinc-800/60 font-sans tracking-tight">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Grid Logic: grid-cols-2 for mobile/tablet wrapping, lg:grid-cols-5 for desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Column: Spans full width (2 columns) on mobile, 2 columns on desktop */}
          <div className="col-span-2 lg:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <Link to="/dashboard" className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90">
                <Scale className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="font-serif text-lg font-bold tracking-wider text-white">LEGALMATE</span>
              </Link>
              <p className="mt-3 text-xs text-zinc-400 leading-relaxed max-w-sm">
                Grow your legal practice with LegalMate. Connect with clients seeking expert legal advice via chat, audio, or video consultations.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <a href="mailto:insanegem142012@gmail.com" className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white transition-colors w-fit">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                insanegem142012@gmail.com
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
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3.5 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-zinc-500" /> Personal links
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/lawyer/dashboard", label: "Dashboard" },
                { to: "/lawyer/manage-account", label: "Profile Settings" },
                { to: "/lawyer/categories", label: "Practice Areas" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-zinc-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3.5 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-zinc-500" /> Resources
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/lawyer/legal-guides", label: "Legal Guides" },
                { to: "/lawyer/how-it-works", label: "How It Works" },
                { to: "/lawyer/legal-aid", label: "Legal Aid Info" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-zinc-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3.5 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-zinc-500" /> Support
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/lawyer/help", label: "Help Center" },
                { to: "/lawyer/faq", label: "FAQs" },
                { to: "/lawyer/contact", label: "Contact Us" },
                { to: "/lawyer/privacy", label: "Privacy Policy" },
                { to: "/lawyer/terms", label: "Terms of Service" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-zinc-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-900 bg-zinc-950/50">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 text-center sm:text-left">
              © {currentYear} LEGALMATE. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                { href: "https://facebook.com", icon: Facebook },
                { href: "https://twitter.com", icon: Twitter },
                { href: "https://linkedin.com", icon: Linkedin },
                { href: "https://instagram.com", icon: Instagram }
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-900 rounded-md">
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};