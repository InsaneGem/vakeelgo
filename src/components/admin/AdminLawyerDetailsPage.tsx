import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Clock, Briefcase, GraduationCap, IndianRupee } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardDescription } from "@/components/ui/card";

const ITEMS_PER_PAGE = 5;

const AdminLawyerDetailsPage = () => {
    const { lawyerId } = useParams<{ lawyerId: string }>();
    const navigate = useNavigate();

    const [lawyer, setLawyer] = useState<any>(null);
    const [lawyerProfile, setLawyerProfile] = useState<any>(null);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [consultationPage, setConsultationPage] = useState(1);
    const [paymentPage, setPaymentPage] = useState(1);


    const [filters, setFilters] = useState({
        client: "",
        status: "all",
        type: "all",
        date: ""
    });

    const [paymentFilters, setPaymentFilters] = useState({
        client: "",
        status: "all",
        date: ""
    });


    const filteredConsultations = consultations.filter((c) => {
        const searchTerm = filters.client.toLowerCase();

        const matchesSearch =
            c.client?.full_name
                ?.toLowerCase()
                .includes(searchTerm) ||
            c.client_id
                ?.toLowerCase()
                .includes(searchTerm) ||
            c.id
                ?.toLowerCase()
                .includes(searchTerm);

        const matchesStatus =
            filters.status === "all" ||
            c.status === filters.status;

        const matchesType =
            filters.type === "all" ||
            c.type === filters.type;

        const matchesDate =
            filters.date === "" ||
            new Date(c.created_at).toLocaleDateString() ===
            new Date(filters.date).toLocaleDateString();

        return (
            matchesSearch &&
            matchesStatus &&
            matchesType &&
            matchesDate
        );
    });


    const filteredPayments = payments.filter((p) => {
        const searchTerm = paymentFilters.client.toLowerCase();

        const matchesSearch =
            p.client?.full_name
                ?.toLowerCase()
                .includes(searchTerm) ||
            p.client_id
                ?.toLowerCase()
                .includes(searchTerm) ||
            p.id
                ?.toLowerCase()
                .includes(searchTerm);

        const matchesStatus =
            paymentFilters.status === "all" ||
            p.status === paymentFilters.status;

        const matchesDate =
            paymentFilters.date === "" ||
            new Date(p.created_at).toLocaleDateString() ===
            new Date(paymentFilters.date).toLocaleDateString();

        return (
            matchesSearch &&
            matchesStatus &&
            matchesDate
        );
    });

    // Pagination
    const paginatedConsultations = filteredConsultations.slice((consultationPage - 1) * ITEMS_PER_PAGE, consultationPage * ITEMS_PER_PAGE);
    const paginatedPayments = filteredPayments.slice((paymentPage - 1) * ITEMS_PER_PAGE, paymentPage * ITEMS_PER_PAGE);
    const totalConsultationPages = Math.ceil(
        filteredConsultations.length / ITEMS_PER_PAGE
    );

    const totalPaymentPages = Math.ceil(
        filteredPayments.length / ITEMS_PER_PAGE
    );

    const fetchLawyerData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Core Data
            const [profileRes, lawyerRes, consultationRes, paymentRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', lawyerId).single(),
                supabase.from('lawyer_profiles').select('*').eq('user_id', lawyerId).single(),
                supabase.from('consultations').select('*').eq('lawyer_id', lawyerId).order('created_at', { ascending: false }),
                supabase.from('payments').select('*').eq('lawyer_id', lawyerId).order('created_at', { ascending: false })
            ]);

            // 2. Enrich Consultations with Client Details
            let enrichedConsultations = consultationRes.data || [];
            if (enrichedConsultations.length > 0) {
                const clientIds = [...new Set(enrichedConsultations.map(c => c.client_id).filter(Boolean))];
                const { data: clientProfiles } = await supabase.from('profiles').select('id, full_name').in('id', clientIds);
                enrichedConsultations = enrichedConsultations.map(c => ({
                    ...c,
                    client: clientProfiles?.find(p => p.id === c.client_id) || { full_name: 'Unknown Client' }
                }));
            }

            // 3. Enrich Payments with Client Details
            let enrichedPayments = paymentRes.data || [];
            if (enrichedPayments.length > 0) {
                const clientIds = [...new Set(enrichedPayments.map(p => p.client_id).filter(Boolean))];
                const { data: clientProfiles } = await supabase.from('profiles').select('id, full_name').in('id', clientIds);
                enrichedPayments = enrichedPayments.map(p => ({
                    ...p,
                    status: p.payment_status,
                    client: clientProfiles?.find(c => c.id === p.client_id) || { full_name: 'Unknown Client' }
                }));
            }

            setLawyer(profileRes.data);
            setLawyerProfile(lawyerRes.data);
            setConsultations(enrichedConsultations);
            setPayments(enrichedPayments);

        } catch (error) {
            console.error("Error fetching lawyer data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lawyerId) fetchLawyerData();
    }, [lawyerId]);

    if (loading) return <AdminLayout>
        <div className="flex justify-center p-20 text-slate-500">Loading lawyer profile...</div>
    </AdminLayout>;

    return (
        <AdminLayout>

            <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 pt-[3px] pb-8 space-y-8 overflow-x-hidden box-border">



                {/* Premium Profile Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
                    {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
                    <button
                        onClick={() => navigate(-1)}
                        className="hidden md:flex absolute top-3 left-4 z-50 items-center gap-2 text-slate-300 hover:text-white transition-colors "
                    >
                        <ArrowLeft className="h-5 w-5" />
                        {/* <span>Back</span> */}
                    </button>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-blue-500 blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-emerald-500 blur-3xl" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 w-full min-w-0">

                        <div className="h-24 w-24 shrink-0 rounded-full overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center text-3xl font-bold">
                            {lawyer?.avatar_url ? (
                                <img
                                    src={lawyer.avatar_url}
                                    alt={lawyer.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                lawyer?.full_name?.charAt(0)
                            )}
                        </div>

                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {lawyer?.full_name || "Unknown Lawyer"}
                            </h1>

                            <p className="text-slate-300 mt-1">
                                Bar Council No: {lawyerProfile?.bar_council_number || "N/A"}
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4 text-sm text-slate-300">

                                <span className="flex items-center gap-2 min-w-0">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate max-w-[180px] sm:max-w-none">
                                        {lawyer?.email}
                                    </span>
                                </span>

                                <span className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {lawyer?.phone || "No phone"}
                                </span>

                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <Badge className="bg-emerald-500 text-white border-0 px-4 py-1.5 capitalize">
                                {lawyerProfile?.status || "Active"}
                            </Badge>

                            <div className="text-center">
                                <p className="text-xs text-slate-400">
                                    Experience
                                </p>

                                <p className="text-2xl font-bold">
                                    {lawyerProfile?.experience_years || 0}+
                                </p>
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
                                        Experience
                                    </p>
                                    <h3 className="text-xl sm:text-3xl font-bold">
                                        {lawyerProfile?.experience_years || 0}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Years Practice
                                    </p>
                                </div>

                                <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl">
                                    <Briefcase className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
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
                                        Earnings
                                    </p>
                                    <h3 className="text-xl sm:text-3xl font-bold">
                                        ₹{payments
                                            .filter(p => p.status === "completed")
                                            .reduce((acc, p) => acc + (p.amount || 0), 0)
                                            .toFixed(0)}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Lifetime Revenue
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
                                        {lawyerProfile?.status || "N/A"}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Account Standing
                                    </p>
                                </div>

                                <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl">
                                    <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Tabs */}
                <Tabs defaultValue="consultations" className="w-full overflow-hidden">
                    {/* <TabsList className="grid w-full grid-cols-3 rounded-3xl bg-white border border-slate-200 shadow-sm p-1.5 h-auto"> */}
                    {/* <TabsList className="flex w-full overflow-x-auto whitespace-nowrap rounded-3xl bg-white border border-slate-200 shadow-sm p-1.5 h-auto gap-2 scrollbar-hide"> */}
                    <TabsList
                        className="
    flex
    w-full
    max-w-full
    overflow-x-auto
    overflow-y-hidden
    whitespace-nowrap
    rounded-3xl
    bg-white
    border
    border-slate-200
    shadow-sm
    p-1
    gap-2
    box-border
  "
                    >
                        <TabsTrigger
                            value="consultations"
                            className="flex-shrink-0 rounded-2xl rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                        >
                            Consultations
                        </TabsTrigger>

                        <TabsTrigger
                            value="payments"
                            className="flex-shrink-0 rounded-2xl rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                        >
                            Earnings History
                        </TabsTrigger>

                        <TabsTrigger
                            value="details"
                            className="flex-shrink-0 rounded-2xl rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                        >
                            Professional Info
                        </TabsTrigger>
                    </TabsList>

                    {/* Consultations Tab */}
                    <TabsContent value="consultations" className="mt-6 space-y-4">

                        <Card className="rounded-3xl border-0 shadow-lg bg-white">
                            <CardContent className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <Input
                                        placeholder="Search Client Name, Client ID, Consultation ID..."
                                        className="text-xs h-9"
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                client: e.target.value
                                            })
                                        }
                                    />

                                    <Select
                                        onValueChange={(val) =>
                                            setFilters({
                                                ...filters,
                                                status: val
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        onValueChange={(val) =>
                                            setFilters({
                                                ...filters,
                                                type: val
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="chat">Chat</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        type="date"
                                        className="text-xs h-9"
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                date: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>



                        <Card className="mt-6 border-0 bg-transparent shadow-none">
                            <div className="grid gap-4">
                                {paginatedConsultations.map((c) => (
                                    <Card
                                        key={c.id}
                                        className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <CardContent className="p-5">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 text-base">
                                                        {c.client?.full_name || "Unknown Client"}
                                                    </h3>

                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {new Date(c.created_at).toLocaleDateString()}
                                                    </p>
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
                                            <div className="space-y-3">
                                                <div className="flex justify-between border-b pb-2 gap-4">
                                                    <span className="text-xs text-slate-500 shrink-0">Client ID</span>
                                                    {/* Adding min-w-0 prevents the text from pushing the flex container */}
                                                    <span className="text-xs font-mono text-right break-all min-w-0">
                                                        {c.client_id}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Client Name
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {c.client?.full_name}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Client ID
                                                        </p>
                                                        <p className="text-xs font-mono break-all text-slate-700">
                                                            {c.client_id}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Consultation Type
                                                        </p>
                                                        <p className="text-sm capitalize text-slate-900">
                                                            {c.type}
                                                        </p>
                                                    </div>

                                                </div>

                                                <div className="space-y-3">

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Consultation ID
                                                        </p>
                                                        <p className="text-xs font-mono break-all text-slate-700">
                                                            {c.id}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Status
                                                        </p>
                                                        <p className="text-sm text-slate-900 capitalize">
                                                            {c.status}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Consultation Date
                                                        </p>
                                                        <p className="text-sm text-slate-900">
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
                        {/* <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 bg-white rounded-2xl p-4 shadow-sm border"> */}
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-slate-500">
                                Page {consultationPage} of {totalConsultationPages || 1}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={consultationPage === 1}
                                    onClick={() => setConsultationPage(prev => prev - 1)}
                                >
                                    Previous
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={consultationPage >= totalConsultationPages}
                                    onClick={() => setConsultationPage(prev => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="mt-6">
                        {/* Payment Filters */}
                        <Card className="mt-6 border-0 bg-transparent shadow-none">
                            <div className="grid gap-4">
                                {paginatedPayments.map((p) => (
                                    <Card
                                        key={p.id}
                                        className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <CardContent className="p-5">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 text-base">
                                                        {p.client?.full_name || "Unknown Client"}
                                                    </h3>

                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {new Date(p.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <Badge
                                                    className={
                                                        p.status === "completed"
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                            : p.status === "pending"
                                                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                                                : "bg-red-100 text-red-700 border-red-200"
                                                    }
                                                >
                                                    {p.status}
                                                </Badge>
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Client Name
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {p.client?.full_name}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Client ID
                                                    </p>
                                                    <p className="text-xs font-mono break-all text-slate-700">
                                                        {p.client_id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Amount
                                                    </p>
                                                    <p className="text-lg font-bold text-emerald-600">
                                                        ₹{p.amount?.toFixed(2)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Payment Mode
                                                    </p>
                                                    <p className="text-sm text-slate-900">
                                                        {p.payment_mode ||
                                                            p.payment_method ||
                                                            "RAZORPAY"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Payment ID
                                                    </p>
                                                    <p className="text-xs font-mono break-all text-slate-700">
                                                        {p.payment_id ||
                                                            p.razorpay_payment_id ||
                                                            p.id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Consultation Status
                                                    </p>
                                                    <p className="text-sm capitalize text-slate-900">
                                                        {p.status}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Payment Date
                                                    </p>
                                                    <p className="text-sm text-slate-900">
                                                        {new Date(p.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </Card>


                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-slate-500">
                                Page {paymentPage} of {totalPaymentPages || 1}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={paymentPage === 1}
                                    onClick={() => setPaymentPage(prev => prev - 1)}
                                >
                                    Previous
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={paymentPage >= totalPaymentPages}
                                    onClick={() => setPaymentPage(prev => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Professional Info Tab */}
                    <TabsContent value="details" className="mt-6">
                        <Card className="rounded-3xl border-0 shadow-xl bg-white overflow-hidden mt-6">
                            <CardContent className="p-6 md:p-8 space-y-8">
                                <div><h3 className="font-semibold text-slate-500 mb-1">Biography</h3><p>{lawyerProfile?.bio || "No biography provided."}</p></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><h3 className="font-semibold text-slate-500">Education</h3><p>{lawyerProfile?.education || "N/A"}</p></div>
                                    <div><h3 className="font-semibold text-slate-500">Specializations</h3><div className="flex flex-wrap gap-1 mt-1">{lawyerProfile?.specializations?.map((s: string) => <Badge key={s} className="bg-indigo-100 text-indigo-700 border border-indigo-200">{s}</Badge>)}</div></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-500">
                                        Experience
                                    </h3>
                                    <p>{lawyerProfile?.experience_years || 0} Years</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-500">
                                        Bar Council Number
                                    </h3>
                                    <p>{lawyerProfile?.bar_council_number || "N/A"}</p>
                                </div>
                            </CardContent>
                        </Card>


                        {/* <Card className="border shadow-md"> */}
                        <Card className="mt-6 rounded-3xl border-0 shadow-xl bg-white overflow-hidden">
                            {/* <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4"> */}
                            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Consultation Pricing
                                </CardTitle>

                                {/* <CardDescription className="text-xs"> */}
                                <CardDescription className="text-emerald-50 text-sm">
                                    Lawyer consultation rates and pricing breakdown
                                </CardDescription>
                            </CardHeader>

                            {/* <CardContent className="p-3 sm:p-6 pt-0 space-y-4"> */}
                            <CardContent className="p-6 space-y-6">

                                {/* READ ONLY RATE CARDS */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                                    <div className="space-y-1.5">
                                        <p className="text-xs text-muted-foreground">
                                            Chat Rate (₹/min)
                                        </p>

                                        <div className="h-9 rounded-md border bg-muted flex items-center px-3 text-sm font-medium">
                                            ₹{lawyerProfile?.chat_price_per_minute || 0}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <p className="text-xs text-muted-foreground">
                                            Audio Rate (₹/min)
                                        </p>

                                        <div className="h-9 rounded-md border bg-muted flex items-center px-3 text-sm font-medium">
                                            ₹{lawyerProfile?.audio_price_per_minute || 0}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <p className="text-xs text-muted-foreground">
                                            Video Rate (₹/min)
                                        </p>

                                        <div className="h-9 rounded-md border bg-muted flex items-center px-3 text-sm font-medium">
                                            ₹{lawyerProfile?.video_price_per_minute || 0}
                                        </div>
                                    </div>

                                </div>

                                {/* MAIN SECTION */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                                    {/* LEFT COLUMN */}
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">

                                        {/* CHAT */}
                                        <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3.5 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[9px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                                                    Chat pricing
                                                </p>

                                                <p className="mt-1 text-sm sm:text-base font-bold tracking-tight text-foreground">
                                                    Extra rate: ₹{lawyerProfile?.chat_price_per_minute || 0}/min
                                                </p>
                                            </div>

                                            <div className="mt-2.5 pt-2 border-t border-border/60 space-y-1 text-[11px] sm:text-xs">
                                                {[5, 10, 15, 30].map((minutes) => (
                                                    <div
                                                        key={minutes}
                                                        className="flex items-center justify-between py-0.5"
                                                    >
                                                        <span>{minutes} min pack</span>

                                                        <span className="font-semibold">
                                                            ₹{((lawyerProfile?.chat_price_per_minute || 0) * minutes).toFixed(0)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* AUDIO */}
                                        <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3.5 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[9px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                                                    Audio pricing
                                                </p>

                                                <p className="mt-1 text-sm sm:text-base font-bold tracking-tight text-foreground">
                                                    Extra rate: ₹{lawyerProfile?.audio_price_per_minute || 0}/min
                                                </p>
                                            </div>

                                            <div className="mt-2.5 pt-2 border-t border-border/60 space-y-1 text-[11px] sm:text-xs">
                                                {[10, 15, 20, 30].map((minutes) => (
                                                    <div
                                                        key={minutes}
                                                        className="flex items-center justify-between py-0.5"
                                                    >
                                                        <span>{minutes} min pack</span>

                                                        <span className="font-semibold">
                                                            ₹{((lawyerProfile?.audio_price_per_minute || 0) * minutes).toFixed(0)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* VIDEO */}
                                        <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3.5 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[9px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                                                    Video pricing
                                                </p>

                                                <p className="mt-1 text-sm sm:text-base font-bold tracking-tight text-foreground">
                                                    Extra rate: ₹{lawyerProfile?.video_price_per_minute || 0}/min
                                                </p>
                                            </div>

                                            <div className="mt-2.5 pt-2 border-t border-border/60 space-y-1 text-[11px] sm:text-xs">
                                                {[10, 15, 20, 30].map((minutes) => (
                                                    <div
                                                        key={minutes}
                                                        className="flex items-center justify-between py-0.5"
                                                    >
                                                        <span>{minutes} min pack</span>

                                                        <span className="font-semibold">
                                                            ₹{((lawyerProfile?.video_price_per_minute || 0) * minutes).toFixed(0)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SESSION */}
                                        <div className="rounded-xl bg-muted/40 border border-border/60 p-2.5 sm:p-3.5 opacity-65 relative overflow-hidden flex flex-col justify-between">
                                            <div className="absolute top-2 right-2">
                                                <span className="text-[8px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/50">
                                                    Soon
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-[9px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                                                    Session pricing
                                                </p>

                                                <p className="mt-1 text-sm sm:text-base font-bold tracking-tight text-muted-foreground">
                                                    ₹{lawyerProfile?.session_price || 0}
                                                </p>
                                            </div>

                                            <div className="mt-2.5 pt-2 border-t border-dashed border-border/80 space-y-1 text-[11px]">
                                                {[30, 60, 120, 180].map((minutes) => (
                                                    <div
                                                        key={minutes}
                                                        className="flex items-center justify-between py-0.5"
                                                    >
                                                        <span>{minutes} min slot</span>

                                                        <span>
                                                            ₹{lawyerProfile?.session_price || 0}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-[10px] italic mt-2 pt-1 border-t border-border/40">
                                                This feature is not available yet.
                                            </p>
                                        </div>

                                    </div>

                                    {/* RIGHT MATRIX */}
                                    <div className="rounded-xl border border-border bg-background p-3 sm:p-4 flex flex-col justify-between">

                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
                                            <div>
                                                <p className="text-xs font-semibold">
                                                    Pricing Summary Matrix
                                                </p>

                                                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                                                    Lawyer consultation channel rates.
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[9px] font-medium text-emerald-600 hidden sm:inline-block">
                                                Active Rates
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                            <div className="rounded-lg bg-muted/20 p-2.5 border">
                                                <p className="text-[9px] uppercase font-semibold">
                                                    Chat
                                                </p>

                                                <p className="text-lg font-bold">
                                                    ₹{lawyerProfile?.chat_price_per_minute || 0}
                                                    <span className="text-[10px]">/min</span>
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-muted/20 p-2.5 border">
                                                <p className="text-[9px] uppercase font-semibold">
                                                    Audio
                                                </p>

                                                <p className="text-lg font-bold">
                                                    ₹{lawyerProfile?.audio_price_per_minute || 0}
                                                    <span className="text-[10px]">/min</span>
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-muted/20 p-2.5 border">
                                                <p className="text-[9px] uppercase font-semibold">
                                                    Video
                                                </p>

                                                <p className="text-lg font-bold">
                                                    ₹{lawyerProfile?.video_price_per_minute || 0}
                                                    <span className="text-[10px]">/min</span>
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-muted/10 p-2.5 border border-dashed opacity-60 relative">
                                                <span className="absolute top-1 right-1 text-[7px] font-bold">
                                                    Soon
                                                </span>

                                                <p className="text-[9px] uppercase font-semibold">
                                                    Session
                                                </p>

                                                <p className="text-lg font-bold">
                                                    ₹{lawyerProfile?.session_price || 0}
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </CardContent>
                        </Card>




                        <Card className="mt-6 rounded-3xl border-0 shadow-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                                <CardTitle className="text-White">
                                    Bank Details
                                </CardTitle>
                                <CardDescription className="text-emerald-50 text-sm">
                                    Lawyer Bank Details
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                                    <div className="rounded-2xl border bg-slate-50 p-4 hover:shadow-md transition">
                                        <h4 className="font-medium text-slate-500">
                                            Account Holder
                                        </h4>
                                        <p>
                                            {lawyerProfile?.bank_account_name || "N/A"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-slate-50 p-4 hover:shadow-md transition">
                                        <h4 className="font-medium text-slate-500">
                                            Account Number
                                        </h4>
                                        <p>
                                            {lawyerProfile?.bank_account_number || "N/A"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-slate-50 p-4 hover:shadow-md transition">
                                        <h4 className="font-medium text-slate-500">
                                            IFSC Code
                                        </h4>
                                        <p>
                                            {lawyerProfile?.bank_ifsc_code || "N/A"}
                                        </p>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default AdminLawyerDetailsPage;