// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import chatBg from '@/assets/chat-bg-01.jpg';
// import {
//   Send, Phone, Video, Clock, ArrowLeft,
//   Loader2, MessageSquare, User, Shield,
//   CheckCircle, Star, Lock, Timer,
//   AlertTriangle, Wallet, PhoneOff,
//   Mic, Paperclip, Smile, XCircle,
//   FileText, Image as ImageIcon, MicOff, Play, Pause, MoreVertical, Trash2
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { VideoCall } from '@/components/consultation/VideoCall';
// import { AudioCall } from '@/components/consultation/AudioCall';
// import { cn } from '@/lib/utils';
// import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
// import { rejectButtonStyle, acceptButtonStyle } from '@/lib/buttonStyles';

// interface Message {
//   id: string;
//   content: string;
//   sender_id: string;
//   created_at: string;
//   deleted?: boolean;
// }

// interface ConsultationData {
//   id: string;
//   type: 'chat' | 'audio' | 'video';
//   status: 'pending' | 'active' | 'completed' | 'cancelled';
//   client_id: string;
//   lawyer_id: string;
//   started_at: string | null;
//   ended_at: string | null;
//   created_at: string;
//   total_amount: number | null;
//   duration_minutes: number | null;
//   notes: string | null;
//   accepted_at: string | null;
// }

// interface ParticipantInfo {
//   id: string;
//   full_name: string;
//   avatar_url: string | null;
// }

// // Voice Message Player Component
// const VoiceMessagePlayer = ({
//   audioUrl,
//   isOwn,
// }: {
//   audioUrl: string;
//   isOwn: boolean;
// }) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [duration, setDuration] = useState(0);
//   const [currentTime, setCurrentTime] = useState(0);
//   const audioRef = useRef<HTMLAudioElement>(null);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     const handleLoadedMetadata = () => setDuration(audio.duration);
//     const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
//     const handleEnded = () => setIsPlaying(false);

//     audio.addEventListener('loadedmetadata', handleLoadedMetadata);
//     audio.addEventListener('timeupdate', handleTimeUpdate);
//     audio.addEventListener('ended', handleEnded);

//     return () => {
//       audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
//       audio.removeEventListener('timeupdate', handleTimeUpdate);
//       audio.removeEventListener('ended', handleEnded);
//     };
//   }, []);

//   const togglePlay = () => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     if (isPlaying) {
//       audio.pause();
//     } else {
//       audio.play();
//     }
//     setIsPlaying(!isPlaying);
//   };

//   const formatTime = (time: number) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);

//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="flex items-center gap-3 w-full min-w-0">
//       <audio ref={audioRef} src={audioUrl} preload="metadata" />

//       <Button
//         variant="ghost"
//         size="icon"
//         onClick={togglePlay}
//         className={cn(
//           'h-10 w-10 rounded-full shrink-0 transition-colors',
//           isOwn
//             ? 'bg-white/15 text-white hover:bg-white/25'
//             : 'bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
//         )}
//       >
//         {isPlaying ? (
//           <Pause className="h-4 w-4" />
//         ) : (
//           <Play className="h-4 w-4" />
//         )}
//       </Button>

//       <div className="flex-1 min-w-0">
//         <div
//           className={cn(
//             'w-full h-1.5 rounded-full overflow-hidden',
//             isOwn ? 'bg-white/25' : 'bg-slate-200/80 dark:bg-white/10'
//           )}
//         >
//           <div
//             className={cn(
//               'h-full rounded-full transition-all duration-150',
//               isOwn ? 'bg-white' : 'bg-slate-950 dark:bg-white'
//             )}
//             style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
//           />
//         </div>

//         <div className={cn('flex justify-end mt-1 text-[11px] font-medium', isOwn ? 'text-white/80' : 'text-slate-500 dark:text-slate-300')}>
//           <span>{formatTime(duration)}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Consultation = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { toast } = useToast();

//   // Core state
//   const [consultation, setConsultation] = useState<ConsultationData | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
//   const [loading, setLoading] = useState(true);


//   // Message state
//   const [newMessage, setNewMessage] = useState('');
//   const [sending, setSending] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [emojiOpen, setEmojiOpen] = useState(false);
//   const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);

//   // Voice recording state
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
//   const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Fetch current user's avatar from profiles
//   useEffect(() => {
//     if (!user?.id) return;
//     supabase
//       .from('profiles')
//       .select('avatar_url')
//       .eq('id', user.id)
//       .single()
//       .then(({ data }) => setMyAvatarUrl(data?.avatar_url ?? null));
//   }, [user?.id]);


//   // Flow state
//   const [lawyerAccepted, setLawyerAccepted] = useState(false);
//   const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
//   const [paymentCountdown, setPaymentCountdown] = useState(120);
//   const [sessionCountdown, setSessionCountdown] = useState(0);
//   // const [sessionCountdown, setSessionCountdown] = useState<number | null>(null);
//   const [paying, setPaying] = useState(false);

//   // Call state
//   const [isVideoCallActive, setIsVideoCallActive] = useState(false);
//   const [isAudioCallActive, setIsAudioCallActive] = useState(false);
//   const [callInitiatedByMe, setCallInitiatedByMe] = useState(false);
//   const [isVideoCallInitiatedByMe, setIsVideoCallInitiatedByMe] = useState(false);
//   const [isAudioCallInitiatedByMe, setIsAudioCallInitiatedByMe] = useState(false);

//   // End state
//   const [showRating, setShowRating] = useState(false);
//   const [showMoodDialog, setShowMoodDialog] = useState(false);
//   const [selectedRating, setSelectedRating] = useState(0);
//   const [ratingComment, setRatingComment] = useState('');
//   const [submittingRating, setSubmittingRating] = useState(false);

//   const autoCompleteRef = useRef(false);
//   const hasHardReloadedRef = useRef(false);

//   // Derived
//   const isClient = consultation?.client_id === user?.id;
//   const isLawyer = consultation?.lawyer_id === user?.id;
//   const isPending = consultation?.status === 'pending';
//   const isActive = consultation?.status === 'active';

//   const isCompleted = consultation?.status === 'completed';
//   const isCancelled = consultation?.status === 'cancelled';


//   const isWaitingForAccept =
//     consultation?.status === 'pending' &&
//     consultation?.started_at === null &&
//     !consultation?.accepted_at &&
//     !lawyerAccepted;

//   const isWaitingForPayment =
//     consultation?.status === 'pending' &&
//     consultation?.started_at === null &&
//     (consultation?.accepted_at !== null || lawyerAccepted);


//   const chatEnabled = consultation?.status === 'active';
//   // const bookedMinutes = consultation?.duration_minutes || 10;
//   const bookedMinutes = consultation?.duration_minutes ?? 0;

//   // ─── Fetch ───
//   const fetchConsultation = useCallback(async () => {
//     if (!id || !user) return;
//     const { data, error } = await supabase
//       .from('consultations')
//       .select('*')
//       .eq('id', id)
//       .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
//       .single();

//     if (error || !data) {
//       toast({ variant: 'destructive', title: 'Error', description: 'Consultation not found.' });

//       // navigate(user?.role === 'lawyer' ? '/lawyer/dashboard' : '/dashboard');
//       navigate(
//         consultation?.lawyer_id === user?.id
//           ? '/lawyer/dashboard'
//           : '/dashboard'
//       );
//       return;
//     }

//     setConsultation(data as ConsultationData);


//     // 🔥 ALWAYS check if accepted signal exists
//     const { data: acceptSignal } = await supabase
//       .from('call_signals')
//       .select('created_at')
//       .eq('consultation_id', id)
//       .eq('type', 'lawyer-accepted')
//       .order('created_at', { ascending: false })
//       .limit(1);

//     if (acceptSignal && acceptSignal.length > 0) {
//       setLawyerAccepted(true);
//       setAcceptedAt(acceptSignal[0].created_at);
//     } else {
//       setLawyerAccepted(false);
//     }

//     // Fetch participant
//     const otherUserId = data.client_id === user.id ? data.lawyer_id : data.client_id;
//     const { data: profile } = await supabase
//       .from('profiles')
//       .select('id, full_name, avatar_url')
//       .eq('id', otherUserId)
//       .single();

//     if (profile) setParticipant(profile);

//     // Wallet payments not used - all payments are via Razorpay at booking time


//     setLoading(false);

//     // 🔥 If lawyer accepted and client initiated a call, auto-activate call UI
//     const lawyerAcceptedKey = `lawyer-accepted:${id}`;
//     if (sessionStorage.getItem(lawyerAcceptedKey) === 'true') {
//       sessionStorage.removeItem(lawyerAcceptedKey);

//       // Check if there's a call-start signal (client initiated call)
//       const { data: callStartSignals } = await supabase
//         .from('call_signals')
//         .select('type')
//         .eq('consultation_id', id)
//         .eq('type', 'call-start')
//         .order('created_at', { ascending: false })
//         .limit(1);

//       if (callStartSignals && callStartSignals.length > 0 && data.type !== 'chat') {
//         // Auto-activate call UI for lawyer to join
//         if (data.type === 'audio') {
//           setIsAudioCallActive(true);
//           setIsAudioCallInitiatedByMe(false);
//         } else if (data.type === 'video') {
//           setIsVideoCallActive(true);
//           setIsVideoCallInitiatedByMe(false);
//         }
//       }
//     }
//   }, [id, user, navigate, toast]);

//   // Auto-open call if user accepted from the global incoming-call popup
//   useEffect(() => {
//     if (!id) return;
//     const key = `auto-open-call:${id}`;
//     const open = (callType: string) => {
//       setCallInitiatedByMe(false);
//       if (callType === 'video') setIsVideoCallActive(true);
//       else setIsAudioCallActive(true);
//     };
//     try {
//       const stored = sessionStorage.getItem(key);
//       if (stored) {
//         sessionStorage.removeItem(key);
//         open(stored);
//       }
//     } catch { }
//     const handler = (e: Event) => {
//       const detail = (e as CustomEvent).detail;
//       if (detail?.consultationId === id) open(detail.callType);
//     };
//     window.addEventListener('auto-open-call', handler as EventListener);
//     return () => window.removeEventListener('auto-open-call', handler as EventListener);
//   }, [id]);

//   const fetchMessages = useCallback(async () => {
//     if (!id) return;
//     const { data } = await supabase
//       .from('messages')
//       .select('*')
//       .eq('consultation_id', id)
//       .order('created_at', { ascending: true });
//     setMessages(data || []);
//   }, [id]);

//   // ─── Init ───
//   useEffect(() => {
//     if (id && user) {
//       fetchConsultation();
//       fetchMessages();
//     }
//   }, [id, user, fetchConsultation, fetchMessages]);

