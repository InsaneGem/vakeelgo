import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatLawyerName } from '@/lib/lawyer-utils';
import { calculateAge } from '@/lib/ageUtils';
import dashboardHeroBg from '@/assets/Client-lawyer-Header.jpg';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Wallet, MessageSquare, Clock, Star, User, Edit, Video, Phone,
  CheckCircle, XCircle, TrendingUp, Zap, Shield, Activity,
  DollarSign, Users, ArrowRight, AlertTriangle, Settings, History,
  Mail, Calendar,
  BadgeCheck,
  Scale,
  ChevronRight,
  CakeSlice,
  Verified,
  Bell, Timer, FileText,
  IndianRupee, Play, HelpCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { OnboardingAlert } from '@/components/dashboard/OnboardingAlert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import LawyerConsultations from './LawyerConsultations';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rejectButtonStyle, acceptButtonStyle, lawyerCardStyle, smallCardStyle, seeMoreButtonStyle, transactionCardStyle } from '@/lib/buttonStyles';

type BadgeItem = {
  label: string;
  icon: LucideIcon;
  show?: boolean;
  className?: string;
};

interface ConsultationWithClient {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_avatar?: string | null;
  client_dob?: string | null;
  total_amount?: number | null;
  ended_at: string | null;
  started_at: string | null;
  duration_minutes: number | null;
  agenda?: string | null;
  payment_status?: string | null;

}
const INACTIVITY_TIMEOUT_MS = 30000;
const LawyerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasOnlineBeforeInactiveRef = useRef(false);

  const [stats, setStats] = useState({
    walletBalance: 0,
    totalConsultations: 0,
    rating: 0,
    totalReviews: 0,
    isAvailable: false,
    status: 'pending',

  });
  // const isAvailableRef = useRef(false);
  const badgeItems: BadgeItem[] = [
    {
      label: "Real-time Sync",
      icon: Activity,
    },
    {
      label: "Verified Lawyer",
      icon: Shield,
      show: stats.status === 'approved',
    },
    {
      label: "Pending Approval",
      icon: Clock,
      show: stats.status === 'pending',
      className: "bg-indigo-100 text-red-700 border-indigo-200",
    },
    {
      label: "Application Not Approved",
      icon: XCircle,
      show: stats.status === 'rejected',
      className: "bg-indigo-100 text-red-700 border-indigo-200",
    },
    {
      label: new Date().toLocaleDateString(),
      icon: Calendar,
    },
    {
      label: "Legal Professional",
      icon: Scale,
    },
    {
      label: "Licensed Advocate",
      icon: BadgeCheck,
    },
  ];

  const [lawyerProfile, setLawyerProfile] = useState<{
    bio: string | null;
    specializations: string[] | null;
    bar_council_number: string | null;
    // price_per_minute: number | null;
    chat_price_per_minute: number | null;
    audio_price_per_minute: number | null;
    video_price_per_minute: number | null;
    languages: string[] | null;
  } | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [pendingConsultations, setPendingConsultations] = useState<ConsultationWithClient[]>([]);
  const [activeConsultations, setActiveConsultations] = useState<ConsultationWithClient[]>([]);
  const [completedConsultations, setCompletedConsultations] = useState<ConsultationWithClient[]>([]);
  const [cancelledConsultations, setCancelledConsultations] = useState<ConsultationWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalConsultations, setTotalConsultations] = useState<number>(0);


  // Calculate profile completion
  const { completionPercentage, missingFields } = useMemo(() => {
    if (!lawyerProfile) return { completionPercentage: 0, missingFields: ['All fields'] };

    const fields = [
      {
        key: 'bio',
        label: 'Professional Bio',
        check: (lawyerProfile.bio?.trim().length || 0) >= 50
      },
      {
        key: 'specializations',
        label: 'Specializations',
        check: (lawyerProfile.specializations?.length || 0) > 0
      },
      {
        key: 'bar_council_number',
        label: 'Bar Council Number',
        check: (lawyerProfile.bar_council_number?.trim().length || 0) > 0
      },

      {
        key: 'pricing',
        label: 'Pricing',
        check:
          lawyerProfile.chat_price_per_minute !== null && lawyerProfile.chat_price_per_minute >= 5 &&
          lawyerProfile.audio_price_per_minute !== null && lawyerProfile.audio_price_per_minute >= 5 &&
          lawyerProfile.video_price_per_minute !== null && lawyerProfile.video_price_per_minute >= 5,
      },
      {
        key: 'languages',
        label: 'Languages',
        check: (lawyerProfile.languages?.length || 0) > 0
      },
    ];

    const completed = fields.filter(f => f.check).length;
    const missing = fields.filter(f => !f.check).map(f => f.label);

    return {
      completionPercentage: Math.round((completed / fields.length) * 100),
      missingFields: missing,
    };
  }, [lawyerProfile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchDashboardData();

      // Set up realtime subscription for lawyer's consultations
      const channel = supabase
        .channel('lawyer-consultations-rt')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'consultations',
            filter: `lawyer_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as any;
            // If payment completed, notify lawyer and hard-redirect into the consultation page
            if (updated?.payment_status === 'paid' && updated?.status === 'active') {
              toast({
                title: '💰 Payment Received!',
                description: 'The client has completed payment. Consultation is now unlocked.',
              });

              const target = `/consultation/${updated.id}`;
              if (window.location.pathname !== target) {
                window.location.href = target;
              } else {
                window.location.reload();
              }
              return;
            }
            fetchDashboardData();
          }
        )
        .subscribe();

      // Real-time subscription for notifications
      const notificationChannel = supabase
        .channel('lawyer-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification = payload.new as { type: string; message: string };
            toast({
              title: '🔔 New Notification',
              description: notification.message || 'You have a new consultation request.',
            });
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(notificationChannel);
      };
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;

    const goOfflineIfInactive = async () => {

      console.log('TIMER FIRED');
      console.log('isAvailable =', stats.isAvailable);
      if (!isAvailableRef.current) return;

      wasOnlineBeforeInactiveRef.current = true;

      const { error } = await supabase
        .from('lawyer_profiles')
        .update({
          is_available: false,
          is_busy: false,
          auto_offline: true,
        })
        .eq('user_id', user.id);
      console.log('AUTO OFFLINE RESULT', error);

      if (!error) {
        setStats(prev => ({
          ...prev,
          isAvailable: false,
        }));
      }
    };

    const restoreOnlineIfNeeded = async () => {
      if (!wasOnlineBeforeInactiveRef.current) return;

      const { error } = await supabase
        .from('lawyer_profiles')
        .update({
          is_available: true,
          is_busy: false,
          auto_offline: false,
        })
        .eq('user_id', user.id);

      if (!error) {
        wasOnlineBeforeInactiveRef.current = false;

        setStats(prev => ({
          ...prev,
          isAvailable: true,
        }));
      }
    };

    const resetTimer = () => {
      console.log('RESET TIMER');
      restoreOnlineIfNeeded();

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(() => {
        goOfflineIfInactive();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'focus'
    ];

    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
    // }, [user, stats.isAvailable]);
  }, [user]);

  const isAvailableRef = useRef(false);

  useEffect(() => {
    isAvailableRef.current = stats.isAvailable;
  }, [stats.isAvailable]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      // .select('full_name')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);

    const { data: walletData } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
    const { data: lawyerProfileData } = await supabase.from('lawyer_profiles').select('*').eq('user_id', user.id).maybeSingle();

    // Fetch all consultations for this lawyer
    const { data: allConsultations } = await supabase
      .from('consultations')
      .select('id, type, created_at, client_id, status, duration_minutes, total_amount, started_at, agenda, payment_status, total_amount')
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false });


    const totalEarnings =
      allConsultations?.filter(c => c.status === 'completed').reduce(
        (sum, c) => sum + (c.total_amount || 0), 0) || 0;

    setStats({
      walletBalance: totalEarnings,
      totalConsultations: allConsultations?.length || 0,
      rating: Number(lawyerProfileData?.rating) || 0,
      totalReviews: lawyerProfileData?.total_reviews || 0,
      isAvailable: lawyerProfileData?.is_available || false,
      status: lawyerProfileData?.status || 'pending',
    });
    wasOnlineBeforeInactiveRef.current = !!lawyerProfileData?.auto_offline;

    // Set lawyer profile for completion calculation
    if (lawyerProfileData) {
      setLawyerProfile({
        bio: lawyerProfileData.bio,
        specializations: lawyerProfileData.specializations,
        bar_council_number: lawyerProfileData.bar_council_number,
        // price_per_minute: lawyerProfileData.price_per_minute,
        chat_price_per_minute: lawyerProfileData.chat_price_per_minute,
        audio_price_per_minute: lawyerProfileData.audio_price_per_minute,
        video_price_per_minute: lawyerProfileData.video_price_per_minute,
        languages: lawyerProfileData.languages,
      });
    }

    // Enrich consultations with client data
    if (allConsultations && allConsultations.length > 0) {
      const clientIds = [...new Set(allConsultations.map(c => c.client_id))];



      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, date_of_birth')
        .in('id', clientIds);

      const enrichConsultation = (consultation: any): ConsultationWithClient => {
        const clientProfile = clientProfiles?.find(cp => cp.id === consultation.client_id);
        return {
          ...consultation,
          client_name: clientProfile?.full_name || 'Client',
          client_email: clientProfile?.email || '',
          client_avatar: clientProfile?.avatar_url,
          client_dob: clientProfile?.date_of_birth,
        };
      };

      const enrichedConsultations = allConsultations.map(enrichConsultation);
      setPendingConsultations(enrichedConsultations.filter(c => c.status === 'pending'));
      setActiveConsultations(enrichedConsultations.filter(c => c.status === 'active'));
      setCompletedConsultations(enrichedConsultations.filter(c => c.status === 'completed'));
      setCancelledConsultations(enrichedConsultations.filter(c => c.status === 'cancelled'));
    } else {
      setPendingConsultations([]);
      setActiveConsultations([]);
      setCompletedConsultations([]);
      setCancelledConsultations([]);
    }

    setLoading(false);
  };


  const toggleAvailability = async () => {
    if (!user) return;



    const newStatus = !stats.isAvailable;

    const { error } = await supabase
      .from('lawyer_profiles')
      .update({
        is_available: newStatus,
        is_busy: false,
        auto_offline: false,
      })
      .eq('user_id', user.id);

    if (!error) {
      setStats(prev => ({
        ...prev,
        isAvailable: newStatus,
      }));

      toast({
        title: newStatus
          ? '✅ You are now online'
          : '⏸️ You are now offline'
      });
    }
  };

  const handleConsultation = async (consultationId: string, action: 'accept' | 'reject') => {
    const newStatus = action === 'accept' ? 'active' : 'cancelled';

    const { error } = await supabase
      .from('consultations')
      .update({
        status: newStatus,
        started_at: action === 'accept' ? new Date().toISOString() : null,
        // Keep payment_status as 'unpaid' so client gets prompted to pay via Razorpay
      })
      .eq('id', consultationId);

    if (!error) {
      toast({
        title: action === 'accept' ? '✅ Consultation accepted!' : '❌ Consultation declined',

        description: action === 'accept'
          ? 'The client will now be prompted to complete payment.'
          : 'The client has been notified.',
      });


      // 2. SET LAWYER BUSY
      const { error: lawyerError } = await supabase
        .from('lawyer_profiles')
        .update({
          is_busy: true,
          is_available: false
        })
        .eq('user_id', user?.id);

      // Dismiss incoming booking dialog if it matches
      if (action === 'accept') {
        navigate(`/consultation/${consultationId}`);
      }



      if (lawyerError) {
        console.error('Lawyer status update failed', lawyerError);
      }


      fetchDashboardData();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'audio': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  // Get unique clients who have booked consultations
  const parseAgenda = (agenda: string | null | undefined) => {
    if (!agenda) return { category: '', urgency: '', details: '' };
    const categoryMatch = agenda.match(/^\[(.+?)\]/);
    const urgencyMatch = agenda.match(/\]\s*\[(.+?)\]/);
    const details = agenda.replace(/^\[.+?\]\s*\[.+?\]\n?/, '');
    return {
      category: categoryMatch?.[1] || '',
      urgency: urgencyMatch?.[1] || '',
      details: details || agenda,
    };
  };


  // Group consultations by client
  const groupedClients = useMemo(() => {
    const all = [...pendingConsultations, ...activeConsultations, ...completedConsultations, ...cancelledConsultations];

    const map: Record<string, ConsultationWithClient[]> = {};

    all.forEach(c => {
      if (!map[c.client_id]) {
        map[c.client_id] = [];
      }
      map[c.client_id].push(c);
    });

    return map;
  }, [pendingConsultations, activeConsultations, completedConsultations, cancelledConsultations]);
  const consultations = useMemo(() => {
    return [...completedConsultations, ...cancelledConsultations]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [completedConsultations, cancelledConsultations]);


  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { className: 'bg-green-100 text-green-700 border-green-200 ', icon: <CheckCircle className="h-3 w-3" /> };
      case 'cancelled':
        return { className: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> };
      case 'active':
        return { className: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Play className="h-3 w-3" /> };
      case 'pending':
        return { className: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="h-3 w-3" /> };
      default:
        return { className: 'bg-gray-100 text-gray-700 border-gray-200', icon: <HelpCircle className="h-3 w-3" /> };
    }
  };


  // Limit max 3 consultations per client
  const ClientsToShow = useMemo(() => {
    const result: ConsultationWithClient[] = [];

    Object.values(groupedClients).forEach((consultations) => {
      result.push(...consultations.slice(0, 3));
    });

    // 🔥 SORT AGAIN BY LATEST
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [groupedClients]);



  if (authLoading || loading) {
    return (
      <LawyerLayout>
        {/* ──── Incoming Booking Real-Time Dialog ──── */}


        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-2" />
            <Skeleton className="h-6 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout>
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
                    {/* <p className="text-sm text-gray-300">Welcome Back</p> */}

                    <h1 className="font-serif text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      {formatLawyerName(profile?.full_name)}
                    </h1>

                    <p className="text-xs text-gray-200 mt-1">
                      Manage consultations, respond to client requests, and grow your legal practice
                    </p>
                  </div>

                </div>
                {/* **************************** */}

                {/* Status Badges */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">

                  {/* Always visible */}
                  <div className="flex items-center gap-2 text-white/90">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Real-time Sync</span>
                  </div>

                  {/* Dynamic Status */}
                  {stats.status === 'approved' && (
                    <div className="flex items-center gap-2 text-white/90">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}

                  {stats.status === 'pending' && (
                    <div className="flex items-center gap-2 text-white/90">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm">Pending Approval</span>
                    </div>
                  )}

                  {stats.status === 'rejected' && (
                    <div className="flex items-center gap-2 text-white/90">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm">Not Approved</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{new Date().toLocaleDateString()}</span>
                  </div>

                  {/* Static */}
                  <div className="flex items-center gap-2 text-white/90">
                    <Scale className="h-4 w-4" />
                    <span className="text-sm">Legal Professional</span>
                  </div>

                  <div className="flex items-center gap-2 text-white/90">
                    <BadgeCheck className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">Licensed</span>
                  </div>

                </div>


                {/* Platform description */}
                <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                  Your professional dashboard to manage client consultations, track legal
                  cases, securely communicate with clients, and provide trusted legal
                  services through the VakeelGo platform.
                </p>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col gap-4 lg:items-end">
                {/* Availability Toggle */}
                {stats.status === 'approved' && (
                  <div className="flex items-center justify-between gap-3 bg-white/10 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3  rounded-xl border border-white/20  shadow-lg transition-all duration-300  hover:bg-white/15 w-full sm:w-auto">

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">

                      <div
                        className={`relative flex h-3 w-3 ${stats.isAvailable ? "text-emerald-400" : "text-gray-400"
                          }`}
                      >
                        {stats.isAvailable && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-3 w-3 ${stats.isAvailable ? "bg-emerald-400" : "bg-gray-400"
                            }`}
                        ></span>
                      </div>

                      <span className="text-sm sm:text-base font-medium text-white transition-colors">
                        {stats.isAvailable ? "Available for Clients" : "Currently Offline"}
                      </span>

                    </div>

                    {/* Toggle Switch */}
                    <Switch
                      checked={stats.isAvailable}
                      onCheckedChange={toggleAvailability}
                      className="data-[state=checked]:bg-emerald-500 transition-all duration-300"
                    />

                  </div>
                )}

              </div>

            </div>
          </div>

          <OnboardingAlert
            status={stats.status}
            completionPercentage={completionPercentage}
            missingFields={missingFields}
          />



          {/* ********************************************************************* */}


          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">

            {/* Earnings */}
            <Card
              onClick={() => navigate('/lawyer/earnings')}
              className={cn(transactionCardStyle)}
            >
              {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent opacity-90" /> */}

              <CardContent className="relative p-3 sm:p-5 text-primary-foreground h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm opacity-80 font-medium">
                      Total Earnings
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold truncate">
                      ₹{stats.walletBalance}
                    </p>
                    <p className="text-[10px] sm:text-xs opacity-80 flex items-center gap-1">
                      <TrendingUp className="h-2.5 w-2.5" />
                      Check your Earning growth over time
                    </p>

                    {/* <p className="text-[10px] opacity-70">
                      Withdraw anytime to your bank
                    </p> */}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Active Sessions */}
            <Card
              onClick={() => navigate('/dashboard/lawyer-active-sessions')}
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
                      • Check Your ongoing Consultation
                    </p>

                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      • Real-time session tracking
                    </p>

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* lawyer Consultations */}
            <Card
              onClick={() => navigate("/lawyer/consultations")}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                        <span>All Consultations</span>
                      </div>
                      <span className="text-xl sm:text-3xl font-bold leading-none">

                        {stats.totalConsultations}

                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      All time
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      • Includes completed & active sessions
                    </p>
                    <p className="text-[10px] text-muted-foreground ">
                      • Consultation History
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Rating */}
            <Card
              onClick={() => navigate('/lawyer/rating')}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                        <span>Review</span>
                      </div>
                      <span className="text-xl sm:text-3xl font-bold leading-none">
                        {/* {stats.rating.toFixed(1)} */}
                        {stats.totalReviews}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      Client Review
                    </p>
                    <p className="text-[10px] text-muted-foreground ">
                      • Based on completed consultations
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      • Trusted legal professional rating
                    </p>
                  </div>
                </div>
              </CardContent>

            </Card>


            {/* Pending Requests */}
            <Card
              onClick={() => navigate('/lawyer/pending-requests')}
              className={cn(smallCardStyle)}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-center justify-between gap-2">
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
                      <Clock className="h-2.5 w-2.5 text-amber-500" />
                      Awaiting for response
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      • Client consultation requests pending
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      • Accept or decline in real-time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Active Consultations (paid & unlocked) */}
          {/* {activeConsultations.filter(c => c.payment_status === 'paid').length > 0 && (
            <Card className="mb-8 border-2 border-emerald-500/30 bg-emerald-500/5 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  Active Consultations
                </CardTitle>
                <CardDescription>Sessions ready — client has paid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeConsultations.filter(c => c.payment_status === 'paid').map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-emerald-500/30 transition-colors cursor-pointer group"

                      // onClick={() => navigate(`#/${c.id}`)}
                      onClick={() => { navigate(`/consultation/${c.id}`); window.scrollTo(0, 0); }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                          {c.client_avatar ? (
                            <img src={c.client_avatar} alt={c.client_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-6 w-6 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{c.client_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            {getTypeIcon(c.type)}
                            <span className="capitalize">{c.type} Session</span>
                          </div>
                        </div>
                      </div>
                      <Button className="gap-2 group-hover:gap-3 transition-all">
                        Start Session
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )} */}
          {/* Accepted but awaiting payment */}
          {activeConsultations.filter(c => c.payment_status === 'unpaid').length > 0 && (
            <Card className="mb-8 border-2 border-blue-500/30 bg-blue-500/5 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Timer className="h-5 w-5 text-blue-500" />
                  Awaiting Client Payment
                </CardTitle>
                <CardDescription>You accepted — waiting for the client to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeConsultations.filter(c => c.payment_status === 'unpaid').map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-primary/20 flex items-center justify-center overflow-hidden">
                          {c.client_avatar ? (
                            <img src={c.client_avatar} alt={c.client_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{c.client_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            {getTypeIcon(c.type)}
                            <span className="capitalize">{c.type}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Payment Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


          {/* My CONSULTATION history Section */}
          <Card className="border-0 shadow-lg overflow-hidden mb-12">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <History className="h-5 w-5" />
                  Consultation History
                </CardTitle>
                <CardDescription className="mt-1">
                  Review your client consultations and track your legal sessions.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Consultations Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Your completed or cancelled consultations will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className={`grid gap-4 item-start
          ${consultations.length === 1
                        ? "grid-cols-1 justify-items-center"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      }`}
                  >
                    {consultations
                      .slice(0, consultations.length === 1 ? 1 : 4)
                      .map((c) => {
                        const statusConfig = getStatusConfig(c.status);
                        const { category, urgency, details } = parseAgenda(c.agenda);

                        return (
                          <div
                            key={c.id}
                            className={cn(lawyerCardStyle, "!h-auto !min-h-0 !max-h-fit")}
                          >
                            {/* Status */}
                            <div className="absolute top-2 right-3 z-10">
                              <Badge
                                className={`${statusConfig.className} text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md gap-1 border shadow-3xs flex-shrink-0`}
                              >
                                {c.icon}
                                {c.status}
                              </Badge>
                            </div>

                            {/* Header */}
                            <div className="p-4 pb-3">
                              <div className="flex gap-3">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
                                  {c.client_avatar ? (
                                    <img
                                      src={c.client_avatar}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-6 w-6 text-primary" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 pr-14">
                                  <h3 className="font-bold text-sm truncate">
                                    {c.client_name}
                                  </h3>

                                  <div className="flex items-center gap-1 mt-1">
                                    <div className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">
                                      {getTypeIcon(c.type)}
                                      <span className="text-[11px] capitalize">
                                        {c.type}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(c.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Agenda */}
                            <div className="px-4 pb-3 space-y-1">
                              {category && (
                                <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                  Agenda : {category}
                                </Badge>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="px-3 py-2 border-t border-border bg-secondary/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <span className="text-lg font-bold">₹{c.total_amount || 0}</span>
                                  <span className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md gap-1 border shadow-3xs flex-shrink-0"> {c.status === 'cancelled' ? 'Not Paid' : 'Earned'} </span>

                                  {statusConfig.icon}
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {consultations.length > 4 && (
                    <div className="flex justify-center mt-5">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(seeMoreButtonStyle)}
                        onClick={() => navigate("/lawyer/consultations")}
                      >
                        See More
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </LawyerLayout >
  );
};

export default LawyerDashboard;
