
import { cn } from '@/lib/utils';
import { rejectButtonStyle, acceptButtonStyle } from '@/lib/buttonStyles';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft, MessageSquare, Phone, Video,
  Clock, Calendar, ChevronRight,
  CheckCircle, XCircle, Play, History,
  DollarSign,
  Star,
  Loader2,
  Download
} from 'lucide-react';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { DialogHeader } from '@/components/ui/dialog';
// import { TabsContent } from '@radix-ui/react-tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsultationWithClient {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  total_amount: number | null;
  client_id: string;
  client_name: string;
  client_avatar: string | null;
  duration_minutes: number | null;
  rating?: number | null;



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

const LawyerConsultations = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState<ConsultationWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const CONSULTATIONS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithClient | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('consultations')
      .select('*')
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false });

    const consultationIds = data?.map(c => c.id) || [];

    const { data: reviews } = await supabase
      .from('reviews')
      .select('consultation_id, rating')
      .in('consultation_id', consultationIds);

    if (data && data.length > 0) {
      const clientIds = [...new Set(data.map(c => c.client_id))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', clientIds);

      const enriched = data.map(c => {
        const cp = profiles?.find(p => p.id === c.client_id);

        const review = reviews?.find(r => r.consultation_id === c.id);

        return {
          ...c,
          client_name: cp?.full_name || 'Client',
          client_avatar: cp?.avatar_url || null,

          // ✅ THIS LINE IS THE MAIN FIX
          rating: review?.rating ?? null,
        };
      });



      setConsultations(enriched);
    }

    setLoading(false);
  };

  const openDetail = async (consultation: ConsultationWithClient) => {
    setSelectedConsultation(consultation);
    setDetailOpen(true);
    setDetailLoading(true);
    const [{ data: msgs }, { data: recs }] = await Promise.all([
      supabase.from('messages').select('*').eq('consultation_id', consultation.id).order('created_at', { ascending: true }),
      supabase.from('call_recordings').select('*').eq('consultation_id', consultation.id).order('created_at', { ascending: true }),
    ]);
    setChatMessages(msgs || []);
    setRecordings(recs || []);
    setDetailLoading(false);
  };

  const formatDuration = (mins: number | null) => {
    if (!mins) return '—';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
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

  const filtered = consultations.filter(c =>
    filterStatus === 'all' || c.status === filterStatus
  );

  const totalPages = Math.ceil(filtered.length / CONSULTATIONS_PER_PAGE);

  const paginated = filtered.slice(
    (currentPage - 1) * CONSULTATIONS_PER_PAGE,
    currentPage * CONSULTATIONS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    earnings: consultations.reduce((sum, c) => sum + (c.total_amount || 0), 0),
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

  if (authLoading || loading) {
    return (
      <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl mb-3" />)}
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/lawyer/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">Consultation History</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your sessions with clients</p>
            </div>
          </div>
          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Card className="border-0 shadow-md bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
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
                <p className="text-2xl sm:text-3xl font-bold text-primary">₹{stats.earnings.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Earnings</p>
              </CardContent>
            </Card>
          </div>
          {/* FILTER */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Tabs value={filterStatus} onValueChange={setFilterStatus}>
              <TabsList className="h-10">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* LIST */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No consultations found</h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {paginated.map((c, index) => {
                  const sc = getStatusConfig(c.status);
                  const { category, urgency, details } = parseAgenda(c.agenda);


                  return (
                    <Card
                      key={c.id}
                      className={cn(
                        "border rounded-xl flex flex-col justify-between min-h-[150px] cursor-pointer animate-fade-in overflow-hidden",

                        // Premium solid golden background setup
                        "bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300",

                        // KEEP EXACT SAME COLORS ON HOVER (NO FLICKERING/COLOR CHANGES)
                        "hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300",

                        // Dark premium styling text baseline
                        "text-amber-900",

                        // Premium dynamic depth shadow configurations
                        "shadow-md hover:shadow-lg",

                        // ONLY smooth slight upward movement translation on hover
                        "hover:-translate-y-1 hover:scale-[1.01]",

                        // Strict protection rule against brightness or contrast alterations
                        "hover:brightness-100",

                        // Custom sub-pixel border matching container
                        "border-amber-300/40",

                        // Transition settings
                        "transition-all duration-300 ease-out group"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => openDetail(c)}
                    >
                      <CardContent className="p-4 flex flex-col justify-between h-full w-full relative">

                        {/* Top Info Layout Block */}
                        <div className="flex items-start justify-between gap-3 w-full">
                          <div className="flex items-center gap-3.5 min-w-0">

                            {/* Profile Avatar Frame Container */}
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-12 w-12 rounded-xl border-2 border-amber-100/40 shadow-xs">
                                <AvatarImage src={c.client_avatar || undefined} className="object-cover" />
                                <AvatarFallback className="bg-amber-950 text-amber-100 text-xs font-bold rounded-xl">
                                  {c.client_name?.charAt(0) || 'C'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-amber-200" />
                            </div>

                            {/* Title & Static Meta Specialization Badges */}
                            <div className="min-w-0">
                              <p className="font-extrabold text-sm tracking-tight text-amber-950 truncate">
                                {c.client_name || 'Client'}
                              </p>
                            </div>

                          </div>


                          {/* Top Right Status Metadata Badge Component */}
                          <Badge className={cn(
                            "text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md gap-1 border shadow-3xs flex-shrink-0",
                            sc.className || "bg-amber-950 text-amber-100 border-transparent"
                          )}>
                            {sc.icon}
                            {c.status}
                          </Badge>
                        </div>
                        {/* Agenda */}
                        <div className="flex justify-center w-full pt-4 pb-3 px-4">
                          {category && (
                            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 tracking-wide font-semibold shadow-3xs">
                              Agenda : {category}
                            </Badge>
                          )}
                        </div>



                        {/* Bottom Section Layout: Context Triggers & Ledger Values Row */}
                        <div className="pt-2.5 border-t border-amber-950/10 flex items-center justify-between w-full mt-auto">

                          {/* Left Dynamic Interactive Indicators */}
                          <div className="flex items-center gap-2 text-[10px] text-amber-900/80 font-bold flex-wrap">
                            <span className="flex items-center gap-1 text-amber-950">
                              {getTypeIcon(c.type)}

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

                          {/* Right Action Trigger Elements Group */}
                          <div className="flex items-center gap-2.5 flex-shrink-0">

                            {/* Dedicated Ledger Amount Metadata Indicators */}
                            <div className="flex flex-col items-end justify-center min-w-[55px]">
                              {c.total_amount ? (
                                <span className="text-sm font-black text-amber-950 tracking-tight leading-none">
                                  ₹{c.total_amount.toFixed(2)}
                                </span>
                              ) : null}
                              <span className={cn(
                                "text-[9px] font-extrabold uppercase tracking-wider mt-0.5",
                                c.status === 'completed' || c.status === 'paid'
                                  ? 'text-emerald-800'
                                  : 'text-amber-900/60'
                              )}>
                                {c.status === 'completed' ? 'Earned' : 'Not Paid'}
                              </span>
                            </div>

                            {/* Action Chevron Indicator Box */}
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
          )}

        </div>
      </div>
      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col sm:rounded-2xl">

          {selectedConsultation && (
            <>
              {/* Detail Header */}
              <div className="p-4 sm:p-5 pb-3 border-b bg-gradient-to-r from-primary/5 to-accent/5">

                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">

                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-primary/20">
                      <AvatarImage src={selectedConsultation.client_avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold">
                        {selectedConsultation.client_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-bold truncate">
                        {selectedConsultation.client_name}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <Badge className={`text-[10px] gap-1 ${getStatusConfig(selectedConsultation.status).className}`}>
                          {getStatusConfig(selectedConsultation.status).icon}
                          {selectedConsultation.status}
                        </Badge>

                        <Badge variant="outline" className="text-[10px] capitalize gap-1">
                          {getTypeIcon(selectedConsultation.type)}
                          {selectedConsultation.type}
                        </Badge>
                      </div>
                    </div>

                  </DialogTitle>
                </DialogHeader>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">

                  <div className="bg-card border rounded-lg p-2.5 text-center min-h-[70px] flex flex-col justify-center">
                    <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-[10px] text-muted-foreground">Date</p>
                    <p className="text-xs font-semibold">
                      {new Date(selectedConsultation.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-card border rounded-lg p-2.5 text-center min-h-[70px] flex flex-col justify-center">
                    <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-[10px] text-muted-foreground">Duration</p>
                    <p className="text-xs font-semibold">
                      {formatDuration(selectedConsultation.duration_minutes)}
                    </p>
                  </div>

                  <div className="bg-card border rounded-lg p-2.5 text-center min-h-[70px] flex flex-col justify-center">
                    <DollarSign className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-[10px] text-muted-foreground">Cost</p>
                    <p className="text-xs font-semibold">
                      ₹{(selectedConsultation.total_amount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-card border rounded-lg p-2.5 text-center min-h-[70px] flex flex-col justify-center">
                    <Star className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                    <p className="text-[10px] text-muted-foreground">Rating</p>
                    <p className="text-xs font-semibold">
                      {selectedConsultation.rating ? `${selectedConsultation.rating}/5` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden px-4 sm:px-5 pb-4 flex flex-col">

                {detailLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden mt-3">

                    <TabsList className="w-full h-9">
                      <TabsTrigger value="chat" className="flex-1 text-xs gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat ({chatMessages.length})
                      </TabsTrigger>

                      <TabsTrigger value="recordings" className="flex-1 text-xs gap-1.5">
                        <Play className="h-3.5 w-3.5" />
                        Recordings ({recordings.length})
                      </TabsTrigger>
                    </TabsList>


                    {/* CHAT */}
                    <TabsContent value="chat" className="flex-1 overflow-hidden mt-3 min-w-0">

                      {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                          <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No messages in this session
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[260px] w-full pr-2">
                          <div className="space-y-3 pr-1 w-full min-w-0 flex flex-col">

                            {chatMessages.map(msg => {
                              const isOwn = msg.sender_id === user?.id;

                              // Unified text/media detection rules engine
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
                                  className={`flex w-full ${isOwn ? 'justify-end pl-8' : 'justify-start pr-8'}`}
                                >
                                  <div className={`max-w-full rounded-lg px-3 py-2 break-all overflow-wrap-anywhere ${isOwn
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                                    }`}>

                                    {/* Executing dynamic media rendering hook */}
                                    {renderMessageContent(msg.content)}

                                    <p className={`text-[8px] mt-1 text-right ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                      }`}>
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
                    <TabsContent value="recordings" className="flex-1 overflow-hidden mt-3">

                      {recordings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <Play className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No recordings for this session
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[260px] pr-2">
                          <div className="space-y-2">

                            {recordings.map((rec, i) => (
                              <Card key={rec.id} className="border shadow-sm rounded-lg">
                                <CardContent className="p-3 flex items-center justify-between">

                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <Play className="h-4 w-4 text-primary" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        Recording {i + 1}
                                      </p>

                                      <p className="text-[10px] text-muted-foreground truncate">
                                        {rec.duration_seconds
                                          ? `${Math.floor(rec.duration_seconds / 60)}m ${rec.duration_seconds % 60}s`
                                          : 'Unknown duration'}
                                        {' · '}
                                        {new Date(rec.created_at).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>

                                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                    <Download className="h-3.5 w-3.5" />
                                  </Button>

                                </CardContent>
                              </Card>
                            ))}

                          </div>
                        </ScrollArea>
                      )}

                    </TabsContent>

                  </Tabs>
                )}

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-3 pt-3 border-t w-full">

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
    </LawyerLayout >
  );
};

export default LawyerConsultations;