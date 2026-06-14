
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Clock, CalendarCheck } from 'lucide-react';
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

    if (loading) return <AdminLayout><div className="flex justify-center p-20 text-slate-500">Loading comprehensive client profile...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                <Button variant="ghost" className="pl-0 text-slate-500 hover:text-slate-900" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-2xl font-bold border">
                            {client?.full_name?.charAt(0) || 'C'}
                        </div> */}
                        <div className="h-20 w-20 rounded-full overflow-hidden border">
                            {client?.avatar_url ? (
                                <img
                                    src={client.avatar_url}
                                    alt={client.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-600 text-2xl font-bold">
                                    {client?.full_name?.charAt(0) || 'C'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-slate-900">{client?.full_name || "Unknown Client"}</h1>
                            <div className="flex flex-wrap gap-4 mt-2 text-slate-500 justify-center md:justify-start text-sm">
                                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {client?.email}</span>
                                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {client?.phone || "No phone provided"}</span>
                                <span className="flex items-center gap-1.5"><CalendarCheck className="h-4 w-4" />  {client?.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'Not Provided'}</span>
                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Joined: {new Date(client?.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <Badge className="bg-slate-900 text-white hover:bg-slate-800 capitalize px-4 py-1">{client?.status || "Active"}</Badge>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card><CardContent className="pt-6"><div className="text-sm text-slate-500 font-medium mb-1">Wallet Balance</div><div className="text-2xl font-bold">₹{wallet?.balance?.toFixed(2) || '0.00'}</div></CardContent></Card>
                    <Card><CardContent className="pt-6"><div className="text-sm text-slate-500 font-medium mb-1">Total Consultations Taken</div><div className="text-2xl font-bold">{consultations.length}</div></CardContent></Card>
                    <Card><CardContent className="pt-6"><div className="text-sm text-slate-500 font-medium mb-1">Total Paid for Consultation</div><div className="text-2xl font-bold">₹{payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.amount || 0), 0).toFixed(2)}</div></CardContent></Card>
                    <Card><CardContent className="pt-6"><div className="text-sm text-slate-500 font-medium mb-1">Role of User</div><div className="text-2xl font-bold capitalize">{clientRole?.role || 'Client'}</div></CardContent></Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="consultations" className="w-full">
                    <TabsList className="bg-slate-100 p-1">
                        <TabsTrigger value="consultations">Consultations</TabsTrigger>
                        <TabsTrigger value="payments">Payment History</TabsTrigger>
                        <TabsTrigger value="account">Account Details</TabsTrigger>
                    </TabsList>

                    {/* Consultations Tab */}
                    <TabsContent value="consultations" className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {/* <Input placeholder="Lawyer name..." className="text-xs h-9" onChange={(e) => setFilters({ ...filters, lawyer: e.target.value })} /> */}
                            <Input
                                placeholder="Search Lawyer Name, Lawyer ID, Consultation ID..."
                                className="text-xs h-9"
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        lawyer: e.target.value,
                                    })
                                }
                            />
                            <Select onValueChange={(val) => setFilters({ ...filters, status: val })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(val) => setFilters({ ...filters, type: val })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="audio">Audio</SelectItem>
                                    <SelectItem value="chat">Chat</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                        <Card className="overflow-hidden border-slate-200">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Lawyer Name</TableHead>
                                            <TableHead>Lawyer ID</TableHead>
                                            <TableHead>Consultation Type</TableHead>
                                            <TableHead>Consultation ID</TableHead>
                                            <TableHead>Consultation Status</TableHead>
                                            <TableHead className="text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedConsultations.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.lawyer?.full_name}</TableCell>
                                                <TableCell> {c.lawyer_id}</TableCell>
                                                <TableCell className="capitalize">{c.type}</TableCell>
                                                <TableCell> {c.id}</TableCell>
                                                <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                                                <TableCell className="text-right">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex items-center justify-between mt-4 px-4 pb-4">
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <Input placeholder="Lawyer name..." className="text-xs h-9" onChange={(e) => setPaymentFilters({ ...paymentFilters, lawyer: e.target.value })} />
                            <Select onValueChange={(val) => setPaymentFilters({ ...paymentFilters, status: val })}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="date" className="text-xs h-9" onChange={(e) => setPaymentFilters({ ...paymentFilters, date: e.target.value })} />
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Lawyer</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Payment ID</TableHead>
                                            <TableHead>Mode</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedPayments.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.lawyer?.full_name}</TableCell>
                                                <TableCell>₹{p.amount?.toFixed(2)}</TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {p.payment_id}
                                                </TableCell>
                                                <TableCell>
                                                    {p.payment_mode || "RAZORPAY"}
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>

                                                <TableCell className="text-right">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex items-center justify-between mt-4 px-4 pb-4">
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
                            </CardContent>
                        </Card>
                    </TabsContent>


                    {/* Account Details Tab */}
                    <TabsContent value="account" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Profile Metadata</CardTitle></CardHeader>
                            <CardContent className="text-sm grid grid-cols-2 gap-4">
                                <div><p className="text-slate-500">User ID</p><p className="font-mono">{client?.id}</p></div>
                                <div><p className="text-slate-500">Last Updated</p><p>{client?.updated_at ? new Date(client.updated_at).toLocaleString() : 'N/A'}</p></div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default AdminClientDetailsPage;