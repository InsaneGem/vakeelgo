

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';

import {
    ArrowLeft,
    RefreshCw,
    Clock,
    DollarSign,
    CheckCircle,
    XCircle,
    CreditCard,
    RotateCcw,
    Receipt,
    IndianRupee,
    User,
    AlertCircle,
    MessageSquareWarning
} from 'lucide-react';

type FilterType =
    | 'all'
    | 'completed'
    | 'pending'
    | 'refunded'
    | 'failed';

// interface PaymentTransaction {
//     id: string;
//     consultation_id: string | null;
//     amount: number;
//     payment_status: string;
//     payment_method: string | null;
//     razorpay_payment_id: string | null;
//     razorpay_order_id: string | null;
//     created_at: string;
//     lawyer_id: string;
//     lawyer_name?: string;
//     lawyer_avatar?: string | null;
// }

interface PaymentTransaction {
    id: string;
    consultation_id: string | null;
    amount: number;
    payment_status: string;
    payment_method: string | null;
    razorpay_payment_id: string | null;
    razorpay_order_id: string | null;
    created_at: string;
    lawyer_id: string;

    lawyer_name?: string;
    lawyer_avatar?: string | null;

    // REPORT INFO
    report_submitted?: boolean;
    report_issue_type?: string | null;
    report_description?: string | null;
    report_status?: string | null;
}

const statusConfig: Record<
    string,
    {
        label: string;
        icon: typeof DollarSign;
        color: string;
        bg: string;
        border: string;
    }
> = {
    completed: {
        label: 'Completed',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
    },

    pending: {
        label: 'Pending',
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20'
    },

    refunded: {
        label: 'Refunded',
        icon: RotateCcw,
        color: 'text-blue-600',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
    },

    failed: {
        label: 'Failed',
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20'
    }
};

