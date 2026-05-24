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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/dashboard')}>
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
                            <p className="text-muted-foreground text-xs mt-0.5">Manage Ongoing Consultations In Real-Time</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 text-[10px] px-2 py-1 hidden sm:flex">
                            <Activity className="h-3 w-3 text-blue-500" /> Live
                        </Badge>
                        <Button variant="outline" size="sm" onClick={fetchSessions} className="gap-1.5 h-8 text-xs">
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
                    <div className="space-y-3">
                        {sessions.map((session, index) => (
                            <Card
                                key={session.id}
                                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in relative"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-500" />
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Lawyer info */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden ring-1 ring-blue-500/30">
                                                    {session.lawyer_avatar ? (
                                                        <img src={session.lawyer_avatar} alt={session.lawyer_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-background" />
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm truncate">{session.lawyer_name}</h3>
                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                    <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5">
                                                        {getTypeIcon(session.type)} {session.type}
                                                    </Badge>
                                                    <span className="text-[10px] text-blue-600 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {getElapsedTime(session.started_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                className="gap-1 h-7 text-xs px-3"
                                                onClick={(e) => { e.stopPropagation(); navigate(`/consultation/${session.id}`); }}
                                            >
                                                Continue <ArrowRight className="h-3 w-3" />
                                            </Button>
                                            {/* <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                                disabled={endingId === session.id}
                                                onClick={(e) => { e.stopPropagation(); handleEndSession(session.id); }}
                                            >
                                                {endingId === session.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                                End
                                            </Button> */}
                                        </div>
                                    </div>
                                    {/* Footer info */}
                                    <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            Started {session.started_at ? new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                        </span>
                                        {session.total_amount && (
                                            <span className="font-medium text-foreground">${Number(session.total_amount).toFixed(2)}</span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Shield className="h-2.5 w-2.5 text-emerald-500" /> Encrypted
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {/* Tips */}
                {/* <Card className="mt-6 border-0 shadow-sm bg-secondary/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-serif">💡 Session Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            {[
                                { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-500/10', title: 'Stay Connected', desc: 'Keep your browser open for notifications.' },
                                { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-500/10', title: 'Privacy Matters', desc: 'All sessions are end-to-end encrypted.' },
                                { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-500/10', title: 'Time Tracking', desc: 'Duration tracked for billing automatically.' },
                            ].map((tip, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className={`w-6 h-6 rounded-md ${tip.bg} flex items-center justify-center shrink-0`}>
                                        <tip.icon className={`h-3 w-3 ${tip.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[11px]">{tip.title}</p>
                                        <p className="text-muted-foreground text-[10px] mt-0.5">{tip.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </ClientLayout>
    );
};
export default ClientActiveSessions;