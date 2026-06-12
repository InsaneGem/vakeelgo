import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rejectButtonStyle, acceptButtonStyle, bookNowButtonStyle } from '@/lib/buttonStyles';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initiateRazorpayPayment } from '@/lib/razorpay';
import {
    MessageSquare, Phone, Video, Clock, Shield,
    Loader2, User, FileText, Send, Timer, CreditCard, XCircle, AlertTriangle,
    CheckCircle
} from 'lucide-react';

const AGENDA_CATEGORIES = [
    { value: 'property_dispute', label: 'Property Dispute' },
    { value: 'family_law', label: 'Family Law / Divorce' },
    { value: 'criminal_defense', label: 'Criminal Defense' },
    { value: 'business_contract', label: 'Business / Contract' },
    { value: 'employment_issue', label: 'Employment Issue' },
    { value: 'consumer_complaint', label: 'Consumer Complaint' },
    { value: 'tax_finance', label: 'Tax & Finance' },
    { value: 'immigration', label: 'Immigration' },
    { value: 'cyber_crime', label: 'Cyber Crime' },
    { value: 'other', label: 'Other' },
    { value: 'tenant_landlord', label: 'Tenant / Landlord Dispute' },
    { value: 'insurance_claim', label: 'Insurance Claim' },
    { value: 'intellectual_property', label: 'Intellectual Property / Copyright' },
    { value: 'cheque_bounce', label: 'Cheque Bounce / Financial Fraud' },
    { value: 'motor_accident', label: 'Motor Accident Claim' },
    { value: 'domestic_violence', label: 'Domestic Violence' },
    { value: 'labour_dispute', label: 'Labour / Industrial Dispute' },
    { value: 'medical_negligence', label: 'Medical Negligence' },
    { value: 'will_succession', label: 'Will & Succession' },
    { value: 'startup_legal', label: 'Startup / Company Registration' },
    { value: 'gst_tax_notice', label: 'GST / Tax Notice' },


];

const DOCUMENT_OPTIONS = [
    { value: 'yes', label: 'Yes, I have documents to share' },
    { value: 'no', label: 'No documents at this time' },
    { value: 'will_share', label: 'Will share during consultation' },

];
const DRAFT_KEY = 'legalmate_booking_agenda_draft';

interface LawyerInfo {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url?: string | null;
    price_per_minute: number | null;
    chat_price_per_minute?: number | null;
    audio_price_per_minute?: number | null;
    video_price_per_minute?: number | null;
    rating: number | null;
    specializations: string[] | null;
}

interface BookingAgendaModalProps {
    isOpen: boolean;
    onClose: () => void;
    lawyer: LawyerInfo;
    consultationType: 'chat' | 'audio' | 'video';
    onSuccess?: (bookingId: string) => void;
}