const ClientTransactionHistory = () => {
    // const [totalSpent, setTotalSpent] = useState(0);
    const { user, loading: authLoading } = useAuth();

    const navigate = useNavigate();

    const [transactions, setTransactions] = useState<
        PaymentTransaction[]
    >([]);

    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] =
        useState<FilterType>('all');

    const [currentPage, setCurrentPage] = useState(1);

    const perPage = 5;

    const [totalSpent, setTotalSpent] = useState(0);

    const [selectedPayment, setSelectedPayment] =
        useState<PaymentTransaction | null>(null);

    const [reportDialogOpen, setReportDialogOpen] =
        useState(false);

    const [reportReason, setReportReason] =
        useState('');

    const [reportMessage, setReportMessage] =
        useState('');

    const [submittingReport, setSubmittingReport] =
        useState(false);

    const [viewReportOpen, setViewReportOpen] =
        useState(false);

    const [selectedReport, setSelectedReport] =
        useState<PaymentTransaction | null>(null);
    const [reportError, setReportError] =
        useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user) {
            fetchTransactions();

            const channel = supabase
                .channel('payment-history')

                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'payments',
                        filter: `client_id=eq.${user.id}`
                    },
                    () => fetchTransactions()
                )

                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, authLoading]);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;

        setReportError('');
        try {
            setLoading(true);

            let query = supabase
                .from('payments')
                .select(`
                    id,
                    consultation_id,
                    amount,
                    payment_status,
                    payment_method,
                    razorpay_payment_id,
                    razorpay_order_id,
                    created_at,
                    lawyer_id
                `)
                .eq('client_id', user.id)
                .order('created_at', { ascending: false });

            if (filterType !== 'all') {
                query = query.eq(
                    'payment_status',
                    filterType
                );
            }

            const { data, error } = await query;

            if (error) {
                console.error(error);
                setTransactions([]);
                return;
            }

            const payments =
                (data as PaymentTransaction[]) || [];

            if (payments.length > 0) {
                const lawyerIds = [
                    ...new Set(
                        payments.map(p => p.lawyer_id)
                    )
                ];

                const { data: profiles } = await supabase
                    .from('profiles')
                    .select(
                        'id, full_name, avatar_url'
                    )
                    .in('id', lawyerIds);

                // const merged = payments.map(payment => {
                //     const lawyer = profiles?.find(
                //         p => p.id === payment.lawyer_id
                //     );

                //     return {
                //         ...payment,
                //         lawyer_name:
                //             lawyer?.full_name ||
                //             'Legal Professional',

                //         lawyer_avatar:
                //             lawyer?.avatar_url || null
                //     };
                // });

                const consultationIds = payments
                    .map(p => p.consultation_id)
                    .filter(Boolean);

                const { data: reports } = await supabase
                    .from('payment_reports')
                    .select('*')
                    .in('consultation_id', consultationIds);

                const merged = payments.map(payment => {
                    const lawyer = profiles?.find(
                        p => p.id === payment.lawyer_id
                    );

                    const report = reports?.find(
                        r =>
                            r.consultation_id ===
                            payment.consultation_id
                    );

                    return {
                        ...payment,

                        lawyer_name:
                            lawyer?.full_name ||
                            'Legal Professional',

                        lawyer_avatar:
                            lawyer?.avatar_url || null,

                        report_submitted: !!report,

                        report_issue_type:
                            report?.issue_type || null,

                        report_description:
                            report?.issue_message || null,

                        report_status:
                            report?.status || 'pending'
                    };
                });

                setTransactions(merged);

                const spent = merged
                    .filter(
                        t =>
                            t.payment_status ===
                            'completed'
                    )
                    .reduce(
                        (sum, t) =>
                            sum + Number(t.amount || 0),
                        0
                    );

                setTotalSpent(spent);
            } else {
                setTransactions([]);
                setTotalSpent(0);
            }
        } catch (err) {
            console.error(err);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [user, filterType]);

    const submitReport = async () => {
        if (!selectedPayment) return;

        if (!reportReason) {
            // alert('Please select issue type');
            setReportError('Please select issue type');
            return;
        }

        if (!reportMessage.trim()) {
            // alert('Please explain the issue');
            setReportError('Please explain the issue');
            return;
        }

        setReportError('');
        try {
            setSubmittingReport(true);

            const { error } = await supabase
                .from('payment_reports')
                .insert({
                    payment_id: selectedPayment.id,
                    consultation_id:
                        selectedPayment.consultation_id,
                    client_id: user?.id,
                    lawyer_id: selectedPayment.lawyer_id,
                    issue_type: reportReason,
                    issue_message: reportMessage,
                    payment_status:
                        selectedPayment.payment_status,
                });

            if (error) {
                console.error(error);
                // alert('Failed to submit report');

                console.log(error);

                // alert(error?.message || 'Failed');
                setReportError(
                    error?.message || 'Failed to submit report'
                );
                return;
            }

            // alert('Report submitted successfully');
            setReportError('Report submitted successfully');
            await fetchTransactions();

            setReportDialogOpen(false);

            setReportReason('');

            setReportMessage('');

            setSelectedPayment(null);
        } catch (err) {
            console.error(err);
            // alert('Something went wrong');
            setReportError('Something went wrong');
        } finally {
            setSubmittingReport(false);
        }
    };

    const filtered =
        filterType === 'all'
            ? transactions
            : transactions.filter(
                t => t.payment_status === filterType
            );

    const totalPages = Math.ceil(
        filtered.length / perPage
    );

    const displayed = filtered.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    const getConfig = (status: string) =>
        statusConfig[status] || {
            label: status,
            icon: DollarSign,
            color: 'text-muted-foreground',
            bg: 'bg-muted',
            border: 'border-border'
        };

    if (authLoading || loading) {
        return (
            <ClientLayout>
                <div className="container mx-auto px-3 sm:px-4 py-6 max-w-3xl overflow-x-hidden">
                    <Skeleton className="h-8 w-48 mb-4" />

                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton
                                key={i}
                                className="h-16 rounded-xl"
                            />
                        ))}
                    </div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="container mx-auto px-4 py-6 max-w-3xl overflow-x-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {/* The Button is hidden by default (mobile), and becomes a flex block on medium screens */}
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
                                Payment History
                            </h1>
                            <p className="text-muted-foreground text-xs mt-0.5">
                                All your Razorpay payment activity
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchTransactions()}
                        className="gap-1.5 h-8 text-xs"
                    >
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Tabs
                        value={filterType}
                        onValueChange={val =>
                            setFilterType(
                                val as FilterType
                            )
                        }
                    >
                        <TabsList className="h-10 flex-wrap">
                            <TabsTrigger
                                value="all"
                                className="text-xs"
                            >
                                All
                            </TabsTrigger>

                            <TabsTrigger
                                value="completed"
                                className="text-xs"
                            >
                                Completed
                            </TabsTrigger>

                            <TabsTrigger
                                value="pending"
                                className="text-xs"
                            >
                                Pending
                            </TabsTrigger>

                            <TabsTrigger
                                value="refunded"
                                className="text-xs"
                            >
                                Refunded
                            </TabsTrigger>

                            <TabsTrigger
                                value="failed"
                                className="text-xs"
                            >
                                Failed
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Count */}
                <p className="text-xs text-muted-foreground mb-3">
                    Showing {displayed.length} of{' '}
                    {filtered.length} payments
                </p>

                {/* Empty */}
                {filtered.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="py-14 text-center">
                            <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                <IndianRupee className="h-7 w-7 text-muted-foreground" />
                            </div>

                            <h3 className="text-lg font-semibold font-serif">
                                No Payments Found
                            </h3>

                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                                No payment records available.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2 overflow-x-hidden">
                        {displayed.map(
                            (txn, index) => {
                                const cfg = getConfig(
                                    txn.payment_status
                                );

                                const IconComp =
                                    cfg.icon;

                                return (
                                    <Card
                                        key={txn.id}
                                        // onClick={() => {
                                        //     setSelectedPayment(txn);
                                        //     setReportDialogOpen(true);
                                        // }}
                                        onClick={() => {
                                            if (txn.report_submitted) {
                                                setSelectedReport(txn);
                                                setViewReportOpen(true);
                                            } else {
                                                setSelectedPayment(txn);
                                                setReportDialogOpen(true);
                                            }
                                        }}
                                        className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in"
                                        style={{
                                            animationDelay: `${index * 0.04}s`
                                        }
                                        }
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-center gap-3">
                                                {/* Icon */}
                                                <div
                                                    className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}
                                                >
                                                    <IconComp
                                                        className={`h-4 w-4 ${cfg.color}`}
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-sm truncate">
                                                            {
                                                                txn.lawyer_name
                                                            }
                                                        </h3>

                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] px-1.5 py-0 h-4 ${cfg.bg} ${cfg.color} ${cfg.border}`}
                                                        >
                                                            {
                                                                cfg.label
                                                            }
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                                                        <User className="h-3 w-3" />

                                                        <span className="truncate">
                                                            Payment
                                                            via{' '}
                                                            {txn.payment_method ||
                                                                'Razorpay'}
                                                        </span>
                                                    </div>

                                                    {txn.razorpay_payment_id && (
                                                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                                            ID:{' '}
                                                            {
                                                                txn.razorpay_payment_id
                                                            }
                                                        </p>
                                                    )}

                                                    {/* <div className="flex items-center gap-1 mt-2 text-[10px] text-red-500">
                                                        <MessageSquareWarning className="h-3 w-3" />
                                                        Tap to report issue
                                                    </div> */}
                                                    <div
                                                        className={`flex items-center gap-1 mt-2 text-[10px] ${txn.report_submitted
                                                            ? 'text-emerald-600'
                                                            : 'text-red-500'
                                                            }`}
                                                    >
                                                        <MessageSquareWarning className="h-3 w-3" />

                                                        {txn.report_submitted
                                                            ? 'Report already submitted'
                                                            : 'Tap to report issue'}
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="text-right shrink-0 min-w-[80px]">
                                                    <p className="text-sm font-bold text-emerald-600">
                                                        ₹
                                                        {Number(
                                                            txn.amount
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </p>

                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                                                        <Clock className="h-2.5 w-2.5" />

                                                        {new Date(
                                                            txn.created_at
                                                        ).toLocaleDateString(
                                                            [],
                                                            {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        currentPage === 1
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            p => p - 1
                                        )
                                    }
                                    className="text-xs h-8"
                                >
                                    Prev
                                </Button>

                                {[...Array(totalPages)]
                                    .slice(0, 5)
                                    .map((_, i) => {
                                        const page =
                                            i + 1;

                                        return (
                                            <Button
                                                key={page}
                                                size="sm"
                                                variant={
                                                    currentPage ===
                                                        page
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    setCurrentPage(
                                                        page
                                                    )
                                                }
                                                className="text-xs h-8 w-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            p => p + 1
                                        )
                                    }
                                    className="text-xs h-8"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Summary */}
                {transactions.length > 0 && (
                    <Card className="mt-6 border-0 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-serif flex items-center gap-1.5">
                                {/* <DollarSign className="h-3.5 w-3.5 text-primary" /> */}
                                Quick Summary
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="px-4 pb-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                {[
                                    {
                                        label:
                                            'Total Payments',

                                        value:
                                            transactions.length,

                                        icon: Receipt,

                                        color:
                                            'text-primary',

                                        bg: 'bg-primary/10'
                                    },

                                    {
                                        label:
                                            'Completed',

                                        value:
                                            transactions.filter(
                                                t =>
                                                    t.payment_status ===
                                                    'completed'
                                            ).length,

                                        icon: CheckCircle,

                                        color:
                                            'text-emerald-600',

                                        bg: 'bg-emerald-500/10'
                                    },

                                    {
                                        label:
                                            'Refunded',

                                        value:
                                            transactions.filter(
                                                t =>
                                                    t.payment_status ===
                                                    'refunded'
                                            ).length,

                                        icon: RotateCcw,

                                        color:
                                            'text-blue-600',

                                        bg: 'bg-blue-500/10'
                                    },

                                    {
                                        label:
                                            'Total Spent',

                                        value: `₹${totalSpent.toFixed(
                                            2
                                        )}`,

                                        icon: IndianRupee,

                                        color:
                                            'text-yellow-600',

                                        bg: 'bg-yellow-500/10'
                                    }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2"
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-md ${item.bg} flex items-center justify-center shrink-0`}
                                        >
                                            <item.icon
                                                className={`h-3.5 w-3.5 ${item.color}`}
                                            />
                                        </div>

                                        <div>
                                            <p className="font-bold text-sm">
                                                {
                                                    item.value
                                                }
                                            </p>

                                            <p className="text-muted-foreground text-[10px]">
                                                {
                                                    item.label
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>


            <Dialog
                open={reportDialogOpen}
                // onOpenChange={setReportDialogOpen}
                onOpenChange={(open) => {
                    setReportDialogOpen(open);

                    if (!open) {
                        setReportError('');
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    {/* <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-none"> */}
                    <DialogHeader>
                        <DialogTitle>
                            Report Payment Issue
                        </DialogTitle>

                        <DialogDescription>
                            Tell us what went wrong?

                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-4 mt-2">
                            {/* Payment Info */}
                            <div className="rounded-xl border p-3 bg-muted/30">
                                <div className="flex justify-between text-sm">
                                    <span>Lawyer</span>

                                    <span className="font-medium">
                                        {
                                            selectedPayment.lawyer_name
                                        }
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm mt-2">
                                    <span>Amount</span>

                                    <span className="font-semibold text-emerald-600">
                                        ₹
                                        {Number(
                                            selectedPayment.amount
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm mt-2">
                                    <span>Status</span>

                                    <span className="capitalize">
                                        {
                                            selectedPayment.payment_status
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Issue Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Select Issue
                                </label>

                                <Select
                                    value={reportReason}
                                    onValueChange={setReportReason}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose issue type" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="refund_request">
                                            Refund Request
                                        </SelectItem>

                                        <SelectItem value="lawyer_abusive">
                                            Lawyer was abusive
                                        </SelectItem>

                                        <SelectItem value="lawyer_not_receiving">
                                            Lawyer not receiving calls
                                        </SelectItem>

                                        <SelectItem value="consultation_not_completed">
                                            Consultation not completed
                                        </SelectItem>

                                        <SelectItem value="payment_issue">
                                            Payment issue
                                        </SelectItem>

                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Explain Issue
                                </label>

                                <Textarea
                                    placeholder="Explain your issue here..."
                                    value={reportMessage}
                                    onChange={e =>
                                        setReportMessage(
                                            e.target.value
                                        )
                                    }
                                    className="min-h-[120px]"
                                />
                            </div>

                            {/* Buttons */}
                            {reportError && (
                                <p
                                    className={`text-[11px] text-center ${reportError.includes('successfully')
                                        ? 'text-emerald-600'
                                        : 'text-red-500'
                                        }`}
                                >
                                    {reportError}
                                </p>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setReportDialogOpen(false)
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={submitReport}
                                    disabled={submittingReport}
                                >
                                    {submittingReport
                                        ? 'Submitting...'
                                        : 'Send Report'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>


            <Dialog
                open={viewReportOpen}
                onOpenChange={setViewReportOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Submitted Report
                        </DialogTitle>

                        <DialogDescription>
                            Your submitted issue details
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-4">
                            {/* Issue Type */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                    Issue Type
                                </p>

                                <div className="border rounded-lg p-3 text-sm font-medium capitalize">
                                    {selectedReport.report_issue_type?.replaceAll(
                                        '_',
                                        ' '
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                    Description
                                </p>

                                <div className="border rounded-lg p-3 text-sm whitespace-pre-wrap">
                                    {
                                        selectedReport.report_description
                                    }
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                    Status
                                </p>

                                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                                    <p className="text-sm font-medium text-amber-700">
                                        Your issue is under review
                                    </p>

                                    <p className="text-xs text-muted-foreground mt-1">
                                        Expected resolution within
                                        4-5 working days.
                                    </p>
                                </div>
                            </div>

                            {/* Close */}
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setViewReportOpen(false)
                                    }
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </ClientLayout>
    );
};

export default ClientTransactionHistory;