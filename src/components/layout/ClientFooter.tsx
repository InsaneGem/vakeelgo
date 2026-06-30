import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Wallet, BookOpen, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const ClientFooter = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-200 border-t border-zinc-800/60 font-sans tracking-tight">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Grid Logic:
          - Mobile (default): grid-cols-2 (2 columns)
          - Desktop (lg): grid-cols-5 (5 columns)
        */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Column: Spans full width on mobile/tablet, 2 units on desktop */}
          <div className="col-span-2 lg:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <Link to="/dashboard" className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90">
                <Scale className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="font-serif text-lg font-bold tracking-wider text-white">VakeelGo</span>
              </Link>
              <p className="mt-3 text-xs text-zinc-400 leading-relaxed max-w-sm">
                Your trusted legal consultation platform. Connect with verified lawyers for expert advice via chat, audio, or video.
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
              <Wallet className="h-3.5 w-3.5 text-zinc-500" /> My Account
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/manage-account", label: "Manage Account" },
                { to: "/lawyers", label: "Find Lawyers" },
                { to: "/client/categories", label: "Lawyer Categories" },
                { to: "/client/refund", label: "Refund Policy" }
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
                { to: "/client/know-your-rights", label: "Know Your Rights" },
                { to: "/client/legal-guides", label: "Legal Guides" },
                { to: "/client/legal-aid", label: "Free Legal Aid" },
                { to: "/client/consumer-protection", label: "Consumer Protection" },
                { to: "/client/legal-updates", label: "Legal Updates" }
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
                { to: "/client/help", label: "Help Center" },
                { to: "/client/faq", label: "FAQs" },
                { to: "/client/contact", label: "Contact Us" },
                { to: "/client/privacy", label: "Privacy Policy" },
                { to: "/client/terms", label: "Terms of Service" }
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

      <div className="border-t border-zinc-900 bg-zinc-950/50">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 text-center sm:text-left">
              © {currentYear} VakeelGo. All rights reserved.
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