//   // ─── Hard refresh once when the consultation becomes active after payment/acceptance ───
//   useEffect(() => {
//     if (!consultation?.id || hasHardReloadedRef.current) return;
//     if (consultation.status !== 'active') return;

//     const params = new URLSearchParams(window.location.search);
//     if (params.get('hard_reload_done') === '1') return;

//     hasHardReloadedRef.current = true;
//     params.set('hard_reload_done', '1');
//     const target = `${window.location.pathname}?${params.toString()}`;
//     window.location.replace(target);
//   }, [consultation?.id, consultation?.status]);

//   // ─── Realtime: consultation changes ───
//   useEffect(() => {

//     if (!id) return;
//     const channel = supabase
//       .channel(`consultation-${id}`)
//       .on('postgres_changes', {
//         event: 'UPDATE',
//         schema: 'public',
//         table: 'consultations',
//         filter: `id=eq.${id}`,
//       }, (payload) => {
//         const updated = payload.new as ConsultationData;
//         setConsultation(updated);

//         // If status became completed and user is lawyer → redirect
//         if (updated.status === 'completed' && updated.lawyer_id === user?.id) {
//           toast({ title: 'Session Complete', description: 'The consultation has ended.' });
//           setTimeout(() => navigate('/lawyer/dashboard'), 2000);
//         }

//         // If status became completed and user is client → show rating
//         if (updated.status === 'completed' && updated.client_id === user?.id) {
//           setShowRating(true);
//         }

//         // If cancelled
//         if (updated.status === 'cancelled') {
//           toast({ title: 'Consultation Cancelled', description: 'This consultation was cancelled.' });
//           setTimeout(() => navigate(updated.lawyer_id === user?.id ? '/lawyer/dashboard' : '/dashboard'), 2000);
//         }
//       })
//       .subscribe();

//     return () => { supabase.removeChannel(channel); };
//   }, [id, user, navigate, toast]);


//   useEffect(() => {
//     if (!id) return;

//     const channel = supabase
//       .channel(`messages-${id}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "messages",
//           filter: `consultation_id=eq.${id}`,
//         },
//         (payload) => {
//           const newMsg = payload.new as Message;

//           setMessages((prev) => {
//             const exists = prev.some((msg) => msg.id === newMsg.id);
//             if (exists) return prev;

//             return [...prev, newMsg].sort(
//               (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//             );
//           });
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [id]);


//   useEffect(() => {
//     if (!id) return;

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'visible') {
//         fetchMessages();
//       }
//     };

//     const handleOnline = () => {
//       fetchMessages();
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('online', handleOnline);

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       window.removeEventListener('online', handleOnline);
//     };
//   }, [id, fetchMessages]);


//   useEffect(() => {
//     if (!id || !user) return;

//     const channel = supabase
//       .channel(`signals-${id}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'call_signals',
//           filter: `consultation_id=eq.${id}`,
//         },
//         async (payload) => {
//           console.log("🔥 SIGNAL RECEIVED:", payload);
//           const signal = payload.new as {
//             sender_id: string;
//             type: string;
//             created_at: string;
//           };

//           // lawyer accepted - update local state immediately
//           if (signal.type === 'lawyer-accepted') {
//             setConsultation(prev =>
//               prev
//                 ? {
//                   ...prev,
//                   accepted_at: signal.created_at,
//                 }
//                 : prev
//             );
//             setLawyerAccepted(true);
//             setAcceptedAt(signal.created_at);
//           }

//           // incoming call - auto-show call UI
//           if (
//             signal.type === 'call-start' &&
//             signal.sender_id !== user?.id
//           ) {
//             console.log("📞 Incoming call from:", signal.sender_id);
//             if (consultation?.type === 'audio' && !isAudioCallActive) {
//               setIsAudioCallInitiatedByMe(false);
//               setIsAudioCallActive(true);
//               toast({
//                 title: 'Incoming Audio Call',
//                 description: `${participant?.full_name} started an audio call`,
//               });
//             } else if (consultation?.type === 'video' && !isVideoCallActive) {
//               setIsVideoCallInitiatedByMe(false);
//               setIsVideoCallActive(true);
//               toast({
//                 title: 'Incoming Video Call',
//                 description: `${participant?.full_name} started a video call`,
//               });
//             }
//           }

//           // call ended
//           if (signal.type === 'call-end') {
//             setIsAudioCallActive(false);
//             setIsVideoCallActive(false);
//             toast({
//               title: 'Call Ended',
//               description: `${participant?.full_name} ended the call`
//             });
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [id, user?.id, consultation?.type, toast, participant?.full_name]);





//   // ─── Scroll to bottom ───
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // ─── Session countdown ───
//   useEffect(() => {
//     if (!consultation) return;
//     if (consultation.status !== 'active') return;
//     if (!consultation.started_at) return;
//     if (!consultation.duration_minutes) return;

//     const startTime = new Date(consultation.started_at).getTime();
//     const endTime =
//       startTime + consultation.duration_minutes * 60 * 1000;

//     // const tick = () => {
//     //   const remaining = Math.max(
//     //     0,
//     //     Math.floor((endTime - Date.now()) / 1000)
//     //   );

//     //   setSessionCountdown(remaining);

//     //   if (remaining <= 0) {
//     //     handleAutoComplete();
//     //   }
//     // };

//     const tick = () => {
//       const remaining = Math.max(
//         0,
//         Math.floor((endTime - Date.now()) / 1000)
//       );

//       setSessionCountdown(remaining);

//       // 🔥 IMMEDIATE REDIRECT FIX WHEN THE TIMER HITS ZERO
//       if (remaining <= 0) {
//         // 1. Fire existing backend updates to close the room in the database
//         handleAutoComplete();

//         // 2. Immediate route redirection with zero network latency delays
//         if (isLawyer) {
//           navigate('/lawyer/dashboard', { replace: true });
//         } else {
//           // Send clients to main dashboard immediately (Rating popups can render there if needed)
//           navigate('/dashboard', { replace: true });
//         }
//       }
//     };

//     tick();
//     const interval = setInterval(tick, 1000);

//     return () => clearInterval(interval);
//   }, [consultation]);

//   // ─── Payment countdown (lawyer side) ───
//   useEffect(() => {
//     if (!isWaitingForPayment || !acceptedAt) return;

//     let timedOut = false;

//     const interval = setInterval(() => {
//       const acceptTime = new Date(acceptedAt).getTime();
//       const deadline = acceptTime + 2 * 60 * 1000;
//       const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
//       setPaymentCountdown(remaining);

//       if (remaining <= 0 && !timedOut) {
//         timedOut = true;
//         if (isLawyer) {
//           handleCancelPaymentTimeout();
//         } else {
//           handleClientPaymentTimeout();
//         }
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [isWaitingForPayment, acceptedAt, isLawyer]);

//   // ─── Actions ───

//   const handleInitiateAudioCall = async () => {
//     if (!user || !id || !consultation) return;

//     try {
//       // Send call initiation signal to the lawyer
//       const recipientId = consultation.lawyer_id;

//       await supabase.from('call_signals').insert({
//         consultation_id: id,
//         sender_id: user.id,
//         recipient_id: recipientId,
//         type: 'call-initiated',
//         data: {
//           callType: 'audio',
//           initiatedBy: user.id,
//           initiatedAt: new Date().toISOString(),
//         },
//       } as any);

//       // Activate local audio call UI
//       setIsAudioCallActive(true);
//       setIsAudioCallInitiatedByMe(true);

//       toast({
//         title: 'Audio call initiated',
//         description: 'Waiting for lawyer to accept...',
//       });
//     } catch (error) {
//       console.error('Error initiating audio call:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Call failed',
//         description: 'Could not initiate audio call. Please try again.',
//       });
//     }
//   };

//   const handleInitiateVideoCall = async () => {
//     if (!user || !id || !consultation) return;

//     try {
//       // Send call initiation signal to the lawyer
//       const recipientId = consultation.lawyer_id;

//       await supabase.from('call_signals').insert({
//         consultation_id: id,
//         sender_id: user.id,
//         recipient_id: recipientId,
//         type: 'call-initiated',
//         data: {
//           callType: 'video',
//           initiatedBy: user.id,
//           initiatedAt: new Date().toISOString(),
//         },
//       } as any);

//       // Activate local video call UI
//       setIsVideoCallActive(true);
//       setIsVideoCallInitiatedByMe(true);

//       toast({
//         title: 'Video call initiated',
//         description: 'Waiting for lawyer to accept...',
//       });
//     } catch (error) {
//       console.error('Error initiating video call:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Call failed',
//         description: 'Could not initiate video call. Please try again.',
//       });
//     }
//   };

//   const handleLawyerAccept = async () => {
//     if (!user || !id) return;

//     const now = new Date().toISOString();

//     try {
//       await supabase
//         .from('consultations')
//         .update({
//           accepted_at: now,
//           status: 'pending',
//         })
//         .eq('id', id);

//       // 🔴 Mark lawyer as busy
//       await supabase
//         .from('lawyer_profiles')
//         .update({
//           is_busy: true,
//           // is_available: false,
//         })
//         .eq('user_id', consultation.lawyer_id);




//       await supabase
//         .from('call_signals')
//         .insert({
//           consultation_id: id,
//           sender_id: user.id,
//           type: 'lawyer-accepted',
//           data: {},
//         });

//       setLawyerAccepted(true);
//       setAcceptedAt(now);

//       await fetchConsultation();

//       toast({
//         title: '✅ Request Accepted',
//         description: 'Waiting for client payment.',
//       });
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to accept consultation.',
//       });
//     }



//   };

//   // Payment is handled during booking via Razorpay

//   const handleEndConsultation = async () => {
//     if (!id || !consultation) return;
//     await supabase
//       .from('consultations')
//       .update({
//         status: 'completed' as const,
//         ended_at: new Date().toISOString(),
//         duration_minutes: Math.ceil(
//           (Date.now() - new Date(consultation.started_at!).getTime()) / 60000
//         ),
//       })
//       .eq('id', id);

//     // 🟢 Mark lawyer available again
//     const { error } = await supabase
//       .from('lawyer_profiles')
//       .update({
//         is_busy: false,
//         is_available: true,
//       })
//       .eq('user_id', consultation.lawyer_id);

//     console.log('RESET ERROR:', error);



//     setShowRating(true);
//   };



//   const handleAutoComplete = async () => {
//     if (!id || !consultation) return;

//     await supabase
//       .from('consultations')
//       .update({
//         status: 'completed' as const,
//         ended_at: new Date().toISOString(),
//       })
//       .eq('id', id);

