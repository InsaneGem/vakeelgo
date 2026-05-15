import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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

const URGENCY_OPTIONS = [
    { value: 'low', label: 'Not urgent — within a week' },
    { value: 'medium', label: 'Moderately urgent — within 2-3 days' },
    { value: 'high', label: 'Very urgent — need help today' },
    { value: 'critical', label: 'Emergency — need help right now' },
];
const DOCUMENT_OPTIONS = [
    { value: 'yes', label: 'Yes, I have documents to share' },
    { value: 'no', label: 'No documents at this time' },
    { value: 'will_share', label: 'Will share during consultation' },

];

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
    const [urgency, setUrgency] = useState('');
    const [agendaDetails, setAgendaDetails] = useState('');
    const [documentStatus, setDocumentStatus] = useState('');
    const [priorAction, setPriorAction] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [step, setStep] = useState<'form' | 'waiting' | 'accepted' | 'rejected' | 'timeout'>('form');
    const [countdown, setCountdown] = useState(60);
    const [pendingConsultationId, setPendingConsultationId] = useState<string | null>(null);
    const [payingNow, setPayingNow] = useState(false);
    const [selectedMinutes, setSelectedMinutes] = useState(10);

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
    const pricePerMinute = consultationType === 'chat'
        ? lawyer.chat_price_per_minute ?? lawyer.price_per_minute ?? 5
        : consultationType === 'audio'
            ? lawyer.audio_price_per_minute ?? lawyer.price_per_minute ?? 5
            : lawyer.video_price_per_minute ?? lawyer.price_per_minute ?? 5;
    const sessionCost = minimumMinutes * pricePerMinute;

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
        }
        setStep('timeout');
    }, [pendingConsultationId]);
    const handleCancelRequest = async () => {
        if (pendingConsultationId) {
            await supabase
                .from('consultations')
                .update({ status: 'cancelled' })
                .eq('id', pendingConsultationId);
        }

        toast({
            title: 'Request Cancelled',
            description: 'Your consultation request has been cancelled.',
        });

        resetAndClose();

        // }, [pendingConsultationId]);
    };

    const resetAndClose = () => {

        setStep('form');
        setAgendaCategory('');
        setUrgency('');
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

            const urgencyLabel =
                URGENCY_OPTIONS.find(u => u.value === urgency)?.label || urgency;

            const docLabel = DOCUMENT_OPTIONS.find(d => d.value === documentStatus)?.label || '';

            let fullAgenda = `[${categoryLabel}] [${urgencyLabel}]`;
            if (docLabel) fullAgenda += ` [Documents: ${docLabel}]`;
            if (priorAction.trim()) fullAgenda += `\nPrior Action: ${priorAction.trim()}`;


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
    // const handlePayment = async () => {
    //     if (!pendingConsultationId) return;
    //     setPayingNow(true);
    //     await initiateRazorpayPayment({
    //         consultationId: pendingConsultationId,
    //         onSuccess: (id) => {
    //             toast({
    //                 title: '✅ Payment Successful!',
    //                 description: 'Redirecting to consultation...',
    //             });
    //             setPayingNow(false);
    //             resetAndClose();
    //             onSuccess?.(id);
    //             navigate(`/consultation/${id}`);
    //         },
    //         onError: (error) => {
    //             toast({
    //                 variant: 'destructive',
    //                 title: 'Payment Failed',
    //                 description: error,
    //             });
    //             setPayingNow(false);
    //         },
    //     });
    // };
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
                        navigate(`/consultation/${id}`);
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
        }
        toast({
            title: 'Booking Cancelled',
            description: 'The consultation has been cancelled.',
        });
        resetAndClose();
    };

    return (

        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && step === 'form') resetAndClose(); }}>

            <DialogContent
                className="w-[95vw] sm:w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl 
max-h-[92vh] overflow-hidden p-0 rounded-2xl"
                onPointerDownOutside={(e) => { if (step !== 'form') e.preventDefault(); }}
            >




                {/* <div className="max-h-[90vh] overflow-y-auto p-6 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-primary/40 [&::-webkit-scrollbar-thumb]:rounded-full"> */}
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
                            <Button onClick={resetAndClose} className="gap-2">
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
                            <Button onClick={resetAndClose} className="gap-2">
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
                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-emerald-600" />
                                    <span className="font-medium">Consultation Fee</span>
                                </div>
                                <span className="text-2xl font-bold text-emerald-600">₹{sessionCost.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Shield className="h-4 w-4 flex-shrink-0" />
                                <span>The lawyer is waiting. Complete payment to start your {consultationType} session.</span>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleCancelAfterAccept} className="flex-1 gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePayment}
                                    disabled={payingNow}
                                    className="flex-1 gap-2"
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

                            <Button variant="outline" onClick={handleCancelRequest} className="gap-2">
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

                            {/* <div className="space-y-2">

                                <Label className="text-sm font-medium">
                                    Select The Consultation Mode
                                </Label>

                                <div className="grid grid-cols-3 gap-2">

                                    {(['chat', 'audio', 'video'] as const).map((type) => (

                                        <button
                                            key={type}
                                            // type="button"
                                            onClick={() => setConsultationType(type)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${consultationType === type
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/30'
                                                }`}
                                        >

                                            {getTypeIcon(type)}

                                            <span className="text-xs font-medium capitalize">{getTypeLabel(type)}</span>

                                        </button>

                                    ))}

                                </div>

                            </div> */}

                            <div className="space-y-3">

                                <Label className="text-sm font-medium">
                                    Select The Consultation Mode
                                </Label>

                                <div className="grid grid-cols-3 gap-2">
                                    {(['chat', 'audio', 'video'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setConsultationType(type);
                                                setSelectedMinutes(DURATION_OPTIONS[type][0]);
                                            }}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${consultationType === type
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/30'
                                                }`}
                                        >
                                            {getTypeIcon(type)}
                                            <span className="text-xs font-medium capitalize">
                                                {getTypeLabel(type)}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-3 rounded-xl border bg-secondary/30 space-y-3">

                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Choose duration
                                    </Label>

                                    <div className="grid grid-cols-2 gap-2">
                                        {DURATION_OPTIONS[consultationType].map((minutes) => {
                                            const isSelected = selectedMinutes === minutes;
                                            const label = isSelected
                                                ? `₹${(minutes * pricePerMinute).toFixed(0)}`
                                                : `${minutes} min`;

                                            return (
                                                <button
                                                    key={minutes}
                                                    onClick={() => setSelectedMinutes(minutes)}
                                                    className={`h-10 rounded-lg text-sm font-semibold border transition-all ${isSelected
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

                                    <SelectContent>

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
                                    onChange={(e) => setAgendaDetails(e.target.value)}
                                    rows={3}
                                />

                            </div>
                            {/* Price Info */}
                            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                                <div className="flex items-center gap-2 text-sm">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    <span>Session Fee ({selectedMinutes} mins)</span>
                                </div>
                                <span className="font-bold text-primary">₹{sessionCost.toFixed(2)}</span>
                            </div>
                            {/* Submit */}
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || !agendaCategory || !agendaDetails.trim()}
                                className="transition-all duration-300 hover:scale-[1.02]"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Send Consultation Request
                            </Button>

                        </div>

                    )}

                </div>

            </DialogContent>

        </Dialog>

    );
};