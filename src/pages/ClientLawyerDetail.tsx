
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
// import { BookingPaymentModal } from '@/components/lawyers/BookingPaymentModal';
import { ClientLayout } from '@/components/layout/ClientLayout';
import {
  Star, MessageSquare, Video, Phone, Clock, Award,
  GraduationCap, Languages, ArrowLeft, Shield, Verified,
  Calendar, Users, DollarSign, BookOpen, CheckCircle,
  CreditCard, Zap, MapPin, Briefcase, Globe, Heart,
  ThumbsUp, BadgeCheck, User
} from 'lucide-react';
import { formatLawyerName } from '@/lib/lawyer-utils';
import { calculateAge } from '@/lib/ageUtils';
import { BookingAgendaModal } from './../components/lawyers/BookingAgendaModal';
import { cn } from '@/lib/utils';
import { lawyerCardStyle, bookNowButtonStyle, rejectButtonStyle } from '@/lib/buttonStyles';
interface LawyerData {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  price_per_minute: number | null;
  chat_price_per_minute?: number | null;
  audio_price_per_minute?: number | null;
  video_price_per_minute?: number | null;
  session_price: number | null;
  rating: number | null;
  total_reviews: number | null;
  total_consultations: number | null;
  is_available: boolean | null;
  status: string | null;
  education: string | null;
  bar_council_number: string | null;
  created_at: string | null;
  date_of_birth?: string | null;
  onSuccess?: (bookingId: string) => void;
  is_busy?: boolean | null;
}
interface ProfileData {
  full_name: string;
  avatar_url: string | null;
  email: string;
  // date_of_birth: string | null;
  date_of_birth?: string | null;
}
interface ReviewData {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  client_id: string;
  client_name?: string;
  client_avatar?: string | null;


}



