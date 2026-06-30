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
    Shield,
    User, AlertTriangle, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const AdminConsultationDetailsPage = () => {
    const { consultationId } = useParams<{ consultationId: string }>();
    const navigate = useNavigate();

    const [consultation, setConsultation] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [lawyer, setLawyer] = useState<any>(null);
    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentReport, setPaymentReport] = useState<any>(null);
    const [adminComment, setAdminComment] = useState("");

    const fetchConsultationData = async () => {
        try {
            setLoading(true);

            // 1. Fetch primary consultation record
            const { data: consultationData, error } = await supabase
                .from("consultations")
                .select("*")
                .eq("id", consultationId)
                .single();

            if (error) throw error;
            setConsultation(consultationData);
            console.log("Consultation Data:", consultationData);

            // 2. Fetch linked entities asynchronously in parallel
            const clientRes = await supabase
                .from("profiles")
                .select("*")
                .eq("id", consultationData.client_id)
                .single();

            const lawyerRes = await supabase
                .from("profiles")
                .select("*")
                .eq("id", consultationData.lawyer_id)
                .single();

            // const paymentRes = await supabase
            //     .from("payments")
            //     .select("*")
            //     .eq("consultation_id", consultationData.id)
            //     .maybeSingle();

            // const reportRes = await supabase
            //     .from("payment_reports")
            //     .select("*")
            //     .eq("payment_id", paymentRes.data?.id)
            //     .maybeSingle();

            // console.log("Payment ID:", paymentRes.data?.id);
            // console.log("Report Data:", reportRes.data);
            // console.log("Report Error:", reportRes.error);


            // setClient(clientRes.data);
            // setLawyer(lawyerRes.data);
            // setPayment(paymentRes.data);
            // setPaymentReport(reportRes.data);
            const paymentRes = await supabase
                .from("payments")
                .select("*")
                .eq("consultation_id", consultationData.id)
                .maybeSingle();

            const reportRes = await supabase
                .from("payment_reports")
                .select("*")
                .eq("consultation_id", consultationData.id)
                .maybeSingle();
            console.table(consultationData);
            console.table(paymentRes.data);
            console.table(reportRes.data);

            setClient(clientRes.data);
            setLawyer(lawyerRes.data);
            setPayment(paymentRes.data);
            setPaymentReport(reportRes.data);

            const testReport = await supabase
                .from("payment_reports")
                .select("*");

            console.log("ALL REPORTS:", testReport.data);




        } catch (err) {
            console.error("Error fetching consultation metadata context:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseReport = async () => {

        if (!adminComment.trim()) {
            alert("Please enter a resolution before closing the report.");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from("payment_reports")
            .update({
                admin_status: "closed",
                admin_comment: adminComment,
                resolved_at: new Date().toISOString(),
                resolved_by: user?.id
            })
            .eq("id", paymentReport.id);

        if (error) {
            alert(error.message);
            return;
        }

        setPaymentReport({
            ...paymentReport,
            admin_status: "closed",
            admin_comment: adminComment,
            resolved_at: new Date().toISOString()
        });
    };


    useEffect(() => {
        if (consultationId) {
            fetchConsultationData();
        }
    }, [consultationId]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center p-20 text-slate-500">
                    Loading Consultation Details...
                </div>
            </AdminLayout>
        );
    }

    if (!consultation) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-4">
                    <p>Consultation record not found.</p>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 pt-[3px] pb-8 space-y-8 overflow-x-hidden box-border">

                {/* Header Navigation Block */}
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
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 text-white">Consultation Details</h1>
                        <p className=" text-sm text-slate-500 select-all font-mono text-white">Manage and Monitor Consultation Data</p>
                    </div>
                </div>

                {/* Quick Premium Stats Row */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">Session Type</p>
                                <h3 className="text-xl sm:text-1xl font-bold capitalize">{consultation.type || 'N/A'}</h3>

                            </div>
                            <Briefcase className="h-4 w-4 sm:h-6 sm:w-6" />
                        </CardContent>

                    </Card>


                    <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold"> Session Status</p>

                                <h3 className="text-xl sm:text-1xl font-bold capitalize">
                                    {consultation.status}
                                </h3>

                            </div>
                            <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">Fee Amount</p>
                                <h3 className="text-xl sm:text-1xl font-bold capitalize">

                                    {payment?.amount ? payment.amount.toFixed(2) : "0.00"}
                                </h3>
                            </div>
                            <IndianRupee className="h-4 w-4 sm:h-6 sm:w-6" />
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">Consulation ID</p>
                                <h3 className="text-xs text-slate-500 font-mono  select-all">

                                    {consultation.id}
                                </h3>
                            </div>
                            {/* <IndianRupee className="h-6 w-6 text-emerald-500" /> */}
                        </CardContent>
                    </Card>
                </div>

                {/* **************************************** */}

                {/* ********************************************************************888 */}

                {/* Main View Segment Tabs */}
                <Tabs defaultValue="participants" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 p-1 bg-slate-100 border border-slate-200 rounded-xl h-auto">
                        <TabsTrigger value="participants" className="rounded-lg py-2 text-sm font-medium">
                            Parties Involved
                        </TabsTrigger>
                        <TabsTrigger value="session" className="rounded-lg py-2 text-sm font-medium">
                            Session Metadata
                        </TabsTrigger>
                        <TabsTrigger value="payment" className="rounded-lg py-2 text-sm font-medium">
                            Financial Ledger
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Participants (Client vs Lawyer Profile Overview) */}
                    <TabsContent value="participants" className="mt-6 grid md:grid-cols-2 gap-6">
                        {/* Client Summary Card */}
                        <Card className="rounded-2xl border border-slate-200 shadow-sm">
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                                    <User className="h-5 w-5" /> Client Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                                        {client?.full_name?.charAt(0) || "C"}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">{client?.full_name || "Unknown Client"}</h4>
                                        <p className="text-xs text-slate-400 font-mono">{client?.id}</p>
                                    </div>
                                </div>
                                <hr className="border-slate-100" />
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {client?.email || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {client?.phone || 'Not Provided'}</p>
                                    <p className="flex items-center gap-2">
                                        <CalendarCheck className="h-4 w-4 text-slate-400" />
                                        {client?.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'Not Provided'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lawyer Summary Card */}
                        <Card className="rounded-2xl border border-slate-200 shadow-sm">
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
                                    <Shield className="h-5 w-5" /> Assigned Legal Counsel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                                        {lawyer?.full_name?.charAt(0) || "L"}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">{lawyer?.full_name || "Unknown Lawyer"}</h4>
                                        <p className="text-xs text-slate-400 font-mono">{lawyer?.id}</p>
                                    </div>
                                </div>
                                <hr className="border-slate-100" />
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {lawyer?.email || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {lawyer?.phone || 'Not Provided'}</p>
                                    <p className="flex items-center gap-2">
                                        <CalendarCheck className="h-4 w-4 text-slate-400" />
                                        {lawyer?.date_of_birth
                                            ? new Date(lawyer.date_of_birth).toLocaleDateString()
                                            : 'Not Provided'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Consultation Record Metadata */}
                    <TabsContent value="session" className="mt-6">
                        <Card className="rounded-2xl border border-slate-200 shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-lg">Consultation Log Specs</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Consultation Reference Key</p>
                                    <p className="font-mono text-sm break-all bg-slate-50 p-2 rounded border">{consultation.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Creation Date</p>
                                    <p className="text-sm font-medium text-slate-800 p-2 bg-slate-50 rounded border">
                                        {new Date(consultation.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">
                                        Consultation Started At
                                    </p>

                                    <p className="text-sm font-medium text-slate-800 p-2 bg-slate-50 rounded border">
                                        {consultation.started_at
                                            ? new Date(consultation.started_at).toLocaleString()
                                            : "Not Started"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">
                                        Consultation Ended At
                                    </p>

                                    <p className="text-sm font-medium text-slate-800 p-2 bg-slate-50 rounded border">
                                        {consultation.ended_at
                                            ? new Date(consultation.ended_at).toLocaleString()
                                            : "Not Ended"}
                                    </p>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">
                                        Consultation Agenda
                                    </p>

                                    <div className="bg-slate-50 border rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
                                        {consultation.agenda
                                            ? (() => {
                                                const agenda = consultation.agenda
                                                    .replace(/[\[\]"]/g, "")      // Remove [ ] and "
                                                    .trim();

                                                const lines = agenda.split("\n").filter(Boolean);

                                                const selectedIssue = lines[0];
                                                const issueDetails = lines.slice(2).join("\n").trim();

                                                return (
                                                    <>
                                                        <p>
                                                            <strong>Selected Issue:</strong> {selectedIssue}
                                                        </p>

                                                        {issueDetails && (
                                                            <p className="mt-3">
                                                                <strong>Issue Details:</strong> {issueDetails}
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            })()
                                            : "No agenda available."}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Channels Allowed</p>
                                    <span className="inline-block px-3 py-1 mt-1 text-xs rounded-full bg-amber-100 text-amber-800 font-medium capitalize">
                                        {consultation.type} Communication
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Financial Settlement Record */}
                    <TabsContent value="payment" className="mt-6 ">
                        <Card className="rounded-2xl border border-slate-200 shadow-sm">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-lg">Payment Settlement Ledger</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {payment ? (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Payment Processing ID</p>
                                            <p className="font-mono text-sm break-all bg-slate-50 p-2 rounded border">
                                                {payment.payment_id || payment.razorpay_payment_id || payment.id}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Capture Date</p>
                                            <p className="text-sm text-slate-800 p-2 bg-slate-50 rounded border">
                                                {new Date(payment.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Gateway Channel</p>
                                            <p className="text-sm font-bold text-slate-700 p-2 bg-slate-50 rounded border">
                                                {payment.payment_mode || payment.payment_method || "RAZORPAY"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Transaction Clearance Status</p>
                                            <Badge className={`inline-block px-2.5 py-1 text-xs rounded-md font-bold uppercase tracking-wider
                                                 ${payment?.payment_status === 'completed'
                                                    ? 'bg-emerald-600'
                                                    : 'bg-rose-600'}`}>
                                                {payment?.payment_status || "N/A"}
                                            </Badge>
                                        </div>




                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 text-sm">
                                        No billing ledger found tied directly to this consultation session.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {/* PLACE THIS DIRECTLY BELOW YOUR EXISTING BASE TRANSACTION CARD inside <TabsContent value="payment"> */}
                        <Card className="rounded-2xl border border-slate-200 shadow-sm mt-6">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" /> Client Dispute File (Payment Reports)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {paymentReport ? (
                                    <div className="space-y-6">
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase">Report Entry ID</p>
                                                <p className="font-mono text-xs truncate bg-slate-50 p-2 rounded border" title={paymentReport.id}>
                                                    {paymentReport.id}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase">Issue Classification</p>
                                                <span className="inline-block px-2.5 py-1 text-xs rounded-md bg-amber-100 text-amber-900 border border-amber-200 font-mono capitalize">
                                                    {paymentReport.issue_type?.replace('_', ' ') || "Unclassified"}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase">Admin Evaluation Status</p>
                                                <span className={`inline-block px-2.5 py-1 text-xs rounded-md font-bold uppercase tracking-wider 
                                                ${paymentReport.admin_status === "open"
                                                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                                                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                    }`}>
                                                    {paymentReport.admin_status || "Open"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Client Logged Description</p>
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 font-mono whitespace-pre-wrap break-all">
                                                {paymentReport.issue_message || "No contextual message provided."}
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase">
                                                    Booked Duration
                                                </p>
                                                <p className="text-sm font-medium text-slate-800 p-2 bg-slate-50 rounded border">
                                                    {consultation?.booked_duration_minutes ?? "N/A"} mins
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase">
                                                    Attended Duration
                                                </p>
                                                <p className="text-sm font-medium text-slate-800 p-2 bg-slate-50 rounded border">
                                                    {consultation?.duration_minutes ?? "N/A"} mins
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase">
                                                    Lawyer Amount
                                                </p>
                                                <p className="text-sm font-semibold text-emerald-700 p-2 bg-slate-50 rounded border">
                                                    ₹{consultation?.lawyer_amount?.toFixed(2) ?? "0.00"}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase">
                                                    Total Amount
                                                </p>
                                                <p className="text-sm font-semibold text-blue-700 p-2 bg-slate-50 rounded border">
                                                    ₹{consultation?.total_amount?.toFixed(2) ?? "0.00"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Report Filed On: {new Date(paymentReport.created_at).toLocaleString()}
                                        </div>
                                        <div className="space-y-2 mt-6">
                                            <label className="text-sm font-semibold">
                                                Admin Resolution
                                            </label>

                                            <Textarea
                                                placeholder="Write the resolution provided to the client..."
                                                value={adminComment}
                                                onChange={(e) => setAdminComment(e.target.value)}
                                            />
                                        </div>
                                        {paymentReport.admin_status === "open" && (
                                            <div className="pt-4">
                                                <Button
                                                    onClick={handleCloseReport}
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Mark as Closed
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-xl bg-slate-50/50">
                                        <FileText className="h-8 w-8 text-slate-300 mb-2" />
                                        <p className="text-sm font-medium text-slate-500">No payment report filed</p>
                                        <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                                            The client has not flagged or submitted any reporting disputes regarding this transaction.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default AdminConsultationDetailsPage;