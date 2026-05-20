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
      .select('id, type, status, created_at, started_at, ended_at, total_amount, duration_minutes, lawyer_id')
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
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 flex-shrink-0 border border-border">
                            <AvatarImage src={c.lawyer_avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold">
                              {c.lawyer_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                {c.lawyer_name}
                              </p>

                              <Badge className={`text-[10px] px-1.5 py-0 gap-1 ${sc.className}`}>
                                {sc.icon}
                                {c.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                {getTypeIcon(c.type)}
                                <span className="capitalize">{c.type}</span>
                              </span>

                              <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />

                              <span className="hidden sm:inline">
                                {new Date(c.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>

                              {c.duration_minutes && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />
                                  <span className="hidden sm:inline">
                                    {formatDuration(c.duration_minutes)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">

                            {c.status === 'completed' && !ratedConsultationIds.has(c.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRatingTarget(c);
                                }}
                              >
                                <Star className="h-3.5 w-3.5 fill-amber-400" />
                                Rate
                              </Button>
                            )}

                            {c.total_amount && (
                              <span className="text-sm font-semibold text-foreground hidden sm:block">
                                ₹{c.total_amount.toFixed(2)}
                              </span>
                            )}

                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
                      {selectedConsultation.lawyer_rating ? `${selectedConsultation.lawyer_rating.toFixed(1)} ★` : 'No rating'}
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
                      {new Date(selectedConsultation.created_at).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit'
                        }
                      )}
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
              <div className="px-6 pb-6">
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
                    <TabsContent value="chat" className="mt-3">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-10">
                          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No messages in this session</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[200px] pr-2">
                          <div className="space-y-2">

                            {chatMessages.map((msg) => {
                              const isOwn = msg.sender_id === user?.id;

                              return (
                                <div
                                  key={msg.id}
                                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`
              max-w-[85%]
              rounded-xl
              px-2.5
              py-1.5
              break-words
              overflow-hidden
              text-wrap
              shadow-sm
              ${isOwn
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-secondary text-secondary-foreground rounded-bl-sm'}
            `}
                                  >

                                    <p className="text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap break-words">
                                      {msg.content}
                                    </p>

                                    <p
                                      className={`
                text-[9px]
                mt-1
                text-right
                ${isOwn
                                          ? 'text-primary-foreground/60'
                                          : 'text-muted-foreground'}
              `}
                                    >
                                      {new Date(msg.created_at).toLocaleTimeString(
                                        'en-US',
                                        {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }
                                      )}
                                    </p>

                                  </div>
                                </div>
                              );
                            })}

                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
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

                              <Card
                                key={rec.id}
                                className="border shadow-none"
                              >
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
                                            : 'Unknown duration'}
                                          {' · '}
                                          {new Date(rec.created_at).toLocaleTimeString(
                                            'en-US',
                                            {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            }
                                          )}
                                        </p>
                                      </div>

                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">

                                      <Button
                                        size="sm"
                                        variant={
                                          activeRecordingId === rec.id
                                            ? 'secondary'
                                            : 'outline'
                                        }
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

                                  {activeRecordingId === rec.id &&
                                    recordingUrls[rec.id] && (
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
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t sm:flex-row">
                  {selectedConsultation.status === 'completed' && !ratedConsultationIds.has(selectedConsultation.id) && (
                    <Button
                      className="flex-1 gap-2"
                      variant="default"
                      onClick={() => { setDetailOpen(false); setRatingTarget(selectedConsultation); }}
                    >
                      <Star className="h-4 w-4" />
                      Rate Lawyer
                    </Button>
                  )}
                  {selectedConsultation.status === 'active' && (
                    <Button className="flex-1 gap-2" onClick={() => { setDetailOpen(false); navigate(`/consultation/${selectedConsultation.id}`); }}>

                      Continue Session
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1" onClick={() => setDetailOpen(false)}>
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