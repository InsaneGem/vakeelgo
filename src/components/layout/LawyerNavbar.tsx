// import { Link, useNavigate, useLocation } from 'react-router-dom';

// import { Button } from '@/components/ui/button';
// import { useAuth } from '@/contexts/AuthContext';
// import { useEffect } from 'react';
// import {
//   Scale, Menu, X, User, LogOut, ChevronDown,
//   LayoutDashboard, DollarSign, MessageSquare, Star, Clock,
//   //   Settings, 
//   FileText, Bell, Briefcase, Shield, BookOpen,
//   Gavel, HelpCircle, Phone, Video, UserCheck
// } from 'lucide-react';
// import { useState } from 'react';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   DropdownMenuLabel,
//   DropdownMenuGroup,
// } from '@/components/ui/dropdown-menu';
// import { Badge } from '@/components/ui/badge';
// import { cn } from '@/lib/utils';



// export const LawyerNavbar = () => {
//   const { user, signOut } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const handleSignOut = async () => {
//     await signOut();
//     navigate('/');
//   };
//   useEffect(() => {
//     if (mobileMenuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'auto';
//     }

//     return () => {
//       document.body.style.overflow = 'auto';
//     };
//   }, [mobileMenuOpen]);

//   const isActive = (path: string) => location.pathname === path;

//   const navLinkClass = (path: string) =>
//     cn(
//       'text-sm font-medium transition-colors underline-animation',
//       isActive(path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
//     );

//   return (

//     <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-b border-border">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/lawyer/dashboard" className="flex items-center gap-2">
//             <Scale className="h-8 w-8" />
//             <div className="flex flex-col">
//               <span className="font-serif text-xl font-semibold tracking-tight leading-none">LEGALMATE</span>
//               <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Lawyer Portal</span>
//             </div>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden lg:flex items-center gap-1">
//             {/* Dashboard Link */}
//             <Link to="/lawyer/dashboard" className={cn(navLinkClass('/lawyer/dashboard'), 'px-3 py-2')}>
//               Dashboard
//             </Link>

//             {/* My Practice Dropdown */}
//             <DropdownMenu>
//               <DropdownMenuTrigger className={cn('flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none')}>
//                 My Practice
//                 <ChevronDown className="h-3.5 w-3.5" />
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="start" className="w-56 bg-popover">
//                 <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Practice Management</DropdownMenuLabel>
//                 <DropdownMenuItem onClick={() => navigate('#')} className="gap-2 cursor-pointer">
//                   <MessageSquare className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Consultations</p>
//                     <p className="text-xs text-muted-foreground">View all client sessions</p>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => navigate('/lawyer/pending-requests')} className="gap-2 cursor-pointer">
//                   <Clock className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Pending Requests</p>
//                     <p className="text-xs text-muted-foreground">Accept or decline requests</p>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Communication</DropdownMenuLabel>
//                 <DropdownMenuItem onClick={() => navigate('#')} className="gap-2 cursor-pointer">
//                   <Video className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Video Consultations</p>
//                     <p className="text-xs text-muted-foreground">Face-to-face with clients</p>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => navigate('#')} className="gap-2 cursor-pointer">
//                   <Phone className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Audio Consultations</p>
//                     <p className="text-xs text-muted-foreground">Voice calls with clients</p>
//                   </div>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             {/* Financials Dropdown */}
//             <DropdownMenu>
//               <DropdownMenuTrigger className={cn('flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none')}>
//                 Financials
//                 <ChevronDown className="h-3.5 w-3.5" />
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="start" className="w-56 bg-popover">
//                 <DropdownMenuItem onClick={() => navigate('/lawyer/earnings')} className="gap-2 cursor-pointer">
//                   <DollarSign className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Earnings & Wallet</p>
//                     <p className="text-xs text-muted-foreground">Balance & transaction history</p>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => navigate('/lawyer/rating')} className="gap-2 cursor-pointer">
//                   <Star className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Ratings & Reviews</p>
//                     <p className="text-xs text-muted-foreground">Client feedback & scores</p>
//                   </div>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             {/* Resources Dropdown */}
//             <DropdownMenu>
//               <DropdownMenuTrigger className={cn('flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none')}>
//                 Resources
//                 <ChevronDown className="h-3.5 w-3.5" />
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="start" className="w-56 bg-popover">
//                 <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/lawyer/profile-setup')}>
//                   <FileText className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Profile Setup</p>
//                     <p className="text-xs text-muted-foreground">Complete your onboarding</p>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem className="gap-2 cursor-pointer">
//                   <BookOpen className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Knowledge Base</p>
//                     <p className="text-xs text-muted-foreground">Guides & legal resources</p>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem className="gap-2 cursor-pointer">
//                   <Gavel className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Legal Updates</p>
//                     <p className="text-xs text-muted-foreground">Latest case laws & amendments</p>
//                   </div>
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem className="gap-2 cursor-pointer">
//                   <HelpCircle className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Help & Support</p>
//                     <p className="text-xs text-muted-foreground">Get platform assistance</p>
//                   </div>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           {/* Right Section */}
//           <div className="hidden lg:flex items-center gap-3">
//             {/* Account Dropdown */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm" className="gap-2">
//                   <User className="h-4 w-4" />
//                   My Account
//                   <ChevronDown className="h-3.5 w-3.5" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-56 bg-popover">
//                 <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Account</DropdownMenuLabel>
//                 <DropdownMenuItem onClick={() => navigate('/lawyer/manage-account')} className="gap-2 cursor-pointer">
//                   <UserCheck className="h-4 w-4 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">Manage Account</p>
//                     <p className="text-xs text-muted-foreground">Profile & verification</p>
//                   </div>
//                 </DropdownMenuItem>

