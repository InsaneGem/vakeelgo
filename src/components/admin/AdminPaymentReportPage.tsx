



import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatLawyerName } from '@/lib/lawyer-utils';
import {
    Users, Briefcase, TrendingUp, CheckCircle, XCircle, Clock, Shield, Eye,
    GraduationCap, Languages, DollarSign, Search, Edit, Ban, UserCheck,
    MessageSquare, Calendar, Wallet, Save, CreditCard, ArrowDownUp, Trash2, FileText, ArrowLeft
} from 'lucide-react';
// import{useNavigate}
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import AdminPaymentReportDetailsPage from "@/components/admin/AdminPaymentReportDetailsPage"


interface PaymentReport {
    id: string;
    consultation_id: string;
    client_name: string;
    lawyer_name: string;

    admin_status: string;
    duration_minutes: number;
    booked_duration_minutes: number;
    type: string;


    total_amount: number | null;
    lawyer_amount: number | null;
    commission_amount: number | null;

    notes: string | null;
    created_at: string;

    client_name?: string;
    lawyer_name?: string;
}


const AdminPaymentReportPage = () => {
    const { toast } = useToast();
    const [paymentReports, setPaymentReports] = useState<PaymentReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<PaymentReport | null>(null);
    const [reportEditOpen, setReportEditOpen] = useState(false);
    const [editReportForm, setEditReportForm] = useState<Partial<PaymentReport>>({});
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;
    const filteredPaymentReports = paymentReports.filter((report) => {
        const search = searchTerm.toLowerCase().trim();

        return (
            report.client_name?.toLowerCase().includes(search) ||
            report.lawyer_name?.toLowerCase().includes(search) ||
            report.admin_status?.toLowerCase().includes(search) ||
            report.id?.toLowerCase().includes(search)
        );
    });
    const totalItems = filteredPaymentReports.length;

    const totalPages = Math.ceil(
        totalItems / itemsPerPage
    );

    const startIndex =
        (currentPage - 1) * itemsPerPage;

    const paginatedPaymentReports =
        filteredPaymentReports.slice(
            startIndex,
            startIndex + itemsPerPage
        );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchPaymentReports();
        const channel = supabase.channel('paymentReports-page-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_reports' }, fetchPaymentReports)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchPaymentReports = async () => {
        // 1. Get payment reports
        const { data: reportsData, error } = await supabase
            .from("payment_reports")
            .select("*")
            .order("created_at", { ascending: false });

        if (error || !reportsData) return;

        // 2. Get all consultation ids from reports
        const consultationIds = reportsData.map(r => r.consultation_id);

        // 3. Fetch consultations
        // 3. Fetch consultations along with duration and type
        const { data: consultationsData } = await supabase
            .from("consultations")
            .select(`
    id,
    client_id,
    lawyer_id,
    total_amount,
    lawyer_amount,
    commission_amount,
    duration_minutes,
    booked_duration_minutes,
    type
  `)
            .in("id", consultationIds);

        if (!consultationsData) {
            setPaymentReports(reportsData);
            return;
        }

        const allUserIds = [
            ...new Set([
                ...consultationsData.map(c => c.client_id),
                ...consultationsData.map(c => c.lawyer_id),
            ]),
        ];
        const lawyerIds = [
            ...new Set(consultationsData.map(c => c.lawyer_id))
        ];



        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", allUserIds);


        // 8. Merge everything
        const finalData = reportsData.map(report => {

            const consultation = consultationsData.find(
                c => c.id === report.consultation_id
            );

            const client = profiles?.find(
                p => p.id === consultation?.client_id
            );

            const lawyer = profiles?.find(
                p => p.id === consultation?.lawyer_id
            );


            return {
                ...report,
                consultation_id: consultation?.id,
                client_name: client?.full_name || "Unknown",
                lawyer_name: lawyer?.full_name || "Unknown",

                booked_duration_minutes:
                    consultation?.booked_duration_minutes ?? 0,

                duration_minutes:
                    consultation?.duration_minutes ?? 0,

                total_amount: consultation?.total_amount ?? 0,
                // lawyer_amount: lawyerAmount,
                lawyer_amount: consultation?.lawyer_amount ?? 0,
                commission_amount: consultation?.commission_amount ?? 0,
            };
        });

        setPaymentReports(finalData);
        console.log(finalData);
    };

    const fetchConsultations = async () => {
        const { data: consultationsData } = await supabase
            .from("consultations")
            .select("*")
            .order("created_at", { ascending: false });

        if (!consultationsData) return;

        const clientIds = [
            ...new Set(consultationsData.map(c => c.client_id)),
        ];

        const lawyerIds = [
            ...new Set(consultationsData.map(c => c.lawyer_id)),
        ];

        // Client names
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", clientIds);

        // Lawyer names + prices
        const { data: lawyerProfiles } = await supabase
            .from("lawyer_profiles")
            .select(`
    user_id,
    chat_price_per_minute,
    audio_price_per_minute,
    video_price_per_minute
  `)
            .in("user_id", lawyerIds);

        const formatted = consultationsData.map((c) => {
            const client = profiles?.find(
                p => p.id === c.client_id
            );

            const lawyerProfile = lawyerProfiles?.find(
                lp => lp.user_id === consultation.lawyer_id
            );

            let lawyerAmount = 0;

            if (lawyerProfile) {
                const bookedMinutes =
                    Number(consultation.booked_duration_minutes) || 0;

                if (consultation.type === "chat") {
                    lawyerAmount =
                        (Number(lawyerProfile.chat_price_per_minute) || 0) *
                        bookedMinutes;
                }

                if (consultation.type === "audio") {
                    lawyerAmount =
                        (Number(lawyerProfile.audio_price_per_minute) || 0) *
                        bookedMinutes;
                }

                if (consultation.type === "video") {
                    lawyerAmount =
                        (Number(lawyerProfile.video_price_per_minute) || 0) *
                        bookedMinutes;
                }
            }

            return {
                ...consultation,
                // lawyer_amount: lawyerAmount,
                lawyer_amount: consultation?.lawyer_amount ?? 0,
            };
        });

        setConsultations(formatted);
    };

    const openPaymentReportEdit = (report: PaymentReport) => {
        setSelectedReport(report);
        setEditReportForm({ admin_status: report.admin_status, total_amount: report.total_amount, commission_amount: report.commission_amount, lawyer_amount: report.lawyer_amount, notes: report.notes || '' });
        setReportEditOpen(true);
    };

    const savePaymentReportEdit = async () => {
        if (!selectedReport) return;
        const { error } = await supabase.from('paymentReports').update({ admin_status: editReportForm.admin_status as any, total_amount: editReportForm.total_amount, commission_amount: editReportForm.commission_amount, lawyer_amount: editReportForm.lawyer_amount, notes: editReportForm.notes }).eq('id', selectedReport.id);
        if (!error) { toast({ title: 'Success', description: 'PaymentReport updated.' }); fetchPaymentReports(); setReportEditOpen(false); }
        else { toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' }); }
    };

    const getPaymentReportStatusBadge = (admin_status: string | null) => {
        switch (admin_status) {
            case 'completed': return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Completed</Badge>;
            case 'active': return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Active</Badge>;
            case 'pending': return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Pending</Badge>;
            case 'cancelled': return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Cancelled</Badge>;
            default: return <Badge variant="outline" className="text-[11px] px-2 py-0.5 rounded-full">{admin_status}</Badge>;
            case 'open':
                return (
                    <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium text-[11px] px-2 py-0.5 rounded-full">
                        Open
                    </Badge>
                );

            case 'closed':
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px] px-2 py-0.5 rounded-full">
                        Closed
                    </Badge>
                );
        }
    };

    // ── Shared action button helpers ───────────────────────────────────────────
    const ApproveBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick}
            className="h-7 w-7 p-0 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
            <CheckCircle className="h-3.5 w-3.5" />
        </Button>
    );
    const RejectBtn = ({ onClick, title }: { onClick: () => void; title?: string }) => (
        <Button variant="ghost" size="sm" onClick={onClick} title={title}
            className="h-7 w-7 p-0 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <XCircle className="h-3.5 w-3.5" />
        </Button>
    );
    const BanBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick}
            className="h-7 w-7 p-0 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors">
            <Ban className="h-3.5 w-3.5" />
        </Button>
    );
    const EditBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick}
            className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Edit className="h-3.5 w-3.5" />
        </Button>
    );
    const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick}
            className="h-7 w-7 p-0 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
        </Button>
    );

    return (
        <AdminLayout>
            <div className="p-3 md:p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 md:p-8 text-white shadow-xl">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-blue-500 blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-indigo-500 blur-3xl" />
                    </div>
                    {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
                    <button
                        onClick={() => navigate(-1)}
                        className="hidden md:flex absolute top-3 left-4 z-50 items-center gap-2 text-slate-300 hover:text-white transition-colors "
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Payment Report
                            </h1>
                            <p className="text-slate-300 mt-2 text-sm md:text-base">
                                View and manage all client payment reports.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">


                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-5 py-3 border border-white/10">
                                <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Total Payment Report</p>
                                <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">
                                    {paymentReports.length}
                                </h3>
                            </div>
                        </div>
                    </div>

                </div>
                <Card className="rounded-3xl border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                            <Input
                                placeholder="Search by Client, Lawyer, Report ID, Status..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                className="pl-10 h-11"
                            />
                        </div>
                    </CardContent>
                </Card>



                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden">
                    <div className="block md:hidden divide-y divide-slate-100 bg-white">

                        {paginatedPaymentReports.map((report) => (

                            <div
                                key={report.id}
                                // onClick={() => navigate(`/admin/AdminPaymentReportDetailsPage/${report.id}`)}
                                className="p-5 mb-4 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                            >

                                {/* Top Section */}
                                <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-200">

                                    <div className="flex-1 min-w-0">

                                        <p className="text-xs uppercase font-semibold text-slate-600">
                                            Client : {report.client_name}
                                        </p>

                                        <p className="text-xs uppercase font-semibold text-slate-600">
                                            Lawyer : {report.lawyer_name}
                                        </p>

                                    </div>



                                </div>

                                {/* PaymentReport Details */}
                                <div className="grid grid-cols-2 gap-3">



                                    <div>
                                        <p className="text-[11px] uppercase font-medium text-slate-400">
                                            Client paid Amount
                                        </p>

                                        <p className="font-semibold text-emerald-600 mt-1">
                                            ₹{report.total_amount?.toFixed(2) || "0.00"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase font-medium text-slate-400">
                                            Lawyer received
                                        </p>

                                        <p className="font-semibold text-emerald-600 mt-1">
                                            ₹{report.lawyer_amount?.toFixed(2) || "0.00"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase font-medium text-slate-400">
                                            Booked Duration
                                        </p>

                                        <p className="font-semibold text-slate-700 mt-1">
                                            {report.booked_duration_minutes} min
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase font-medium text-slate-400">
                                            Attended Duration
                                        </p>

                                        <p className="font-semibold text-slate-700 mt-1">
                                            {report.duration_minutes} min
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-[11px] uppercase font-medium text-slate-400">
                                            Report Date
                                        </p>

                                        <p className="text-sm text-slate-700 mt-1">
                                            {new Date(
                                                report.created_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase font-medium text-slate-400">
                                            Payment Report ID
                                        </p>

                                        <p className="text-xs text-slate-700 mt-1 break-all">
                                            {report.id}
                                        </p>
                                    </div>

                                </div>

                                {/* Notes */}
                                {report.notes && (
                                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">

                                        <p className="text-[11px] uppercase font-medium text-slate-400 mb-1">
                                            Notes
                                        </p>

                                        <p className="text-sm text-slate-700 line-clamp-3">
                                            {report.notes}
                                        </p>

                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4">

                                    <div>
                                        <p className="text-xs uppercase font-semibold text-slate-600 ">
                                            Current Status
                                        </p>

                                        <div className="mt-1">
                                            {getPaymentReportStatusBadge(
                                                report.admin_status
                                            )}
                                        </div>
                                    </div>

                                    <EditBtn
                                        onClick={() => navigate(`/admin/AdminConsultationDetailsPage/${report.consultation_id}`)}
                                    />

                                </div>

                            </div>

                        ))}

                        {paginatedPaymentReports.length === 0 && (
                            <div className="text-center py-12 text-slate-400 text-sm">
                                No PaymentReport Found
                            </div>
                        )}

                    </div>


                    <div className="hidden md:block overflow-x-auto w-full">

                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/70 border-b border-slate-100 hover:bg-slate-50/70">

                                    <TableHead className="pl-6">Client</TableHead>
                                    <TableHead>Lawyer</TableHead>
                                    <TableHead>Report ID</TableHead>
                                    <TableHead>Admin Status</TableHead>
                                    <TableHead>Attended Duration</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Lawyer Amount</TableHead>
                                    <TableHead>Booked Duration</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right pr-6">Management</TableHead>

                                </TableRow>
                            </TableHeader>

                            <TableBody>

                                {paginatedPaymentReports.map((report) => (

                                    <TableRow
                                        key={report.id}
                                        // onClick={() => navigate(`/admin/AdminPaymentReportDetailsPage/${report.id}`)}
                                        className="group hover:bg-slate-50/40 border-b border-slate-100 last:border-none transition-all duration-150"
                                    >

                                        <TableCell className="font-semibold text-slate-900 text-xs  py-4 pl-6">

                                            {report.client_name}
                                        </TableCell>

                                        <TableCell className="font-semibold text-slate-900 text-xs ">
                                            {report.lawyer_name}
                                        </TableCell>

                                        <TableCell className="text-slate-700 text-xs">
                                            {report.id}
                                        </TableCell>



                                        <TableCell>
                                            {getPaymentReportStatusBadge(
                                                report.admin_status
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {report.duration_minutes} min
                                        </TableCell>

                                        <TableCell className="text-slate-700 font-medium text-xs">
                                            ₹{report.total_amount?.toFixed(2) || "0.00"}
                                        </TableCell>
                                        <TableCell>
                                            ₹{report.lawyer_amount?.toFixed(2) || "0.00"}
                                        </TableCell>

                                        <TableCell>
                                            {report.booked_duration_minutes} min
                                        </TableCell>

                                        <TableCell className="text-slate-500 text-xs">
                                            {new Date(
                                                report.created_at
                                            ).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="text-right pr-6">
                                            <EditBtn
                                                onClick={() => navigate(`/admin/AdminConsultationDetailsPage/${report.consultation_id}`)}
                                            />
                                        </TableCell>

                                    </TableRow>

                                ))}

                                {paginatedPaymentReports.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center py-16 text-slate-400 text-sm font-medium"
                                        >
                                            No PaymentReport Found
                                        </TableCell>
                                    </TableRow>
                                )}

                            </TableBody>
                        </Table>

                    </div>

                </div>
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-t border-slate-100">

                        <p className="text-xs font-semibold text-slate-500">
                            Showing {startIndex + 1} to{" "}
                            {Math.min(
                                startIndex + itemsPerPage,
                                totalItems
                            )} of {totalItems} paymentReports
                        </p>

                        <div className="flex items-center gap-2">

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.max(p - 1, 1)
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(p + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>

                        </div>

                    </div>
                )}
            </div>

            <Dialog open={reportEditOpen} onOpenChange={setReportEditOpen}>
                {/* ... (Copy Dialog implementation from original code) ... */}

                <DialogContent className="rounded-2xl p-0 gap-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                        <DialogTitle className="text-base font-semibold text-slate-900">Edit PaymentReport</DialogTitle>
                        <DialogDescription className="text-xs text-slate-400 mt-0.5">
                            {selectedReport?.client_name} → {selectedReport?.lawyer_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 py-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Status</Label>
                            <Select value={editReportForm.admin_status || ''} onValueChange={(v) => setEditReportForm({ ...editReportForm, admin_status: v })}>
                                <SelectTrigger className="h-9 text-sm rounded-lg border-slate-200"><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    {['pending', 'active', 'completed', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Total (₹)</Label>
                                <Input type="number" step="0.01" value={editReportForm.total_amount || 0} onChange={(e) => setEditReportForm({ ...editReportForm, total_amount: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Commission (₹)</Label>
                                <Input type="number" step="0.01" value={editReportForm.commission_amount || 0} onChange={(e) => setEditReportForm({ ...editReportForm, commission_amount: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Lawyer (₹)</Label>
                                <Input type="number" step="0.01" value={editReportForm.lawyer_amount || 0} onChange={(e) => setEditReportForm({ ...editReportForm, lawyer_amount: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Notes</Label>
                            <Textarea value={editReportForm.notes || ''} onChange={(e) => setEditReportForm({ ...editReportForm, notes: e.target.value })} rows={3} className="text-sm rounded-lg border-slate-200 resize-none" />
                        </div>
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-slate-100 gap-2">
                        <Button variant="outline" onClick={() => setReportEditOpen(false)} className="h-9 text-sm rounded-lg border-slate-200">Cancel</Button>
                        <Button onClick={savePaymentReportEdit} className="h-9 text-sm rounded-lg bg-slate-900 hover:bg-slate-800 gap-1.5">
                            <Save className="h-3.5 w-3.5" /> Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog>
        </AdminLayout>
    );
};

export default AdminPaymentReportPage;