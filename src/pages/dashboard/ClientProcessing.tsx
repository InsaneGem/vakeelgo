import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft, ArrowRight, Video, Phone, MessageSquare, Clock,
    User, Loader2, RefreshCw, AlertCircle, CheckCircle, XCircle,
    HelpCircle, Timer
} from 'lucide-react';
const COUNTDOWN_MINUTES = 15; // same as booking logic
interface PendingBooking {
    id: string;
    type: 'chat' | 'audio' | 'video';
    status: string;
    created_at: string;
    total_amount: number | null;
    lawyer_id: string;
    lawyer_name: string;
    lawyer_avatar: string | null;
    lawyer_specializations: string[] | null;
}
const CountdownBadge = ({ createdAt, onExpire }: { createdAt: string; onExpire: () => void }) => {
    const [remaining, setRemaining] = useState('');
    const [expired, setExpired] = useState(false);
    useEffect(() => {
        const calc = () => {
            const end = new Date(createdAt).getTime() + COUNTDOWN_MINUTES * 60000;
            const diff = Math.max(0, end - Date.now());
            if (diff <= 0) { setExpired(true); setRemaining('0:00'); onExpire(); return; }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
        };
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [createdAt, onExpire]);
    if (expired) return null;
    const end = new Date(createdAt).getTime() + COUNTDOWN_MINUTES * 60000;
    const diff = Math.max(0, end - Date.now());
    const isUrgent = diff < 120000; // < 2 min
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold tabular-nums ${isUrgent ? 'text-destructive animate-pulse' : 'text-amber-600'}`}>
            <Timer className="h-3 w-3" />
            {remaining}
        </span>
    );
};
const ClientProcessing = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [bookings, setBookings] = useState<PendingBooking[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!authLoading && !user) { navigate('/login'); return; }
        if (user) {
            fetchBookings();
            const channel = supabase
                .channel('processing-bookings')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations', filter: `client_id=eq.${user.id}` }, () => fetchBookings())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [user, authLoading]);
    const fetchBookings = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('consultations')
            .select('id, type, status, created_at, total_amount, lawyer_id')
            .eq('client_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (data && data.length > 0) {
            const lawyerIds = [...new Set(data.map(c => c.lawyer_id))];
            const [{ data: profiles }, { data: lawyerProfiles }] = await Promise.all([
                supabase.from('profiles').select('id, full_name, avatar_url').in('id', lawyerIds),
                supabase.from('lawyer_profiles').select('user_id, specializations').in('user_id', lawyerIds),
            ]);
            setBookings(data.map(b => {
                const p = profiles?.find(p => p.id === b.lawyer_id);
                const lp = lawyerProfiles?.find(lp => lp.user_id === b.lawyer_id);
                return { ...b, lawyer_name: p?.full_name || 'Legal Professional', lawyer_avatar: p?.avatar_url || null, lawyer_specializations: lp?.specializations || null };
            }));
        } else {
            setBookings([]);
        }
        setLoading(false);
    }, [user]);
    const handleCancel = async (id: string) => {
        await supabase.from('consultations').update({ status: 'cancelled' }).eq('id', id);
        toast({ title: 'Booking Cancelled', description: 'Your booking request has been cancelled.' });
        fetchBookings();
    };
    const handleExpire = useCallback((id: string) => {
        // Auto-cancel expired bookings
        supabase.from('consultations').update({ status: 'cancelled' }).eq('id', id).then(() => {
            toast({ title: 'Booking Expired', description: 'The request timed out and was automatically cancelled.' });
            fetchBookings();
        });
    }, [fetchBookings, toast]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-3.5 w-3.5" />;
            case 'audio': return <Phone className="h-3.5 w-3.5" />;
            default: return <MessageSquare className="h-3.5 w-3.5" />;
        }

    };
    if (authLoading || loading) {
        return (
            <ClientLayout>
                <div className="container mx-auto px-4 py-6 max-w-3xl">
                    <Skeleton className="h-8 w-40 mb-4" />
                    <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
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
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                                </span>
                                Processing Bookings
                            </h1>
                            <p className="text-muted-foreground text-xs mt-0.5">
                                Waiting for lawyer confirmation
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchBookings}
                        className="gap-1.5 h-8 text-xs"
                    >
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                </div>
                {/* Status Flow */}
                <Card className="border-0 shadow-sm mb-5 bg-amber-500/5">
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-1 overflow-x-auto">
                            {[
                                { icon: CheckCircle, label: 'Sent', done: true, color: 'text-emerald-600' },
                                { icon: Loader2, label: 'Awaiting', done: true, color: 'text-amber-600', spin: true },
                                { icon: CheckCircle, label: 'Confirmed', done: false, color: 'text-muted-foreground' },
                                { icon: CheckCircle, label: 'Session', done: false, color: 'text-muted-foreground' },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${step.done ? 'bg-card shadow-sm border border-border' : ''}`}>
                                        <step.icon className={`h-3 w-3 ${step.color} ${step.spin ? 'animate-spin' : ''}`} />
                                        <span className={`text-[10px] font-medium whitespace-nowrap ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                                    </div>
                                    {i < 3 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                {/* Bookings */}
                {bookings.length === 0 ? (
                    <Card className="border-0 shadow-md">
                        <CardContent className="py-14 text-center">
                            <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                                <CheckCircle className="h-7 w-7 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-semibold font-serif">All Clear!</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-4">
                                No pending bookings. Ready to book a new consultation?
                            </p>
                            <Button size="sm" onClick={() => navigate('/lawyers')} className="gap-1.5">
                                Book Now <ArrowRight className="h-3.5 w-3.5" />
                            </Button>

                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {bookings.map((booking, index) => (
                            <Card
                                key={booking.id}
                                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in relative"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                <div className="absolute top-0 left-0 w-0.5 h-full bg-amber-500" />
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Lawyer info */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden ring-1 ring-amber-500/30">
                                                    {booking.lawyer_avatar ? (
                                                        <img src={booking.lawyer_avatar} alt={booking.lawyer_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-background" />
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm truncate">{booking.lawyer_name}</h3>
                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                    <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5">
                                                        {getTypeIcon(booking.type)} {booking.type}
                                                    </Badge>
                                                    {booking.lawyer_specializations?.slice(0, 1).map(s => (
                                                        <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{s}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Countdown + Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <CountdownBadge createdAt={booking.created_at} onExpire={() => handleExpire(booking.id)} />
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                                                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Awaiting
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                                onClick={() => handleCancel(booking.id)}
                                            >
                                                <XCircle className="h-3 w-3" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Footer */}
                                    <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            {new Date(booking.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {booking.total_amount && (
                                            <span className="font-medium text-foreground">${Number(booking.total_amount).toFixed(2)}</span>
                                        )}
                                        <span className="flex items-center gap-1 sm:hidden">
                                            <CountdownBadge createdAt={booking.created_at} onExpire={() => handleExpire(booking.id)} />
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HelpCircle className="h-2.5 w-2.5" /> ~5-15 min response
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {/* FAQ */}
                <Card className="mt-6 border-0 shadow-sm bg-secondary/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-serif">❓ FAQ</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3 text-xs">
                        {[
                            { q: 'How long does a lawyer take to respond?', a: 'Most respond within 5-15 minutes. Auto-cancelled after 15 min.' },
                            { q: 'Can I cancel a pending booking?', a: 'Yes, cancel anytime before acceptance. Payment is refunded immediately.' },
                            { q: 'What happens after the lawyer accepts?', a: "You'll be notified instantly and can join from Active Sessions." },
                        ].map((faq, i) => (
                            <div key={i}>
                                <p className="font-medium text-[11px]">{faq.q}</p>
                                <p className="text-muted-foreground text-[10px] mt-0.5">{faq.a}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </div>
        </ClientLayout >
    );
};
export default ClientProcessing;