const ClientLawyerDetail = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [lawyer, setLawyer] = useState<LawyerData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'chat' | 'audio' | 'video'>('chat');

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [completedConsultations, setCompletedConsultations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const REVIEWS_PER_PAGE = 3;
  const isBusy = lawyer?.is_busy === true;

  const onBooking = (bookingId: string) => {
    setShowBookingModal(false);

    toast({
      title: 'Request Sent',
      description: 'Your consultation request has been sent to the lawyer.',
    });
  };

  const selectedRate = selectedType === 'chat'
    ? lawyer?.chat_price_per_minute ?? lawyer?.price_per_minute ?? 5
    : selectedType === 'audio'
      ? lawyer?.audio_price_per_minute ?? lawyer?.price_per_minute ?? 5
      : lawyer?.video_price_per_minute ?? lawyer?.price_per_minute ?? 5;
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  const paginatedReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) fetchLawyerDetails();
  }, [id, user]);


  const fetchLawyerDetails = async () => {
    const { data, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      toast({ variant: 'destructive', title: 'Error', description: 'Lawyer profile not found.' });
      navigate('/dashboard');
      return;
    }
    setLawyer(data);
    const [profileRes, reviewsRes] = await Promise.all([
      supabase.from('profiles').select('full_name, avatar_url, email, date_of_birth').eq('id', data.user_id).single(),
      supabase.from('reviews').select('*').eq('lawyer_id', data.user_id).order('created_at', { ascending: false }).limit(20),
    ]);
    if (profileRes.data) setProfile(profileRes.data);

    // ✅ Fetch ONLY completed consultations
    const { count } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('lawyer_id', data.id)
      .eq('status', 'completed');

    if (!error) {
      setCompletedConsultations(count || 0);
      setTotalConsultations(count || 0);
    }

    // const { data: consultations } = await supabase
    //   .from('consultations')
    //   .select('id, status')
    //   .eq('lawyer_id', data.id)
    //   .eq('status', 'completed');

    // if (!error && consultations) {
    //   setCompletedConsultations(consultations.length);
    //   setTotalConsultations(consultations.length);
    // }


    // const fetchConsultationCount = async (lawyerId: string) => {
    //   const { count, error } = await supabase
    //     .from('consultations')
    //     .select('*', { count: 'exact', head: true })
    //     .eq('lawyer_id', lawyerId)
    //     .eq('status', 'completed'); // optional

    //   if (!error) {
    //     setTotalConsultations(count || 0);
    //   }
    // };





    // setCompletedConsultations(count || 0);

    // ✅ KEEP ONLY THIS — uses data.user_id since consultations.lawyer_id stores user_id
    const { count: completedCount } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('lawyer_id', data.user_id)  // ← use user_id, NOT data.id
      .eq('status', 'completed');

    setCompletedConsultations(completedCount || 0);
    setTotalConsultations(completedCount || 0);

    if (reviewsRes.data && reviewsRes.data.length > 0) {
      const clientIds = [...new Set(reviewsRes.data.map(r => r.client_id))];
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', clientIds);
      setReviews(reviewsRes.data.map(review => ({
        ...review,
        client_name: clientProfiles?.find(p => p.id === review.client_id)?.full_name || 'Client',
        client_avatar: clientProfiles?.find(p => p.id === review.client_id)?.avatar_url,
      })));
    }
    setLoading(false);


  };




  const handleBookClick = (
    type: 'chat' | 'audio' | 'video',
    e?: React.MouseEvent
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to book a consultation.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setSelectedType(type);
    setShowBookingModal(true);
  };


  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} />
    ));
  if (loading) {
    return (

      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-72 rounded-2xl mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>

      </ClientLayout>
    );
  }
  if (!lawyer || !profile) {
    return (
      //   <MainLayout showFooter={false}>
      <ClientLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Lawyer Not Found</h2>
          <p className="text-muted-foreground mb-6">This profile doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard')}>Backk to Dashboard</Button>
        </div>
      </ClientLayout>
    );
  }
  const memberSince = lawyer.created_at ? new Date(lawyer.created_at).getFullYear() : new Date().getFullYear();
  const avgRating = lawyer.rating?.toFixed(1) || '0.0';
  return (
    // <MainLayout showFooter={false}>
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-2 py-6 max-w-6xl ">
          {/* Back Button */}
          <Button variant="outline" className={cn(rejectButtonStyle)}

            onClick={() => navigate('/dashboard')}>

            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Hero Profile Header */}
          <Card className={cn(lawyerCardStyle)}>

            <CardContent className="p-1 sm:p-6">

              {/* GRID LAYOUT */}
              <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr,auto] gap-3 sm:gap-5 items-center py-4 sm:py-6 text-center sm:text-left justify-items-center sm:justify-items-stretch">
                {/* Avatar */}
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 border-4  border-gray-900/50">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-accent/20">
                    {profile.full_name.charAt(0)}

                  </AvatarFallback>
                </Avatar>

                {/* Middle Info */}
                <div className="space-y-2 text-center sm:text-left">

                  {/* Name + Verified */}
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {/* {profile.full_name} */}
                      {formatLawyerName(profile.full_name)}
                    </h1>

                    {lawyer.status === "approved" && (
                      <Verified className="h-5 w-5 text-blue-500" />
                    )}
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-muted-foreground ">

                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full">
                      <Star className="h-4 w-9 fill-amber-500 text-amber-500" />
                      <span className="font-semibold text-amber-600">({avgRating} Ratings)</span>
                      <span className="text-sm  text-foreground whitespace-nowrap"> | {reviews.length} Reviews</span>
                    </div>

                    {/* Member Since */}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <p>Member since {memberSince} |</p>
                    </span>
                    <span>
                      <Badge
                        className={`text-xs px-2 py-1 font-medium flex items-center gap-1
                      ${lawyer.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : lawyer.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : 'bg-red-500/10 text-red-600 border-red-500/20'
                          }`}
                      >
                        <Shield className="h-4 w-4 " />
                        {lawyer.status === 'approved'
                          ? 'Verified'
                          : lawyer.status === 'pending'
                            ? 'Pending'
                            : 'Not Verified'}
                      </Badge>

                    </span>

                  </div>

                  {/* Specializations */}
                  {lawyer.specializations?.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                      {lawyer.specializations.map(spec => (
                        <Badge key={spec} variant="secondary" className="text-xs px-2.5 py-1">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex justify-center sm:justify-end">
                  {lawyer.is_available ? (
                    <Badge className="bg-emerald-500 text-white border-0 gap-1.5 px-3 py-1 text-xs sm:text-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
                      Offline
                    </Badge>
                  )}
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-[12px]">
                    {lawyer.bio || 'Experienced legal professional committed to providing excellent legal counsel and representation.'}
                  </p>
                </CardContent>
              </Card>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{lawyer.experience_years || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Years Experience</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                      <Languages className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{lawyer.languages?.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Languages</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold">{avgRating || 0}</p>
                    {/* <p className="text-2xl font-bold">₹ {renderStars(review.rating || 0)}</p> */}
                    <p className="text-xs text-muted-foreground mt-1">Average Rating</p>

                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold">{totalConsultations}</p>
                    <p className="text-xs text-muted-foreground mt-1">Completed   Consultations</p>
                  </CardContent>
                </Card>
              </div>
              {/* Qualifications Card */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 font-semibold">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Qualifications & Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">

                  {/* GRID LAYOUT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">



                    {/* BAR COUNCIL */}
                    {/* {lawyer.bar_council_number && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition">
                        <BadgeCheck className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            Registration
                          </p>
                          <p className="text-sm font-medium">
                            {lawyer.bar_council_number}
                          </p>
                        </div>
                      </div>
                    )} */}

                    {/* AGE + DOB (NEW) */}
                    {profile?.date_of_birth && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition">
                        <User className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            Age
                          </p>
                          <p className="text-sm font-medium">
                            {calculateAge(profile.date_of_birth)} yrs
                          </p>
                          {/* <p className="text-[11px] text-muted-foreground">
                            {new Date(profile.date_of_birth).toLocaleDateString()}
                          </p> */}
                        </div>
                      </div>
                    )}
                    {/* LANGUAGES */}
                    {lawyer.languages && lawyer.languages.length > 0 && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition">
                        <Languages className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <div className="flex-1">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Languages
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {lawyer.languages.slice(0, 6).map(lang => (
                              <Badge
                                key={lang}
                                variant="outline"
                                className="text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1"
                              >
                                <Globe className="h-3 w-3" />
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* EDUCATION */}
                    {lawyer.education && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition">
                        <GraduationCap className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            Education
                          </p>
                          {/* <p className="text-sm font-medium leading-snug truncate"> */}
                          <p className="text-sm font-medium leading-snug break-words whitespace-pre-wrap">
                            {lawyer.education}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="border-t border-border/70 pt-4 mt-4 space-y-3">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          Consultation Pricing
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Transparent pricing set individually by the lawyer.
                        </p>
                      </div>

                      <div className="hidden sm:flex items-center gap-1 rounded-full border bg-secondary/40 px-3 py-1">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Secure Payment
                        </span>
                      </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

                      {/* Chat */}
                      <div className="group rounded-2xl border border-border/70 bg-secondary/30 p-3 hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between gap-2">

                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <MessageSquare className="h-4 w-4" />
                            </span>

                            <div>
                              <p className="text-sm font-semibold leading-none">
                                Chat
                              </p>

                              <p className="text-[11px] text-muted-foreground mt-1">
                                5 • 10 • 15 • 30 mins
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-bold leading-none">
                              ₹{(lawyer.chat_price_per_minute ?? lawyer.price_per_minute ?? 0).toFixed(0)}
                            </p>

                            <p className="text-[11px] text-muted-foreground mt-1">
                              per min
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Audio */}
                      <div className="group rounded-2xl border border-border/70 bg-secondary/30 p-3 hover:border-blue-500/30 transition-all">
                        <div className="flex items-start justify-between gap-2">

                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                              <Phone className="h-4 w-4" />
                            </span>

                            <div>
                              <p className="text-sm font-semibold leading-none">
                                Audio
                              </p>

                              <p className="text-[11px] text-muted-foreground mt-1">
                                10 • 15 • 20 • 30 mins
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-bold leading-none">
                              ₹{(lawyer.audio_price_per_minute ?? lawyer.price_per_minute ?? 0).toFixed(0)}
                            </p>

                            <p className="text-[11px] text-muted-foreground mt-1">
                              per min
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Video */}
                      <div className="group rounded-2xl border border-border/70 bg-secondary/30 p-3 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-start justify-between gap-2">

                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                              <Video className="h-4 w-4" />
                            </span>

                            <div>
                              <p className="text-sm font-semibold leading-none">
                                Video
                              </p>

                              <p className="text-[11px] text-muted-foreground mt-1">
                                15 • 20 • 30 • 45 mins
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-bold leading-none">
                              ₹{(lawyer.video_price_per_minute ?? lawyer.price_per_minute ?? 0).toFixed(0)}
                            </p>

                            <p className="text-[11px] text-muted-foreground mt-1">
                              per min
                            </p>
                          </div>

                        </div>
                      </div>

                    </div>

                    {/* Session Price */}
                    <div className="rounded-2xl border border-border/50 bg-muted/40 px-4 py-3 opacity-70 cursor-not-allowed select-none">

                      <div className="flex items-center justify-between gap-3">

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            Fixed Session Price
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            Complete consultation at a flat rate.
                          </p>

                          <p className="text-[10px] text-amber-600 font-medium mt-2">
                            Feature not started yet
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-muted-foreground">
                            ₹{lawyer.session_price?.toFixed(0) || 0}
                          </p>

                          <p className="text-[11px] text-muted-foreground">
                            full session
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>

                </CardContent>
              </Card>
              {/* Reviews Section */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Client Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>

                <CardContent>

                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <ThumbsUp className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">No reviews yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Be the first to leave a review!</p>
                    </div>
                  ) : (
                    <>
                      {/* REVIEWS LIST */}
                      <div className="space-y-4">

                        {paginatedReviews.map(review => {

                          const isLong = review.comment && review.comment.length > 120;

                          return (
                            <div
                              key={review.id}
                              className="p-4 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition"
                            >

                              <div className="flex items-start gap-3">

                                {/* Avatar */}
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={review.client_avatar || undefined} />
                                  <AvatarFallback className="text-sm bg-secondary">
                                    {review.client_name?.charAt(0) || 'C'}
                                  </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1">

                                  {/* Header */}
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">
                                      {review.client_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {/* Stars */}
                                  <div className="flex items-center gap-0.5 mt-1">
                                    {renderStars(review.rating || 0)}
                                  </div>

                                  {/* Comment */}
                                  {review.comment && (
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                      {isLong
                                        ? review.comment.slice(0, 120) + '...'
                                        : review.comment}
                                    </p>
                                  )}

                                  {/* SEE MORE */}
                                  {isLong && (
                                    <button
                                      onClick={() => setSelectedReview(review)}
                                      className="text-xs text-primary mt-1 hover:underline"
                                    >
                                      See more
                                    </button>
                                  )}

                                </div>

                              </div>

                            </div>
                          );
                        })}

                      </div>

                      {/* PAGINATION */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">

                          {/* Previous */}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                          >
                            Prev
                          </Button>

                          {/* Page Numbers */}
                          {[...Array(totalPages)].map((_, i) => (
                            <Button
                              key={i}
                              size="sm"
                              variant={currentPage === i + 1 ? "default" : "outline"}
                              className="h-8 w-8 p-0"
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </Button>
                          ))}

                          {/* Next */}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                          >
                            Next
                          </Button>

                        </div>
                      )}
                    </>
                  )}

                </CardContent>
              </Card>

            </div>
            {/* Right Sidebar - Sticky Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Pricing Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-b from-card to-secondary/20">
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <p className="text-sm text-foreground font-medium">Flexible booking options for chat, audio and video consultations</p>

                    </div>
                    <Separator />
                    {/* Quick Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Rating
                        </span>
                        <span className="font-semibold">{avgRating} / 5.0</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5" /> Experience
                        </span>
                        <span className="font-semibold">{lawyer.experience_years || 0} years</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" /> Consultations
                        </span>
                        <span className="font-semibold">{totalConsultations}</span>
                      </div>
                    </div>
                    <Separator />

                    {/* Booking Buttons - Premium Full Width */}
                    <div className="space-y-3">

                      {/* Main CTA */}
                      {/* <Button
                        onClick={(e) => handleBookClick('chat', e)}
                        className="
      w-full h-12 text-base font-semibold
      rounded-xl
      bg-gradient-to-r from-primary to-primary/80
      hover:from-primary/90 hover:to-primary
      shadow-lg hover:shadow-xl
      transition-all duration-300
      hover:scale-[1.02]
      flex items-center justify-center gap-2
    "
                      >

                        <CreditCard className="h-5 w-5" />
                        Book Now
                      </Button> */}
                      <Button
                        disabled={isBusy}
                        onClick={(e) => handleBookClick('chat', e)}
                        className={cn(
                          bookNowButtonStyle,
                          "w-full h-12 text-base flex items-center justify-center",

                          isBusy &&
                          "bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed opacity-70"
                        )}
                      >
                        {/* <CreditCard className="h-5 w-5" /> */}
                        {isBusy ? 'Lawyer is Busy With Client' : 'Book Now'}
                      </Button>



                      {/* Secondary Options */}
                      <div className="grid grid-cols-3 gap-2">

                        {/* <Button
                          variant="outline"
                          onClick={(e) => handleBookClick('chat', e)}
                          className="
        h-11 rounded-xl flex flex-col gap-1
        
        transition-all duration-200
      "
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs font-medium">Chat</span>
                        </Button> */}

                        <Button
                          variant="outline"
                          disabled={isBusy}
                          onClick={(e) => handleBookClick('chat', e)}
                          className={`
    h-11 rounded-xl flex flex-col gap-1
    transition-all duration-200

    ${isBusy
                              ? 'opacity-60 cursor-not-allowed bg-muted'
                              : ''
                            }
  `}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            {isBusy ? 'Busy' : 'Chat'}
                          </span>
                        </Button>


                        {/* <Button
                          variant="outline"
                          onClick={(e) => handleBookClick('audio', e)}
                          className="
        h-11 rounded-xl flex flex-col gap-1
       
        transition-all duration-200
      "
                        >
                          <Phone className="h-4 w-4" />
                          <span className="text-xs font-medium">Audio</span>
                        </Button> */}

                        <Button
                          variant="outline"
                          disabled={isBusy}
                          onClick={(e) => handleBookClick('audio', e)}
                          className={`
    h-11 rounded-xl flex flex-col gap-1
    transition-all duration-200

    ${isBusy
                              ? 'opacity-60 cursor-not-allowed bg-muted'
                              : ''
                            }
  `}
                        >
                          <Phone className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            {isBusy ? 'Busy' : 'Audio'}
                          </span>
                        </Button>

                        {/* <Button
                          variant="outline"
                          onClick={(e) => handleBookClick('video', e)}
                          className="
        h-11 rounded-xl flex flex-col gap-1
        
        transition-all duration-200
      "
                        >
                          <Video className="h-4 w-4" />
                          <span className="text-xs font-medium">Video</span>
                        </Button> */}

                        <Button
                          variant="outline"
                          disabled={isBusy}
                          onClick={(e) => handleBookClick('video', e)}
                          className={`
    h-11 rounded-xl flex flex-col gap-1
    transition-all duration-200

    ${isBusy
                              ? 'opacity-60 cursor-not-allowed bg-muted'
                              : ''
                            }
  `}
                        >
                          <Video className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            {isBusy ? 'Busy' : 'Video'}
                          </span>
                        </Button>

                      </div>

                    </div>
                    {/* Trust Badges */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Secure & confidential</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span>Instant connection</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {/* Mobile Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
            <div className="flex items-center gap-3 max-w-6xl mx-auto">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Flexible Pricing</p>

              </div>

              <MessageSquare className="h-4 w-4" />

              <Phone className="h-4 w-4" />


              <Video className="h-4 w-4" />


              <Button
                disabled={isBusy}
                onClick={(e) => handleBookClick('chat', e)}
                className={cn(
                  bookNowButtonStyle,


                  isBusy &&
                  "bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed opacity-70"
                )}
              >
                {/* <CreditCard className="h-4 w-4" /> */}
                {isBusy ? 'Busy' : 'Book Now'}
              </Button>
            </div>
          </div>
          {/* Spacer for mobile bottom bar */}
          <div className="h-24 lg:hidden" />
        </div>
      </div>

      {/* BOOKING AGENDA MODAL */}
      {lawyer && profile && (
        <BookingAgendaModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          lawyer={{
            id: lawyer.id,
            user_id: lawyer.user_id,
            full_name: profile.full_name || 'Legal Professional',
            avatar_url: profile.avatar_url,
            price_per_minute: lawyer.price_per_minute,
            chat_price_per_minute: lawyer.chat_price_per_minute,
            audio_price_per_minute: lawyer.audio_price_per_minute,
            video_price_per_minute: lawyer.video_price_per_minute,
            rating: lawyer.rating,
            specializations: lawyer.specializations,
          }}
          consultationType={selectedType}
          onSuccess={onBooking}
        />
      )}

      {selectedReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">

          <div
            className="
        relative
        w-full max-w-sm sm:max-w-md
        max-h-[80vh]
        bg-card
        rounded-2xl shadow-2xl
        p-4 sm:p-5
        flex flex-col
      "
          >

            {/* Close Button */}
            <button
              onClick={() => setSelectedReview(null)}
              className="
          absolute top-3 right-3
          text-muted-foreground hover:text-foreground
          text-lg font-bold
        "
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-3 pr-6">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                <AvatarImage src={selectedReview.client_avatar || undefined} />
                <AvatarFallback className="text-sm">
                  {selectedReview.client_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {selectedReview.client_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedReview.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-3">
              {renderStars(selectedReview.rating || 0)}
            </div>

            {/* Scrollable Comment */}
            <div
              className="
    overflow-y-auto overflow-x-hidden
    text-sm text-muted-foreground leading-relaxed
    max-h-[45vh]
    break-words

    [scrollbar-width:none] 
    [-ms-overflow-style:none] 
    [&::-webkit-scrollbar]:hidden
  "
            >
              {selectedReview.comment}
            </div>

          </div>
        </div>
      )}
    </ClientLayout>
  );
};
export default ClientLawyerDetail;