//     const { error } = await supabase
//       .from('lawyer_profiles')
//       .update({
//         is_busy: false,
//         is_available: true,
//       })
//       .eq('user_id', consultation.lawyer_id);

//     console.log('AUTO RESET ERROR:', error);
//   };

//   const handleCancelPaymentTimeout = async () => {
//     if (!id) return;
//     await supabase
//       .from('consultations')
//       .update({ status: 'cancelled' as const })
//       .eq('id', id);
//     setShowMoodDialog(false);
//     navigate('/lawyer/dashboard');
//   };

//   const handleClientPaymentTimeout = async () => {
//     if (!id) return;
//     await supabase
//       .from('consultations')
//       .update({ status: 'cancelled' as const })
//       .eq('id', id);
//     toast({
//       variant: 'destructive',
//       title: 'Payment Timed Out',
//       description: 'The payment window expired and the consultation was cancelled.',
//     });
//     navigate('/dashboard');
//   };

//   const handleCancelRequest = async () => {
//     if (!id) return;

//     try {
//       await supabase
//         .from('consultations')
//         .update({ status: 'cancelled' as const })
//         .eq('id', id);

//       toast({
//         title: 'Request Cancelled',
//         description: 'The consultation request has been cancelled.',
//       });

//       navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard');
//     } catch {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Could not cancel the consultation request.',
//       });
//     }
//   };

//   const handleSubmitRating = async () => {
//     if (!user || !id || !consultation || selectedRating === 0) return;
//     setSubmittingRating(true);
//     try {
//       await supabase.from('reviews').insert({
//         client_id: user.id,
//         lawyer_id: consultation.lawyer_id,
//         consultation_id: id,
//         rating: selectedRating,
//         comment: ratingComment || null,
//       });
//       toast({ title: '⭐ Rating Submitted', description: 'Thank you for your feedback!' });
//     } catch {
//       toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit rating.' });
//     }
//     setSubmittingRating(false);
//     setShowRating(false);
//     navigate('/dashboard');
//   };


//   // const sendMessage = async (e: React.FormEvent) => {
//   //   e.preventDefault();

//   //   if (!newMessage.trim() || !user || !chatEnabled) return;

//   //   setSending(true);

//   //   const text = newMessage.trim();
//   //   setNewMessage("");

//   //   const { data, error } = await supabase
//   //     .from("messages")
//   //     .insert({
//   //       consultation_id: id,
//   //       sender_id: user.id,
//   //       content: text,
//   //     })
//   //     .select()
//   //     .single();

//   //   if (!error && data) {
//   //     setMessages((prev) => [...prev, data as Message]);
//   //   }

//   //   inputRef.current?.focus();
//   //   setSending(false);
//   // };

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !user || !chatEnabled) return;

//     setSending(true);
//     const text = newMessage.trim();
//     setNewMessage("");

//     // Create local transient message object 
//     const optimisticMessage: Message = {
//       id: `temp-${Date.now()}`,
//       content: text,
//       sender_id: user.id,
//       created_at: new Date().toISOString()
//     };

//     // Render to UI instantly
//     setMessages((prev) => [...prev, optimisticMessage]);

//     const { data, error } = await supabase
//       .from("messages")
//       .insert({
//         consultation_id: id,
//         sender_id: user.id,
//         content: text,
//       })
//       .select()
//       .single();

//     if (!error && data) {
//       // Replace the temporary optimistic record with the verified backend item
//       setMessages((prev) => prev.map(m => m.id === optimisticMessage.id ? (data as Message) : m));
//     } else if (error) {
//       // Revert structural change if network dropped
//       setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
//       toast({ variant: 'destructive', title: 'Message failed to send' });
//     }

//     inputRef.current?.focus();
//     setSending(false);
//   };


//   const handleEmojiSelect = (emoji: EmojiClickData) => {
//     setNewMessage((prev) => prev + emoji.emoji);
//     setEmojiOpen(false);
//     inputRef.current?.focus();
//   };

//   const handleFileUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];

//     if (!file || !user || !id || !chatEnabled) return;

//     if (file.size > 10 * 1024 * 1024) {
//       toast({
//         variant: 'destructive',
//         title: 'File too large',
//         description: 'Max file size is 10MB.',
//       });
//       return;
//     }

//     setUploading(true);

//     try {
//       const ext = file.name.split('.').pop();
//       const path = `${id}/${Date.now()}-${Math.random()
//         .toString(36)
//         .slice(2)}.${ext}`;

//       const { error: uploadError } = await supabase.storage
//         .from('chat-attachments')
//         .upload(path, file, {
//           contentType: file.type,
//         });

//       if (uploadError) throw uploadError;

//       const { data: signed } = await supabase.storage
//         .from('chat-attachments')
//         .createSignedUrl(path, 60 * 60 * 24 * 7);

//       const url = signed?.signedUrl || '';
//       const isImage = file.type.startsWith('image/');

//       const content = isImage
//         ? `📎 [image] ${file.name}\n${url}`
//         : `📎 [file] ${file.name}\n${url}`;

//       await supabase.from('messages').insert({
//         consultation_id: id,
//         sender_id: user.id,
//         content,
//       });

//       toast({
//         title: 'File sent',
//         description: file.name,
//       });
//     } catch (err: any) {
//       toast({
//         variant: 'destructive',
//         title: 'Upload failed',
//         description: err.message || 'Try again.',
//       });
//     } finally {
//       setUploading(false);

//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   // ***********************************************
//   // Voice recording functions
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       const recorder = new MediaRecorder(stream);
//       const chunks: Blob[] = [];

//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           chunks.push(event.data);
//         }
//       };

//       recorder.onstop = async () => {
//         stream.getTracks().forEach(track => track.stop());

//         setIsRecording(false);
//         setMediaRecorder(null);

//         if (chunks.length > 0) {
//           await sendVoiceMessage(chunks);
//         }
//       };

//       recorder.start();