export const BookingAgendaModal = ({
    isOpen,
    onClose,
    lawyer,
    consultationType: initialType,
    onSuccess
}: BookingAgendaModalProps) => {

    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [consultationType, setConsultationType] = useState<'chat' | 'audio' | 'video'>(initialType);
    const [agendaCategory, setAgendaCategory] = useState('');
    // const [urgency, setUrgency] = useState('');
    const [agendaDetails, setAgendaDetails] = useState('');
    const [documentStatus, setDocumentStatus] = useState('');
    const [priorAction, setPriorAction] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [step, setStep] = useState<'form' | 'waiting' | 'accepted' | 'rejected' | 'timeout'>('form');
    const [countdown, setCountdown] = useState(60);
    const [pendingConsultationId, setPendingConsultationId] = useState<string | null>(null);
    const [payingNow, setPayingNow] = useState(false);
    const [selectedMinutes, setSelectedMinutes] = useState(10);
    // ✅ AUTO SAVE DRAFT LOCALLY
    useEffect(() => {

        const draft = {
            agendaCategory,
            agendaDetails,
            documentStatus,
            priorAction,
            consultationType,
            selectedMinutes,
        };

        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

    }, [
        agendaCategory,
        agendaDetails,
        documentStatus,
        priorAction,
        consultationType,
        selectedMinutes
    ]);

    // ✅ RESTORE DRAFT WHEN MODAL OPENS
    useEffect(() => {

        if (!isOpen) return;

        const savedDraft = localStorage.getItem(DRAFT_KEY);

        if (savedDraft) {

            try {

                const parsed = JSON.parse(savedDraft);

                setAgendaCategory(parsed.agendaCategory || '');
                setAgendaDetails(parsed.agendaDetails || '');
                setDocumentStatus(parsed.documentStatus || '');
                setPriorAction(parsed.priorAction || '');
                setConsultationType(parsed.consultationType || initialType);
                setSelectedMinutes(parsed.selectedMinutes || 10);

            } catch (err) {
                console.error('Draft restore failed:', err);
            }
        }

    }, [isOpen]);

    const DURATION_OPTIONS = {
        chat: [5, 10, 15, 30],
        audio: [10, 15, 20, 30],
        video: [15, 20, 30, 45],
    } as const;

    useEffect(() => {
        setConsultationType(initialType);
        setSelectedMinutes(DURATION_OPTIONS[initialType][0]);
    }, [initialType]);


    const minimumMinutes = selectedMinutes;

    const lawyerBasePricePerMinute = consultationType === 'chat'
        ? lawyer.chat_price_per_minute ?? lawyer.price_per_minute ?? 5
        : consultationType === 'audio'
            ? lawyer.audio_price_per_minute ?? lawyer.price_per_minute ?? 5
            : lawyer.video_price_per_minute ?? lawyer.price_per_minute ?? 5;

    const rawSessionCost = minimumMinutes * lawyerBasePricePerMinute;
    // const sessionCost = Math.ceil((rawSessionCost * 1.05) / 0.9764);

    const markup =
        consultationType === 'chat'
            ? 0.05
            : consultationType === 'audio'
                ? 0.12
                : 0.15;

    const sessionCost = Math.ceil(
        ((rawSessionCost * (1 + markup)) + 15) / 0.9764
    );





    // ✅ 1. Get the raw base price per minute set by the lawyer
    // const lawyerBasePricePerMinute = consultationType === 'chat'
    //     ? lawyer.chat_price_per_minute ?? lawyer.price_per_minute ?? 5
    //     : consultationType === 'audio'
    //         ? lawyer.audio_price_per_minute ?? lawyer.price_per_minute ?? 5
    //         : lawyer.video_price_per_minute ?? lawyer.price_per_minute ?? 5;

    // // ✅ 2. Calculate raw session cost before platform markup
    // const rawSessionCost = minimumMinutes * lawyerBasePricePerMinute;

    // const sessionCost = Math.ceil((rawSessionCost * 1.05) / 0.9764);

    // ✅ 1. Get the raw base price per minute set by the lawyer


    // ✅ 2. Calculate raw session cost before platform markup


    // ✅ 3. Add your 15% platform markup rule (Covers Razorpay's fee + your profit)
    // const totalMarkupMultiplier = 1.15;

    // ✅ 4. Final rounded cost to show to the client and send to your DB/Razorpay
    // const sessionCost = Math.ceil(rawSessionCost * totalMarkupMultiplier);







    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'audio': return <Phone className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'video': return 'Video Call';
            case 'audio': return 'Audio Call';
            default: return 'Chat';
        }
    };

    const formatCountdown = (seconds: number) => {
        const safeSeconds = Math.max(0, seconds);
        const m = Math.floor(safeSeconds / 60);
        const s = safeSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (step !== 'waiting') return;

        if (countdown <= 0) {
            handleTimeout();
            return;
        }

        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);

    }, [step, countdown]);

    useEffect(() => {
        if (step !== 'accepted') return;

        if (countdown <= 0) {
            handlePaymentTimeout();
            return;
        }

        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [step, countdown]);

    useEffect(() => {

        if (!pendingConsultationId || (step !== 'waiting' && step !== 'accepted')) return;

        const channel = supabase
            .channel(`booking-wait-${pendingConsultationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'consultations',
                    filter: `id=eq.${pendingConsultationId}`,
                },
                (payload) => {

                    const updated = payload.new as any;

                    if (updated.status === 'pending' && updated.accepted_at) {
                        // Lawyer accepted! Show pay button
                        setCountdown(120);
                        setStep('accepted');

                        toast({
                            title: '✅ Lawyer Accepted!',
                            description: 'Please complete the payment to start your consultation.',
                        });
                    } else if (updated.status === 'active') {

                        // Payment done, redirect to consultation

                        toast({
                            title: '🎉 Consultation Started!',
                            description: 'Redirecting to your consultation...',
                        });

                        resetAndClose();
                        navigate(`/consultation/${pendingConsultationId}`);

                    }

                    else if (updated.status === 'cancelled') {
                        setStep('rejected');

                        toast({
                            variant: 'destructive',
                            title: 'Request Declined',
                            description: 'The lawyer declined your consultation request. Please try another lawyer.',
                        });

                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [step, pendingConsultationId]);

    const handleTimeout = useCallback(async () => {

        if (pendingConsultationId) {
            await supabase
                .from('consultations')
                .update({ status: 'cancelled' })
                .eq('id', pendingConsultationId);

            // ✅ reset lawyer busy status
            await supabase
                .from('lawyer_profiles')
                .update({
                    is_busy: false,
                    is_available: true,
                })
                .eq('user_id', lawyer.user_id);

        }
        setStep('timeout');
    }, [pendingConsultationId]);
    const handleCancelRequest = async () => {
        if (pendingConsultationId) {
            await supabase
                .from('consultations')
                .update({ status: 'cancelled' })
                .eq('id', pendingConsultationId);

            // ✅ reset lawyer busy status
            await supabase
                .from('lawyer_profiles')
                .update({
                    is_busy: false,
                    is_available: true,
                })
                .eq('user_id', lawyer.user_id);

        }

        toast({
            title: 'Request Cancelled',
            description: 'Your consultation request has been cancelled.',
        });

        resetAndClose();


    };

    const resetAndClose = () => {

        setStep('form');
        setAgendaCategory('');

        setAgendaDetails('');
        setDocumentStatus('');
        setPriorAction('');
        setCountdown(60);
        setPendingConsultationId(null);
        setPayingNow(false);

        onClose();
    };

    const handleSubmit = async () => {

        if (!user || !agendaCategory || !agendaDetails.trim()) {

            toast({
                variant: 'destructive',
                title: 'Missing Details',
                description: 'Please fill in all required fields.',
            });

            return;
        }

        setSubmitting(true);

        try {

            const categoryLabel =
                AGENDA_CATEGORIES.find(c => c.value === agendaCategory)?.label || agendaCategory;


            const docLabel = DOCUMENT_OPTIONS.find(d => d.value === documentStatus)?.label || '';


            let fullAgenda = '';

            if (categoryLabel) {
                fullAgenda += `[${categoryLabel}]`;
            }

            if (docLabel) {
                fullAgenda += ` [Documents: ${docLabel}]`;
            }

            if (priorAction.trim()) {
                fullAgenda += `\nPrior Action: ${priorAction.trim()}`;
            }

            // MAIN DESCRIPTION
            fullAgenda += `\n\nIssue Details:\n${agendaDetails.trim()}`;


            const { data, error } = await supabase
                .from('consultations')
                .insert({
                    client_id: user.id,
                    lawyer_id: lawyer.user_id,
                    type: consultationType,
                    status: 'pending',
                    total_amount: sessionCost,
                    duration_minutes: selectedMinutes,
                    agenda: fullAgenda,
                    payment_status: 'unpaid',
                })
                .select('id')
                .single();

            if (error) throw error;

            setPendingConsultationId(data.id);
            setCountdown(60);
            setStep('waiting');
            localStorage.removeItem(DRAFT_KEY);

            // Clear agenda after 2 minutes to avoid storing long-term details
            // This keeps the agenda visible to the lawyer for a short period,
            // then removes it to avoid filling Supabase storage with sensitive text.
            setTimeout(async () => {
                try {
                    await supabase
                        .from('consultations')
                        .update({ agenda: null })
                        .eq('id', data.id);
                } catch (err) {
                    console.error('Failed to clear temporary agenda:', err);
                }
            }, 2 * 60 * 1000);

        }

        catch (error) {

            console.error('Booking error:', error);

            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: 'Unable to send consultation request. Please try again.',
            });

        }

        finally {
            setSubmitting(false);
        }
    };

    const handlePayment = async () => {
        if (!pendingConsultationId) return;

        setPayingNow(true);

        await initiateRazorpayPayment({
            consultationId: pendingConsultationId,

            onSuccess: async (id) => {
                try {
                    const now = new Date().toISOString();

                    // ✅ STEP 1: update DB FIRST
                    const { error } = await supabase
                        .from('consultations')
                        .update({
                            status: 'active',
                            started_at: now,
                            payment_status: 'paid'
                        })
                        .eq('id', id);

                    if (error) throw error;

                    toast({
                        title: '✅ Payment Successful!',
                        description: 'Starting consultation...',
                    });

                    // small delay avoids route crash
                    setTimeout(() => {
                        setPayingNow(false);
                        resetAndClose();
                        onSuccess?.(id);
                        // navigate(`/consultation/${id}`);
                        // ⚡ FORCES HARD PAGE REFRESH AND MOUNTS WEBSOCKETS CLEANLY 
                        window.location.href = `/consultation/${id}`;
                    }, 300);

                } catch (err) {
                    console.error('Activation error:', err);

                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Payment succeeded but activation failed. Please refresh.',
                    });

                    setPayingNow(false);
                }
            },

            onError: (error) => {
                toast({
                    variant: 'destructive',
                    title: 'Payment Failed',
                    description: error,
                });
                setPayingNow(false);
            },
        });
    };
    // Client cancels AFTER lawyer accepted (before paying)
    const handleCancelAfterAccept = async () => {
        if (pendingConsultationId) {
            await supabase
                .from('consultations')
                .update({ status: 'cancelled' })
                .eq('id', pendingConsultationId);

            // ✅ reset lawyer busy status
            await supabase
                .from('lawyer_profiles')
                .update({
                    is_busy: false,
                    is_available: true,
                })
                .eq('user_id', lawyer.user_id);

        }
        toast({
            title: 'Booking Cancelled',
            description: 'The consultation has been cancelled.',
        });
        resetAndClose();
    };

    const handlePaymentTimeout = async () => {
        if (pendingConsultationId) {
            await supabase
                .from('consultations')
                .update({ status: 'cancelled' })
                .eq('id', pendingConsultationId);

            // ✅ reset lawyer busy status
            await supabase
                .from('lawyer_profiles')
                .update({
                    is_busy: false,
                    is_available: true,
                })
                .eq('user_id', lawyer.user_id);
        }

        toast({
            variant: 'destructive',
            title: 'Payment Timed Out',
            description: 'The payment window expired and the consultation was cancelled.',
        });
        resetAndClose();
        navigate('/dashboard');
    };

    return (

        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                if (step === 'waiting') {
                    handleCancelRequest();
                } else {
                    resetAndClose();
                }
            }
        }}>

            <DialogContent
                className="w-[95vw] sm:w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl 
max-h-[92vh] overflow-hidden p-0 rounded-2xl"
                onPointerDownOutside={(e) => { if (step !== 'form') e.preventDefault(); }}
            >
                <div className="max-h-[92vh] overflow-y-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6 
                    scroll-smooth scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <DialogHeader>

                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {step === 'accepted' ? 'Complete Payment' : step === 'waiting' ? 'Waiting for Lawyer' : step === 'rejected' ? 'Request Declined' : step === 'timeout' ? 'Request Timed Out' : 'Book Consultation'}
                        </DialogTitle>

                        <DialogDescription>
                            {step === 'waiting'
                                ? 'Waiting for the lawyer to accept your request...'
                                : step === 'accepted'
                                    ? 'The lawyer accepted! Pay now to start.'
                                    : step === 'rejected'
                                        ? 'The lawyer was unable to take your request.'
                                        : step === 'timeout'
                                            ? 'The lawyer did not respond in time.'
                                            : 'Fill in your consultation details to send a request'}
                        </DialogDescription>

                    </DialogHeader>

                    {step === 'timeout' ? (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                                <AlertTriangle className="h-8 w-8 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Lawyer Did Not Respond</h3>
                                <p className="text-sm text-muted-foreground">
                                    The lawyer didn't respond within 60 seconds. Please try another lawyer.
                                </p>
                            </div>
                            <Button onClick={resetAndClose} className={cn(rejectButtonStyle)}>
                                Try Another Lawyer
                            </Button>
                        </div>
                    ) : step === 'rejected' ? (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Request Declined</h3>
                                <p className="text-sm text-muted-foreground">
                                    The lawyer was unable to accept your request. Please try another lawyer.
                                </p>
                            </div>
                            <Button onClick={resetAndClose} className={cn(rejectButtonStyle)}>
                                Try Another Lawyer
                            </Button>
                        </div>
                    ) : step === 'accepted' ? (
                        <div className="py-6 space-y-5">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-semibold">Lawyer Accepted!</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {lawyer.full_name} is ready for your {getTypeLabel(consultationType).toLowerCase()} session
                                </p>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <div className="flex items-center gap-1.5">
                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-medium">Consultation Fee</span>
                                </div>

                                <span className="text-lg font-semibold text-emerald-600">
                                    ₹{sessionCost.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-center">
                                <div
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-sm font-semibold",
                                        countdown <= 30
                                            ? "bg-destructive/10 text-destructive animate-pulse"
                                            : "bg-amber-500/10 text-amber-600"
                                    )}
                                >
                                    <Timer className="h-4 w-4" />
                                    {formatCountdown(countdown)}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Shield className="h-4 w-4 flex-shrink-0" />
                                <span>The lawyer is waiting. Complete payment to start your {consultationType} session.</span>
                            </div>
                            <div className="flex gap-3 ">
                                <Button variant="outline" onClick={handleCancelAfterAccept} className={cn(rejectButtonStyle, "flex-1 gap-2 h-11 sm:h-12")}>
                                    <XCircle className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePayment}
                                    disabled={payingNow}

                                    className={cn(bookNowButtonStyle, "flex-1 gap-2 h-11 sm:h-12")}

                                >
                                    {payingNow ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CreditCard className="h-4 w-4" />
                                    )}
                                    Pay ₹{sessionCost.toFixed(2)}
                                </Button>
                            </div>
                        </div>
                    ) : step === 'waiting' ? (

                        <div className="py-8 text-center space-y-6">

                            <div className="relative w-24 h-24 mx-auto">

                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">

                                    <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />

                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={countdown <= 10 ? 'hsl(0 84% 60%)' : 'hsl(var(--primary))'}
                                        strokeWidth="6" strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 45}`}
                                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - countdown / 60)}`}
                                        className="transition-all duration-1000 ease-linear"
                                    />

                                </svg>

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-3xl font-bold ${countdown <= 10 ? 'text-red-500' : ''}`}>{countdown}</span>
                                </div>

                            </div>

                            <div>

                                <h3 className="text-lg font-semibold mb-1">
                                    Waiting for Lawyer
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    {lawyer.full_name} has 60 seconds to accept your request
                                </p>

                            </div>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Timer className="h-4 w-4" />
                                <span>Request will auto-cancel if not accepted in time</span>
                            </div>


                            <Button
                                variant="outline"
                                onClick={handleCancelRequest}
                                className={cn(rejectButtonStyle)}
                            >
                                {/* <XCircle className="h-4 w-4 text-black" /> */}
                                <XCircle className="h-4 w-4" />

                                Cancel Request
                            </Button>

                        </div>

                    ) : (

                        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 
  scrollbar-none 
  [-ms-overflow-style:none] 
  [scrollbar-width:none] 
  [&::-webkit-scrollbar]:hidden">

                            {/* Lawyer Info */}

                            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border">

                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">

                                    {lawyer.avatar_url ? (

                                        <img
                                            src={lawyer.avatar_url}
                                            alt={lawyer.full_name}
                                            className="w-full h-full object-cover"
                                        />

                                    ) : (

                                        <User className="h-7 w-7 text-primary" />

                                    )}

                                </div>

                                <div className="flex-1">

                                    <h4 className="font-semibold">
                                        {lawyer.full_name}
                                    </h4>

                                    {lawyer.specializations && lawyer.specializations.length > 0 && (

                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {lawyer.specializations.slice(0, 2).join(', ')}
                                        </p>

                                    )}

                                </div>

                            </div>

                            {/* Consultation Type */}

                            <div className="space-y-3">

                                <Label className="text-sm font-medium">
                                    Select The Consultation Mode
                                </Label>

                                <div className="grid grid-cols-3 gap-1.5">
                                    {(['chat', 'audio', 'video'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setConsultationType(type);
                                                setSelectedMinutes(DURATION_OPTIONS[type][0]);
                                            }}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${consultationType === type
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/30'
                                                }`}
                                        >
                                            {getTypeIcon(type)}

                                            <span className="text-[11px] font-medium capitalize leading-none">
                                                {getTypeLabel(type)}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-2.5 rounded-lg border bg-secondary/30 space-y-2">

                                    <Label className="text-[11px] font-medium text-muted-foreground">
                                        Choose duration
                                    </Label>

                                    <div className="grid grid-cols-2 gap-1.5">
                                        {DURATION_OPTIONS[consultationType].map((minutes) => {
                                            const isSelected = selectedMinutes === minutes;
                                            const label = isSelected
                                                // ? `₹${(minutes * pricePerMinute).toFixed(0)}`
                                                //  Update it to this:
                                                // ? `₹${Math.ceil((minutes * lawyerBasePricePerMinute) * 1.15)}`
                                                // ? `₹${Math.ceil(((minutes * lawyerBasePricePerMinute) * 1.05) / 0.9764)}`
                                                ? (() => {
                                                    const currentBase = minutes * lawyerBasePricePerMinute;
                                                    const currentMarkup = consultationType === 'chat' ? 0.05 : consultationType === 'audio' ? 0.12 : 0.15;
                                                    return `₹${Math.ceil(((currentBase * (1 + currentMarkup)) + 15) / 0.9764)}`;
                                                })()
                                                : `${minutes} min`;

                                            return (
                                                <button
                                                    key={minutes}
                                                    onClick={() => setSelectedMinutes(minutes)}
                                                    className={`h-8 rounded-md text-xs font-medium border transition-all ${isSelected
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'hover:border-primary/40'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                </div>
                            </div>
                            {/* Category */}

                            <div className="space-y-2">

                                <Label className="text-sm font-medium">Legal Category *</Label>

                                <Select value={agendaCategory} onValueChange={setAgendaCategory}>

                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category..." />
                                    </SelectTrigger>

                                    {/* <SelectContent> */}
                                    <SelectContent
                                        className="z-[9999]"
                                        position="popper"
                                    >

                                        {AGENDA_CATEGORIES.map((cat) => (

                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>
                            </div>


                            {/* Details */}

                            <div className="space-y-2">

                                <Label className="text-sm font-medium">Describe Your Issue *</Label>


                                <Textarea
                                    placeholder="Briefly describe your legal issue so the lawyer can prepare..."
                                    value={agendaDetails}
                                    rows={3}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const words = value.trim().split(/\s+/).filter(Boolean);

                                        if (words.length <= 40) {
                                            setAgendaDetails(value);
                                        } else {
                                            setAgendaDetails(words.slice(0, 40).join(' '));
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        const words = agendaDetails.trim().split(/\s+/).filter(Boolean);

                                        const allowedKeys = [
                                            'Backspace',
                                            'Delete',
                                            'ArrowLeft',
                                            'ArrowRight',
                                            'ArrowUp',
                                            'ArrowDown',
                                            'Tab'
                                        ];

                                        // 🚫 Block typing if already 40 words
                                        if (words.length >= 40 && !allowedKeys.includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />

                                <p className="text-xs text-gray-500 mt-1">
                                    {agendaDetails.trim().split(/\s+/).filter(Boolean).length} / 40 words
                                </p>

                            </div>
                            {/* Price Info */}

                            {/* ✅ PASTE THIS NEW PREMIUM BREAKDOWN BLOCK */}
                            {/* Premium Price Summary Breakdown */}
                            <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                                        Consultation Fee ({selectedMinutes} mins)
                                    </span>
                                    <span className="font-medium text-foreground">
                                        ₹{rawSessionCost.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5 text-muted-foreground/70" />
                                        Platform & Payment Gateway Charges
                                    </span>
                                    <span className="font-medium text-foreground">
                                        ₹{(sessionCost - rawSessionCost).toFixed(2)}
                                    </span>
                                </div>

                                {/* Subtle Divider Line */}
                                <div className="border-t border-border/80 my-1" />

                                <div className="flex items-center justify-between pt-0.5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded bg-primary/10 text-primary">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-semibold tracking-tight text-foreground">
                                            Total Payable Amount
                                        </span>
                                    </div>
                                    <span className="text-base font-bold text-primary tracking-tight">
                                        ₹{sessionCost.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            {/* Submit */}
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || !agendaCategory || !agendaDetails.trim()}
                                // className="h-9 text-sm px-4 rounded-lg transition-all duration-300 hover:scale-[1.01]"
                                className={cn(acceptButtonStyle)}
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}

                                <span className="ml-1">Send Request</span>
                            </Button>

                        </div>

                    )}

                </div>

            </DialogContent>

        </Dialog>

    );
};