

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Scale, Menu, X, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { NavDropdown } from './NavDropdown';
import { MobileNavAccordion } from './MobileNavAccordion';
import { navMenuConfig } from './navMenuConfig';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';



export interface NavMenuItem {
  label: string;
  href: string;
  description?: string;
}
export interface NavMenuSection {
  title: string;
  items: NavMenuItem[];
}


export const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'lawyer':
        return '/lawyer/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] 
    bg-background/70 backdrop-blur-xl border-b border-border/50 
    shadow-sm transition-all duration-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/vakeelgologo.png" alt="LEGALMATE" className="h-12 w-12 object-contain" />
            <span className="font-['Playfair_Display'] text-2xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-all duration-300">
              VakeelGo
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-2">
            {navMenuConfig.map((section) => (
              <NavDropdown key={section.title} section={section} />
            ))}

            {role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-all"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-3">

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full px-4 hover:bg-primary/10 transition-all"
                  >
                    <User className="h-4 w-4" />
                    Account
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52 bg-popover">
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>

                <Button
                  size="sm"
                  className="rounded-full px-5 shadow-md hover:shadow-lg transition-all"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-14 left-0 right-0 z-[99] 
          bg-background border-t border-border 
          animate-in fade-in slide-in-from-top-2 duration-200 
          max-h-[calc(100vh-3.5rem)] overflow-y-auto shadow-xl">

            <div className="px-4 py-4 space-y-6">

              {/* NAV SECTIONS */}
              <MobileNavAccordion
                sections={navMenuConfig}
                onNavigate={() => setMobileMenuOpen(false)}
              />

              {/* ADMIN */}
              {role === 'admin' && (
                <button
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all"
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Admin Dashboard</span>
                </button>
              )}

              {/* AUTH */}
              <div className="pt-4 border-t border-border space-y-2">
                {user ? (
                  <>
                    <button
                      className="w-full px-4 py-3 rounded-xl hover:bg-secondary text-left"
                      onClick={() => {
                        navigate(getDashboardLink());
                        setMobileMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </button>

                    <button
                      className="w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 text-left"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="w-full px-4 py-3 rounded-xl hover:bg-secondary text-left"
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </button>

                    <button
                      className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground text-left"
                      onClick={() => {
                        navigate('/signup');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

