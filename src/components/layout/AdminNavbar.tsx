
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
    Scale, Menu, X, User, LogOut, ChevronDown,
    LayoutDashboard, Wallet, MessageSquare, Search, Clock,
    Settings, FileText, Bell, Shield, BookOpen,
    HelpCircle, Heart, Briefcase, TrendingUp, History,
    Video, Phone, Globe, Award, AlertCircle, UserCheck, Building2, Star
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const AdminNavbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;
    const navLinkClass = (path: string) =>
        cn(
            'text-sm font-medium transition-colors underline-animation',
            isActive(path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        );

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link to="/admin/dashboard" className="flex items-center gap-2">
                        <Scale className="h-8 w-8" />
                        <div className="flex flex-col">
                            <span className="font-serif text-xl font-semibold tracking-tight leading-none">LEGALMATE</span>
                            <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
                                Admin Portal
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {/* Dashboard Link */}
                        <Link to="/admin/dashboard" className={cn(navLinkClass('/admin/dashboard'), 'px-3 py-2')}>
                            Dashboard
                        </Link>
                        <Link to="#" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                            Profile Database
                        </Link>






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
                            {/* CRITICAL FIX APPLIED HERE: Added z-[110] layer priority, shadow elevation, and top offset margin */}
                            <DropdownMenuContent align="end" className="w-56 bg-popover z-[110] mt-2 shadow-lg border border-border">
                                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Account</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigate('#')} className="gap-3 cursor-pointer">
                                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Manage Account</p>
                                        <p className="text-xs text-muted-foreground">Personal info & preferences</p>
                                    </div>
                                </DropdownMenuItem>


                                <DropdownMenuSeparator />
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
                    <div className="lg:hidden fixed top-14 left-0 right-0 z-[99] bg-background border-t border-border animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto shadow-xl">
                        <div className="h-full overflow-y-auto px-4 py-4 space-y-6">
                            {/* DASHBOARD */}
                            <div>
                                <button
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all"
                                    onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false); }}
                                >
                                    <LayoutDashboard className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-sm">Dashboard</span>
                                </button>
                            </div>

                            {/* ACCOUNT ACTIONS */}
                            <div className="pt-4 border-t border-border space-y-2">

                                <button
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                    onClick={() => {
                                        navigate('#');
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm">Manage Account</span>
                                </button>

                                <button
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                    onClick={() => {
                                        navigate('#');
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm">Profile Database</span>
                                </button>

                                <button
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="text-sm font-medium">Sign Out</span>
                                </button>

                            </div>

                            {/* FIND LEGAL HELP */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                                    Find Legal Help
                                </p>
                                <div className="space-y-1">
                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                        onClick={() => { navigate('/lawyers'); setMobileMenuOpen(false); }}
                                    >
                                        <Search className="h-5 w-5 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Browse Lawyers</p>
                                            <p className="text-xs text-muted-foreground">Find verified professionals</p>
                                        </div>
                                    </button>

                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                        onClick={() => { navigate('/lawyers?sort=top-rated'); setMobileMenuOpen(false); }}
                                    >
                                        <Award className="h-5 w-5 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Top Rated</p>
                                            <p className="text-xs text-muted-foreground">Best reviewed lawyers</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* MY CASES */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                                    My Cases
                                </p>
                                <div className="space-y-1">
                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                        onClick={() => { navigate('/consultation-history'); setMobileMenuOpen(false); }}
                                    >
                                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Consultations</p>
                                            <p className="text-xs text-muted-foreground">Chat, audio & video</p>
                                        </div>
                                    </button>

                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                        onClick={() => { navigate('/client/active-sessions'); setMobileMenuOpen(false); }}
                                    >
                                        <History className="h-5 w-5 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Active Sessions</p>
                                            <p className="text-xs text-muted-foreground">Ongoing consultations</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* LEGAL RESOURCES */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                                    Legal Resources
                                </p>
                                <div className="space-y-1">
                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                        onClick={() => { navigate('/client/know-your-rights'); setMobileMenuOpen(false); }}
                                    >
                                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm">Know Your Rights</span>
                                    </button>

                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                        onClick={() => { navigate('/client/legal-guides'); setMobileMenuOpen(false); }}
                                    >
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm">Legal Guides</span>
                                    </button>

                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-secondary transition-all"
                                        onClick={() => { navigate('/client/consumer-protection'); setMobileMenuOpen(false); }}
                                    >
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm">Consumer Protection</span>
                                    </button>
                                </div>
                            </div>


                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};