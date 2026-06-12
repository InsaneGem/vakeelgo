import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatLawyerName } from '@/lib/lawyer-utils';
import { cn } from '@/lib/utils';
import { rejectButtonStyle, acceptButtonStyle, OtherCardStyle } from '@/lib/buttonStyles';
import {
    ArrowLeft, Video, Phone, MessageSquare, Play, Clock,
    Calendar, User, FileVideo, Loader2, Download, HardDrive
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
    participant_avatar?: string | null;
}
const ClientRecordings = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [recordings, setRecordings] = useState<RecordingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [loadingPlaybackId, setLoadingPlaybackId] = useState<string | null>(null);
    const [totalRecordingTime, setTotalRecordingTime] = useState(0);
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
            .select('id, full_name, avatar_url')
            .in('id', otherUserIds);
        const enriched: RecordingWithDetails[] = recordingsData.map((rec) => {
            const consultation = userConsultations.find(
                c => c.id === rec.consultation_id
            );

            const otherUserId = consultation
                ? consultation.client_id === user.id
                    ? consultation.lawyer_id
                    : consultation.client_id
                : null;

            const participantProfile = profiles?.find(
                p => p.id === otherUserId
            );

            return {
                ...rec,
                consultation: consultation || undefined,

                participant_name:
                    // formatLawyerName(participantProfile?.full_name) || 'Unknown',
                    (formatLawyerName(participantProfile?.full_name) || 'U').charAt(0),

                participant_avatar:
                    participantProfile?.avatar_url || null,

                playback_url: undefined,
            };
        });
        setRecordings(enriched);
        const totalSeconds = enriched.reduce(
            (sum, rec) => sum + (rec.duration_seconds || 0),
            0
        );

        setTotalRecordingTime(totalSeconds);
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
    const formatTotalDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        }

        return `${minutes}m ${remainingSeconds}s`;
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
                                    className={cn(OtherCardStyle, "h-auto min-h-0 p-3 flex flex-col justify-between")}
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    <CardContent className="p-3 sm:p-4 space-y-3">
                                        {/* Header: Compact Avatar & Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 shrink-0">
                                                {rec.participant_avatar ? (
                                                    <img
                                                        src={rec.participant_avatar}
                                                        alt={rec.participant_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-sm truncate">{rec.participant_name}</h3>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <span className="capitalize font-medium">{rec.consultation?.type || 'call'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats: Modern Pill Layout */}
                                        {rec.consultation && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {/* <div className="px-2 py-1 rounded-md bg-secondary/50 text-[10px] flex items-center gap-1">
                                                    <span className="text-muted-foreground font-semibold">DUR:</span>
                                                    <span className="font-medium">{formatDuration(rec.duration_seconds)}</span>

                                                </div> */}
                                                <div className="px-2 py-1 rounded-md bg-emerald-50 text-[10px] text-emerald-700 border border-emerald-100 flex items-center gap-1">
                                                    <span className="font-semibold">FEE:</span>
                                                    <span className="font-bold">${rec.consultation.total_amount?.toFixed(2) || '0.00'}</span>
                                                </div>
                                                <div className="px-2 py-1 rounded-md bg-secondary/50 text-[10px] flex items-center gap-1">
                                                    <span className="text-muted-foreground font-semibold">STATUS:</span>
                                                    <span className="font-medium capitalize">{rec.consultation.status}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Player Container */}
                                        {playingId === rec.id && rec.playback_url && (
                                            <div className="rounded-lg overflow-hidden bg-black/5 border">
                                                {rec.consultation?.type === 'video' ? (
                                                    <video
                                                        src={rec.playback_url}
                                                        controls
                                                        autoPlay
                                                        className="w-full max-h-48 rounded-lg"
                                                    />
                                                ) : (
                                                    <audio
                                                        src={rec.playback_url}
                                                        controls
                                                        autoPlay
                                                        className="w-full h-10"
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-1 border-t border-dashed border-secondary/50">

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
