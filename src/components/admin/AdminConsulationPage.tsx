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
    MessageSquare, Calendar, Wallet, Save, CreditCard, ArrowDownUp, Trash2, FileText
} from 'lucide-react';

interface Consultation {
    id: string;
    client_id: string;
    lawyer_id: string;
    type: string;
    status: string;
    total_amount: number | null;
    commission_amount: number | null;
    lawyer_amount: number | null;
    notes: string | null;
    created_at: string;
    client_name?: string;
    lawyer_name?: string;
}

const AdminConsultationsPage = () => {
    const { toast } = useToast();
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [consultationEditOpen, setConsultationEditOpen] = useState(false);
    const [editConsultationForm, setEditConsultationForm] = useState<Partial<Consultation>>({});

    useEffect(() => {
        fetchConsultations();
        const channel = supabase.channel('consultations-page-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, fetchConsultations)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchConsultations = async () => {
        const { data: consultationsData } = await supabase.from('consultations').select('*').order('created_at', { ascending: false });
        if (consultationsData) {
            const allUserIds = [...new Set([...consultationsData.map(c => c.client_id), ...consultationsData.map(c => c.lawyer_id)])];
            const { data: allProfiles } = await supabase.from('profiles').select('id, full_name').in('id', allUserIds);
            setConsultations(consultationsData.map(c => ({
                ...c,
                client_name: allProfiles?.find(p => p.id === c.client_id)?.full_name || 'Unknown',
                lawyer_name: formatLawyerName(allProfiles?.find(p => p.id === c.lawyer_id)?.full_name, 'Unknown'),
            })));
        }
    };

    const openConsultationEdit = (consultation: Consultation) => {
        setSelectedConsultation(consultation);
        setEditConsultationForm({ status: consultation.status, total_amount: consultation.total_amount, commission_amount: consultation.commission_amount, lawyer_amount: consultation.lawyer_amount, notes: consultation.notes || '' });
        setConsultationEditOpen(true);
    };

    const saveConsultationEdit = async () => {
        if (!selectedConsultation) return;
        const { error } = await supabase.from('consultations').update({ status: editConsultationForm.status as any, total_amount: editConsultationForm.total_amount, commission_amount: editConsultationForm.commission_amount, lawyer_amount: editConsultationForm.lawyer_amount, notes: editConsultationForm.notes }).eq('id', selectedConsultation.id);
        if (!error) { toast({ title: 'Success', description: 'Consultation updated.' }); fetchConsultations(); setConsultationEditOpen(false); }
        else { toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' }); }
    };

    const getConsultationStatusBadge = (status: string | null) => {
        switch (status) {
            case 'completed': return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Completed</Badge>;
            case 'active': return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Active</Badge>;
            case 'pending': return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Pending</Badge>;
            case 'cancelled': return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Cancelled</Badge>;
            default: return <Badge variant="outline" className="text-[11px] px-2 py-0.5 rounded-full">{status}</Badge>;
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
            <div className="max-w-screen-xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold mb-6">Consultations</h1>
                {/* Table code remains identical to the original... */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <Table>
                        {/* ... (Copy Table implementation from original code) ... */}
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                    {['Client', 'Lawyer', 'Type', 'Status', 'Amount', 'Date', 'Actions'].map((h, i) => (
                                        <TableHead key={h} className={`text-[11px] font-semibold text-slate-500 uppercase tracking-wide ${i === 0 ? 'pl-5' : ''} ${h === 'Actions' ? 'text-right pr-5' : ''}`}>{h}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consultations.map((consultation) => (
                                    <TableRow key={consultation.id} className="hover:bg-slate-50/60 border-slate-100 transition-colors">
                                        <TableCell className="font-medium text-sm text-slate-900 pl-5">{consultation.client_name}</TableCell>
                                        <TableCell className="text-slate-600 text-sm">{consultation.lawyer_name}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize text-[11px] px-2 py-0.5 rounded-full border-slate-200 text-slate-600">{consultation.type}</Badge></TableCell>
                                        <TableCell>{getConsultationStatusBadge(consultation.status)}</TableCell>
                                        <TableCell className="text-slate-700 font-medium text-xs">₹{consultation.total_amount?.toFixed(2) || '0.00'}</TableCell>
                                        <TableCell className="text-slate-400 text-xs">{new Date(consultation.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right pr-5"><EditBtn onClick={() => openConsultationEdit(consultation)} /></TableCell>
                                    </TableRow>
                                ))}
                                {consultations.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm">No consultations found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Table>
                </div>
            </div>

            <Dialog open={consultationEditOpen} onOpenChange={setConsultationEditOpen}>
                {/* ... (Copy Dialog implementation from original code) ... */}
                <Dialog open={consultationEditOpen} onOpenChange={setConsultationEditOpen}>
                    <DialogContent className="rounded-2xl p-0 gap-0">
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-base font-semibold text-slate-900">Edit Consultation</DialogTitle>
                            <DialogDescription className="text-xs text-slate-400 mt-0.5">
                                {selectedConsultation?.client_name} → {selectedConsultation?.lawyer_name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="px-6 py-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Status</Label>
                                <Select value={editConsultationForm.status || ''} onValueChange={(v) => setEditConsultationForm({ ...editConsultationForm, status: v })}>
                                    <SelectTrigger className="h-9 text-sm rounded-lg border-slate-200"><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                        {['pending', 'active', 'completed', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Total (₹)</Label>
                                    <Input type="number" step="0.01" value={editConsultationForm.total_amount || 0} onChange={(e) => setEditConsultationForm({ ...editConsultationForm, total_amount: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Commission (₹)</Label>
                                    <Input type="number" step="0.01" value={editConsultationForm.commission_amount || 0} onChange={(e) => setEditConsultationForm({ ...editConsultationForm, commission_amount: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-600">Lawyer (₹)</Label>
                                    <Input type="number" step="0.01" value={editConsultationForm.lawyer_amount || 0} onChange={(e) => setEditConsultationForm({ ...editConsultationForm, lawyer_amount: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-600">Notes</Label>
                                <Textarea value={editConsultationForm.notes || ''} onChange={(e) => setEditConsultationForm({ ...editConsultationForm, notes: e.target.value })} rows={3} className="text-sm rounded-lg border-slate-200 resize-none" />
                            </div>
                        </div>
                        <DialogFooter className="px-6 py-4 border-t border-slate-100 gap-2">
                            <Button variant="outline" onClick={() => setConsultationEditOpen(false)} className="h-9 text-sm rounded-lg border-slate-200">Cancel</Button>
                            <Button onClick={saveConsultationEdit} className="h-9 text-sm rounded-lg bg-slate-900 hover:bg-slate-800 gap-1.5">
                                <Save className="h-3.5 w-3.5" /> Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminConsultationsPage;