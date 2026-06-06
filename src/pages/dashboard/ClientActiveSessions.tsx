import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { lawyerCardStyle, acceptButtonStyle } from '@/lib/buttonStyles';
import {
    ArrowLeft, ArrowRight, Video, Phone, MessageSquare, Clock,
    User, Zap, Activity, Shield, Timer, RefreshCw, XCircle
} from 'lucide-react';
interface ActiveSession {
    id: string;
    type: 'chat' | 'audio' | 'video';
    status: string;
    // created_at: string;
    started_at: string | null;
    total_amount: number | null;
    lawyer_id: string;
    lawyer_name: string;
    lawyer_avatar: string | null;
    lawyer_specializations: string[] | null;
    // lawyer_rating: number | null;
}
const ClientActiveSessions = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const { toast } = useToast();
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [endingId, setEndingId] = useState<string | null>(null);
    const [, setTick] = useState(0);
    // Live timer tick every 30s
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) { navigate('/login'); return; }
        if (user) {
            fetchSessions();
            const channel = supabase
                .channel('active-sessions')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations', filter: `client_id=eq.${user.id}` }, () => fetchSessions())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [user, authLoading]);
    const fetchSessions = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('consultations')
            // .select('id, type, status, created_at, started_at, total_amount, lawyer_id')
            .select('id, type, status, started_at, total_amount, lawyer_id')

            .eq('client_id', user.id)
            .eq('status', 'active')
            .order('started_at', { ascending: false });
        if (data && data.length > 0) {
            const lawyerIds = [...new Set(data.map(c => c.lawyer_id))];
            const [{ data: profiles }, { data: lawyerProfiles }] = await Promise.all([
                supabase.from('profiles').select('id, full_name, avatar_url').in('id', lawyerIds),
                // supabase.from('lawyer_profiles').select('user_id, specializations, rating').in('user_id', lawyerIds),
                supabase.from('lawyer_profiles').select('user_id, specializations').in('user_id', lawyerIds),
            ]);
            setSessions(data.map(s => {
                const p = profiles?.find(p => p.id === s.lawyer_id);
                const lp = lawyerProfiles?.find(lp => lp.user_id === s.lawyer_id);
                return { ...s, lawyer_name: p?.full_name || 'Legal Professional', lawyer_avatar: p?.avatar_url || null, lawyer_specializations: lp?.specializations || null };
            }));
        } else {
            setSessions([]);
        }
        setLoading(false);
    }, [user]);
    const handleEndSession = async (id: string) => {
        setEndingId(id);
        try {
            await supabase.from('consultations')
                .update({ status: 'completed', ended_at: new Date().toISOString() })
                .eq('id', id);



            toast({ title: 'Session Ended', description: 'The consultation has been completed.' });
            fetchSessions();
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not end session.' });
        } finally {
            setEndingId(null);
        }
    };
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-3.5 w-3.5" />;
            case 'audio': return <Phone className="h-3.5 w-3.5" />;
            default: return <MessageSquare className="h-3.5 w-3.5" />;
        }
    };

    const getElapsedTime = (startedAt: string | null) => {
        if (!startedAt) return '< 1 min';
        const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
        if (diff < 1) return '< 1 min';
        if (diff < 60) return `${diff}m`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    };
    if (authLoading || loading) {
        return (
            <ClientLayout>
                <div className="container mx-auto px-4 py-6 max-w-3xl">
                    <Skeleton className="h-8 w-40 mb-4" />
                    <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
                </div>
            </ClientLayout>
        );
    }
    return (
        <ClientLayout>
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {/* Back Button: Hidden on mobile, visible on desktop */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex h-8 w-8"
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>

                        <div>
                            <h1 className="font-serif text-xl sm:text-2xl font-bold flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                                </span>
                                Active Sessions
                            </h1>
                            <p className="text-muted-foreground text-xs mt-0.5">
                                Manage Ongoing Consultations In Real-Time
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 text-[10px] px-2 py-1 hidden sm:flex">
                            <Activity className="h-3 w-3 text-blue-500" /> Live
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchSessions}
                            className="gap-1.5 h-8 text-xs"
                        >
                            <RefreshCw className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'Active', value: sessions.length, color: 'text-blue-600' },
                        { label: 'Video', value: sessions.filter(s => s.type === 'video').length, color: 'text-purple-600' },
                        { label: 'Chat/Audio', value: sessions.filter(s => s.type !== 'video').length, color: 'text-emerald-600' },
                    ].map((s, i) => (
                        <Card key={i} className="border-0 shadow-sm">
                            <CardContent className="p-3 text-center">
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {/* Sessions */}
                {sessions.length === 0 ? (
                    <Card className="border-0 shadow-md">
                        <CardContent className="py-14 text-center">
                            <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center animate-pulse">
                                <Activity className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold font-serif">No Active Sessions</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-4">
                                You don't have any ongoing consultations right now.
                            </p>
                            <Button size="sm" onClick={() => navigate('/lawyers')} className="gap-1.5">
                                Find a Lawyer <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session, index) => (
                            <Card
                                key={session.id}
                                className={cn("p-0 overflow-hidden", lawyerCardStyle, "h-auto min-h-0")}
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                {/* Premium left accent indicator with layout responsive hover width extension */}
                                {/* <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-[4px]" /> */}

                                {/* Ambient inner background hover tint for active connections */}
                                {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/[0.01] to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" /> */}

                                <CardContent className="p-2.5 relative z-10">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Lawyer Profile Metadata */}
                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                            <div className="relative shrink-0">
                                                {/* Polished Gradient Profile Frame Ring */}
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/10 dark:ring-blue-400/20 shadow-inner group-hover:ring-blue-500/20 transition-all duration-300">
                                                    {session.lawyer_avatar ? (
                                                        <img src={session.lawyer_avatar} alt={session.lawyer_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-blue-600/80 dark:text-blue-400" />
                                                    )}
                                                </div>
                                                {/* Live Session Online Status Beacon */}
                                                <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                                </span>
                                            </div>

                                            <div className="min-w-0 space-y-1">
                                                <h3 className="font-semibold text-[14px] leading-tight text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-blue-600 transition-colors duration-200 truncate">
                                                    {session.lawyer_name}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Type Category Badge */}
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1 text-[10px] font-medium tracking-wide bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60 uppercase px-2 py-0 h-5 rounded-md"
                                                    >
                                                        {getTypeIcon(session.type)} <span className="ml-0.5">{session.type}</span>
                                                    </Badge>
                                                    {/* Active Counter Live Display */}
                                                    <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-500/10 px-2 py-0 h-5 inline-flex items-center gap-1 rounded-md border border-blue-100/40 dark:border-blue-400/10">
                                                        <Clock className="h-2.5 w-2.5 animate-pulse" />
                                                        {getElapsedTime(session.started_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Controls */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                className={cn(acceptButtonStyle, "px-3")}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/consultation/${session.id}`);
                                                }}
                                            >
                                                Continue
                                                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Card Structural Footer Divider and Metadata */}
                                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                Started: <span className="font-medium text-slate-600 dark:text-slate-300">{session.started_at ? new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Shield className="h-3 w-3 text-emerald-500/90" />
                                                <span className="font-medium text-slate-600 dark:text-slate-300">Secure Live Connection</span>
                                            </span>
                                        </div>

                                        {session.total_amount && (
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium tracking-wider mr-1.5">Paid:</span>
                                                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700/40">
                                                    ${Number(session.total_amount).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

            </div>
        </ClientLayout>
    );
};
export default ClientActiveSessions;