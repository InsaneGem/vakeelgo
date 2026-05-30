
// import { useState, useEffect, useCallback } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { useToast } from '@/hooks/use-toast';

// interface IncomingCall {
//   consultationId: string;
//   callType: 'audio' | 'video';
//   callerName: string;
//   callerId: string;
// }

// export const useIncomingCalls = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

//   const fetchCallerName = useCallback(async (callerId: string): Promise<string> => {
//     const { data } = await supabase
//       .from('profiles')
//       .select('full_name')
//       .eq('id', callerId)
//       .single();
//     return data?.full_name || 'Unknown Caller';
//   }, []);

//   // Accept: store flag so Consultation page auto-opens the call, then navigate.
//   // We do NOT send 'call-accepted' here — the AudioCall/VideoCall will send it
//   // after media stream + peer connection are ready (avoids racing the offer).
//   const acceptCall = useCallback(() => {
//     if (!incomingCall) return;
//     try {
//       sessionStorage.setItem(
//         `auto-open-call:${incomingCall.consultationId}`,
//         incomingCall.callType
//       );
//     } catch { }
//     navigate(`/consultation/${incomingCall.consultationId}`);
//     // Notify already-mounted Consultation page (same route → no remount)
//     window.dispatchEvent(
//       new CustomEvent('auto-open-call', {
//         detail: {
//           consultationId: incomingCall.consultationId,
//           callType: incomingCall.callType,
//         },
//       })
//     );
//     setIncomingCall(null);
//   }, [incomingCall, navigate]);

//   const rejectCall = useCallback(async () => {
//     if (!incomingCall || !user) return;
//     await supabase.from('call_signals').insert({
//       consultation_id: incomingCall.consultationId,
//       sender_id: user.id,
//       type: 'call-rejected',
//       data: { rejected_by: user.id },
//     } as any);
//     setIncomingCall(null);
//     toast({ title: 'Call declined' });
//   }, [incomingCall, user, toast]);

//   const dismissCall = useCallback(() => setIncomingCall(null), []);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && incomingCall) dismissCall();
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [incomingCall, dismissCall]);

//   useEffect(() => {
//     if (!user) return;
//     let channel: ReturnType<typeof supabase.channel> | null = null;

//     const setup = async () => {
//       const { data: consultations } = await supabase
//         .from('consultations')
//         .select('id, client_id, lawyer_id, type')
//         .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
//         .in('status', ['pending', 'active']);

//       if (!consultations || consultations.length === 0) return;
//       const consultationIds = consultations.map((c) => c.id);

//       channel = supabase
//         .channel('incoming-calls-global')
//         .on(
//           'postgres_changes',
//           { event: 'INSERT', schema: 'public', table: 'call_signals' },
//           async (payload) => {
//             const signal = payload.new as {
//               consultation_id: string;
//               sender_id: string;
//               type: string;
//             };
//             if (signal.sender_id === user.id) return;
//             if (!consultationIds.includes(signal.consultation_id)) return;

//             if (signal.type === 'call-start') {
//               const consultation = consultations.find((c) => c.id === signal.consultation_id);
//               if (!consultation) return;
//               const callType = consultation.type === 'video' ? 'video' : 'audio';
//               const callerName = await fetchCallerName(signal.sender_id);
//               setIncomingCall({
//                 consultationId: signal.consultation_id,
//                 callType,
//                 callerName,
//                 callerId: signal.sender_id,
//               });
//               if (Notification.permission === 'granted') {
//                 new Notification(`Incoming ${callType} call`, {
//                   body: `${callerName} is calling you`,
//                   icon: '/favicon.ico',
//                   tag: 'incoming-call',
//                 });
//               }
//             }

//             if (
//               signal.type === 'call-end' ||
//               signal.type === 'call-rejected' ||
//               signal.type === 'call-accepted'
//             ) {
//               setIncomingCall((prev) =>
//                 prev?.consultationId === signal.consultation_id ? null : prev
//               );
//             }
//           }
//         )
//         .subscribe();
//     };

//     setup();
//     if (Notification.permission === 'default') Notification.requestPermission();

//     return () => {
//       if (channel) supabase.removeChannel(channel);
//     };
//   }, [user, fetchCallerName]);

//   return { incomingCall, acceptCall, rejectCall, dismissCall };
// };


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface IncomingCall {
  consultationId: string;
  callType: 'audio' | 'video';
  callerName: string;
  callerId: string;
}