//                 <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive">
//                   <LogOut className="h-4 w-4" />
//                   Sign Out
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="lg:hidden p-2"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <>
//             {/* Overlay (locks background + click to close) */}
//             <div
//               className="fixed inset-0 bg-black/40 z-40"
//               onClick={() => setMobileMenuOpen(false)}
//             />

//             {/* Mobile Menu */}
//             <div className="fixed top-[84px] left-0 right-0 z-50 bg-background border-t border-border animate-fade-in">
//               <div className="max-h-[calc(100vh-84px)] overflow-y-auto no-scrollbar">
//                 <div className="flex flex-col gap-1 px-2 pb-4">

//                   {/* Dashboard */}
//                   <button
//                     className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
//                     onClick={() => { navigate('/lawyer/dashboard'); setMobileMenuOpen(false); }}
//                   >
//                     <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
//                     <span className="font-medium text-sm">Dashboard</span>
//                   </button>

//                   {/* Practice Section */}
//                   <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Practice</p>

//                   <button
//                     className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
//                     onClick={() => { navigate('#'); setMobileMenuOpen(false); }}
//                   >
//                     <MessageSquare className="h-5 w-5 text-muted-foreground" />
//                     <span className="text-sm">Consultations</span>
//                   </button>

//                   <button
//                     className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
//                     onClick={() => { navigate('/lawyer/pending-requests'); setMobileMenuOpen(false); }}
//                   >
//                     <Clock className="h-5 w-5 text-muted-foreground" />
//                     <span className="text-sm">Pending Requests</span>
//                   </button>

//                   {/* Financials Section */}
//                   <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financials</p>

//                   <button
//                     className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
//                     onClick={() => { navigate('/lawyer/earnings'); setMobileMenuOpen(false); }}
//                   >
//                     <DollarSign className="h-5 w-5 text-muted-foreground" />
//                     <span className="text-sm">Earnings & Wallet</span>
//                   </button>

//                   <button
//                     className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
//                     onClick={() => { navigate('/lawyer/rating'); setMobileMenuOpen(false); }}
//                   >
//                     <Star className="h-5 w-5 text-muted-foreground" />
//                     <span className="text-sm">Ratings & Reviews</span>
//                   </button>

//                   {/* Resources Section */}
//                   <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</p>

//                   <button
//                     className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
//                     onClick={() => { navigate('/lawyer/profile-setup'); setMobileMenuOpen(false); }}
//                   >
//                     <FileText className="h-5 w-5 text-muted-foreground" />
//                     <span className="text-sm">Profile Setup</span>
//                   </button>

//                   <button className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left">
//                     <BookOpen className="h-5 w-5 text-muted-foreground" />
//                     <span className="text-sm">Knowledge Base</span>
//                   </button>

//                   <button className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left">
//                     <Gavel className="h-5 w-5 text-muted-foreground" />
//                     <span className="text-sm">Legal Updates</span>
//                   </button>

//                   {/* Account Section */}
//                   <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
//                     <Button
//                       variant="outline"
//                       className="gap-2 justify-start"
//                       onClick={() => { navigate('/lawyer/manage-account'); setMobileMenuOpen(false); }}
//                     >
//                       <UserCheck className="h-4 w-4" />
//                       Manage Account
//                     </Button>

//                     <Button
//                       variant="ghost"
//                       className="gap-2 justify-start text-destructive"
//                       onClick={handleSignOut}
//                     >
//                       <LogOut className="h-4 w-4" />
//                       Sign Out
//                     </Button>
//                   </div>