//       setMediaRecorder(recorder);
//       setIsRecording(true);

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Mic permission denied",
//         description: "Allow microphone access",
//       });
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && mediaRecorder.state === "recording") {
//       mediaRecorder.stop();
//     }
//   };


//   const sendVoiceMessage = async (chunks: Blob[]) => {
//     if (!user || !id || !chatEnabled) return;

//     setUploading(true);

//     try {
//       const audioBlob = new Blob(chunks, { type: "audio/webm" });

//       const fileName = `voice-${Date.now()}.webm`;
//       const path = `${id}/${fileName}`;

//       const { error } = await supabase.storage
//         .from("chat-attachments")
//         .upload(path, audioBlob, {
//           contentType: "audio/webm",
//         });

//       if (error) throw error;

//       const { data: signed } = await supabase.storage
//         .from("chat-attachments")
//         .createSignedUrl(path, 604800);

//       const voiceContent = `🎤 [voice] Voice Message\n${signed?.signedUrl}`;

//       const { data: insertedMsg, error: msgError } = await supabase
//         .from("messages")
//         .insert({
//           consultation_id: id,
//           sender_id: user.id,
//           content: voiceContent,
//         })
//         .select()
//         .single();

//       if (!msgError && insertedMsg) {
//         setMessages((prev) => [...prev, insertedMsg as Message]);
//       }
//     } catch (err: any) {
//       toast({
//         variant: "destructive",
//         title: "Send failed",
//         description: err.message,
//       });
//     } finally {
//       setUploading(false);
//     }
//   };


//   const renderMessageContent = (content: string, isOwn: boolean) => {
//     if (content.startsWith('📎 [')) {
//       const lines = content.split('\n');
//       const header = lines[0];
//       const url = lines[1];

//       const isImage = header.startsWith('📎 [image]');
//       const filename = header.replace(
//         /^📎 \[(image|file)\]\s*/,
//         ''
//       );

//       if (isImage && url) {
//         return (
//           <a
//             href={url}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="block"
//           >
//             <img
//               src={url}
//               alt={filename}
//               className="rounded-lg max-w-[240px] max-h-[240px] object-cover"
//             />
//             <p className="text-xs mt-1 opacity-80">
//               {filename}
//             </p>
//           </a>
//         );
//       }

//       if (url) {
//         return (
//           <a
//             href={url}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center gap-2 underline"
//           >
//             <FileText className="h-4 w-4" />
//             {filename}
//           </a>
//         );
//       }
//     }

//     if (content.startsWith('🎤 [')) {
//       const lines = content.split('\n');
//       const url = lines[1];

//       return <VoiceMessagePlayer audioUrl={url} isOwn={isOwn} />;
//     }

//     return (
//       <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
//         {content}
//       </p>
//     );
//   };

//   // ─── Helpers ───
//   const formatCountdown = (seconds: number | null | undefined) => {
//     if (seconds == null || isNaN(seconds)) return "00:00";

//     const safeSeconds = Math.max(0, seconds);

//     const m = Math.floor(safeSeconds / 60);
//     const s = safeSeconds % 60;

//     return `${m.toString().padStart(2, '0')}:${s
//       .toString()
//       .padStart(2, '0')}`;
//   };

//   const getTypeIcon = () => {
//     switch (consultation?.type) {
//       case 'video': return <Video className="h-4 w-4" />;
//       case 'audio': return <Phone className="h-4 w-4" />;
//       default: return <MessageSquare className="h-4 w-4" />;
//     }
//   };

//   // ─── Loading ───
//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-background">
//         <div className="text-center animate-fade-in">
//           <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
//           <p className="mt-4 text-muted-foreground">Loading consultation...</p>
//         </div>
//       </div>
//     );
//   }

//   // ─── Render ───
//   return (
//     <div className="h-screen flex flex-col bg-background overflow-hidden">
//       {/* ═══ HEADER ═══ */}
//       <header className="h-14 sm:h-16 border-b border-border bg-card/80 backdrop-blur-sm px-3 sm:px-6 flex items-center justify-between flex-shrink-0 animate-fade-in z-10">
//         <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//           <Button
//             variant="ghost"
//             size="icon"
//             className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
//             onClick={() => navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')}
//           >
//             <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
//           </Button>

//           <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
//             <AvatarImage src={participant?.avatar_url || undefined} />
//             <AvatarFallback className="text-xs bg-primary/10">
//               {participant?.full_name?.charAt(0) || 'P'}
//             </AvatarFallback>
//           </Avatar>

//           <div className="min-w-0">
//             <h3 className="font-semibold text-sm sm:text-base truncate">
//               {participant?.full_name}
//             </h3>
//             <div className="flex items-center gap-1.5">
//               <Badge variant="outline" className="text-[10px] sm:text-xs gap-1 px-1.5 py-0">
//                 {getTypeIcon()}
//                 <span className="capitalize">{consultation?.type}</span>
//               </Badge>
//               {isActive && (
//                 <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] sm:text-xs px-1.5 py-0">
//                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                   Live
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
//           {/* Session countdown */}



//           {/* Audio/Video buttons - CLIENT ONLY */}
//           {isActive && isClient && !isAudioCallActive && !isVideoCallActive && (
//             <div className="flex items-center gap-1.5 sm:gap-2">

//               {consultation?.type === "audio" && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="h-8 sm:h-9 text-xs sm:text-sm gap-1 px-2 sm:px-3"
//                   onClick={() => {
//                     setCallInitiatedByMe(true);
//                     setIsAudioCallActive(true);
//                   }}
//                   title="Start audio call with lawyer"
//                 >
//                   <Phone className="h-4 w-4" />
//                   <span className="hidden sm:inline">Audio</span>
//                 </Button>
//               )}

//               {consultation?.type === "video" && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="h-8 sm:h-9 text-xs sm:text-sm gap-1 px-2 sm:px-3"
//                   onClick={() => {
//                     setCallInitiatedByMe(true);
//                     setIsVideoCallActive(true);
//                   }}
//                   title="Start video call with lawyer"
//                 >
//                   <Video className="h-4 w-4" />
//                   <span className="hidden sm:inline">Video</span>
//                 </Button>
//               )}

//             </div>
//           )}

//           {/* End button - CLIENT ONLY */}
//           {isActive && isClient && (
//             <Button
//               variant="destructive"
//               size="sm"
//               className="h-8 sm:h-9 text-xs sm:text-sm gap-1 px-2 sm:px-3"
//               onClick={handleEndConsultation}
//             >
//               {/* <PhoneOff className="h-3.5 w-3.5" /> */}
//               <span className=" sm:inline">End Chat</span>
//             </Button>
//           )}
//         </div>
//       </header >

//       {/* ═══ MAIN CONTENT ═══ */}
//       <div className="flex-1 flex overflow-hidden" >
//         {/* Desktop sidebar later add this content in nav bar */}


//         {/* Chat + Content Area */}
//         {/* <div className="flex-1 flex flex-col overflow-hidden"> */}
//         <div className="flex-1 flex flex-col overflow-hidden min-h-0">

//           {/* ─── WAITING FOR ACCEPT ─── */}
//           {isWaitingForAccept && (
//             <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
//               <div className="relative text-center max-w-sm">
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
//                   onClick={handleCancelRequest}
//                 >
//                   <XCircle className="h-4 w-4" />
//                 </Button>

//                 {isLawyer ? (
//                   <>
//                     <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
//                       <User className="h-10 w-10 text-primary" />
//                     </div>
//                     <h2 className="text-xl sm:text-2xl font-bold mb-2">New Consultation Request</h2>
//                     <p className="text-muted-foreground mb-2">
//                       <span className="font-semibold text-foreground">{participant?.full_name}</span> wants a{' '}
//                       <span className="capitalize font-medium">{consultation?.type}</span> consultation.
//                     </p>
//                     {consultation?.total_amount && (
//                       <p className="text-sm text-muted-foreground mb-6">
//                         Session fee: <span className="font-semibold text-emerald-600">${consultation.total_amount.toFixed(2)}</span>
//                         {' '}for {bookedMinutes} minutes
//                       </p>
//                     )}
//                     <div className="flex flex-col items-center gap-3">
//                       <Button size="lg" className="gap-2 px-8" onClick={handleLawyerAccept}>
//                         <CheckCircle className="h-5 w-5" />
//                         Accept Request
//                       </Button>
//                       <Button variant="outline" size="sm" onClick={handleCancelRequest}>
//                         Cancel Request
//                       </Button>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
//                       <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
//                     </div>
//                     <h2 className="text-xl sm:text-2xl font-bold mb-2">Waiting for Lawyer</h2>
//                     <p className="text-muted-foreground">
//                       <span className="font-semibold text-foreground">{participant?.full_name}</span> will accept your request shortly.
//                     </p>
//                     <div className="flex items-center justify-center gap-1 mt-4">
//                       <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
//                       <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
//                       <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
//                     </div>
//                     <Button variant="outline" size="sm" className="mt-6" onClick={handleCancelRequest}>
//                       Cancel Request
//                     </Button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ─── WAITING FOR PAYMENT ─── */}
//           {isWaitingForPayment && (
//             <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
//               <div className="text-center max-w-sm w-full">
//                 {isClient ? (
//                   <>
//                     <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 animate-scale-in">
//                       <Wallet className="h-8 w-8 text-emerald-600" />
//                     </div>
//                     <h2 className="text-xl font-bold mb-1">Complete Payment</h2>
//                     <p className="text-sm text-muted-foreground mb-5">
//                       {participant?.full_name} accepted your request. Pay to start the session.
//                     </p>

//                     <div className="rounded-xl border border-border bg-card p-4 text-left space-y-3 mb-5">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">Session Type</span>
//                         <span className="font-medium capitalize">{consultation?.type}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">Duration</span>
//                         <span className="font-medium">{bookedMinutes} min</span>
//                       </div>
//                       <div className="border-t border-border pt-3 flex justify-between items-center gap-3">
//                         <div>
//                           <span className="font-semibold">Total</span>
//                           <div className="text-xl font-bold text-primary">
//                             ${(consultation?.total_amount || 0).toFixed(2)}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
//                           <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
//                           <span className="text-emerald-600">
//                             Payment completed via Razorpay. Consultation is active.
//                           </span>
//                         </div>
//                       </div>
//                       <p className="flex items-center gap-1 text-xs text-muted-foreground">
//                         <Shield className="h-3 w-3" /> Secure payment
//                       </p>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
//                       <Lock className="h-8 w-8 text-amber-600" />
//                     </div>
//                     <h2 className="text-xl font-bold mb-2">Waiting for Payment</h2>
//                     <p className="text-sm text-muted-foreground mb-2">
//                       {participant?.full_name} is completing payment. Chat will unlock once paid.
//                     </p>

//                     <div className={cn(
//                       "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-semibold mb-4",
//                       paymentCountdown <= 30
//                         ? "bg-destructive/10 text-destructive animate-pulse"
//                         : "bg-amber-500/10 text-amber-600"
//                     )}>
//                       <Timer className="h-4 w-4" />
//                       {formatCountdown(paymentCountdown)}
//                     </div>

//                     <div className="flex items-center justify-center gap-1 mt-2">
//                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
//                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
//                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ─── ACTIVE SESSION: CHAT ─── */}

//           {!isWaitingForAccept && !isWaitingForPayment && (isActive || isCompleted) && (
//             <>
//               {/* Messages Area */}

//               <div
//                 className="flex-1 overflow-y-auto px-3 py-4 relative w-full h-full bg-center bg-no-repeat "
//                 style={{
//                   backgroundImage: `url(${chatBg})`,
//                   backgroundSize: "contain",
//                   backgroundPosition: "center",
//                   backgroundRepeat: "no-repeat",
//                 }}
//               >

//                 {/* BACKGROUND OVERLAY */}
//                 {/* <div className="absolute inset-0 bg-black/10 dark:bg-black/50  pointer-events-none " /> */}


//                 {/* CONTENT WRAPPER */}
//                 <div className="relative z-10 max-w-4xl mx-auto space-y-4">

//                   {/* <div className="absolute inset-0 bg-black/10 dark:bg-black/50  pointer-events-none " /> */}

//                   {/* Premium badge */}
//                   <div className="flex justify-center my-3">
//                     <div className="rounded-full border border-emerald-500/20 bg-white/80 backdrop-blur-xl px-4 py-2 shadow-md flex items-center gap-2 text-xs sm:text-sm font-medium text-emerald-700">
//                       <Shield className="h-4 w-4" />
//                       <span>Secure Legal Consultation</span>
//                     </div>
//                   </div>

//                   {/* Session countdown */}
//                   {isActive && (
//                     <div className="w-full flex justify-center sticky top-3 z-20 mb-3">
//                       <div
//                         className={cn(
//                           // "flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-semibold shadow-lg backdrop-blur-md",
//                           "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-sm font-semibold",
//                           (sessionCountdown ?? 0) <= 60
//                             ? "bg-destructive/90 text-white animate-pulse"
//                             : "bg-amber-500/10 text-amber-600"
//                         )}
//                       >
//                         <Timer className="h-4 w-4" />
//                         {sessionCountdown !== null && formatCountdown(sessionCountdown)}
//                       </div>
//                     </div>
//                   )}




//                   {messages.length === 0 && isActive && (
//                     <div className="text-center py-0">

//                       <h3 className="font-bold text-lg mb-1">Consultation Started</h3>
//                       <p className="text-sm text-muted-foreground">
//                         Start chatting securely with your legal expert.
//                       </p>
//                     </div>
//                   )}

//                   {messages.map((message, index) => {
//                     const isOwn = message.sender_id === user?.id;
//                     const showAvatar =
//                       index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

//                     return (
//                       <div
//                         key={message.id}
//                         className={cn(
//                           "flex gap-2 sm:gap-3",
//                           isOwn && "flex-row-reverse"
//                         )}
//                       >
//                         {showAvatar ? (
//                           <Avatar className="h-9 w-9 flex-shrink-0 border shadow-sm">
//                             <AvatarImage
//                               src={
//                                 isOwn
//                                   ? myAvatarUrl || undefined
//                                   : participant?.avatar_url || undefined
//                               }
//                             />
//                             <AvatarFallback className="text-xs bg-primary/10">
//                               {isOwn
//                                 ? user?.email?.charAt(0).toUpperCase()
//                                 : participant?.full_name?.charAt(0)}
//                             </AvatarFallback>
//                           </Avatar>
//                         ) : (
//                           <div className="w-9" />
//                         )}

//                         <div className="max-w-[85%] sm:max-w-[70%]">
//                           <div className="relative">


//                             <div
//                               className={cn(
//                                 "px-4 py-3 rounded-2xl text-sm sm:text-[14px] leading-relaxed shadow-md border",
//                                 isOwn
//                                   ? "bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-md border-primary/20"
//                                   : "bg-white rounded-bl-md border-border",

//                               )}
//                             >
//                               {renderMessageContent(message.content, isOwn)}
//                             </div>
//                           </div>

//                           <p
//                             className={cn(
//                               "text-[10px] sm:text-xs text-muted-foreground mt-1 px-2",
//                               isOwn && "text-right"
//                             )}
//                           >
//                             {new Date(message.created_at).toLocaleTimeString([], {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}
//                           </p>
//                         </div>
//                       </div>
//                     );
//                   })}

//                   <div ref={messagesEndRef} />
//                 </div>
//               </div>

//               {/* Input Area */}
//               {chatEnabled && (
//                 <div className="border-t border-border/50 bg-gradient-to-r from-white via-slate-50 to-white dark:from-card dark:via-card dark:to-card backdrop-blur-2xl px-2 sm:px-4 py-3 sm:py-4">
//                   <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
//                     <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-border bg-white/95 dark:bg-card/95 shadow-lg px-2 sm:px-3 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">

//                       <input
//                         ref={fileInputRef}
//                         type="file"
//                         className="hidden"
//                         accept="image/*,application/pdf,.doc,.docx,.txt"
//                         onChange={handleFileUpload}
//                       />

//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => fileInputRef.current?.click()}
//                         disabled={uploading}
//                         className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary shrink-0"
//                       >
//                         {uploading ? (
//                           <Loader2 className="h-4 w-4 animate-spin text-primary" />
//                         ) : (
//                           <Paperclip className="h-4 w-4 text-slate-600 dark:text-slate-300" />
//                         )}
//                       </Button>

//                       <Input
//                         ref={inputRef}
//                         placeholder={
//                           isRecording
//                             ? "Recording voice note..."
//                             : "Type your message..."
//                         }
//                         value={newMessage}
//                         onChange={(e) => setNewMessage(e.target.value)}
//                         className={`flex-1 border-0 bg-transparent px-1 sm:px-2 text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 ${isRecording
//                           ? "text-red-600 placeholder:text-red-600 font-semibold"
//                           : "text-slate-700 dark:text-slate-100"
//                           }`}
//                         disabled={sending || isRecording}
//                       />

//                       <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
//                         <PopoverTrigger asChild>
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="icon"
//                             className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary shrink-0"
//                           >
//                             <Smile className="h-4 w-4 text-amber-500" />
//                           </Button>
//                         </PopoverTrigger>

//                         <PopoverContent
//                           align="end"
//                           side="top"
//                           className="p-0 border-0 w-auto bg-transparent shadow-none"
//                         >
//                           <EmojiPicker
//                             onEmojiClick={handleEmojiSelect}
//                             theme={Theme.AUTO}
//                             width={320}
//                             height={400}
//                           />
//                         </PopoverContent>
//                       </Popover>

//                       {isRecording ? (
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={stopRecording}
//                           className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-50 hover:bg-red-100 shrink-0"
//                         >
//                           <Mic className="text-red-500 animate-pulse h-4 w-4" />
//                         </Button>
//                       ) : (
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={startRecording}
//                           className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary shrink-0"
//                         >
//                           <Mic className="h-4 w-4 text-slate-600 dark:text-slate-300" />
//                         </Button>
//                       )}

//                       <Button
//                         type="submit"
//                         disabled={sending || !newMessage.trim()}
//                         className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-md shrink-0"
//                         size="icon"
//                       >
//                         {sending ? (
//                           <Loader2 className="h-4 w-4 animate-spin" />
//                         ) : (
//                           <Send className="h-4 w-4" />
//                         )}
//                       </Button>

//                     </div>
//                   </form>
//                 </div>
//               )}
//             </>
//           )}





//           {/* Completed footer */}
//           {isCompleted && !showRating && (
//             <div className="p-4 sm:p-6 border-t border-border bg-secondary/30 text-center flex-shrink-0">
//               <p className="text-muted-foreground text-sm mb-2">
//                 This consultation has ended.
//               </p>

//               <Button
//                 onClick={() => {
//                   if (isClient) {
//                     setShowRating(true);
//                   } else {
//                     navigate('/lawyer/dashboard');
//                   }
//                 }}
//                 className={cn(rejectButtonStyle)}
//               >
//                 Return to Dashboard
//               </Button>
//             </div>
//           )}

//           {/* ─── CANCELLED ─── */}
//           {isCancelled && (
//             <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
//               <div className="text-center">
//                 <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
//                   <XCircle className="h-8 w-8 text-destructive" />
//                 </div>
//                 <h2 className="text-xl font-bold mb-2">Consultation Cancelled</h2>
//                 <p className="text-sm text-muted-foreground mb-6">
//                   This consultation has been cancelled.
//                 </p>
//                 <Button
//                   onClick={() =>
//                     navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')
//                   }
//                 >
//                   Return to Dashboard
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div >

//       {/* ═══ RATING DIALOG ═══ */}
//       <Dialog Dialog Dialog
//         open={showRating && isClient}
//         onOpenChange={(open) => {
//           if (!open) {
//             setShowRating(false);
//             navigate('/dashboard');
//           }
//         }}
//       >
//         <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-2xl">
//           <div className="p-6 sm:p-8 text-center">
//             <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
//               <Star className="h-7 w-7 text-primary" />
//             </div>

//             <h3 className="text-lg font-bold mb-1">Rate Your Experience</h3>
//             <p className="text-sm text-muted-foreground mb-5">
//               How was your session with {participant?.full_name}?
//             </p>

//             <div className="flex justify-center gap-2 mb-5">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <button
//                   key={star}
//                   onClick={() => setSelectedRating(star)}
//                   className="transition-transform hover:scale-110"
//                 >
//                   <Star
//                     className={cn(
//                       "h-8 w-8 sm:h-10 sm:w-10 transition-colors",
//                       star <= selectedRating
//                         ? "fill-amber-400 text-amber-400"
//                         : "text-muted-foreground/30"
//                     )}
//                   />
//                 </button>
//               ))}
//             </div>

//             <textarea
//               placeholder="Share your experience (optional)..."
//               value={ratingComment}
//               onChange={(e) => setRatingComment(e.target.value)}
//               className="w-full rounded-lg border border-border bg-secondary/30 p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
//             />

//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 className={cn(rejectButtonStyle, "flex-1")}
//                 onClick={() => {
//                   setShowRating(false);
//                   navigate('/dashboard');
//                 }}
//               >
//                 Skip
//               </Button>

//               <Button
//                 className={cn(acceptButtonStyle, "flex-1 gap-1.5")}
//                 disabled={selectedRating === 0 || submittingRating}
//                 onClick={handleSubmitRating}
//               >
//                 {submittingRating ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <CheckCircle className="h-4 w-4" />
//                 )}
//                 Submit
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog >

//       {/* ═══ MOOD DIALOG ═══ */}
//       <Dialog Dialog Dialog open={showMoodDialog} onOpenChange={() => { }}>
//         <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl [&>button]:hidden">
//           <div className="p-6 sm:p-8 text-center">
//             <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
//               <AlertTriangle className="h-7 w-7 text-amber-600" />
//             </div>

//             <h3 className="text-lg font-bold mb-1">
//               Client Changed Their Mind
//             </h3>

//             <p className="text-sm text-muted-foreground mb-6">
//               The client was unable to complete the payment within the allotted
//               time. The consultation has been cancelled.
//             </p>

//             <Button className="w-full" onClick={handleCancelPaymentTimeout}>
//               Return to Dashboard
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog >

//       {/* ═══ VIDEO / AUDIO CALL OVERLAYS ═══ */}
//       < VideoCall
//         isActive={isVideoCallActive}
//         onEnd={() => { setIsVideoCallActive(false); setCallInitiatedByMe(false); }}
//         participantName={participant?.full_name || 'Participant'}
//         consultationId={id || ''}
//         isInitiatedByMe={callInitiatedByMe}
//       />

//       {/* Audio Call Component */}
//       < AudioCall
//         isActive={isAudioCallActive}
//         onEnd={() => { setIsAudioCallActive(false); setCallInitiatedByMe(false); }}
//         participantName={participant?.full_name || 'Participant'}
//         consultationId={id || ''}
//         isInitiatedByMe={callInitiatedByMe}
//       />
//     </div >
//   );
// }

// export default Consultation;


import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import chatBg from '@/assets/chat-bg-01.jpg';
import {
  Send, Phone, Video, Clock, ArrowLeft,
  Loader2, MessageSquare, User, Shield,
  CheckCircle, Star, Lock, Timer,
  AlertTriangle, Wallet, PhoneOff,
  Mic, Paperclip, Smile, XCircle,
  FileText, Image as ImageIcon, MicOff, Play, Pause, MoreVertical, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoCall } from '@/components/consultation/VideoCall';
import { AudioCall } from '@/components/consultation/AudioCall';
import { cn } from '@/lib/utils';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { rejectButtonStyle, acceptButtonStyle } from '@/lib/buttonStyles';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  deleted?: boolean;
}

interface ConsultationData {
  id: string;
  type: 'chat' | 'audio' | 'video';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  client_id: string;
  lawyer_id: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  total_amount: number | null;
  duration_minutes: number | null;
  notes: string | null;
  accepted_at: string | null;
}

interface ParticipantInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

// Voice Message Player Component
const VoiceMessagePlayer = ({
  audioUrl,
  isOwn,
}: {
  audioUrl: string;
  isOwn: boolean;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={cn(
          'h-10 w-10 rounded-full shrink-0 transition-colors',
          isOwn
            ? 'bg-white/15 text-white hover:bg-white/25'
            : 'bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'w-full h-1.5 rounded-full overflow-hidden',
            isOwn ? 'bg-white/25' : 'bg-slate-200/80 dark:bg-white/10'
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-150',
              isOwn ? 'bg-white' : 'bg-slate-950 dark:bg-white'
            )}
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className={cn('flex justify-end mt-1 text-[11px] font-medium', isOwn ? 'text-white/80' : 'text-slate-500 dark:text-slate-300')}>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

const Consultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Core state
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [loading, setLoading] = useState(true);


  // Message state
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user's avatar from profiles
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setMyAvatarUrl(data?.avatar_url ?? null));
  }, [user?.id]);


  // Flow state
  const [lawyerAccepted, setLawyerAccepted] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [paymentCountdown, setPaymentCountdown] = useState(120);
  const [sessionCountdown, setSessionCountdown] = useState(0);
  // const [sessionCountdown, setSessionCountdown] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  // Call state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);
  const [callInitiatedByMe, setCallInitiatedByMe] = useState(false);
  const [isVideoCallInitiatedByMe, setIsVideoCallInitiatedByMe] = useState(false);
  const [isAudioCallInitiatedByMe, setIsAudioCallInitiatedByMe] = useState(false);

  // End state
  const [showRating, setShowRating] = useState(false);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const autoCompleteRef = useRef(false);

  // Derived
  const isClient = consultation?.client_id === user?.id;
  const isLawyer = consultation?.lawyer_id === user?.id;
  const isPending = consultation?.status === 'pending';
  const isActive = consultation?.status === 'active';

  const isCompleted = consultation?.status === 'completed';
  const isCancelled = consultation?.status === 'cancelled';


  const isWaitingForAccept =
    consultation?.status === 'pending' &&
    consultation?.started_at === null &&
    !consultation?.accepted_at &&
    !lawyerAccepted;

  const isWaitingForPayment =
    consultation?.status === 'pending' &&
    consultation?.started_at === null &&
    (consultation?.accepted_at !== null || lawyerAccepted);


  const chatEnabled = consultation?.status === 'active';
  // const bookedMinutes = consultation?.duration_minutes || 10;
  const bookedMinutes = consultation?.duration_minutes ?? 0;

  // ─── Fetch ───
  const fetchConsultation = useCallback(async () => {
    if (!id || !user) return;
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
      .single();

    if (error || !data) {
      toast({ variant: 'destructive', title: 'Error', description: 'Consultation not found.' });

      // navigate(user?.role === 'lawyer' ? '/lawyer/dashboard' : '/dashboard');
      navigate(
        consultation?.lawyer_id === user?.id
          ? '/lawyer/dashboard'
          : '/dashboard'
      );
      return;
    }

    setConsultation(data as ConsultationData);


    // 🔥 ALWAYS check if accepted signal exists
    const { data: acceptSignal } = await supabase
      .from('call_signals')
      .select('created_at')
      .eq('consultation_id', id)
      .eq('type', 'lawyer-accepted')
      .order('created_at', { ascending: false })
      .limit(1);

    if (acceptSignal && acceptSignal.length > 0) {
      setLawyerAccepted(true);
      setAcceptedAt(acceptSignal[0].created_at);
    } else {
      setLawyerAccepted(false);
    }

    // Fetch participant
    const otherUserId = data.client_id === user.id ? data.lawyer_id : data.client_id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', otherUserId)
      .single();

    if (profile) setParticipant(profile);

    // Wallet payments not used - all payments are via Razorpay at booking time


    setLoading(false);

    // 🔥 If lawyer accepted and client initiated a call, auto-activate call UI
    const lawyerAcceptedKey = `lawyer-accepted:${id}`;
    if (sessionStorage.getItem(lawyerAcceptedKey) === 'true') {
      sessionStorage.removeItem(lawyerAcceptedKey);

      // Check if there's a call-start signal (client initiated call)
      const { data: callStartSignals } = await supabase
        .from('call_signals')
        .select('type')
        .eq('consultation_id', id)
        .eq('type', 'call-start')
        .order('created_at', { ascending: false })
        .limit(1);

      if (callStartSignals && callStartSignals.length > 0 && data.type !== 'chat') {
        // Auto-activate call UI for lawyer to join
        if (data.type === 'audio') {
          setIsAudioCallActive(true);
          setIsAudioCallInitiatedByMe(false);
        } else if (data.type === 'video') {
          setIsVideoCallActive(true);
          setIsVideoCallInitiatedByMe(false);
        }
      }
    }
  }, [id, user, navigate, toast]);

  // Auto-open call if user accepted from the global incoming-call popup
  useEffect(() => {
    if (!id) return;
    const key = `auto-open-call:${id}`;
    const open = (callType: string) => {
      setCallInitiatedByMe(false);
      if (callType === 'video') setIsVideoCallActive(true);
      else setIsAudioCallActive(true);
    };
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        sessionStorage.removeItem(key);
        open(stored);
      }
    } catch { }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.consultationId === id) open(detail.callType);
    };
    window.addEventListener('auto-open-call', handler as EventListener);
    return () => window.removeEventListener('auto-open-call', handler as EventListener);
  }, [id]);

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('consultation_id', id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }, [id]);

  // ─── Init ───
  useEffect(() => {
    if (id && user) {
      fetchConsultation();
      fetchMessages();
    }
  }, [id, user, fetchConsultation, fetchMessages]);

  // ─── Realtime: consultation changes ───
  useEffect(() => {

    if (!id || !user?.id) return;
    const channel = supabase
      .channel(`consultation-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
        filter: `id=eq.${id}`,
      }, (payload) => {
        const updated = payload.new as ConsultationData;
        setConsultation(updated);

        // If status became completed and user is lawyer → redirect
        if (updated.status === 'completed' && updated.lawyer_id === user?.id) {
          toast({ title: 'Session Complete', description: 'The consultation has ended.' });
          setTimeout(() => navigate('/lawyer/dashboard'), 2000);
        }

        // If status became completed and user is client → show rating
        if (updated.status === 'completed' && updated.client_id === user?.id) {
          setShowRating(true);
        }

        // If cancelled
        if (updated.status === 'cancelled') {
          toast({ title: 'Consultation Cancelled', description: 'This consultation was cancelled.' });
          setTimeout(() => navigate(updated.lawyer_id === user?.id ? '/lawyer/dashboard' : '/dashboard'), 2000);
        }

      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user?.id, navigate, toast]);



  // ─── Realtime: messages ───
  useEffect(() => {
    if (!id || !user?.id) return;

    const channel = supabase
      .channel(`messages-${id}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `consultation_id=eq.${id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;

          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMsg.id);
            if (exists) return prev;

            return [...prev, newMsg];
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          fetchMessages();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id, fetchMessages]);


  const checkPendingIncomingCall = useCallback(async () => {
    if (!id || !user?.id || !consultation?.type) return;
    if (isAudioCallActive || isVideoCallActive) return;

    const { data } = await supabase
      .from('call_signals')
      .select('sender_id, type, created_at')
      .eq('consultation_id', id)
      .eq('type', 'call-start')
      .order('created_at', { ascending: false })
      .limit(1);

    const latest = data?.[0];
    if (!latest || latest.sender_id === user.id) return;

    const timestamp = new Date(latest.created_at).getTime();
    if (Date.now() - timestamp > 30_000) return;

    if (consultation.type === 'audio') {
      setIsAudioCallInitiatedByMe(false);
      setIsAudioCallActive(true);
      toast({
        title: 'Incoming Audio Call',
        description: `${participant?.full_name} started an audio call`,
      });
    } else if (consultation.type === 'video') {
      setIsVideoCallInitiatedByMe(false);
      setIsVideoCallActive(true);
      toast({
        title: 'Incoming Video Call',
        description: `${participant?.full_name} started a video call`,
      });
    }
  }, [id, user?.id, consultation?.type, isAudioCallActive, isVideoCallActive, participant?.full_name, toast]);

  useEffect(() => {
    if (!id || !user?.id) return;

    const channel = supabase
      .channel(`signals-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `consultation_id=eq.${id}`,
        },
        async (payload) => {
          console.log("🔥 SIGNAL RECEIVED:", payload);
          const signal = payload.new as {
            sender_id: string;
            type: string;
            created_at: string;
          };

          // lawyer accepted - update local state immediately
          if (signal.type === 'lawyer-accepted') {
            setConsultation(prev =>
              prev
                ? {
                  ...prev,
                  accepted_at: signal.created_at,
                }
                : prev
            );
            setLawyerAccepted(true);
            setAcceptedAt(signal.created_at);
          }

          // incoming call - auto-show call UI
          if (
            signal.type === 'call-start' &&
            signal.sender_id !== user.id
          ) {
            console.log("📞 Incoming call from:", signal.sender_id);
            if (consultation?.type === 'audio' && !isAudioCallActive) {
              setIsAudioCallInitiatedByMe(false);
              setIsAudioCallActive(true);
              toast({
                title: 'Incoming Audio Call',
                description: `${participant?.full_name} started an audio call`,
              });
            } else if (consultation?.type === 'video' && !isVideoCallActive) {
              setIsVideoCallInitiatedByMe(false);
              setIsVideoCallActive(true);
              toast({
                title: 'Incoming Video Call',
                description: `${participant?.full_name} started a video call`,
              });
            }
          }

          // call ended
          if (signal.type === 'call-end') {
            setIsAudioCallActive(false);
            setIsVideoCallActive(false);
            toast({
              title: 'Call Ended',
              description: `${participant?.full_name} ended the call`
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          checkPendingIncomingCall().catch((error) => {
            console.error('Error checking pending call-start:', error);
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id, consultation?.type, toast, participant?.full_name, checkPendingIncomingCall]);

  // ─── Scroll to bottom ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Session countdown ───
  useEffect(() => {
    if (!consultation) return;
    if (consultation.status !== 'active') return;
    if (!consultation.started_at) return;
    if (!consultation.duration_minutes) return;

    const startTime = new Date(consultation.started_at).getTime();
    const endTime =
      startTime + consultation.duration_minutes * 60 * 1000;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((endTime - Date.now()) / 1000)
      );

      setSessionCountdown(remaining);

      if (remaining <= 0) {
        handleAutoComplete();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [consultation]);

  // ─── Payment countdown (lawyer side) ───
  useEffect(() => {
    if (!isWaitingForPayment || !acceptedAt) return;

    let timedOut = false;

    const interval = setInterval(() => {
      const acceptTime = new Date(acceptedAt).getTime();
      const deadline = acceptTime + 2 * 60 * 1000;
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setPaymentCountdown(remaining);

      if (remaining <= 0 && !timedOut) {
        timedOut = true;
        if (isLawyer) {
          handleCancelPaymentTimeout();
        } else {
          handleClientPaymentTimeout();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWaitingForPayment, acceptedAt, isLawyer]);

  // ─── Actions ───

  const handleInitiateAudioCall = async () => {
    if (!user || !id || !consultation) return;

    try {
      // Send call initiation signal to the lawyer
      const recipientId = consultation.lawyer_id;

      await supabase.from('call_signals').insert({
        consultation_id: id,
        sender_id: user.id,
        recipient_id: recipientId,
        type: 'call-initiated',
        data: {
          callType: 'audio',
          initiatedBy: user.id,
          initiatedAt: new Date().toISOString(),
        },
      } as any);

      // Activate local audio call UI
      setIsAudioCallActive(true);
      setIsAudioCallInitiatedByMe(true);

      toast({
        title: 'Audio call initiated',
        description: 'Waiting for lawyer to accept...',
      });
    } catch (error) {
      console.error('Error initiating audio call:', error);
      toast({
        variant: 'destructive',
        title: 'Call failed',
        description: 'Could not initiate audio call. Please try again.',
      });
    }
  };

  const handleInitiateVideoCall = async () => {
    if (!user || !id || !consultation) return;

    try {
      // Send call initiation signal to the lawyer
      const recipientId = consultation.lawyer_id;

      await supabase.from('call_signals').insert({
        consultation_id: id,
        sender_id: user.id,
        recipient_id: recipientId,
        type: 'call-initiated',
        data: {
          callType: 'video',
          initiatedBy: user.id,
          initiatedAt: new Date().toISOString(),
        },
      } as any);

      // Activate local video call UI
      setIsVideoCallActive(true);
      setIsVideoCallInitiatedByMe(true);

      toast({
        title: 'Video call initiated',
        description: 'Waiting for lawyer to accept...',
      });
    } catch (error) {
      console.error('Error initiating video call:', error);
      toast({
        variant: 'destructive',
        title: 'Call failed',
        description: 'Could not initiate video call. Please try again.',
      });
    }
  };

  const handleLawyerAccept = async () => {
    if (!user || !id) return;

    const now = new Date().toISOString();

    try {
      await supabase
        .from('consultations')
        .update({
          accepted_at: now,
          status: 'pending',
        })
        .eq('id', id);

      // 🔴 Mark lawyer as busy
      await supabase
        .from('lawyer_profiles')
        .update({
          is_busy: true,
          // is_available: false,
        })
        .eq('user_id', consultation.lawyer_id);




      await supabase
        .from('call_signals')
        .insert({
          consultation_id: id,
          sender_id: user.id,
          type: 'lawyer-accepted',
          data: {},
        });

      setLawyerAccepted(true);
      setAcceptedAt(now);

      await fetchConsultation();

      toast({
        title: '✅ Request Accepted',
        description: 'Waiting for client payment.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept consultation.',
      });
    }



  };

  // Payment is handled during booking via Razorpay

  const handleEndConsultation = async () => {
    if (!id || !consultation) return;
    await supabase
      .from('consultations')
      .update({
        status: 'completed' as const,
        ended_at: new Date().toISOString(),
        duration_minutes: Math.ceil(
          (Date.now() - new Date(consultation.started_at!).getTime()) / 60000
        ),
      })
      .eq('id', id);

    // 🟢 Mark lawyer available again
    const { error } = await supabase
      .from('lawyer_profiles')
      .update({
        is_busy: false,
        is_available: true,
      })
      .eq('user_id', consultation.lawyer_id);

    console.log('RESET ERROR:', error);



    setShowRating(true);
  };



  const handleAutoComplete = async () => {
    if (!id || !consultation) return;

    await supabase
      .from('consultations')
      .update({
        status: 'completed' as const,
        ended_at: new Date().toISOString(),
      })
      .eq('id', id);

    const { error } = await supabase
      .from('lawyer_profiles')
      .update({
        is_busy: false,
        is_available: true,
      })
      .eq('user_id', consultation.lawyer_id);

    console.log('AUTO RESET ERROR:', error);
  };

  const handleCancelPaymentTimeout = async () => {
    if (!id) return;
    await supabase
      .from('consultations')
      .update({ status: 'cancelled' as const })
      .eq('id', id);
    setShowMoodDialog(false);
    navigate('/lawyer/dashboard');
  };

  const handleClientPaymentTimeout = async () => {
    if (!id) return;
    await supabase
      .from('consultations')
      .update({ status: 'cancelled' as const })
      .eq('id', id);
    toast({
      variant: 'destructive',
      title: 'Payment Timed Out',
      description: 'The payment window expired and the consultation was cancelled.',
    });
    navigate('/dashboard');
  };

  const handleCancelRequest = async () => {
    if (!id) return;

    try {
      await supabase
        .from('consultations')
        .update({ status: 'cancelled' as const })
        .eq('id', id);

      toast({
        title: 'Request Cancelled',
        description: 'The consultation request has been cancelled.',
      });

      navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not cancel the consultation request.',
      });
    }
  };

  const handleSubmitRating = async () => {
    if (!user || !id || !consultation || selectedRating === 0) return;
    setSubmittingRating(true);
    try {
      await supabase.from('reviews').insert({
        client_id: user.id,
        lawyer_id: consultation.lawyer_id,
        consultation_id: id,
        rating: selectedRating,
        comment: ratingComment || null,
      });
      toast({ title: '⭐ Rating Submitted', description: 'Thank you for your feedback!' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit rating.' });
    }
    setSubmittingRating(false);
    setShowRating(false);
    navigate('/dashboard');
  };


  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !chatEnabled) return;

    setSending(true);

    const text = newMessage.trim();
    setNewMessage("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        consultation_id: id,
        sender_id: user.id,
        content: text,
      })
      .select()
      .single();
    // **********************************************************remove comment and uncommet new code  if later code not works for chat and voice message ************************************
    // if (!error && data) {
    //   setMessages((prev) => [...prev, data as Message]);
    // }
    if (!error && data) {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.id)) return prev;
        return [...prev, data as Message];
      });
    }
    // ****************************************************************************************************************************************************************
    setSending(false);
  };


  const handleEmojiSelect = (emoji: EmojiClickData) => {
    setNewMessage((prev) => prev + emoji.emoji);
    setEmojiOpen(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !user || !id || !chatEnabled) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Max file size is 10MB.',
      });
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(path, file, {
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: signed } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(path, 60 * 60 * 24 * 7);

      const url = signed?.signedUrl || '';
      const isImage = file.type.startsWith('image/');

      const content = isImage
        ? `📎 [image] ${file.name}\n${url}`
        : `📎 [file] ${file.name}\n${url}`;

      await supabase.from('messages').insert({
        consultation_id: id,
        sender_id: user.id,
        content,
      });

      toast({
        title: 'File sent',
        description: file.name,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: err.message || 'Try again.',
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ***********************************************
  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        setIsRecording(false);
        setMediaRecorder(null);

        if (chunks.length > 0) {
          await sendVoiceMessage(chunks);
        }
      };

      recorder.start();

      setMediaRecorder(recorder);
      setIsRecording(true);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Mic permission denied",
        description: "Allow microphone access",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };


  const sendVoiceMessage = async (chunks: Blob[]) => {
    if (!user || !id || !chatEnabled) return;

    setUploading(true);

    try {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });

      const fileName = `voice-${Date.now()}.webm`;
      const path = `${id}/${fileName}`;

      const { error } = await supabase.storage
        .from("chat-attachments")
        .upload(path, audioBlob, {
          contentType: "audio/webm",
        });

      if (error) throw error;

      const { data: signed } = await supabase.storage
        .from("chat-attachments")
        .createSignedUrl(path, 604800);

      const voiceContent = `🎤 [voice] Voice Message\n${signed?.signedUrl}`;

      const { data: insertedMsg, error: msgError } = await supabase
        .from("messages")
        .insert({
          consultation_id: id,
          sender_id: user.id,
          content: voiceContent,
        })
        .select()
        .single();
      // **********************************************************remove comment and uncommet new code  if later code not works for chat and voice message ************************************
      // if (!msgError && insertedMsg) {
      //   setMessages((prev) => [...prev, insertedMsg as Message]);
      // }
      if (!msgError && insertedMsg) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === insertedMsg.id)) return prev;
          return [...prev, insertedMsg as Message];
        });
      }
      // *******************************************************************************************************************************************************************



    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Send failed",
        description: err.message,
      });
    } finally {
      setUploading(false);
    }
  };


  const renderMessageContent = (content: string, isOwn: boolean) => {
    if (content.startsWith('📎 [')) {
      const lines = content.split('\n');
      const header = lines[0];
      const url = lines[1];

      const isImage = header.startsWith('📎 [image]');
      const filename = header.replace(
        /^📎 \[(image|file)\]\s*/,
        ''
      );

      if (isImage && url) {
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={url}
              alt={filename}
              className="rounded-lg max-w-[240px] max-h-[240px] object-cover"
            />
            <p className="text-xs mt-1 opacity-80">
              {filename}
            </p>
          </a>
        );
      }

      if (url) {
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 underline"
          >
            <FileText className="h-4 w-4" />
            {filename}
          </a>
        );
      }
    }

    if (content.startsWith('🎤 [')) {
      const lines = content.split('\n');
      const url = lines[1];

      return <VoiceMessagePlayer audioUrl={url} isOwn={isOwn} />;
    }

    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </p>
    );
  };

  // ─── Helpers ───
  const formatCountdown = (seconds: number | null | undefined) => {
    if (seconds == null || isNaN(seconds)) return "00:00";

    const safeSeconds = Math.max(0, seconds);

    const m = Math.floor(safeSeconds / 60);
    const s = safeSeconds % 60;

    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  const getTypeIcon = () => {
    switch (consultation?.type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="h-screen h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading consultation...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───
  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* ═══ HEADER ═══ */}
      <header className="h-14 sm:h-16 border-b border-border bg-card/80 backdrop-blur-sm px-3 sm:px-6 flex items-center justify-between flex-shrink-0 animate-fade-in z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage src={participant?.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-primary/10">
              {participant?.full_name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {participant?.full_name}
            </h3>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] sm:text-xs gap-1 px-1.5 py-0">
                {getTypeIcon()}
                <span className="capitalize">{consultation?.type}</span>
              </Badge>
              {isActive && (
                <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] sm:text-xs px-1.5 py-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Session countdown */}



          {/* Audio/Video buttons - CLIENT ONLY */}
          {isActive && isClient && !isAudioCallActive && !isVideoCallActive && (
            <div className="flex items-center gap-1.5 sm:gap-2">

              {consultation?.type === "audio" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm gap-1 px-2 sm:px-3"
                  onClick={() => {
                    setCallInitiatedByMe(true);
                    setIsAudioCallActive(true);
                  }}
                  title="Start audio call with lawyer"
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Audio</span>
                </Button>
              )}

              {consultation?.type === "video" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm gap-1 px-2 sm:px-3"
                  onClick={() => {
                    setCallInitiatedByMe(true);
                    setIsVideoCallActive(true);
                  }}
                  title="Start video call with lawyer"
                >
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Video</span>
                </Button>
              )}

            </div>
          )}

          {/* End button - CLIENT ONLY */}
          {isActive && isClient && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 sm:h-9 text-xs sm:text-sm gap-1 px-2 sm:px-3"
              onClick={handleEndConsultation}
            >
              {/* <PhoneOff className="h-3.5 w-3.5" /> */}
              <span className=" sm:inline">End Chat</span>
            </Button>
          )}
        </div>
      </header >

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden" >
        {/* Desktop sidebar later add this content in nav bar */}


        {/* Chat + Content Area */}
        {/* <div className="flex-1 flex flex-col overflow-hidden"> */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">

          {/* ─── WAITING FOR ACCEPT ─── */}
          {isWaitingForAccept && (
            <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
              <div className="relative text-center max-w-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
                  onClick={handleCancelRequest}
                >
                  <XCircle className="h-4 w-4" />
                </Button>

                {isLawyer ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">New Consultation Request</h2>
                    <p className="text-muted-foreground mb-2">
                      <span className="font-semibold text-foreground">{participant?.full_name}</span> wants a{' '}
                      <span className="capitalize font-medium">{consultation?.type}</span> consultation.
                    </p>
                    {consultation?.total_amount && (
                      <p className="text-sm text-muted-foreground mb-6">
                        Session fee: <span className="font-semibold text-emerald-600">${consultation.total_amount.toFixed(2)}</span>
                        {' '}for {bookedMinutes} minutes
                      </p>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <Button size="lg" className="gap-2 px-8" onClick={handleLawyerAccept}>
                        <CheckCircle className="h-5 w-5" />
                        Accept Request
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelRequest}>
                        Cancel Request
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                      <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Waiting for Lawyer</h2>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{participant?.full_name}</span> will accept your request shortly.
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-4">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <Button variant="outline" size="sm" className="mt-6" onClick={handleCancelRequest}>
                      Cancel Request
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── WAITING FOR PAYMENT ─── */}
          {isWaitingForPayment && (
            <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
              <div className="text-center max-w-sm w-full">
                {isClient ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 animate-scale-in">
                      <Wallet className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Complete Payment</h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      {participant?.full_name} accepted your request. Pay to start the session.
                    </p>

                    <div className="rounded-xl border border-border bg-card p-4 text-left space-y-3 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Session Type</span>
                        <span className="font-medium capitalize">{consultation?.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{bookedMinutes} min</span>
                      </div>
                      <div className="border-t border-border pt-3 flex justify-between items-center gap-3">
                        <div>
                          <span className="font-semibold">Total</span>
                          <div className="text-xl font-bold text-primary">
                            ${(consultation?.total_amount || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-emerald-600">
                            Payment completed via Razorpay. Consultation is active.
                          </span>
                        </div>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" /> Secure payment
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
                      <Lock className="h-8 w-8 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Waiting for Payment</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      {participant?.full_name} is completing payment. Chat will unlock once paid.
                    </p>

                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-semibold mb-4",
                      paymentCountdown <= 30
                        ? "bg-destructive/10 text-destructive animate-pulse"
                        : "bg-amber-500/10 text-amber-600"
                    )}>
                      <Timer className="h-4 w-4" />
                      {formatCountdown(paymentCountdown)}
                    </div>

                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── ACTIVE SESSION: CHAT ─── */}

          {!isWaitingForAccept && !isWaitingForPayment && (isActive || isCompleted) && (
            <>
              {/* Messages Area */}

              <div
                className="flex-1 overflow-y-auto px-3 py-4 relative w-full h-full bg-center bg-no-repeat "
                style={{
                  backgroundImage: `url(${chatBg})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >

                {/* BACKGROUND OVERLAY */}
                {/* <div className="absolute inset-0 bg-black/10 dark:bg-black/50  pointer-events-none " /> */}


                {/* CONTENT WRAPPER */}
                <div className="relative z-10 max-w-4xl mx-auto space-y-4">

                  {/* <div className="absolute inset-0 bg-black/10 dark:bg-black/50  pointer-events-none " /> */}

                  {/* Premium badge */}
                  <div className="flex justify-center my-3">
                    <div className="rounded-full border border-emerald-500/20 bg-white/80 backdrop-blur-xl px-4 py-2 shadow-md flex items-center gap-2 text-xs sm:text-sm font-medium text-emerald-700">
                      <Shield className="h-4 w-4" />
                      <span>Secure Legal Consultation</span>
                    </div>
                  </div>

                  {/* Session countdown */}
                  {isActive && (
                    <div className="w-full flex justify-center sticky top-3 z-20 mb-3">
                      <div
                        className={cn(
                          // "flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-semibold shadow-lg backdrop-blur-md",
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-sm font-semibold",
                          (sessionCountdown ?? 0) <= 60
                            ? "bg-destructive/90 text-white animate-pulse"
                            : "bg-amber-500/10 text-amber-600"
                        )}
                      >
                        <Timer className="h-4 w-4" />
                        {sessionCountdown !== null && formatCountdown(sessionCountdown)}
                      </div>
                    </div>
                  )}




                  {messages.length === 0 && isActive && (
                    <div className="text-center py-0">

                      <h3 className="font-bold text-lg mb-1">Consultation Started</h3>
                      <p className="text-sm text-muted-foreground">
                        Start chatting securely with your legal expert.
                      </p>
                    </div>
                  )}

                  {messages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id;
                    const showAvatar =
                      index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2 sm:gap-3",
                          isOwn && "flex-row-reverse"
                        )}
                      >
                        {showAvatar ? (
                          <Avatar className="h-9 w-9 flex-shrink-0 border shadow-sm">
                            <AvatarImage
                              src={
                                isOwn
                                  ? myAvatarUrl || undefined
                                  : participant?.avatar_url || undefined
                              }
                            />
                            <AvatarFallback className="text-xs bg-primary/10">
                              {isOwn
                                ? user?.email?.charAt(0).toUpperCase()
                                : participant?.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-9" />
                        )}

                        <div className="max-w-[85%] sm:max-w-[70%]">
                          <div className="relative">


                            <div
                              className={cn(
                                "px-4 py-3 rounded-2xl text-sm sm:text-[14px] leading-relaxed shadow-md border",
                                isOwn
                                  ? "bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-md border-primary/20"
                                  : "bg-white rounded-bl-md border-border",

                              )}
                            >
                              {renderMessageContent(message.content, isOwn)}
                            </div>
                          </div>

                          <p
                            className={cn(
                              "text-[10px] sm:text-xs text-muted-foreground mt-1 px-2",
                              isOwn && "text-right"
                            )}
                          >
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              {chatEnabled && (
                // <div className="border-t border-border/50 bg-gradient-to-r from-white via-slate-50 to-white dark:from-card dark:via-card dark:to-card backdrop-blur-2xl px-2 sm:px-4 py-3 sm:py-4">
                <div className="sticky bottom-0 z-20 w-full border-t border-border/50 bg-gradient-to-r from-white via-slate-50 to-white dark:from-card dark:via-card dark:to-card backdrop-blur-2xl px-2 sm:px-4 py-3 sm:py-4 flex-shrink-0">
                  <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-border bg-white/95 dark:bg-card/95 shadow-lg px-2 sm:px-3 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">

                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary shrink-0"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Paperclip className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        )}
                      </Button>

                      <Input
                        ref={inputRef}
                        placeholder={
                          isRecording
                            ? "Recording voice note..."
                            : "Type your message..."
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className={`flex-1 border-0 bg-transparent px-1 sm:px-2 text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 ${isRecording
                          ? "text-red-600 placeholder:text-red-600 font-semibold"
                          : "text-slate-700 dark:text-slate-100"
                          }`}
                        disabled={sending || isRecording}
                      />

                      <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary shrink-0"
                          >
                            <Smile className="h-4 w-4 text-amber-500" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          align="end"
                          side="top"
                          className="p-0 border-0 w-auto bg-transparent shadow-none"
                        >
                          <EmojiPicker
                            onEmojiClick={handleEmojiSelect}
                            theme={Theme.AUTO}
                            width={320}
                            height={400}
                          />
                        </PopoverContent>
                      </Popover>

                      {isRecording ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={stopRecording}
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-50 hover:bg-red-100 shrink-0"
                        >
                          <Mic className="text-red-500 animate-pulse h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={startRecording}
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary shrink-0"
                        >
                          <Mic className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </Button>
                      )}

                      <Button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-md shrink-0"
                        size="icon"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>

                    </div>
                  </form>
                </div>
              )}
            </>
          )}





          {/* Completed footer */}
          {isCompleted && !showRating && (
            <div className="p-4 sm:p-6 border-t border-border bg-secondary/30 text-center flex-shrink-0">
              <p className="text-muted-foreground text-sm mb-2">
                This consultation has ended.
              </p>

              <Button
                onClick={() => {
                  if (isClient) {
                    setShowRating(true);
                  } else {
                    navigate('/lawyer/dashboard');
                  }
                }}
                className={cn(rejectButtonStyle)}
              >
                Return to Dashboard
              </Button>
            </div>
          )}

          {/* ─── CANCELLED ─── */}
          {isCancelled && (
            <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold mb-2">Consultation Cancelled</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  This consultation has been cancelled.
                </p>
                <Button
                  onClick={() =>
                    navigate(isLawyer ? '/lawyer/dashboard' : '/dashboard')
                  }
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div >

      {/* ═══ RATING DIALOG ═══ */}
      <Dialog Dialog
        open={showRating && isClient}
        onOpenChange={(open) => {
          if (!open) {
            setShowRating(false);
            navigate('/dashboard');
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-2xl">
          <div className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Star className="h-7 w-7 text-primary" />
            </div>

            <h3 className="text-lg font-bold mb-1">Rate Your Experience</h3>
            <p className="text-sm text-muted-foreground mb-5">
              How was your session with {participant?.full_name}?
            </p>

            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 sm:h-10 sm:w-10 transition-colors",
                      star <= selectedRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Share your experience (optional)..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/30 p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className={cn(rejectButtonStyle, "flex-1")}
                onClick={() => {
                  setShowRating(false);
                  navigate('/dashboard');
                }}
              >
                Skip
              </Button>

              <Button
                className={cn(acceptButtonStyle, "flex-1 gap-1.5")}
                disabled={selectedRating === 0 || submittingRating}
                onClick={handleSubmitRating}
              >
                {submittingRating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog >

      {/* ═══ MOOD DIALOG ═══ */}
      <Dialog Dialog open={showMoodDialog} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-2xl [&>button]:hidden">
          <div className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>

            <h3 className="text-lg font-bold mb-1">
              Client Changed Their Mind
            </h3>

            <p className="text-sm text-muted-foreground mb-6">
              The client was unable to complete the payment within the allotted
              time. The consultation has been cancelled.
            </p>

            <Button className="w-full" onClick={handleCancelPaymentTimeout}>
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      {/* ═══ VIDEO / AUDIO CALL OVERLAYS ═══ */}
      < VideoCall
        isActive={isVideoCallActive}
        onEnd={() => { setIsVideoCallActive(false); setCallInitiatedByMe(false); }}
        participantName={participant?.full_name || 'Participant'}
        consultationId={id || ''}
        isInitiatedByMe={callInitiatedByMe}
      />

      {/* Audio Call Component */}
      {/* < AudioCall
        isActive={isAudioCallActive}
        onEnd={() => { setIsAudioCallActive(false); setCallInitiatedByMe(false); }}
        participantName={participant?.full_name || 'Participant'}
        consultationId={id || ''}
        isInitiatedByMe={callInitiatedByMe}
      /> */}
      <AudioCall
        isActive={isAudioCallActive}
        onEnd={() => {
          setIsAudioCallActive(false);
          setCallInitiatedByMe(false);
        }}
        participantName={participant?.full_name || 'Participant'}
        consultationId={id || ''}
        isInitiatedByMe={callInitiatedByMe}
        canRecord={isClient}
      />
    </div >
  );
}

export default Consultation;