import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RatingDialog } from '@/components/consultation/RatingDialog';
import {
  ArrowLeft, Search, MessageSquare, Phone, Video, User,
  Clock, Calendar, DollarSign, Star, Filter,
  ChevronRight, Play, FileText, Shield, Download,
  CheckCircle, XCircle, Loader2, History
} from 'lucide-react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { rejectButtonStyle } from '@/lib/buttonStyles';
import { cn } from './../../lib/utils';
interface ConsultationFull {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  total_amount: number | null;
  duration_minutes: number | null;
  lawyer_id: string;
  lawyer_name: string;
  lawyer_avatar: string | null;
  lawyer_specializations: string[] | null;
  lawyer_rating: number | null;
  agenda?: string | null;
  lawyer_bio?: string | null;
}
interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}
interface Recording {
  id: string;
  storage_path: string;
  duration_seconds: number | null;
  created_at: string;
}
// Helper to strip out everything from "Issue Details:" onward
const cleanAgendaForDisplay = (fullAgenda: string | null): string => {
  if (!fullAgenda) return 'General Consultation';

  // Splits the string at 'Issue Details:' (case-insensitive)
  const parts = fullAgenda.split(/Issue Details:/i);

  // Returns only the first part containing the categories, neatly trimmed
  return parts[0].trim();
};

const ConsultationHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<ConsultationFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const CONSULTATIONS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationFull | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [downloadLoadingId, setDownloadLoadingId] = useState<string | null>(null);
  const [playbackLoadingId, setPlaybackLoadingId] = useState<string | null>(null);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [recordingUrls, setRecordingUrls] = useState<Record<string, string>>({});
  const [ratedConsultationIds, setRatedConsultationIds] = useState<Set<string>>(new Set());
  const [ratingTarget, setRatingTarget] = useState<ConsultationFull | null>(null);
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) fetchConsultations();
  }, [user, authLoading]);
  const fetchConsultations = async () => {
    if (!user) return;
    const { data: consultationsData } = await supabase
      .from('consultations')
      .select('id, type, status, created_at, started_at, ended_at, total_amount, duration_minutes, lawyer_id, agenda')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    if (consultationsData && consultationsData.length > 0) {
      const lawyerIds = [...new Set(consultationsData.map(c => c.lawyer_id))];
      const completedIds = consultationsData.filter(c => c.status === 'completed').map(c => c.id);
      const [{ data: profiles }, { data: lawyerProfiles }, { data: reviews }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', lawyerIds),
        supabase.from('lawyer_profiles').select('user_id, specializations, rating').in('user_id', lawyerIds),
        completedIds.length > 0
          ? supabase.from('reviews').select('consultation_id').eq('client_id', user.id).in('consultation_id', completedIds)
          : Promise.resolve({ data: [] }),
      ]);
      const ratedIds = new Set((reviews || []).map(r => r.consultation_id));
      setRatedConsultationIds(ratedIds);

      const enriched: ConsultationFull[] = consultationsData.map(c => {
        const profile = profiles?.find(p => p.id === c.lawyer_id);
        const lp = lawyerProfiles?.find(l => l.user_id === c.lawyer_id);
        return {
          ...c,
          lawyer_name: profile?.full_name || 'Legal Professional',
          lawyer_avatar: profile?.avatar_url || null,
          lawyer_specializations: lp?.specializations || null,
          lawyer_rating: lp?.rating ? Number(lp.rating) : null,
          // agenda: (c as any).agenda || null,
          agenda: cleanAgendaForDisplay((c as any).agenda || null),
        };
      });
      setConsultations(enriched);
    }
    setLoading(false);
  };
  const openDetail = async (consultation: ConsultationFull) => {
    setSelectedConsultation(consultation);
    setDetailOpen(true);
    setDetailLoading(true);
    setChatMessages([]);
    setRecordings([]);
    setActiveRecordingId(null);
    setRecordingUrls({});
    const [{ data: msgs }, { data: recs }] = await Promise.all([
      supabase.from('messages').select('*').eq('consultation_id', consultation.id).order('created_at', { ascending: true }),
      supabase.from('call_recordings').select('id, storage_path, duration_seconds, created_at').eq('consultation_id', consultation.id).order('created_at', { ascending: true }),
    ]);
    setChatMessages(msgs || []);
    setRecordings(recs || []);
    setDetailLoading(false);
  };
  const getRecordingUrl = async (rec: Recording) => {
    if (recordingUrls[rec.id]) return recordingUrls[rec.id];
    setPlaybackLoadingId(rec.id);
    try {
      const { data, error } = await supabase.storage.from('recordings').createSignedUrl(rec.storage_path, 3600);
      if (error || !data?.signedUrl) {
        console.error('Recording URL error', error);
        return null;
      }
      const url = data.signedUrl;
      setRecordingUrls(prev => ({ ...prev, [rec.id]: url }));
      return url;
    } finally {
      setPlaybackLoadingId(null);
    }
  };
  const downloadRecording = async (rec: Recording) => {
    setDownloadLoadingId(rec.id);
    const url = await getRecordingUrl(rec);
    setDownloadLoadingId(null);
    if (url) window.open(url, '_blank');
  };
  const playRecording = async (rec: Recording) => {
    const url = await getRecordingUrl(rec);
    if (url) {
      setActiveRecordingId(rec.id);
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
      case 'completed': return { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle className="h-3 w-3" /> };
      case 'active': return { className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse', icon: <Play className="h-3 w-3" /> };
      case 'pending': return { className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Clock className="h-3 w-3" /> };
      default: return { className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <XCircle className="h-3 w-3" /> };
    }
  };
  const formatDuration = (mins: number | null) => {
    if (!mins) return '—';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };
  const filtered = consultations.filter(c => {
    const matchesSearch = !searchQuery || c.lawyer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filtered.length / CONSULTATIONS_PER_PAGE);

  const paginatedConsultations = filtered.slice(
    (currentPage - 1) * CONSULTATIONS_PER_PAGE,
    currentPage * CONSULTATIONS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('ellipsis');

      pages.push(totalPages);
    }

    return pages;
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    totalSpent: consultations.reduce((sum, c) => sum + (c.total_amount || 0), 0),
  };
  if (authLoading || loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl mb-3" />)}
          </div>
        </div>
      </ClientLayout>
    );
  }
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">Consultation History</h1>
              <p className="text-sm text-muted-foreground mt-0.5">All your legal sessions in one place</p>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Sessions</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">₹{stats.totalSpent.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
              </CardContent>
            </Card>
          </div>
          {/* Search & Filter */}
          <div className="grid gap-3 mb-6 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by lawyer or consultation"
                className="pl-9"
              />
            </div>
            <div className="overflow-x-auto">
              <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                <TabsList className="h-10 min-w-max">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          {/* Consultation List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No consultations found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Book your first consultation'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedConsultations.map((c, index) => {
                  const sc = getStatusConfig(c.status);
                  return (
                    <Card
                      key={c.id}
                      className="border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group animate-fade-in overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => openDetail(c)}
                    >
                      <CardContent
                        className={cn(
                          "p-4 relative overflow-hidden rounded-xl border flex flex-col justify-between min-h-[145px] cursor-pointer",
                          // Premium golden background setup
                          "bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300",
                          // KEEP SAME COLORS ON HOVER
                          "hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300",
                          // Dark premium text color baseline
                          "text-amber-900",
                          // Premium shadow configurations
                          "shadow-md hover:shadow-lg",
                          // ONLY slight front translation movement on desktop hover states
                          "hover:-translate-y-1 hover:scale-[1.01]",
                          // NO brightness modifications or color flickering
                          "hover:brightness-100",
                          // Sub-pixel custom borders
                          "border-amber-300/40",
                          // Animation transitions
                          "transition-all duration-300 ease-out group"
                        )}
                      >

                        {/* Top Section Layout */}
                        <div className="flex items-start justify-between gap-3 w-full">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Advocate Avatar Layer Profile */}
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-12 w-12 rounded-xl border-2 border-amber-100/40 shadow-xs">
                                <AvatarImage src={c.lawyer_avatar || undefined} className="object-cover" />
                                <AvatarFallback className="bg-amber-950 text-amber-100 text-xs font-bold rounded-xl">
                                  {c.lawyer_name?.charAt(0) || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-amber-200" />
                            </div>

                            {/* Identity Headers */}
                            <div className="min-w-0">
                              <p className="font-bold text-sm tracking-tight text-amber-950 truncate">
                                {c.lawyer_name}
                              </p>
                              {/* Specializations */}
                              {c.lawyer_specializations?.length ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {c.lawyer_specializations.slice(0, 2).map((spec) => (
                                    <Badge
                                      key={spec}
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {spec}
                                    </Badge>
                                  ))}

                                  {c.lawyer_specializations.length > 2 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      +{c.lawyer_specializations.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : null}

                            </div>
                          </div>

                          {/* Top Right Status Badge Header */}
                          <Badge className={cn(
                            "text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md gap-1 border shadow-3xs flex-shrink-0",
                            sc.className || "bg-amber-950 text-amber-100 border-transparent"
                          )}>
                            {sc.icon}
                            {c.status}
                          </Badge>
                        </div>

                        {/* Middle Section Layout: Clean Agenda Rendering */}




                        {/* Agenda */}
                        {/* <div className="mt-2">
                          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                            Agenda:{" "}
                            {(c.agenda || "Legal consultation session").replace(/[\[\]]/g, "")}
                          </p>
                        </div> */}
                        {/* Agenda */}
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                            Agenda:{" "}
                            {cleanAgendaForDisplay(c.agenda).replace(/[\[\]]/g, "")}
                          </p>
                        </div>



                        {/* Bottom Section Layout: Metrics Footer Tracker Matrix */}
                        <div className="pt-2.5 border-t border-amber-950/10 flex items-center justify-between w-full mt-auto">

                          {/* Left Metadata Parameters */}
                          <div className="flex items-center gap-2 text-[10px] text-amber-900/80 font-bold flex-wrap">
                            <span className="flex items-center gap-1 text-amber-950">
                              {getTypeIcon(c.type)}
                              <span className="capitalize">{c.type}</span>
                            </span>

                            <span className="w-0.5 h-0.5 rounded-full bg-amber-900/40" />

                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 opacity-80" />
                              {new Date(c.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>

                            {c.duration_minutes && (
                              <>
                                <span className="w-0.5 h-0.5 rounded-full bg-amber-900/40" />
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 opacity-80" />
                                  {formatDuration(c.duration_minutes)}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Right Ledger Side Actions Grouping */}
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            {c.status === 'completed' && !ratedConsultationIds.has(c.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[10px] font-bold tracking-wide gap-1 bg-amber-950 text-amber-100 hover:bg-amber-900 border-transparent transition-colors shadow-3xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRatingTarget(c);
                                }}
                              >
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                Rate
                              </Button>
                            )}

                            {/* Pricing Currency Indicators */}
                            <div className="flex flex-col items-end justify-center min-w-[50px]">
                              {c.total_amount && (
                                <span className="text-sm font-black text-amber-950 tracking-tight leading-none">
                                  ₹{c.total_amount.toFixed(2)}
                                </span>
                              )}
                              <span className={cn(
                                "text-[9px] font-extrabold uppercase tracking-wider mt-0.5",
                                c.status === 'completed' || c.status === 'paid'
                                  ? 'text-emerald-800'
                                  : 'text-amber-900/60'
                              )}>
                                {c.status === 'completed' || c.status === 'paid' ? 'Paid' : 'Not Paid'}
                              </span>
                            </div>

                            {/* Interactive Micro Chevron Box */}
                            <div className="w-6 h-6 rounded-md bg-amber-950/10 border border-transparent group-hover:bg-amber-950/20 flex items-center justify-center transition-all duration-300">
                              <ChevronRight className="h-3.5 w-3.5 text-amber-950 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">

                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * CONSULTATIONS_PER_PAGE + 1}
                    –
                    {Math.min(currentPage * CONSULTATIONS_PER_PAGE, filtered.length)}
                    of {filtered.length} consultations
                  </p>

                  <div className="flex items-center gap-2">

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>

                    {/* CURRENT PAGE */}
                    <Button
                      variant="default"
                      size="sm"
                      className="w-9 h-9 p-0"
                    >
                      {currentPage}
                    </Button>

                    {/* NEXT PAGE */}
                    {currentPage + 1 <= totalPages && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-9 h-9 p-0"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </Button>
                    )}

                    {/* ELLIPSIS */}
                    {currentPage + 1 < totalPages && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>

                  </div>
                </div>
              )}
            </>
          )



          }
        </div>
      </div>
      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedConsultation(null);
            setChatMessages([]);
            setRecordings([]);
            setActiveRecordingId(null);
          }
        }}
      >
        <DialogContent className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-3xl max-h-[92vh] p-0 overflow-y-auto overflow-x-hidden scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:rounded-3xl">

          {selectedConsultation && (
            <>
              {/* Detail Header */}
              <div className="relative p-5 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">

                <DialogHeader className="sm:flex sm:items-center sm:justify-between sm:gap-4">

                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={selectedConsultation.lawyer_avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold">
                        {selectedConsultation.lawyer_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <DialogTitle className="text-xl sm:text-2xl flex flex-col gap-1">
                        {selectedConsultation.lawyer_name}
                      </DialogTitle>

                      <DialogDescription className="text-sm text-muted-foreground max-w-xl">
                        View complete session history for this consultation.
                      </DialogDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:justify-end">
                    <Badge className={`text-[11px] gap-1 ${getStatusConfig(selectedConsultation.status).className}`}>
                      {getStatusConfig(selectedConsultation.status).icon}
                      {selectedConsultation.status}
                    </Badge>

                    <Badge variant="outline" className="text-[11px] capitalize gap-1">
                      {getTypeIcon(selectedConsultation.type)}
                      {selectedConsultation.type}
                    </Badge>

                    <Badge variant="outline" className="text-[11px] gap-1">
                      {selectedConsultation.lawyer_rating
                        ? `${selectedConsultation.lawyer_rating.toFixed(1)} ★`
                        : 'No rating'}
                    </Badge>
                  </div>

                </DialogHeader>

                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4">

                  <div className="bg-card border border-border rounded-xl px-2 py-2 flex flex-col justify-center min-h-[56px]">
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground truncate">
                      Session Date
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold leading-tight mt-1 truncate">
                      {new Date(selectedConsultation.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-xl px-2 py-2 flex flex-col justify-center min-h-[56px]">
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground truncate">
                      Duration
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold leading-tight mt-1 truncate">
                      {formatDuration(selectedConsultation.duration_minutes)}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-xl px-2 py-2 flex flex-col justify-center min-h-[56px]">
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground truncate">
                      Fee
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold leading-tight mt-1 truncate">
                      ₹{(selectedConsultation.total_amount || 0).toFixed(0)}
                    </p>
                  </div>

                </div>
              </div>

              {/* Content Tabs */}
              <div className="px-1 pb-10">

                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Tabs defaultValue="chat" className="mt-4">

                    <TabsList className="w-full">
                      <TabsTrigger value="chat" className="flex-1 gap-1.5 text-xs">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat ({chatMessages.length})
                      </TabsTrigger>

                      <TabsTrigger value="recordings" className="flex-1 gap-1.5 text-xs">
                        <Play className="h-3.5 w-3.5" />
                        Recordings ({recordings.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* CHAT */}
                    {/* FIX: Added min-w-0 to allow horizontal shrinking */}
                    <TabsContent value="chat" className="mt-3 min-w-0">

                      {chatMessages.length === 0 ? (
                        <div className="text-center py-10">
                          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No messages in this session
                          </p>
                        </div>
                      ) : (
                        // FIX: Added w-full down-scoping
                        <ScrollArea className="h-[200px] w-full pr-2">
                          {/* FIX: Added w-full min-w-0 to anchor layout boundaries */}
                          <div className="space-y-3 pr-1 w-full min-w-0 flex flex-col">

                            {chatMessages.map((msg) => {
                              const isOwn = msg.sender_id === user?.id;

                              // Helper function to render message content safely with attachments
                              const renderMessageContent = (content: string) => {
                                const urlRegex = /(https:\/\/gptzsnnskgwuheqlpwpk\.supabase\.co\/storage\/v1\/object\/sign\/chat-attachments\/[^\s]+)/gi;
                                const match = content.match(urlRegex);

                                if (match) {
                                  const fileUrl = match[0];
                                  const cleanText = content.replace(fileUrl, '').trim();

                                  // 1. Compact Voice Message Parser
                                  if (fileUrl.toLowerCase().includes('.webm') || content.includes('[voice]')) {
                                    return (
                                      <div className="space-y-1 w-full max-w-[180px] sm:max-w-[200px]">
                                        {cleanText && (
                                          <p className="text-[10px] sm:text-[11px] opacity-90 truncate font-medium">
                                            {cleanText.replace('🎤 [voice] ', '')}
                                          </p>
                                        )}

                                        <div className="flex items-center gap-2 bg-background/10 dark:bg-muted/40 rounded-lg p-1.5 border border-foreground/5">
                                          <button
                                            type="button"
                                            className="w-7 h-7 rounded-full bg-background dark:bg-primary text-foreground dark:text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-xs hover:scale-105 active:scale-95 transition-transform"
                                            onClick={(e) => {
                                              const btn = e.currentTarget;
                                              const audio = btn.nextElementSibling as HTMLAudioElement;
                                              if (audio.paused) {
                                                document.querySelectorAll('audio').forEach(a => a.pause());
                                                audio.play();
                                              } else {
                                                audio.pause();
                                              }
                                            }}
                                          >
                                            <Play className="h-3 w-3 fill-current" />
                                          </button>

                                          <audio
                                            src={fileUrl}
                                            preload="metadata"
                                            className="hidden"
                                            onPlay={(e) => {
                                              const btn = e.currentTarget.previousElementSibling;
                                              if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"></rect><rect x="6" y="4" width="4" height="16" rx="1"></rect></svg>';
                                            }}
                                            onPause={(e) => {
                                              const btn = e.currentTarget.previousElementSibling;
                                              if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';
                                            }}
                                            onEnded={(e) => {
                                              const btn = e.currentTarget.previousElementSibling;
                                              if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';
                                            }}
                                          />

                                          <div className="flex-1 flex items-center gap-0.5 h-3 px-1 opacity-60">
                                            <span className="w-0.5 h-2 bg-current rounded-full animate-pulse"></span>
                                            <span className="w-0.5 h-3 bg-current rounded-full"></span>
                                            <span className="w-0.5 h-1 bg-current rounded-full"></span>
                                            <span className="w-0.5 h-2.5 bg-current rounded-full"></span>
                                            <span className="w-0.5 h-1.5 bg-current rounded-full"></span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // 2. Safe Self-Contained PDF Document Parser (No Imports Needed)
                                  if (fileUrl.toLowerCase().includes('.pdf') || content.includes('[document]')) {
                                    return (
                                      <div className="space-y-1 w-full max-w-[200px] sm:max-w-[240px]">
                                        {cleanText && (
                                          <p className="text-[10px] sm:text-[11px] opacity-90 truncate font-medium">
                                            {cleanText.replace('📄 [document] ', '')}
                                          </p>
                                        )}

                                        <div
                                          onClick={() => window.open(fileUrl, '_blank')}
                                          className="flex items-center justify-between gap-3 bg-background/20 dark:bg-muted/50 border border-foreground/10 p-2 rounded-lg cursor-pointer hover:bg-background/30 dark:hover:bg-muted/70 transition-colors"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            {/* Native Document SVG Box */}
                                            <div className="w-7 h-7 rounded bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 text-red-500">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                                <path d="M10 9H8" />
                                                <path d="M16 13H8" />
                                                <path d="M16 17H8" />
                                              </svg>
                                            </div>
                                            <div className="min-w-0">
                                              <p className="text-[11px] font-medium truncate text-foreground">
                                                Document.pdf
                                              </p>
                                              <p className="text-[9px] opacity-60">View PDF</p>
                                            </div>
                                          </div>

                                          {/* Native Inline External Link SVG */}
                                          <div className="w-6 h-6 rounded-md hover:bg-background/40 flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M15 3h6v6" />
                                              <path d="M10 14 21 3" />
                                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // 3. Compact Image Preview Parser
                                  if (fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png)/) || content.includes('[image]')) {
                                    return (
                                      <div className="space-y-1 max-w-[140px] sm:max-w-[180px]">
                                        {cleanText && (
                                          <p className="text-[10px] sm:text-[11px] opacity-90 truncate font-medium">
                                            {cleanText.replace('📎 [image] ', '')}
                                          </p>
                                        )}
                                        <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/20 shadow-xs">
                                          <img
                                            src={fileUrl}
                                            alt="Shared attachment"
                                            className="w-full h-auto object-cover max-h-[120px] hover:opacity-90 transition-opacity cursor-pointer"
                                            onClick={() => window.open(fileUrl, '_blank')}
                                          />
                                        </div>
                                      </div>
                                    );
                                  }
                                }

                                return (
                                  <p className="text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap break-words [word-break:break-word]">
                                    {content}
                                  </p>
                                );
                              };

                              return (
                                <div
                                  key={msg.id}
                                  className={`flex w-full ${isOwn ? 'justify-end pl-6' : 'justify-start pr-6'}`}
                                >
                                  <div
                                    className={`
          max-w-full
          rounded-xl
          px-3
          py-2
          shadow-sm
          break-all
          [overflow-wrap:anywhere]
          ${isOwn
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-secondary text-secondary-foreground rounded-bl-sm'}
        `}
                                  >
                                    {/* Dynamic Media Renderer */}
                                    {renderMessageContent(msg.content)}

                                    <p className={`text-[9px] mt-1 text-right ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                      {new Date(msg.created_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}

                          </div>
                        </ScrollArea>
                      )}

                    </TabsContent>

                    {/* RECORDINGS */}
                    <TabsContent value="recordings" className="mt-3">

                      <ScrollArea className="h-[200px] pr-2">

                        {recordings.length === 0 ? (
                          <div className="h-[180px] flex flex-col items-center justify-center text-center">
                            <Play className="h-7 w-7 text-muted-foreground mb-2" />
                            <p className="text-xs text-muted-foreground">
                              No recordings for this session
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">

                            {recordings.map((rec, i) => (
                              <Card key={rec.id} className="border shadow-none">
                                <CardContent className="p-3 space-y-2">

                                  <div className="flex items-center justify-between gap-2">

                                    <div className="flex items-center gap-2 min-w-0">

                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Play className="h-3.5 w-3.5 text-primary" />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-xs font-medium truncate">
                                          Recording {i + 1}
                                        </p>

                                        <p className="text-[10px] text-muted-foreground truncate">
                                          {rec.duration_seconds
                                            ? `${Math.floor(rec.duration_seconds / 60)}m ${rec.duration_seconds % 60}s`
                                            : 'Unknown duration'}{' · '}
                                          {new Date(rec.created_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>

                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">

                                      <Button
                                        size="sm"
                                        variant={activeRecordingId === rec.id ? 'secondary' : 'outline'}
                                        className="h-7 px-2 text-[10px]"
                                        disabled={playbackLoadingId === rec.id}
                                        onClick={() => playRecording(rec)}
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Play
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2"
                                        disabled={downloadLoadingId === rec.id}
                                        onClick={() => downloadRecording(rec)}
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>

                                    </div>

                                  </div>

                                  {activeRecordingId === rec.id && recordingUrls[rec.id] && (
                                    <audio
                                      src={recordingUrls[rec.id]}
                                      controls
                                      autoPlay
                                      className="w-full h-9"
                                    />
                                  )}

                                </CardContent>
                              </Card>
                            ))}

                          </div>
                        )}

                      </ScrollArea>

                    </TabsContent>

                  </Tabs>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-3 pt-3 border-t w-full">

                  {selectedConsultation.status === 'completed' &&
                    !ratedConsultationIds.has(selectedConsultation.id) && (
                      <Button
                        className="w-full sm:max-w-[130px] h-8.5 text-[11px] sm:text-xs font-semibold tracking-wide gap-1.5 transition-all shadow-xs order-1 sm:order-2"
                        onClick={() => {
                          setDetailOpen(false);
                          setRatingTarget(selectedConsultation);
                        }}
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        Rate Lawyer
                      </Button>
                    )}

                  {selectedConsultation.status === 'active' && (
                    <Button
                      className="w-full sm:max-w-[140px] h-8.5 text-[11px] sm:text-xs font-semibold tracking-wide gap-1.5 transition-all shadow-xs order-1 sm:order-2"
                      onClick={() => {
                        setDetailOpen(false);
                        navigate(`/consultation/${selectedConsultation.id}`);
                      }}
                    >
                      Continue Session
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:max-w-[100px] h-8.5 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5 transition-colors order-2 sm:order-1",
                      rejectButtonStyle
                    )}
                    onClick={() => setDetailOpen(false)}
                  >
                    <XCircle className="h-3.5 w-3.5 opacity-80" />
                    Close
                  </Button>

                </div>

              </div>
            </>
          )}

        </DialogContent>
      </Dialog>
      {ratingTarget && user && (
        <RatingDialog
          open={!!ratingTarget}
          onOpenChange={(open) => { if (!open) setRatingTarget(null); }}
          consultationId={ratingTarget.id}
          lawyerId={ratingTarget.lawyer_id}
          clientId={user.id}
          lawyerName={ratingTarget.lawyer_name}
          lawyerAvatar={ratingTarget.lawyer_avatar}
          onRated={() => {
            setRatedConsultationIds(prev => new Set([...prev, ratingTarget.id]));
            setRatingTarget(null);
          }}
        />
      )}
    </ClientLayout>
  );
};
export default ConsultationHistory;