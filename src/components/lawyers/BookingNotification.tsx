import { useEffect, useState, useRef } from 'react';
import { rejectButtonStyle, acceptButtonStyle } from '@/lib/buttonStyles';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {

  MessageSquare,
  Phone,
  Video,
  User,
  Bell,
  XCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

interface IncomingRequest {
  id: string;
  consultationId: string;
  clientName: string;
  clientAvatar?: string;
  type: 'chat' | 'audio' | 'video';
  amount: number;
  agenda?: string | null;
  countdown: number;
  statusMessage?: string;
}

interface BookingNotificationProviderProps {
  children: React.ReactNode;
}

const parseAgenda = (agenda: string | null | undefined) => {
  if (!agenda) return { category: '', details: '' };

  const categoryMatch = agenda.match(/^\[(.+?)\]/);
  // const urgencyMatch = agenda.match(/\]\s*\[(.+?)\]/);
  const details = agenda
    .replace(/^\[.+?\](\s*\[.+?\])*/g, '')
    .replace(/^\n/, '');

  return {
    category: categoryMatch?.[1] || '',
    // urgency: urgencyMatch?.[1] || '',
    details: details || agenda,
  };
};

// Helper to strip out everything from "Issue Details:" onward
const cleanAgendaForDisplay = (fullAgenda: string | null): string => {
  if (!fullAgenda) return 'General Consultation';

  // Splits the string at 'Issue Details:' (case-insensitive)
  const parts = fullAgenda.split(/Issue Details:/i);

  // Returns only the first part containing the categories, neatly trimmed
  return parts[0].trim();
};

export const BookingNotificationProvider = ({ children }: BookingNotificationProviderProps) => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {

    if (!user) return;

    const checkLawyerAndSubscribe = async () => {

      const { data: lawyerProfile } = await supabase
        .from('lawyer_profiles')
        // .from('lawyer_profile')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!lawyerProfile) return;

      const channel = supabase
        .channel('lawyer-booking-notifications-global')
        .on(
          'postgres_changes',
          {
            event: '*', // ✅ IMPORTANT: listen to INSERT + UPDATE
            schema: 'public',
            table: 'consultations',
            filter: `lawyer_id=eq.${user.id}`,
          },
          async (payload) => {
            console.log("🔥 Realtime triggered:", payload); // DEBUG

            const consultation = payload.new as any;

            // =========================
            // ✅ NEW REQUEST (INSERT)
            // =========================
            if (
              payload.eventType === 'INSERT' &&
              consultation.status === 'pending'
            ) {

              const { data: clientProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', consultation.client_id)
                .single();

              const reqId = consultation.id;

              // const newReq: IncomingRequest = {
              //   id: reqId,
              //   consultationId: consultation.id,
              //   clientName: clientProfile?.full_name || 'Client',
              //   clientAvatar: clientProfile?.avatar_url || undefined,
              //   type: consultation.type,
              //   amount: consultation.total_amount || 0,
              //   agenda: consultation.agenda,
              //   countdown: 60,
              // };
              // ✅ UPDATED CODE
              const newReq: IncomingRequest = {
                id: reqId,
                consultationId: consultation.id,
                clientName: clientProfile?.full_name || 'Client',
                clientAvatar: clientProfile?.avatar_url || undefined,
                // type: consultation.type,
                type: consultation.type,
                // Automatically filters out description details, leaving only bracketed categories
                agenda: cleanAgendaForDisplay(consultation.agenda),
                // Reverse the 15% markup to show the lawyer's actual earnings
                amount: consultation.total_amount ? Math.round(consultation.total_amount / 1.15) : 0,
                agenda: consultation.agenda,
                countdown: 60,
              };

              setRequests(prev => [newReq, ...prev]);

              // ⏱ countdown logic (unchanged)
              const interval = setInterval(() => {

                setRequests(prev => {

                  const updated = prev.map(r => {

                    if (r.id === reqId) {

                      if (r.countdown <= 1) {
                        clearInterval(intervalsRef.current.get(reqId)!);
                        intervalsRef.current.delete(reqId);
                        return null;
                      }

                      return { ...r, countdown: r.countdown - 1 };
                    }

                    return r;

                  }).filter(Boolean) as IncomingRequest[];

                  return updated;

                });

              }, 1000);

              intervalsRef.current.set(reqId, interval);

              // 🔔 sound
              try {
                const audio = new Audio('/alertTone.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
              } catch { }

              // 🔔 browser notification
              if (Notification.permission === 'granted') {
                new Notification('New Consultation Request', {
                  body: `${clientProfile?.full_name || 'Client'} requested ${consultation.type} consultation`
                });
              }
            }

            // =========================
            // ❌ CLIENT CANCELLED (UPDATE)
            // =========================
            if (payload.eventType === 'UPDATE') {

              // 🔥 remove instantly if cancelled
              if (consultation.status === 'cancelled') {
                if (intervalsRef.current.has(consultation.id)) {
                  clearInterval(intervalsRef.current.get(consultation.id)!);
                  intervalsRef.current.delete(consultation.id);
                }

                // 2. Show message instead of removing
                setRequests(prev =>
                  prev.map(r =>
                    r.id === consultation.id
                      ? { ...r, statusMessage: 'Client changed their mind' }
                      : r
                  )
                );

                // 3. Remove after 3 seconds
                setTimeout(() => {
                  setRequests(prev => prev.filter(r => r.id !== consultation.id));
                }, 3000);
              }

              // 🔥 also remove if already accepted
              if (consultation.accepted_at) {
                dismissRequest(consultation.id);
              }
            }

          }
        )
        .subscribe();


      // 🔔 request permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // 🧹 cleanup
      return () => {
        supabase.removeChannel(channel);
      };

    };

    const cleanup = checkLawyerAndSubscribe();
    return () => { cleanup.then(fn => fn?.()); };
  }, [user]);

  // Also listen for cancellation of pending consultations (client cancelled while waiting)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('lawyer-booking-cancel-listener')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations',
          filter: `lawyer_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'cancelled') {
            // Remove from requests if still showing
            dismissRequest(updated.id);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };

  }, [user]);

  const dismissRequest = (id: string) => {

    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id)!);
      intervalsRef.current.delete(id);
    }

    setRequests(prev => prev.filter(r => r.id !== id));
    setExpanded(null);

  };

  const handleAccept = async (req: IncomingRequest) => {

    const now = new Date().toISOString();

    try {
      // 1. Send signal
      await supabase.from('call_signals').insert({
        consultation_id: req.consultationId,
        sender_id: user.id,
        type: 'lawyer-accepted',
        data: {}
      });

      // 2. Update consultation with accepted_at
      const { error: updateError } = await supabase
        .from('consultations')
        .update({
          status: 'pending',
          started_at: null,
          accepted_at: now
        })
        .eq('id', req.consultationId);

      // ✅ MARK LAWYER BUSY
      await supabase
        .from('lawyer_profiles')
        .update({
          is_busy: true,
          is_available: true,
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Accepted',
        description: 'Waiting for client payment...'
      });

      dismissRequest(req.id);

      // Store flag to auto-join call when navigating to consultation
      sessionStorage.setItem(`lawyer-accepted:${req.consultationId}`, 'true');

      // Navigate to consultation - it will fetch fresh data
      navigate(`/consultation/${req.consultationId}`);
    } catch (error) {
      console.error('Error accepting consultation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept consultation. Please try again.'
      });
    }
  };

  const handleReject = async (req: IncomingRequest) => {

    await supabase
      .from('consultations')
      .update({ status: 'cancelled' })
      .eq('id', req.consultationId);

    toast({
      title: 'Declined',
      description: 'Client has been notified'
    });

    dismissRequest(req.id);

  };

  const getTypeIcon = (type: string) => {

    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }

  };

  return (
    <>
      {children}

      {requests.length > 0 && (

        // <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto">

          {requests.map(req => {

            const { category, details } = parseAgenda(req.agenda);

            return (

              <div
                key={req.id}
                className="pointer-events-auto bg-card border rounded-xl shadow-2xl w-[90%] max-w-md animate-in zoom-in-95 duration-200"
              >

                {/* SMALL CARD */}


                {expanded !== req.id && (

                  <div
                    onClick={() => setExpanded(req.id)}
                    className="
      relative overflow-hidden
      cursor-pointer
      w-full

      rounded-3xl
      border border-white/80
      bg-white/95

      backdrop-blur-2xl

      px-4 py-4 sm:px-5 sm:py-5

      flex items-center gap-4

      shadow-[0_10px_40px_rgba(0,0,0,0.12)]
      hover:shadow-[0_14px_50px_rgba(0,0,0,0.18)]

      transition-all duration-300
      hover:-translate-y-0.5
    "
                  >

                    {/* Premium Top Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-950/5 via-transparent to-red-900/5 pointer-events-none" />

                    {/* Bell Icon */}
                    <div
                      className="
        relative z-10
        w-11 h-11 sm:w-12 sm:h-12
        rounded-2xl

        bg-gradient-to-br
        from-red-950
        via-red-900
        to-red-800

        flex items-center justify-center
        shadow-lg
        shrink-0
      "
                    >
                      <Bell className="h-5 w-5 text-white animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 relative z-10">

                      <div className="flex items-center gap-2 flex-wrap">

                        <p className="font-semibold text-sm sm:text-[15px] text-gray-900 tracking-tight">
                          New Consultation Request
                        </p>

                        <div className="h-1.5 w-1.5 rounded-full bg-red-700" />

                        <span className="text-[11px] sm:text-xs text-red-900 font-medium">
                          Urgent
                        </span>

                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                        {req.clientName} • ₹{req.amount}
                      </p>

                      <p className="text-[11px] text-gray-400 mt-1">
                        Tap to review consultation request
                      </p>

                    </div>

                    {/* Countdown */}
                    <div className="relative z-10 flex flex-col items-end shrink-0">

                      <Badge
                        className="
          border-0
          bg-gradient-to-r
          from-red-950
          to-red-800

          text-white

          rounded-full
          px-3 py-1

          text-xs
          font-semibold

          shadow-md
        "
                      >
                        {req.countdown}s
                      </Badge>

                      <span className="text-[10px] text-gray-400 mt-1">
                        remaining
                      </span>

                    </div>

                  </div>

                )}






                {/* EXPANDED DIALOG */}
                {expanded === req.id && (

                  <div
                    className="
      relative overflow-hidden

      rounded-3xl
      border border-white/80
      bg-white/95

      backdrop-blur-2xl

      p-5 sm:p-6
      space-y-5

      shadow-[0_18px_60px_rgba(0,0,0,0.15)]
    "
                  >

                    {/* Soft Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-red-950/5 pointer-events-none" />

                    {/* HEADER */}
                    <div className="relative z-10 flex items-start gap-4">

                      {/* Avatar */}
                      <div
                        className="
          w-12 h-12 sm:w-14 sm:h-14
          rounded-2xl
          overflow-hidden
          border border-gray-200
          bg-gray-100
          shadow-sm
          shrink-0
        "
                      >
                        {req.clientAvatar ? (
                          <img
                            src={req.clientAvatar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <p className="font-semibold text-[15px] sm:text-base text-gray-900 truncate">
                              {req.clientName}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-gray-500 mt-1">

                              <span className="flex items-center gap-1">
                                {getTypeIcon(req.type)}

                                <span className="capitalize">
                                  {req.type}
                                </span>
                              </span>

                              <span className="text-gray-300">•</span>

                              <span className="font-semibold text-primary">
                                ₹{req.amount}
                              </span>

                            </div>

                          </div>

                          {/* Countdown */}
                          <Badge
                            className="
              border-0
              bg-gradient-to-r
              from-red-950
              to-red-800

              text-white

              px-3 py-1
              rounded-full

              text-xs
              font-semibold

              shadow-md
              shrink-0
            "
                          >
                            {req.countdown}s
                          </Badge>

                        </div>

                      </div>

                    </div>

                    {/* AGENDA */}
                    {req.agenda && (

                      <div
                        className="
          relative z-10

          rounded-2xl
          border border-gray-200

          bg-gray-50/90

          p-4
          space-y-3
        "
                      >

                        {/* Agenda Header */}
                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Consultation Agenda
                            </p>

                            <p className="text-[11px] text-gray-500">
                              Review details before responding
                            </p>
                          </div>

                        </div>

                        {/* Category */}
                        {category && (

                          <div className="flex gap-2 flex-wrap">

                            <Badge
                              variant="outline"
                              className="
                rounded-full
                border-primary/20
                bg-primary/5
                text-primary
                px-3 py-1
              "
                            >
                              {category}
                            </Badge>

                          </div>

                        )}

                        {/* Details */}
                        {details && (
                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            {details}
                          </p>
                        )}

                        {/* Status */}
                        {req.statusMessage && (

                          <div
                            className="
              rounded-xl
              border border-red-200
              bg-red-50

              px-3 py-2
            "
                          >
                            <p className="text-xs text-red-700 text-center font-medium">
                              {req.statusMessage}
                            </p>
                          </div>

                        )}

                      </div>

                    )}

                    {/* ACTION BUTTONS */}
                    <div className="relative z-10 grid grid-cols-2 gap-3">

                      {/* Reject */}
                      <Button
                        variant="outline"
                        className={cn(rejectButtonStyle)}
                        onClick={() => handleReject(req)}
                        disabled={!!req.statusMessage}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>

                      {/* Accept */}
                      <Button
                        className={cn(acceptButtonStyle)}
                        onClick={() => handleAccept(req)}
                        disabled={!!req.statusMessage}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>

                    </div>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}

    </>
  );

};