// Global background audio controller pointing to your saved file name
const ringtoneAudio = new Audio('/Call.mp3');
ringtoneAudio.loop = true;

const playRingtone = () => {
  ringtoneAudio.currentTime = 0;
  ringtoneAudio.play().catch((err) => {
    console.warn("Ringtone playback paused by browser policies. Please click on the dashboard interface first to allow audio triggers.", err);
  });
};

const stopRingtone = () => {
  ringtoneAudio.pause();
  ringtoneAudio.currentTime = 0;
};

export const useIncomingCalls = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  const fetchCallerName = useCallback(async (callerId: string): Promise<string> => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', callerId)
      .single();
    return data?.full_name || 'Unknown Caller';
  }, []);

  // Accept: store flag so Consultation page auto-opens the call, then navigate.
  // We do NOT send 'call-accepted' here — the AudioCall/VideoCall will send it
  // after media stream + peer connection are ready (avoids racing the offer).
  const acceptCall = useCallback(() => {
    if (!incomingCall) return;

    stopRingtone(); // Stop audio track immediately on accepting incoming stream

    try {
      sessionStorage.setItem(
        `auto-open-call:${incomingCall.consultationId}`,
        incomingCall.callType
      );
    } catch { }
    navigate(`/consultation/${incomingCall.consultationId}`);
    // Notify already-mounted Consultation page (same route → no remount)
    window.dispatchEvent(
      new CustomEvent('auto-open-call', {
        detail: {
          consultationId: incomingCall.consultationId,
          callType: incomingCall.callType,
        },
      })
    );
    setIncomingCall(null);
  }, [incomingCall, navigate]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall || !user) return;

    stopRingtone(); // Stop audio track immediately when declining connection

    await supabase.from('call_signals').insert({
      consultation_id: incomingCall.consultationId,
      sender_id: user.id,
      type: 'call-rejected',
      data: { rejected_by: user.id },
    } as any);
    setIncomingCall(null);
    toast({ title: 'Call declined' });
  }, [incomingCall, user, toast]);

  const dismissCall = useCallback(() => {
    stopRingtone(); // Stop audio track if popup overlay drops
    setIncomingCall(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && incomingCall) dismissCall();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [incomingCall, dismissCall]);

  useEffect(() => {
    if (!user) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      const { data: consultations } = await supabase
        .from('consultations')
        .select('id, client_id, lawyer_id, type')
        .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
        .in('status', ['pending', 'active']);

      if (!consultations || consultations.length === 0) return;
      const consultationIds = consultations.map((c) => c.id);

      channel = supabase
        .channel('incoming-calls-global')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'call_signals' },
          async (payload) => {
            const signal = payload.new as {
              consultation_id: string;
              sender_id: string;
              type: string;
            };
            if (signal.sender_id === user.id) return;
            if (!consultationIds.includes(signal.consultation_id)) return;

            if (signal.type === 'call-start') {
              const consultation = consultations.find((c) => c.id === signal.consultation_id);
              if (!consultation) return;
              const callType = consultation.type === 'video' ? 'video' : 'audio';
              const callerName = await fetchCallerName(signal.sender_id);
              setIncomingCall({
                consultationId: signal.consultation_id,
                callType,
                callerName,
                callerId: signal.sender_id,
              });

              playRingtone(); // Fire audio loop player upon receiving call signal

              if (Notification.permission === 'granted') {
                new Notification(`Incoming ${callType} call`, {
                  body: `${callerName} is calling you`,
                  icon: '/favicon.ico',
                  tag: 'incoming-call',
                });
              }
            }

            if (
              signal.type === 'call-end' ||
              signal.type === 'call-rejected' ||
              signal.type === 'call-accepted'
            ) {
              setIncomingCall((prev) => {
                if (prev?.consultationId === signal.consultation_id) {
                  stopRingtone(); // Drop audio feed if caller hangs up or answers elsewhere
                  return null;
                }
                return prev;
              });
            }
          }
        )
        .subscribe();
    };

    setup();
    if (Notification.permission === 'default') Notification.requestPermission();

    return () => {
      if (channel) supabase.removeChannel(channel);
      stopRingtone(); // Ensure absolute silencing if the functional interface component drops
    };
  }, [user, fetchCallerName]);

  return { incomingCall, acceptCall, rejectCall, dismissCall };
};