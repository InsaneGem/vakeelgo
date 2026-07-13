
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Mail,
    Phone,
    Clock,
    CalendarCheck,
    IndianRupee,
    Briefcase,
    Shield, Search
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const ITEMS_PER_PAGE = 5;

const AdminClientDetailsPage = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();

    const [client, setClient] = useState<any>(null);
    const [clientRole, setClientRole] = useState<any>(null);
    const [wallet, setWallet] = useState<any>(null);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [consultationPage, setConsultationPage] = useState(1);
    const [paymentPage, setPaymentPage] = useState(1);

    const [filters, setFilters] = useState({ lawyer: "", status: "all", type: "all", date: "" });
    const [paymentFilters, setPaymentFilters] = useState({ lawyer: "", status: "all", date: "" });

    // 1. Filtering Logic
    const filteredConsultations = consultations.filter((c) => {
        // const matchesLawyer = c.lawyer?.full_name?.toLowerCase().includes(filters.lawyer.toLowerCase());
        const searchTerm = filters.lawyer.toLowerCase();

        const matchesSearch =
            c.lawyer?.full_name
                ?.toLowerCase()
                .includes(searchTerm) ||
            c.lawyer_id
                ?.toLowerCase()
                .includes(searchTerm) ||
            c.id
                ?.toLowerCase()
                .includes(searchTerm);
        const matchesStatus = filters.status === "all" || c.status === filters.status;
        const matchesType = filters.type === "all" || c.type === filters.type;
        const matchesDate = filters.date === "" || new Date(c.created_at).toLocaleDateString() === new Date(filters.date).toLocaleDateString();
        // return matchesLawyer && matchesStatus && matchesType && matchesDate;
        return (
            matchesSearch &&
            matchesStatus &&
            matchesType &&
            matchesDate
        );
    });

    const filteredPayments = payments.filter((p) => {
        const matchesLawyer = p.lawyer?.full_name?.toLowerCase().includes(paymentFilters.lawyer.toLowerCase());
        const matchesStatus = paymentFilters.status === "all" || p.status === paymentFilters.status;
        const matchesDate = paymentFilters.date === "" || new Date(p.created_at).toLocaleDateString() === new Date(paymentFilters.date).toLocaleDateString();
        return matchesLawyer && matchesStatus && matchesDate;
    });

    // 2. Pagination
    const paginatedConsultations = filteredConsultations.slice((consultationPage - 1) * ITEMS_PER_PAGE, consultationPage * ITEMS_PER_PAGE);
    const paginatedPayments = filteredPayments.slice((paymentPage - 1) * ITEMS_PER_PAGE, paymentPage * ITEMS_PER_PAGE);

    const fetchClientData = async () => {
        try {
            setLoading(true);
            console.log("Fetching for:", clientId);
            const { data: debugData, error: debugError } = await supabase
                .from('payments')
                .select('*')
                .limit(1);

            console.log("--- DATABASE DEBUG ---");
            console.log("Error (if any):", debugError);
            console.log("First record in payments table:", debugData);
            console.log("----------------------");

            // Fetch core data in parallel
            const [profileRes, roleRes, walletRes, consultationRes, paymentRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', clientId).single(),
                supabase.from('user_roles').select('*').eq('user_id', clientId).maybeSingle(),
                supabase.from('wallets').select('*').eq('user_id', clientId).maybeSingle(),
                supabase.from('consultations').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
                supabase.from('payments').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
            ]);

            console.log("Payment Data Received:", paymentRes.data);

            // Enrich Consultations
            let enrichedConsultations = consultationRes.data || [];
            if (enrichedConsultations.length > 0) {
                const lawyerIds = [...new Set(enrichedConsultations.map(c => c.lawyer_id).filter(Boolean))];
                const { data: lawyerProfiles } = await supabase.from('profiles').select('id, full_name').in('id', lawyerIds);
                enrichedConsultations = enrichedConsultations.map(c => ({
                    ...c,
                    lawyer: lawyerProfiles?.find(p => p.id === c.lawyer_id) || { full_name: 'Unknown Lawyer' }
                }));
            }

            // Prepare Reports and Lawyers for Payments
            // const rawPayments = paymentRes.data || [];
            //     const { data: rawPayments, error: paymentError } =
            //         await supabase
            //             .from('payments')
            //             .select(`
            //     id,
            //     consultation_id,
            //     amount,
            //     payment_status,
            //     payment_method,
            //     razorpay_payment_id,
            //     razorpay_order_id,
            //     created_at,
            //     lawyer_id,
            //     client_id
            // `)
            //             .eq('client_id', clientId)
            //             .order('created_at', { ascending: false });

            //     console.log("Admin Payment Data:", rawPayments);
            //     console.log("Admin Payment Error:", paymentError);
            const { data: rawPayments, error: paymentError } =
                await supabase
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
            lawyer_id,
            client_id
        `)
                    .eq('client_id', clientId)
                    .order('created_at', { ascending: false });


            const consultationIds = rawPayments.map(p => p.consultation_id).filter(Boolean);

            let reports = [];
            if (consultationIds.length > 0) {
                const { data: reportData } = await supabase.from('payment_reports').select('*').in('consultation_id', consultationIds);
                reports = reportData || [];
            }

            const paymentLawyerIds = [...new Set(rawPayments.map(p => p.lawyer_id).filter(Boolean))];
            const { data: paymentLawyerProfiles } = await supabase.from('profiles').select('id, full_name').in('id', paymentLawyerIds);

            // Map Payments with correct fields
            // const paymentsWithDetails = rawPayments.map(payment => {
            //     const report = reports.find(r => r.consultation_id === payment.consultation_id);
            //     const lawyer = paymentLawyerProfiles?.find(p => p.id === payment.lawyer_id);

            //     return {
            //         ...payment,
            //         // IMPORTANT: Mapping DB 'payment_status' to 'status' for UI compatibility
            //         status: payment.payment_status || 'pending',
            //         lawyer: lawyer || { full_name: 'Unknown' },
            //         report_submitted: !!report,
            //         report_issue_type: report?.issue_type || null,
            //         report_description: report?.issue_message || null,
            //         report_status: report?.status || 'pending'
            //     };
            // });
            const paymentsWithDetails = rawPayments.map(payment => {
                const report = reports.find(
                    r => r.consultation_id === payment.consultation_id
                );

                const lawyer = paymentLawyerProfiles?.find(
                    p => p.id === payment.lawyer_id
                );

                return {
                    ...payment,
                    status: payment.payment_status || 'pending',

                    payment_mode:
                        payment.payment_method ||
                        (payment.razorpay_payment_id ? 'RAZORPAY' : 'N/A'),

                    payment_id:
                        payment.razorpay_payment_id ||
                        payment.razorpay_order_id ||
                        payment.id,

                    lawyer: lawyer || { full_name: 'Unknown' },

                    report_submitted: !!report,
                    report_issue_type: report?.issue_type || null,
                    report_description: report?.issue_message || null,
                    report_status: report?.status || 'pending'
                };
            });

            setClient(profileRes.data);
            setClientRole(roleRes.data);
            setWallet(walletRes.data);
            setConsultations(enrichedConsultations);
            setPayments(paymentsWithDetails);

        } catch (error) {
            console.error("Error fetching client data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) fetchClientData();
    }, [clientId]);

    if (loading) return <AdminLayout><div className="flex justify-center p-20 text-slate-500">Loading  client profile...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 pt-[3px] pb-8 space-y-8 overflow-x-hidden box-border">
                {/* Profile Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
                    <button
                        onClick={() => navigate(-1)}
                        className="hidden md:flex absolute top-3 left-4 z-50 items-center gap-2 text-slate-300 hover:text-white transition-colors "
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-blue-500 blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-emerald-500 blur-3xl" />
                    </div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 w-full min-w-0">
                        <div className="h-24 w-24 shrink-0 rounded-full overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center text-3xl font-bold">
                            {client?.avatar_url ? (
                                <img
                                    src={client.avatar_url}
                                    alt={client.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold">
                                    {client?.full_name?.charAt(0) || "C"}
                                </div>

                            )}
                        </div>

                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {client?.full_name || "Unknown Client"}
                            </h1>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4 text-sm text-slate-300">

                                <span className="flex items-center gap-2 min-w-0">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate max-w-[180px] sm:max-w-none">
                                        {client?.email}
                                    </span>
                                </span>

                                <span className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {client?.phone || "Not Provided"}
                                </span>

                                <span className="flex items-center gap-2">
                                    <CalendarCheck className="h-4 w-4" />
                                    {client?.date_of_birth
                                        ? new Date(
                                            client.date_of_birth
                                        ).toLocaleDateString()
                                        : "Not Provided"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Joined: {new Date(client?.created_at).toLocaleDateString()}
                                </span>
                                <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white border-0 px-5 py-2">
                                    {client?.status || "Active"}
                                </Badge>

                            </div>
                        </div>

                    </div>
                </div>


                {/* Premium Stats */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
                                        Wallet Balance
                                    </p>
                                    <h3 className="text-xl sm:text-3xl font-bold">
                                        ₹{wallet?.balance?.toFixed(2) || "0.00"}
                                    </h3>
                                </div>
                                <IndianRupee className="h-4 w-4 sm:h-6 sm:w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold">
                                        Consultations
                                    </p>
                                    <h3 className="text-xl sm:text-3xl font-bold">
                                        {consultations.length}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Total Sessions
                                    </p>
                                </div>
                                <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl">
                                    <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
                                        Spent
                                    </p>
                                    <h3 className="text-xl sm:text-3xl font-bold">
                                        ₹{
                                            payments
                                                .filter(p => p.status === "completed")
                                                .reduce((a, p) => a + (p.amount || 0), 0)
                                                .toFixed(2)
                                        }
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Total Paid
                                    </p>
                                </div>
                                <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl">
                                    <IndianRupee className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold">
                                        Status
                                    </p>
                                    <h3 className="text-sm uppercase  font-bold">
                                        {clientRole?.role || "Client"}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        User Role
                                    </p>
                                </div>

                                <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl">
                                    <Shield className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>


                {/* Tabs */}
                <Tabs defaultValue="consultations" className="w-full overflow-hidden">

                    <TabsList className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 h-auto">
                        <TabsTrigger
                            value="consultations"
                            className="rounded-xl px-2 py-2 text-[11px] sm:text-xs md:text-sm font-semibold text-center leading-tight transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                        >
                            Consultations
                        </TabsTrigger>

                        <TabsTrigger
                            value="payments"
                            className="rounded-xl px-2 py-2 text-[11px] sm:text-xs md:text-sm font-semibold text-center leading-tight transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                        >
                            Payment History
                        </TabsTrigger>

                        <TabsTrigger
                            value="account"
                            className="rounded-xl px-2 py-2 text-[11px] sm:text-xs md:text-sm font-semibold text-center leading-tight transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                        >
                            Profile
                        </TabsTrigger>
                    </TabsList>

                    {/* Consultations Tab */}
                    <TabsContent value="consultations" className="mt-6 space-y-4">
                        <Card className="rounded-3xl border-0 shadow-lg bg-white">
                            <CardContent className="p-3 sm:p-5">
                                {/* Mobile */}
                                <div className="block md:hidden space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Search..."
                                            className="pl-9 h-9 text-xs rounded-xl border-slate-200"
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    lawyer: e.target.value,
                                                })
                                            }
                                        />
                                    </div>


                                    <div className="flex gap-2">
                                        <Select onValueChange={(val) => setFilters({ ...filters, status: val })}>
                                            <SelectTrigger className="h-9 flex-1 text-xs rounded-xl">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select onValueChange={(val) => setFilters({ ...filters, type: val })}>
                                            <SelectTrigger className="h-9 flex-1 text-xs rounded-xl">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="audio">Audio</SelectItem>
                                                <SelectItem value="chat">Chat</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="date"
                                            className="h-9 w-[120px] text-xs rounded-xl"
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    date: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Desktop */}
                                <div className="hidden md:grid grid-cols-12 gap-3">

                                    <div className="col-span-5 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                                        <Input
                                            placeholder="Search Client Name, Client ID, Consultation ID..."
                                            className="pl-10 h-11 rounded-xl"
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    lawyer: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Select
                                            onValueChange={(val) =>
                                                setFilters({
                                                    ...filters,
                                                    status: val
                                                })
                                            }
                                        >
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-2">
                                        <Select
                                            onValueChange={(val) =>
                                                setFilters({
                                                    ...filters,
                                                    type: val
                                                })
                                            }
                                        >
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue placeholder="Consultation Type" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="audio">Audio</SelectItem>
                                                <SelectItem value="chat">Chat</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-3">
                                        <Input
                                            type="date"
                                            className="h-11 rounded-xl"
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    date: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                </div>

                            </CardContent>

                        </Card>






                        <Card className="mt-6 border-0 bg-transparent shadow-none">
                            <div className="grid gap-5">
                                {paginatedConsultations.map((c) => (
                                    <Card
                                        key={c.id}
                                        className="
                                        rounded-3xl
                                         border border-yellow-300
                                          bg-gradient-to-br
                                           from-yellow-100
                                           via-amber-50
                                           to-yellow-200
                                           shadow-md
                                           hover:shadow-xl
                                           hover:-translate-y-1
                                           transition-all
                                           duration-300
                                           overflow-hidden
                                           max-w-5xl
                                           mx-auto
                                           w-full
                                                   "
                                    >
                                        {/* Header */}
                                        <CardContent className="p-4 sm:p-5 md:p-6">
                                            <div className="flex items-start justify-between gap-3 mb-5">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-slate-900 text-base md:text-lg break-words">
                                                        {c.lawyer?.full_name || "Unknown Client"}
                                                    </h3>
                                                </div>
                                                <Badge
                                                    className={
                                                        c.status === "completed"
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                            : c.status === "pending"
                                                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                                                : "bg-red-100 text-red-700 border-red-200"
                                                    }
                                                >
                                                    {c.status}
                                                </Badge>

                                            </div>
                                            {/* Details */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                {/* Left Section */}
                                                <div
                                                    className="
                                                  rounded-2xl
                                                         bg-gradient-to-br
                                                         from-stone-50
                                                         via-amber-50/40
                                                         to-stone-100
                                                         border
                                                         border-amber-200/50
                                                         p-4
                                                         space-y-4
                                                         shadow-sm
                                                     "
                                                >

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Lawyer Name
                                                        </p>

                                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                                            {c.lawyer?.full_name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Lawyer ID
                                                        </p>

                                                        <p className="text-xs font-mono break-all text-slate-700 mt-1">
                                                            {c.lawyer_id}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Consultation Type
                                                        </p>

                                                        <p className="text-sm capitalize text-slate-900 mt-1">
                                                            {c.type}
                                                        </p>
                                                    </div>

                                                </div>
                                                {/* Right Section */}
                                                <div
                                                    className="
                                                         rounded-2xl
                                                         bg-gradient-to-br
                                                         from-stone-50
                                                         via-amber-50/40
                                                         to-stone-100
                                                         border
                                                         border-amber-200/50
                                                         p-4
                                                         space-y-4
                                                         shadow-sm
                                                     "
                                                >
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Consultation ID
                                                        </p>

                                                        <p className="text-xs font-mono break-all text-slate-700 mt-1">
                                                            {c.id}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Status
                                                        </p>

                                                        <p className="text-sm capitalize text-slate-900 mt-1">
                                                            {c.status}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Consultation Date
                                                        </p>

                                                        <p className="text-sm text-slate-900 mt-1">
                                                            {new Date(c.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>


                                ))}

                            </div>
                        </Card>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-slate-500">
                                Showing {(consultationPage - 1) * ITEMS_PER_PAGE + 1}
                                -
                                {Math.min(
                                    consultationPage * ITEMS_PER_PAGE,
                                    filteredConsultations.length
                                )}
                                {" "}of {filteredConsultations.length}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={consultationPage === 1}
                                    onClick={() =>
                                        setConsultationPage(prev => prev - 1)
                                    }
                                >
                                    Previous
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        consultationPage >=
                                        Math.ceil(
                                            filteredConsultations.length /
                                            ITEMS_PER_PAGE
                                        )
                                    }
                                    onClick={() =>
                                        setConsultationPage(prev => prev + 1)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="mt-6">
                        <Card className="rounded-3xl border-0 shadow-lg bg-white mb-6">
                            <CardContent className="p-3 sm:p-5">
                                <div className="block md:hidden space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Search Payments..."
                                            className="pl-9 h-9 text-xs rounded-xl"
                                            onChange={(e) =>
                                                setPaymentFilters({
                                                    ...paymentFilters,
                                                    lawyer: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select
                                            onValueChange={(val) =>
                                                setPaymentFilters({
                                                    ...paymentFilters,
                                                    status: val,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="h-9 flex-1 text-xs rounded-xl">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            type="date"
                                            className="h-9 w-[120px] text-xs rounded-xl"
                                            onChange={(e) =>
                                                setPaymentFilters({
                                                    ...paymentFilters,
                                                    date: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="hidden md:grid grid-cols-12 gap-3">
                                    <div className="col-span-7 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search Lawyer Name, Lawyer ID, Payment ID..."
                                            className="pl-10 h-11 rounded-xl"
                                            onChange={(e) =>
                                                setPaymentFilters({
                                                    ...paymentFilters,
                                                    lawyer: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Select
                                            onValueChange={(val) =>
                                                setPaymentFilters({
                                                    ...paymentFilters,
                                                    status: val
                                                })
                                            }
                                        >
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="date"
                                            className="h-11 rounded-xl"
                                            onChange={(e) =>
                                                setPaymentFilters({
                                                    ...paymentFilters,
                                                    date: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Payment Filters */}
                        <Card className="mt-6 border-0 bg-transparent shadow-none">
                            <div className="grid gap-5">
                                {paginatedPayments.map((p) => (
                                    <Card
                                        key={p.id}
                                        className="
                                            rounded-3xl
                                                    border border-yellow-300
                                                     bg-gradient-to-br
                                                     from-yellow-100
                                                     via-amber-50
                                                     to-yellow-200
                                                     shadow-md
                                                     hover:shadow-xl
                                                     hover:-translate-y-1
                                                     transition-all
                                                     duration-300
                                                     overflow-hidden
                                                     max-w-5xl
                                                     mx-auto
                                                     w-full
                                                 "
                                    >
                                        <CardContent className="p-4 sm:p-5 md:p-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-5">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-slate-900 text-base md:text-lg break-words">
                                                        {p.lawyer?.full_name || "Unknown Lawyer"}
                                                    </h3>
                                                </div>
                                                <Badge
                                                    className={`
                                                                 shrink-0
                                                                 ${p.status === "completed"
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                            : p.status === "pending"
                                                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                                                : "bg-red-100 text-red-700 border-red-200"
                                                        }
                                                             `}
                                                >
                                                    {p.status}
                                                </Badge>
                                            </div>

                                            {/* Details */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                {/* Left */}
                                                <div
                                                    className="
                                         rounded-2xl
                                         bg-gradient-to-br
                                         from-stone-50
                                         via-amber-50/40
                                         to-stone-100
                                         border
                                         border-amber-200/50
                                         p-4
                                         space-y-4
                                         shadow-sm
                                    "
                                                >
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Lawyer Name
                                                        </p>

                                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                                            {p.lawyer?.full_name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Amount
                                                        </p>

                                                        <p className="text-xl font-bold text-emerald-600 mt-1">
                                                            ₹{p.amount?.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Payment Mode
                                                        </p>

                                                        <p className="text-sm text-slate-900 mt-1">
                                                            {p.payment_mode ||
                                                                p.payment_method ||
                                                                "RAZORPAY"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Right */}
                                                <div
                                                    className="
                                         rounded-2xl
                                         bg-gradient-to-br
                                         from-stone-50
                                         via-amber-50/40
                                         to-stone-100
                                         border
                                         border-amber-200/50
                                         p-4
                                         space-y-4
                                         shadow-sm
                                     "
                                                >
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Payment ID
                                                        </p>

                                                        <p className="text-xs font-mono break-all text-slate-700 mt-1">
                                                            {p.payment_id ||
                                                                p.razorpay_payment_id ||
                                                                p.id}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Consultation Status
                                                        </p>

                                                        <p className="text-sm capitalize text-slate-900 mt-1">
                                                            {p.status}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Payment Date
                                                        </p>

                                                        <p className="text-sm text-slate-900 mt-1">
                                                            {new Date(p.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-slate-500">
                                Showing {(paymentPage - 1) * ITEMS_PER_PAGE + 1}
                                -
                                {Math.min(
                                    paymentPage * ITEMS_PER_PAGE,
                                    filteredPayments.length
                                )}
                                {" "}of {filteredPayments.length}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={paymentPage === 1}
                                    onClick={() =>
                                        setPaymentPage(prev => prev - 1)
                                    }
                                >
                                    Previous
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        paymentPage >=
                                        Math.ceil(
                                            filteredPayments.length /
                                            ITEMS_PER_PAGE
                                        )
                                    }
                                    onClick={() =>
                                        setPaymentPage(prev => prev + 1)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>

                        {/* ****************************** */}

                    </TabsContent>


                    {/* Account Information */}
                    <TabsContent value="account" className="mt-6">
                        <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 shadow-xl overflow-hidden">
                            <CardHeader className="border-b bg-white/70 backdrop-blur-sm">
                                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">
                                    Client Account Information
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                                    {[
                                        {
                                            label: "Full Name",
                                            value: client?.full_name || "N/A",
                                        },
                                        {
                                            label: "Email Address",
                                            value: client?.email || "N/A",
                                        },
                                        {
                                            label: "Phone Number",
                                            value: client?.phone || "Not Provided",
                                        },
                                        {
                                            label: "User Role",
                                            value: clientRole?.role || "Client",
                                        },
                                        {
                                            label: "Account Status",
                                            value: client?.status || "Active",
                                        },

                                        {
                                            label: "Total Consultations",
                                            value: consultations.length,
                                        },



                                        {
                                            label: "Total Amount Spent",
                                            value: `₹${payments
                                                .filter((p) => p.status === "completed")
                                                .reduce((sum, p) => sum + (p.amount || 0), 0)
                                                .toFixed(2)}`,
                                            valueClass: "text-emerald-600 font-bold",
                                        },
                                        {
                                            label: "Total Payments",
                                            value: payments.length,
                                        },
                                        {
                                            label: "Date of Birth",
                                            value: client?.date_of_birth
                                                ? new Date(client.date_of_birth).toLocaleDateString()
                                                : "N/A",
                                        },
                                        {
                                            label: "Joined On",
                                            value: client?.created_at
                                                ? new Date(client.created_at).toLocaleString()
                                                : "N/A",
                                        },
                                        {
                                            label: "Last Updated",
                                            value: client?.updated_at
                                                ? new Date(client.updated_at).toLocaleString()
                                                : "N/A",
                                        },
                                        {
                                            label: "User ID",
                                            value: client?.id || "N/A",
                                            mono: true,
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {item.label}
                                            </p>

                                            <p
                                                className={`mt-2 text-sm text-slate-800 ${item.valueClass || "font-medium"
                                                    } ${item.mono
                                                        ? "font-mono text-xs break-all"
                                                        : "break-words"
                                                    }`}
                                            >
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs >
            </div>
        </AdminLayout >
    );
};

export default AdminClientDetailsPage;