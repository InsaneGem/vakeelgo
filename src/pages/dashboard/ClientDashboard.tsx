import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';

import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dashboardHeroBg from '@/assets/Client-lawyer-Header.jpg';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Wallet, MessageSquare, Clock, Plus, History, User, Video, Phone,
  TrendingUp, Calendar, ArrowRight, Zap, Shield, Activity, Settings,
  Search, Users, Star, Heart, FileVideo,
  Lock,
  CreditCard,
  BadgeCheck,
  Award,
  Globe,
  Eye,
  ArrowDownLeft, ArrowUpRight, FileText,
  Currency,
  IndianRupee, CheckCircle, Play, XCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LawyerCard } from '@/components/lawyers/LawyerCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatLawyerName } from '@/lib/lawyer-utils';
import Consultation from './../Consultation';
import { initiateRazorpayPayment } from '@/lib/razorpay';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { seeMoreButtonStyle, smallCardStyle, transactionCardStyle, lawyerCardStyle } from '@/lib/buttonStyles';


interface ConsultationWithLawyer {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  total_amount: number | null;
  ended_at?: string | null;
  started_at: string | null;
  duration_minutes: number | null;
  lawyer_id: string;
  agenda?: string | null;
  payment_status?: string | null;
  lawyer_profile?: {
    bio: string | null;
    specializations: string[] | null;
    rating: number | null;

  };
  lawyer_name?: string;
  lawyer_avatar?: string | null;
}
interface TransactionRecord {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

interface LawyerWithProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  price_per_minute: number | null;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  status: string | null;
  full_name?: string;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  is_busy?: boolean | null;
}

// Helper to strip out everything from "Issue Details:" onward
const cleanAgendaForDisplay = (fullAgenda: string | null): string => {
  if (!fullAgenda) return 'General Consultation';

  // Splits the string at 'Issue Details:' (case-insensitive)
  const parts = fullAgenda.split(/Issue Details:/i);

  // Returns only the first part containing the categories, neatly trimmed
  return parts[0].trim();
};

const ClientDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [consultations, setConsultations] = useState<ConsultationWithLawyer[]>([]);
  const [totalConsultations, setTotalConsultations] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [lawyers, setLawyers] = useState<LawyerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [payingConsultationId, setPayingConsultationId] = useState<string | null>(null);
  const [recordingsCount, setRecordingsCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [showMore, setShowMore] = useState({
    active: false,
    accepted: false,
    pending: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchDashboardData();

      // Set up realtime subscription for consultations
      const consultationsChannel = supabase
        .channel('client-consultations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'consultations',
            filter: `client_id=eq.${user.id}`,
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      // Set up realtime subscription for lawyer availability
      const lawyersChannel = supabase
        .channel('lawyer-availability-client')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'lawyer_profiles',
          },
          () => {
            fetchLawyers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(consultationsChannel);
        supabase.removeChannel(lawyersChannel);
      };
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user) return;

    await Promise.all([
      fetchProfile(),
      fetchWallet(),
      fetchConsultations(),
      fetchLawyers(),
      fetchTransactions(),
      fetchRecordingsCount(),
    ]);

    setLoading(false);
  };
  const fetchRecordingsCount = async () => {
    if (!user) return;
    const { data: completedConsults } = await supabase
      .from('consultations')
      .select('id')
      .eq('client_id', user.id)
      .eq('status', 'completed');
    setCompletedCount(completedConsults?.length || 0);
    if (!completedConsults || completedConsults.length === 0) {
      setRecordingsCount(0);
      return;
    }
    const ids = completedConsults.map(c => c.id);
    const { count } = await supabase
      .from('call_recordings')
      .select('id', { count: 'exact', head: true })
      .in('consultation_id', ids);
    setRecordingsCount(count || 0);
  };
  const fetchProfile = async () => {
    if (!user) return;
    const { data: profileData } = await supabase
      .from('profiles')
      // .select('full_name')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    if (profileData) setProfile(profileData);
  };
  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    totalSpent: consultations.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.total_amount || 0), 0),
  };
  const fetchWallet = async () => {
    if (!user) return;
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    if (walletData) {
      setWalletBalance(Number(walletData.balance) || 0);
    }
  };
  const fetchTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('transactions')
      .select('id, type, amount, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setTransactions(data || []);
  };
  const handleRazorpayPayment = async (consultationId: string) => {
    setPayingConsultationId(consultationId);
    await initiateRazorpayPayment({
      consultationId,
      onSuccess: (id) => {
        toast({
          title: '✅ Payment Successful!',
          description: 'Consultation is now active. Redirecting...',
        });
        setPayingConsultationId(null);
        fetchDashboardData();
        setTimeout(() => navigate(`/consultation/${id}`), 1500);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: error,
        });
        setPayingConsultationId(null);
      },
    });
  };
  const fetchConsultations = async () => {
    if (!user) return;

    // 🔥 Get TOTAL COUNT (separate query)
    const { count } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id);

    if (count !== null) {
      setTotalConsultations(count);
    }

    // 🔥 Fetch latest consultations for UI (keep limit for cards)
    const { data: consultationsData } = await supabase
      .from('consultations')
      .select('id, type, status, created_at, total_amount, lawyer_id, started_at, duration_minutes, agenda, payment_status')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (consultationsData && consultationsData.length > 0) {
      const lawyerIds = [...new Set(consultationsData.map(c => c.lawyer_id))];

      const { data: lawyerProfiles } = await supabase
        .from('lawyer_profiles')
        .select('user_id, bio, specializations, rating')
        .in('user_id', lawyerIds);

      const { data: lawyerNames } = await supabase
        .from('profiles')
        .select('id, full_name,avatar_url')
        .in('id', lawyerIds);

      const enrichedConsultations = consultationsData.map(consultation => {
        const lawyerProfile = lawyerProfiles?.find(lp => lp.user_id === consultation.lawyer_id);
        const lawyerName = lawyerNames?.find(ln => ln.id === consultation.lawyer_id);
        return {
          ...consultation,
          lawyer_profile: lawyerProfile || undefined,
          lawyer_name: formatLawyerName(lawyerName?.full_name),
          lawyer_avatar: lawyerName?.avatar_url || null
        };
      });

      setConsultations(enrichedConsultations);
    } else {
      setConsultations([]);
    }
  };


  const fetchLawyers = async () => {
    const { data: lawyerData, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('status', 'approved')
      .order('is_available', { ascending: false })
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching lawyers:', error);
      return;
    }

    if (lawyerData && lawyerData.length > 0) {
      const userIds = lawyerData.map(l => l.user_id);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, date_of_birth')
        .in('id', userIds);

      const enrichedLawyers = lawyerData.map(lawyer => {
        const profile = profilesData?.find(p => p.id === lawyer.user_id);
        return {
          ...lawyer,

          full_name: formatLawyerName(profile?.full_name),
          avatar_url: profile?.avatar_url,
          date_of_birth: profile?.date_of_birth,

        };
      });

      setLawyers(enrichedLawyers as LawyerWithProfile[]);
    } else {
      setLawyers([]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { variant: 'default' as const, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle className="h-3 w-3" /> };
      case 'active': return { variant: 'secondary' as const, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse', icon: <Play className="h-3 w-3" /> };
      case 'pending': return { variant: 'outline' as const, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Clock className="h-3 w-3" /> };
      default: return { variant: 'destructive' as const, className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <XCircle className="h-3 w-3" /> };
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    const specializations = lawyer.specializations?.join(' ').toLowerCase() || '';
    const lawyerName = lawyer.full_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return !query || specializations.includes(query) || lawyerName.includes(query);
  });

  const onlineLawyers = filteredLawyers.filter(l => l.is_available);
  const offlineLawyers = filteredLawyers.filter(l => !l.is_available);

  const activeConsultations = consultations.filter(c => c.status === 'active');
  const pendingConsultations = consultations.filter(c => c.status === 'pending');
  // Consultations accepted by lawyer but not yet paid
  const acceptedUnpaid = consultations.filter(c => c.status === 'active' && c.payment_status === 'unpaid');

  if (authLoading || loading) {
    return (

      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-2" />
            <Skeleton className="h-6 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>

      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-2">

          {/* Header Section */}
          <div
            className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between
                   mb-10 rounded-2xl p-6 sm:p-8 lg:p-10 overflow-hidden border border-border
               min-h-[280px] sm:min-h-[340px] lg:min-h-[400px] bg-black"
            style={{
              backgroundImage: `url(${dashboardHeroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/45 sm:bg-black/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 w-full">

              {/* LEFT SIDE */}
              <div className="flex flex-col text-sm text-gray-300 max-w-xl">

                {/* Avatar + Greeting */}
                <div className="flex items-center gap-4 mb-4">

                  <Avatar className="h-16 w-16 sm:h-18 sm:w-18 lg:h-20 lg:w-20 ring-2 ring-white/20 shadow-lg">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      alt={profile?.full_name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-7 w-7" />
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm text-gray-300">
                      Welcome Back
                    </p>

                    <h1 className="font-serif text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      {profile?.full_name || "Client"}
                    </h1>

                    <p className="text-xs text-gray-200 mt-1">
                      Manage your legal consultations and connect with trusted lawyers
                    </p>
                  </div>
                </div>

                {/* Status badges */}


                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">

                  <div className="flex items-center gap-2 text-white/90">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Real-time Sync</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/90">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm">Secure Platform</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/90">
                    <BadgeCheck className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">Verified Account</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{new Date().toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/90">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">Secure Payment</span>
                  </div>


                  <div className="flex items-center gap-2 text-white/90">
                    <BadgeCheck className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">Licensed Lawyer</span>
                  </div>

                </div>

                {/* Platform description */}
                <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                  Your secure peer-to-peer platform to connect with verified lawyers,
                  manage legal consultations, track cases, and store important legal
                  documents safely.
                </p>

              </div>

            </div>

          </div>

          {/* ****************************************************************** */}



          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">

            {/* Transaction */}
            <Card
              onClick={() => navigate("/dashboard/transactions")}
              className={cn(transactionCardStyle)}>
              {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent opacity-90" /> */}
              <CardContent className="relative p-3 sm:p-5  h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm opacity-80 font-medium">Transactions</p>
                    <p className="text-[10px] opacity-70"> • Track your payment history</p>
                    <p className="text-[10px] opacity-70"> • Report issues</p>


                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card
              onClick={() => navigate('/client/active-sessions')}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">

                        {activeConsultations.length > 0 && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                        )}

                        <span>Active Session</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {activeConsultations.length}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      In progress now
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      • Lawyers currently assisting clients
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Real-time session tracking
                    </p>

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Consultations */}
            <Card
              onClick={() => navigate("/consultation-history")}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                        <span>Consultations</span>
                      </div>
                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {totalConsultations}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      All time
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      • Includes completed & active sessions
                    </p>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Consultation History
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Lawyers */}
            <Card
              onClick={() => navigate("/lawyers")}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                        <span>Available Lawyers</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {onlineLawyers.length}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3 text-emerald-500" />
                      Online now
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      • Verified | 24/7 Support
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Updated in real-time
                    </p>

                  </div>


                </div>
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card
              onClick={() => navigate('/dashboard/processing')}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                        {pendingConsultations.length > 0 && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                          </span>
                        )}
                        <span>Processing</span>
                      </div>
                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {pendingConsultations.length}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      Awating for response
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Lawyer consultation requests pending
                    </p>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      Accept or decline in real-time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accepted — Complete Payment */}
            <Card
              onClick={() => navigate("/dashboard/payments")}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">

                        {acceptedUnpaid.length > 0 && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                          </span>
                        )}

                        <span>Payment</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {acceptedUnpaid.length}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-green-500" />
                      Secure and Trusted
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      • Proceed with the payment, Lawyer is waiting
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      Click to know more.
                    </p>

                  </div>


                </div>
              </CardContent>
            </Card>

            {/* Recordings */}

            <Card
              onClick={() => navigate('/dashboard/recordings')}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex-1 space-y-1">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                        <span>Recordings</span>
                      </div>

                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {recordingsCount}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3 text-amber-500" />
                      Saved Recordings
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Check All Your recordings
                    </p>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Chat, Video, Audio
                    </p>

                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {/* Accepted - Complete Payment */}
            {acceptedUnpaid.length > 0 && (
              <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-sm">

                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    Payment Pending
                  </CardTitle>

                  <CardDescription className="text-xs">
                    Lawyer accepted request
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-3 pb-3">

                  {(() => {

                    const isMobile = window.innerWidth < 640
                    const limit = isMobile ? 1 : 2

                    const visible = showMore.accepted
                      ? acceptedUnpaid
                      : acceptedUnpaid.slice(0, limit)

                    const remaining = acceptedUnpaid.length - limit

                    return (
                      <>

                        <div className="divide-y">

                          {visible.map((c) => (

                            <div
                              key={c.id}
                              className="flex items-center justify-between py-2 gap-2 hover:bg-emerald-500/5 rounded-md px-1"
                            >

                              <div className="flex items-center gap-2 min-w-0">

                                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-emerald-600" />
                                </div>

                                <div className="min-w-0">

                                  <p className="text-xs font-medium truncate">
                                    {c.lawyer_name}
                                  </p>

                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    {getTypeIcon(c.type)}
                                    <span className="capitalize">{c.type}</span>
                                    <span>₹{c.total_amount?.toFixed(0)}</span>
                                  </div>

                                </div>

                              </div>

                              <Button
                                size="sm"
                                className="h-7 text-xs px-2"
                                disabled={payingConsultationId === c.id}
                                onClick={() => handleRazorpayPayment(c.id)}
                              >
                                Pay
                              </Button>

                            </div>

                          ))}

                        </div>

                        {!showMore.accepted && remaining > 0 && (
                          <button
                            onClick={() => setShowMore(prev => ({ ...prev, accepted: true }))}
                            className="mt-2 text-xs text-emerald-600 hover:underline"
                          >
                            Show {remaining} more →
                          </button>
                        )}

                      </>
                    )

                  })()}

                </CardContent>
              </Card>
            )}





          </div>



          {/* Available Lawyers Section */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5" />
                  Available Lawyers
                </CardTitle>
                <CardDescription className="mt-1">
                  Book instantly via chat, call, or video
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Updates | Available {onlineLawyers.length} lawyer{onlineLawyers.length !== 1 ? 's' : ''} online
                </Badge>
              </div>
            </CardHeader>
            <CardContent>


              {filteredLawyers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No Lawyers Found</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? 'Try adjusting your search' : 'No lawyers are available at the moment'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Online Lawyers */}
                  {onlineLawyers.length > 0 && (
                    <div className="mb-8">

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {onlineLawyers.slice(0, 3).map((lawyer) => (
                          <LawyerCard
                            key={lawyer.id}
                            lawyer={lawyer}
                            showActions={true}
                            onBooking={fetchDashboardData}
                          />
                        ))}
                      </div>


                    </div>
                  )}
                </>
              )}
              {/* View All Button */}
              <div className="flex justify-center mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(seeMoreButtonStyle)}
                  onClick={() => navigate("/lawyers")}
                >
                  See More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>



          {/* Consultation History */}

          <Card className="border-0 shadow-lg overflow-hidden mb-12">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <History className="h-5 w-5" />
                  Consultation History
                </CardTitle>
                <CardDescription className="mt-1"> Review your previous consultations and track your legal discussions.</CardDescription>
              </div>
            </CardHeader>


            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Consultations Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    Start your first consultation with a verified legal professional today
                  </p>
                  <Button onClick={() => navigate('/lawyers')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Find a Lawyer
                  </Button>
                </div>
              ) : (
                <>
                  <div className={`grid gap-4 item-start
                     ${consultations.length === 1
                      ? "grid-cols-1 justify-items-center"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                  >

                    {consultations.slice(0, consultations.length === 1 ? 1 : 4).map((consultation) => {
                      const statusConfig = getStatusConfig(consultation.status);



                      return (
                        <div
                          key={consultation.id}
                          className={cn(lawyerCardStyle, "!h-auto !min-h-0 !max-h-fit")}

                          onClick={() => navigate(`/consultation/${consultation.id}`)}
                        >
                          {/* Status badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className={`${statusConfig.className} text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md gap-1 border shadow-3xs flex-shrink-0`}>
                              {consultation.status}
                              {/* {statusConfig.icon} */}
                            </Badge>
                          </div>

                          {/* Header */}
                          <div className="p-3 pb-2">
                            <div className="flex gap-3">
                              <Avatar className="w-12 h-12 shrink-0 border-2 border-background shadow-lg rounded-xl">
                                <AvatarImage
                                  src={consultation.lawyer_avatar || undefined}
                                  alt={consultation.lawyer_name || 'Lawyer'}
                                  className="object-cover"
                                />

                                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-lg font-bold">
                                  {consultation.lawyer_name?.charAt(0).toUpperCase() || 'L'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0 pr-14">
                                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                  {consultation.lawyer_name}
                                </h3>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">
                                    {getTypeIcon(consultation.type)}
                                    <span className="text-[11px] font-medium capitalize">{consultation.type}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(consultation.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Agenda */}
                          <div className="mt-3 px-2 text-center w-full">
                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] mx-auto max-w-[90%] leading-relaxed">
                              <span className="font-medium text-foreground/80">Agenda:</span>{" "}
                              {cleanAgendaForDisplay(consultation.agenda).replace(/[\[\]]/g, "")}
                            </p>
                          </div>
                          {/* Footer */}
                          <div className="px-3 py-2 border-t border-border bg-secondary/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold">₹{consultation.total_amount?.toFixed(0) || '0'}</span>
                                <span className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md gap-1 border shadow-3xs flex-shrink-0">{consultation.status === 'cancelled' ? 'Not Paid' : 'Paid'} </span>
                                {statusConfig.icon}
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* View All Button */}
                  {consultations.length > 3 && (
                    <div className="flex justify-center mt-5">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(seeMoreButtonStyle)}
                        onClick={() => navigate("/consultation-history")}
                      >
                        See More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>


          {/* ***********************************************************************8 */}

          {/* ***********************************************************************8 */}

          {/* Platform Trust Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">

            {[
              { icon: Shield, value: '100%', label: 'Verified Lawyers', desc: 'All attorneys are bar-certified' },
              { icon: Lock, value: 'End-to-End', label: 'Encrypted Chats', desc: 'Your data stays private' },
              { icon: Award, value: '4.8/5', label: 'Client Rating', desc: 'Average satisfaction score' },
              { icon: Globe, value: '24/7', label: 'Always Available', desc: 'Legal help, any time' },
            ].map((item, i) => (
              <div
                key={i}
                className="
          group
          relative
          text-center
          p-4 sm:p-5 lg:p-6
          rounded-xl
          bg-card
          border
          border-border
          shadow-sm
          hover:shadow-lg
          hover:-translate-y-[2px]
          transition-all
          duration-300
          "
              >

                <div
                  className="
            w-10 h-10 sm:w-12 sm:h-12
            rounded-full
            bg-primary/10
            flex
            items-center
            justify-center
            mx-auto
            mb-3
            group-hover:scale-110
            transition
            "
                >
                  <item.icon className="h-5 w-5 text-primary" />
                </div>

                <p className="text-base sm:text-lg font-bold">
                  {item.value}
                </p>

                <p className="text-xs sm:text-sm font-semibold mt-1">
                  {item.label}
                </p>

                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                  {item.desc}
                </p>

              </div>
            ))}

          </div>

          {/* Why Clients Trust Us */}
          <div className="mb-8 rounded-2xl bg-primary text-primary-foreground p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Why Clients Trust LegalMate</h2>
              <p className="text-sm opacity-80 max-w-xl mx-auto">
                We bridge the gap between clients and qualified legal professionals, making expert legal advice accessible, affordable, and convenient for everyone.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Eye, title: 'Transparent Pricing', desc: 'No hidden fees. See lawyer rates upfront before you book. Pay only for the time you use during consultations.' },
                { icon: Shield, title: 'Verified Professionals', desc: 'Every lawyer on our platform is bar-certified and thoroughly vetted. Your case is in safe, qualified hands.' },
                { icon: Lock, title: 'Confidential & Secure', desc: 'Attorney-client privilege is honored. All communications are encrypted and your personal data is never shared.' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                  <item.icon className="h-5 w-5 mb-3 opacity-90" />
                  <h4 className="font-semibold text-sm mb-1.5">{item.title}</h4>
                  <p className="text-xs opacity-75 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout >
  );
};

export default ClientDashboard;
