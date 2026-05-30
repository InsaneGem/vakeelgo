import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
    ArrowLeft, Video, Phone, MessageSquare, Play, Clock,
    Calendar, User, FileVideo, Loader2, Download, HardDrive
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
interface RecordingWithDetails {
    id: string;
    consultation_id: string;
    storage_path: string;
    duration_seconds: number | null;
    file_size_bytes: number | null;
    created_at: string;
    recorded_by: string;
    consultation?: {
        type: 'chat' | 'audio' | 'video';
        status: string;
        created_at: string;
        total_amount: number | null;
        duration_minutes: number | null;
        client_id: string;
        lawyer_id: string;
    };
    participant_name?: string;
    playback_url?: string;
}
const ClientRecordings = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [recordings, setRecordings] = useState<RecordingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [loadingPlaybackId, setLoadingPlaybackId] = useState<string | null>(null);
    const { toast } = useToast();
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }
        if (user) fetchRecordings();
    }, [user, authLoading]);
    const fetchRecordings = async () => {
        if (!user) return;
        // Get all recordings for consultations where user is client or lawyer
        const { data: userConsultations } = await supabase
            .from('consultations')
            .select('id, type, status, created_at, total_amount, duration_minutes, client_id, lawyer_id')
            .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`);
        if (!userConsultations || userConsultations.length === 0) {
            setRecordings([]);
            setLoading(false);
            return;
        }
        const consultationIds = userConsultations.map(c => c.id);
        const { data: recordingsData } = await supabase
            .from('call_recordings')
            .select('*')
            .in('consultation_id', consultationIds)
            .order('created_at', { ascending: false });
        if (!recordingsData || recordingsData.length === 0) {
            setRecordings([]);
            setLoading(false);
            return;
        }
        // Get participant names
        const otherUserIds = [
            ...new Set(
                userConsultations.map(c => c.client_id === user.id ? c.lawyer_id : c.client_id)
            ),
        ];
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', otherUserIds);
        // Build enriched recordings but do NOT fetch signed URLs yet (on-demand)
        const enriched: RecordingWithDetails[] = recordingsData.map((rec) => {
            const consultation = userConsultations.find(c => c.id === rec.consultation_id);
            const otherUserId = consultation
                ? consultation.client_id === user.id
                    ? consultation.lawyer_id
                    : consultation.client_id
                : null;
            const participantName = profiles?.find(p => p.id === otherUserId)?.full_name || 'Unknown';
            return {
                ...rec,
                consultation: consultation || undefined,
                participant_name: participantName,
                playback_url: undefined,
            };
        });
        setRecordings(enriched);
        setLoading(false);
    };
    const fetchPlaybackUrl = async (rec: RecordingWithDetails) => {
        if (!rec.storage_path) {
            toast({ title: 'Error', description: 'Recording path unavailable', variant: 'destructive' });
            return null;
        }
        try {
            setLoadingPlaybackId(rec.id);
            const { data: urlData, error } = await supabase.storage
                .from('recordings')
                .createSignedUrl(rec.storage_path, 3600);
            if (error || !urlData?.signedUrl) {
                console.error('Failed to create signed url', error);
                toast({ title: 'Error', description: 'Could not get playback URL', variant: 'destructive' });
                return null;
            }
            const signedUrl = urlData.signedUrl;
            setRecordings(prev => prev.map(r => r.id === rec.id ? { ...r, playback_url: signedUrl } : r));
            return signedUrl;
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'Failed to fetch playback URL', variant: 'destructive' });
            return null;
        } finally {
            setLoadingPlaybackId(null);
        }
    };
    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    const getTypeIcon = (type?: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'audio': return <Phone className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };
    if (authLoading || loading) {
        return (
            <ClientLayout>
                <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                    <div className="max-w-3xl mx-auto px-4 py-8">
                        <Skeleton className="h-10 w-48 mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
                        </div>
                    </div>
                </div>
            </ClientLayout>
        );
    }
    return (
        <ClientLayout>
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8 animate-fade-in">
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
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Recordings
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Saved Recent Consultation Recordings.
                            </p>
                        </div>
                    </div>
                    {recordings.length === 0 ? (
                        <div className="text-center py-20 animate-fade-in">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <FileVideo className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-1">No Recordings Yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Recordings will appear here after audio or video consultations.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recordings.map((rec, index) => (
                                <Card
                                    key={rec.id}
                                    className="border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in overflow-hidden"
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-sm truncate">
                                                        {rec.participant_name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0">
                                                            {getTypeIcon(rec.consultation?.type)}
                                                            <span className="capitalize">{rec.consultation?.type || 'call'}</span>
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(rec.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="text-right text-xs text-muted-foreground hidden sm:block">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDuration(rec.duration_seconds)}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <HardDrive className="h-3 w-3" />
                                                        {formatFileSize(rec.file_size_bytes)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Consultation details */}
                                        {rec.consultation && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
                                                <div className="bg-secondary/50 rounded-lg px-2.5 py-1.5">
                                                    <span className="text-muted-foreground block">Duration</span>
                                                    <span className="font-medium">{rec.consultation.duration_minutes || '—'} min</span>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg px-2.5 py-1.5">
                                                    <span className="text-muted-foreground block">Fee</span>
                                                    <span className="font-medium text-emerald-600">
                                                        ${rec.consultation.total_amount?.toFixed(2) || '0.00'}
                                                    </span>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg px-2.5 py-1.5">
                                                    <span className="text-muted-foreground block">Status</span>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px] px-1.5 py-0 mt-0.5",
                                                        rec.consultation.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                            rec.consultation.status === 'active' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                                'bg-muted text-muted-foreground'
                                                    )}>
                                                        {rec.consultation.status}
                                                    </Badge>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg px-2.5 py-1.5">
                                                    <span className="text-muted-foreground block">Recording</span>
                                                    <span className="font-medium">{formatDuration(rec.duration_seconds)}</span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Player */}
                                        {playingId === rec.id && rec.playback_url ? (
                                            <div className="mt-3 rounded-lg overflow-hidden bg-black/5 border">
                                                {rec.consultation?.type === 'video' ? (
                                                    <video
                                                        src={rec.playback_url}
                                                        controls
                                                        autoPlay
                                                        className="w-full max-h-64 rounded-lg"
                                                    />
                                                ) : (
                                                    <audio
                                                        src={rec.playback_url}
                                                        controls
                                                        autoPlay
                                                        className="w-full"
                                                    />
                                                )}
                                            </div>
                                        ) : null}
                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant={playingId === rec.id ? "secondary" : "default"}
                                                className="gap-1.5 text-xs"
                                                onClick={async () => {
                                                    if (playingId === rec.id) {
                                                        setPlayingId(null);
                                                        return;
                                                    }
                                                    if (!rec.playback_url) {
                                                        const url = await fetchPlaybackUrl(rec);
                                                        if (!url) return;
                                                        setPlayingId(rec.id);
                                                        return;
                                                    }
                                                    setPlayingId(rec.id);
                                                }}
                                                disabled={loadingPlaybackId === rec.id}
                                            >
                                                {loadingPlaybackId === rec.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Play className="h-3.5 w-3.5" />
                                                )}
                                                {playingId === rec.id ? 'Hide Player' : 'Play'}
                                            </Button>
                                            {rec.playback_url ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 text-xs"
                                                    asChild
                                                >
                                                    <a href={rec.playback_url} download target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-3.5 w-3.5" />
                                                        Download
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 text-xs"
                                                    onClick={async () => {
                                                        if (loadingPlaybackId === rec.id) return;
                                                        const url = await fetchPlaybackUrl(rec);
                                                        if (url) window.open(url, '_blank');
                                                    }}
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Download
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
};
export default ClientRecordings;
