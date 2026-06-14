

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
    ArrowLeft,
    ArrowRight,
    Video,
    Phone,
    MessageSquare,
    Clock,
    User,
    CreditCard,
    CheckCircle,
    DollarSign,
    RefreshCw,
    Shield,
    AlertCircle,
    Banknote,
    XCircle,
    Loader2
} from 'lucide-react';

interface PendingPayment {
    id: string;
    type: 'chat' | 'audio' | 'video';
    status: string;
    created_at: string;
    total_amount: number | null;
    lawyer_id: string;
    lawyer_name: string;
    lawyer_avatar: string | null;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const ClientPayments = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [payments, setPayments] = useState<PendingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user) {
            fetchData();

            const channel = supabase
                .channel('client-payments')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'consultations',
                        filter: `client_id=eq.${user.id}`
                    },
                    () => fetchData()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, authLoading]);

    const fetchData = useCallback(async () => {
        if (!user) return;

        await fetchPayments();
        setLoading(false);
    }, [user]);

    const fetchPayments = async () => {
        if (!user) return;

        const { data } = await supabase
            .from('consultations')
            .select('id, type, status, created_at, total_amount, lawyer_id')
            .eq('client_id', user.id)
            .in('status', ['pending', 'active'])
            .not('total_amount', 'is', null)
            .order('created_at', { ascending: false });

        if (data && data.length > 0) {
            const lawyerIds = [...new Set(data.map(c => c.lawyer_id))];

            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', lawyerIds);

            setPayments(
                data.map(p => {
                    const prof = profiles?.find(pr => pr.id === p.lawyer_id);

                    return {
                        ...p,
                        lawyer_name: prof?.full_name || 'Legal Professional',
                        lawyer_avatar: prof?.avatar_url || null
                    };
                })
            );
        } else {
            setPayments([]);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="h-3.5 w-3.5" />;
            case 'audio':
                return <Phone className="h-3.5 w-3.5" />;
            default:
                return <MessageSquare className="h-3.5 w-3.5" />;
        }
    };

    const handleRazorpayPayment = async (payment: PendingPayment) => {
        if (!user) return;

        try {
            setPayingId(payment.id);

            const amount = Number(payment.total_amount) || 0;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,

                amount: Math.round(amount * 100),

                currency: 'INR',

                name: 'Legal Aid Connect',

                description: `${payment.type} consultation payment`,

                handler: async function (response: any) {
                    try {
                        const { error: paymentError } = await supabase
                            .from('payments')
                            .insert({
                                consultation_id: payment.id,
                                client_id: user.id,
                                lawyer_id: payment.lawyer_id,
                                razorpay_payment_id:
                                    response.razorpay_payment_id,
                                razorpay_order_id:
                                    response.razorpay_order_id || null,
                                amount: amount,
                                payment_status: 'completed',
                                payment_method: 'razorpay'
                            });

                        if (paymentError) {
                            console.error(paymentError);

                            toast({
                                variant: 'destructive',
                                title: 'Database Error',
                                description:
                                    'Payment received but failed to save.'
                            });

                            return;
                        }

                        await supabase
                            .from('consultations')
                            .update({
                                status: 'active'
                            })
                            .eq('id', payment.id);

                        toast({
                            title: '✅ Payment Successful',
                            description:
                                'Consultation payment completed successfully.'
                        });

                        fetchData();

                        navigate('/dashboard/transactions');
                    } catch (err) {
                        console.error(err);

                        toast({
                            variant: 'destructive',
                            title: 'Payment Error',
                            description: 'Something went wrong.'
                        });
                    } finally {
                        setPayingId(null);
                    }
                },

                prefill: {
                    email: user.email || ''
                },

                theme: {
                    color: '#16a34a'
                },

                modal: {
                    ondismiss: () => {
                        setPayingId(null);
                    }
                }
            };

            const razor = new window.Razorpay(options);

            razor.on('payment.failed', async function (response: any) {
                console.error(response);

                await supabase.from('payments').insert({
                    consultation_id: payment.id,
                    client_id: user.id,
                    lawyer_id: payment.lawyer_id,
                    amount: amount,
                    payment_status: 'failed',
                    payment_method: 'razorpay'
                });

                toast({
                    variant: 'destructive',
                    title: 'Payment Failed',
                    description: 'Your payment could not be completed.'
                });

                setPayingId(null);
            });

            razor.open();
        } catch (error) {
            console.error(error);

            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Unable to start payment.'
            });

            setPayingId(null);
        }
    };

    const handleCancel = async (id: string) => {
        setCancellingId(id);

        try {
            await supabase
                .from('consultations')
                .update({
                    status: 'cancelled'
                })
                .eq('id', id);

            toast({
                title: 'Cancelled',
                description: 'Booking cancelled successfully.'
            });

            fetchData();
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not cancel.'
            });
        } finally {
            setCancellingId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <ClientLayout>
                <div className="container mx-auto px-4 py-6 max-w-3xl">
                    <Skeleton className="h-8 w-40 mb-4" />

                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <Skeleton
                                key={i}
                                className="h-20 rounded-xl"
                            />
                        ))}
                    </div>
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
                            <h1 className="font-serif text-xl sm:text-2xl font-bold">
                                Pending Payments
                            </h1>
                            <p className="text-muted-foreground text-xs mt-0.5">
                                Pay consultation fees securely using Razorpay
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/dashboard/transactions')}
                            className="gap-1.5 h-8 text-xs"
                        >
                            <Clock className="h-3 w-3" />
                            Payment History
                        </Button> */}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchData()}
                            className="gap-1.5 h-8 text-xs"
                        >
                            <RefreshCw className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Payments */}
                {payments.length === 0 ? (
                    <Card className="border-0 shadow-md">
                        <CardContent className="py-14 text-center">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 mx-auto mb-4 flex items-center justify-center">
                                <CheckCircle className="h-7 w-7 text-emerald-500" />
                            </div>

                            <h3 className="text-lg font-semibold font-serif">
                                No Pending Payments
                            </h3>

                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-4">
                                All payments processed!
                            </p>

                            <Button
                                size="sm"
                                onClick={() => navigate('/lawyers')}
                                className="gap-1.5"
                            >
                                Browse Lawyers
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {payments.map((payment, index) => {
                            const amount =
                                Number(payment.total_amount) || 0;

                            return (
                                <Card
                                    key={payment.id}
                                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in relative"
                                    style={{
                                        animationDelay: `${index * 0.08}s`
                                    }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            {/* Lawyer Info */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden ring-1 ring-border shrink-0">
                                                    {payment.lawyer_avatar ? (
                                                        <img
                                                            src={
                                                                payment.lawyer_avatar
                                                            }
                                                            alt={
                                                                payment.lawyer_name
                                                            }
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-sm truncate">
                                                        {payment.lawyer_name}
                                                    </h3>

                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 text-[10px] px-1.5 py-0 h-5"
                                                        >
                                                            {getTypeIcon(
                                                                payment.type
                                                            )}

                                                            {payment.type}
                                                        </Badge>

                                                        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                            Pending
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <p className="text-lg font-bold hidden sm:block">
                                                    ₹{amount.toFixed(2)}
                                                </p>

                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        size="sm"
                                                        className="gap-1 h-7 text-xs px-3"
                                                        onClick={() =>
                                                            handleRazorpayPayment(
                                                                payment
                                                            )
                                                        }
                                                        disabled={
                                                            payingId ===
                                                            payment.id
                                                        }
                                                    >
                                                        {payingId ===
                                                            payment.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <CreditCard className="h-3 w-3" />
                                                        )}

                                                        Pay
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1 h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                                        disabled={
                                                            cancellingId ===
                                                            payment.id
                                                        }
                                                        onClick={() =>
                                                            handleCancel(
                                                                payment.id
                                                            )
                                                        }
                                                    >
                                                        {cancellingId ===
                                                            payment.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3" />
                                                        )}

                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-2.5 w-2.5" />

                                                {new Date(
                                                    payment.created_at
                                                ).toLocaleDateString([], {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>

                                            <span className="font-medium text-foreground sm:hidden">
                                                ₹{amount.toFixed(2)}
                                            </span>

                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <Shield className="h-2.5 w-2.5" />
                                                Secure Razorpay Payment
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Security Info */}
                <Card className="mt-6 border-0 shadow-sm bg-secondary/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-serif flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-emerald-600" />
                            Payment Security
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            {[
                                {
                                    icon: Shield,
                                    color: 'text-emerald-600',
                                    bg: 'bg-emerald-500/10',
                                    title: 'Secure',
                                    desc: 'Encrypted Razorpay transactions.'
                                },
                                {
                                    icon: DollarSign,
                                    color: 'text-blue-600',
                                    bg: 'bg-blue-500/10',
                                    title: 'Transparent',
                                    desc: 'No hidden fees ever.'
                                },
                                {
                                    icon: Banknote,
                                    color: 'text-amber-600',
                                    bg: 'bg-amber-500/10',
                                    title: 'Refunds',
                                    desc: 'Refund support available.'
                                }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-2"
                                >
                                    <div
                                        className={`w-6 h-6 rounded-md ${item.bg} flex items-center justify-center shrink-0`}
                                    >
                                        <item.icon
                                            className={`h-3 w-3 ${item.color}`}
                                        />
                                    </div>

                                    <div>
                                        <p className="font-medium text-[11px]">
                                            {item.title}
                                        </p>

                                        <p className="text-muted-foreground text-[10px] mt-0.5">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ClientLayout>
    );
};

export default ClientPayments;