//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// };

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import {
  Scale, Menu, X, User, LogOut, ChevronDown,
  LayoutDashboard, DollarSign, MessageSquare, Star, Clock,
  FileText, Bell, Briefcase, Shield, BookOpen,
  Gavel, HelpCircle, Phone, Video, UserCheck
} from 'lucide-react';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const LawyerNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    cn(
      'text-sm font-medium transition-colors underline-animation',
      isActive(path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    );

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/lawyer/dashboard" className="flex items-center gap-2">
            <Scale className="h-8 w-8" />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-semibold tracking-tight leading-none">LEGALMATE</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Lawyer Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Dashboard Link */}
            <Link to="/lawyer/dashboard" className={cn(navLinkClass('/lawyer/dashboard'), 'px-3 py-2')}>
              Dashboard
            </Link>

            {/* My Practice Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn('flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none')}>
                My Practice
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              {/* Added z-[110], mt-2, and shadow layout */}
              <DropdownMenuContent align="start" className="w-56 bg-popover z-[110] mt-2 shadow-lg">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Practice Management</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('#')} className="gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Consultations</p>
                    <p className="text-xs text-muted-foreground">View all client sessions</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/lawyer/pending-requests')} className="gap-2 cursor-pointer">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pending Requests</p>
                    <p className="text-xs text-muted-foreground">Accept or decline requests</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Communication</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('#')} className="gap-2 cursor-pointer">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Video Consultations</p>
                    <p className="text-xs text-muted-foreground">Face-to-face with clients</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('#')} className="gap-2 cursor-pointer">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Audio Consultations</p>
                    <p className="text-xs text-muted-foreground">Voice calls with clients</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Financials Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn('flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none')}>
                Financials
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              {/* Added z-[110], mt-2, and shadow layout */}
              <DropdownMenuContent align="start" className="w-56 bg-popover z-[110] mt-2 shadow-lg">
                <DropdownMenuItem onClick={() => navigate('/lawyer/earnings')} className="gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Earnings & Wallet</p>
                    <p className="text-xs text-muted-foreground">Balance & transaction history</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/lawyer/rating')} className="gap-2 cursor-pointer">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Ratings & Reviews</p>
                    <p className="text-xs text-muted-foreground">Client feedback & scores</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn('flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none')}>
                Resources
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              {/* Added z-[110], mt-2, and shadow layout */}
              <DropdownMenuContent align="start" className="w-56 bg-popover z-[110] mt-2 shadow-lg">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/lawyer/profile-setup')}>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Profile Setup</p>
                    <p className="text-xs text-muted-foreground">Complete your onboarding</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Knowledge Base</p>
                    <p className="text-xs text-muted-foreground">Guides & legal resources</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Legal Updates</p>
                    <p className="text-xs text-muted-foreground">Latest case laws & amendments</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Help & Support</p>
                    <p className="text-xs text-muted-foreground">Get platform assistance</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  My Account
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              {/* Added z-[110], mt-2, and shadow layout */}
              <DropdownMenuContent align="end" className="w-56 bg-popover z-[110] mt-2 shadow-lg border border-border">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/lawyer/manage-account')} className="gap-2 cursor-pointer">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Manage Account</p>
                    <p className="text-xs text-muted-foreground">Profile & verification</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className="fixed top-[84px] left-0 right-0 z-50 bg-background border-t border-border animate-fade-in">
              <div className="max-h-[calc(100vh-84px)] overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-1 px-2 pb-4">

                  {/* Dashboard */}
                  <button
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    onClick={() => { navigate('/lawyer/dashboard'); setMobileMenuOpen(false); }}
                  >
                    <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-sm">Dashboard</span>
                  </button>

                  {/* Practice Section */}
                  <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Practice</p>

                  <button
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    onClick={() => { navigate('#'); setMobileMenuOpen(false); }}
                  >
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Consultations</span>
                  </button>

                  <button
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    onClick={() => { navigate('/lawyer/pending-requests'); setMobileMenuOpen(false); }}
                  >
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Pending Requests</span>
                  </button>

                  {/* Financials Section */}
                  <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financials</p>

                  <button
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    onClick={() => { navigate('/lawyer/earnings'); setMobileMenuOpen(false); }}
                  >
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Earnings & Wallet</span>
                  </button>

                  <button
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    onClick={() => { navigate('/lawyer/rating'); setMobileMenuOpen(false); }}
                  >
                    <Star className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Ratings & Reviews</span>
                  </button>

                  {/* Resources Section */}
                  <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</p>

                  <button
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    onClick={() => { navigate('/lawyer/profile-setup'); setMobileMenuOpen(false); }}
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Profile Setup</span>
                  </button>

                  <button className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Knowledge Base</span>
                  </button>

                  <button className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left">
                    <Gavel className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Legal Updates</span>
                  </button>

                  {/* Account Section */}
                  <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                    <Button
                      variant="outline"
                      className="gap-2 justify-start"
                      onClick={() => { navigate('/lawyer/manage-account'); setMobileMenuOpen(false); }}
                    >
                      <UserCheck className="h-4 w-4" />
                      Manage Account
                    </Button>

                    <Button
                      variant="ghost"
                      className="gap-2 justify-start text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};