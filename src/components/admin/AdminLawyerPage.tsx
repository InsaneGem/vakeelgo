import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminLawyerDetailsPage from "@/components/admin/AdminLawyerDetailsPage"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Briefcase, CheckCircle, XCircle, Clock, Ban, Edit, Trash2, Search, Save, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatLawyerName } from '@/lib/lawyer-utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface LawyerProfile {
    id: string;
    user_id: string;
    bio: string | null;
    education: string | null;
    bar_council_number: string | null;
    experience_years: number | null;
    specializations: string[] | null;
    languages: string[] | null;
    price_per_minute: number | null;
    session_price: number | null;
    status: string | null;
    is_available: boolean | null;
    rating: number | null;
    total_consultations: number | null;
    created_at: string;
    full_name?: string;
    email?: string;
}

const AdminLawyerPage = () => {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
    const [lawyerEditOpen, setLawyerEditOpen] = useState(false);
    const [editLawyerForm, setEditLawyerForm] = useState<Partial<LawyerProfile>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [lawyerFilter, setLawyerFilter] = useState<string>('all');

    useEffect(() => {
        if (!user || role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchLawyers();

        const channel = supabase
            .channel('admin-lawyers-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lawyer_profiles' }, () => { fetchLawyers(); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user, role]);

    const fetchLawyers = async () => {
        try {
            const { data: lawyersData } = await supabase.from('lawyer_profiles').select('*').order('created_at', { ascending: false });
            if (lawyersData) {
                const userIds = lawyersData.map(l => l.user_id);
                const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
                setLawyers(lawyersData.map(lawyer => {
                    const profile = profiles?.find(p => p.id === lawyer.user_id);
                    return { ...lawyer, full_name: formatLawyerName(profile?.full_name, 'Unknown'), email: profile?.email || 'N/A' };
                }));
            }
        } catch (error) {
            console.error('Error fetching lawyers:', error);
        } finally {
            setLoading(false);
        }
    };

    const openLawyerEdit = (lawyer: LawyerProfile) => {
        setSelectedLawyer(lawyer);
        setEditLawyerForm({ bio: lawyer.bio || '', education: lawyer.education || '', bar_council_number: lawyer.bar_council_number || '', experience_years: lawyer.experience_years || 0, price_per_minute: lawyer.price_per_minute || 0, session_price: lawyer.session_price || 0, status: lawyer.status, is_available: lawyer.is_available, specializations: lawyer.specializations || [], languages: lawyer.languages || [] });
        setLawyerEditOpen(true);
    };

    const saveLawyerEdit = async () => {
        if (!selectedLawyer) return;
        const { error } = await supabase.from('lawyer_profiles').update({ bio: editLawyerForm.bio, education: editLawyerForm.education, bar_council_number: editLawyerForm.bar_council_number, experience_years: editLawyerForm.experience_years, price_per_minute: editLawyerForm.price_per_minute, session_price: editLawyerForm.session_price, status: editLawyerForm.status as any, is_available: editLawyerForm.is_available, specializations: editLawyerForm.specializations, languages: editLawyerForm.languages }).eq('id', selectedLawyer.id);
        if (!error) { toast({ title: 'Success', description: 'Lawyer profile updated.' }); fetchLawyers(); setLawyerEditOpen(false); }
        else { toast({ title: 'Error', description: 'Failed to update lawyer.', variant: 'destructive' }); }
    };

    const approveLawyer = async (lawyer: LawyerProfile) => {
        const { error } = await supabase.from('lawyer_profiles').update({ status: 'approved' }).eq('id', lawyer.id);
        if (!error) { toast({ title: 'Lawyer Approved', description: `${lawyer.full_name} is now approved.` }); }
        else { toast({ title: 'Error', description: 'Failed to approve lawyer.', variant: 'destructive' }); }
    };

    const rejectLawyer = async (lawyer: LawyerProfile) => {
        const { error } = await supabase.from('lawyer_profiles').update({ status: 'rejected' }).eq('id', lawyer.id);
        if (!error) { toast({ title: 'Lawyer Rejected', description: `${lawyer.full_name} has been rejected.` }); }
        else { toast({ title: 'Error', description: 'Failed to reject lawyer.', variant: 'destructive' }); }
    };

    const deleteLawyer = async (lawyer: LawyerProfile) => {
        if (!confirm(`Are you sure you want to delete ${lawyer.full_name}?`)) return;
        const { error } = await supabase.from('lawyer_profiles').delete().eq('id', lawyer.id);
        if (!error) { toast({ title: 'Success', description: 'Lawyer deleted.' }); }
    };

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</Badge>;
            case 'pending': return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">Pending</Badge>;
            case 'rejected': return <Badge className="bg-red-50 text-red-700 border border-red-200">Rejected</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const filteredLawyers = lawyers.filter(l =>
        l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (lawyerFilter === 'all' || l.status === lawyerFilter)
    );

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
            {/* ── Lawyers tab ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 sm:px-5 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Manage Lawyers</h2>
                    <div className="flex gap-2">
                        <div className="relative flex-1 sm:w-52">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input placeholder="Search lawyers…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 h-8 text-xs rounded-lg border-slate-200 focus:border-slate-400 bg-slate-50" />
                        </div>
                        <Select value={lawyerFilter} onValueChange={setLawyerFilter}>
                            <SelectTrigger className="h-8 w-28 text-xs rounded-lg border-slate-200 bg-slate-50">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                {/* Mobile cards */}
                <div className="block lg:hidden divide-y divide-slate-50">
                    {filteredLawyers.map((l) => (
                        <div key={l.id}
                            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                            onClick={() =>
                                navigate(`/admin/AdminLawyerDetailsPage/${l.user_id}`)
                            }
                        >
                            <div className="min-w-0 flex-1" onClick={() => navigate(`/admin/AdminLawyerDetailsPage/${l.user_id}`)}>
                                <p className="font-medium text-sm text-slate-900 truncate">{l.full_name}</p>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{l.email}</p>
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                    {getStatusBadge(l.status)}
                                    <span className="text-[11px] text-slate-400">{l.experience_years || 0} yrs</span>
                                    <span className="text-[11px] text-slate-400">₹{l.price_per_minute}/min</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                {l.status === 'pending' && (<><ApproveBtn onClick={() => approveLawyer(l)} /><RejectBtn onClick={() => rejectLawyer(l)} /></>)}
                                {l.status === 'approved' && <BanBtn onClick={() => rejectLawyer(l)} />}
                                {l.status === 'rejected' && <ApproveBtn onClick={() => approveLawyer(l)} />}
                                <EditBtn onClick={() => openLawyerEdit(l)} />
                                <DeleteBtn onClick={() => deleteLawyer(l)} />
                            </div>
                        </div>
                    ))}
                    {filteredLawyers.length === 0 && (
                        <div className="text-center py-12 text-slate-400 text-sm">No lawyers found</div>
                    )}
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide pl-5">Name</TableHead>
                                <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Email</TableHead>
                                <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</TableHead>
                                <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Exp.</TableHead>
                                <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pricing</TableHead>
                                <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Available</TableHead>
                                <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-right pr-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLawyers.map((l) => (
                                <TableRow key={l.id}
                                    className="hover:bg-slate-50/60 border-slate-100 transition-colors cursor-pointer"
                                    onClick={() =>
                                        navigate(`/admin/AdminLawyerDetailsPage/${l.user_id}`)
                                    }
                                >
                                    <TableCell className="font-medium text-sm text-slate-900 pl-5">{l.full_name}</TableCell>
                                    <TableCell className="text-slate-400 text-xs max-w-[180px] truncate">{l.email}</TableCell>
                                    <TableCell>{getStatusBadge(l.status)}</TableCell>
                                    <TableCell className="text-slate-600 text-xs">{l.experience_years || 0} yrs</TableCell>
                                    <TableCell className="text-slate-600 text-xs">₹{l.price_per_minute}/min</TableCell>
                                    <TableCell>
                                        <Badge className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${l.is_available ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {l.is_available ? 'Online' : 'Offline'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-5">
                                        <div className="flex items-center justify-end gap-0.5">
                                            {l.status === 'pending' && (<><ApproveBtn onClick={() => approveLawyer(l)} /><RejectBtn onClick={() => rejectLawyer(l)} /></>)}
                                            {l.status === 'rejected' && <ApproveBtn onClick={() => approveLawyer(l)} />}
                                            {l.status === 'approved' && <BanBtn onClick={() => rejectLawyer(l)} />}
                                            <EditBtn onClick={() => openLawyerEdit(l)} />
                                            <DeleteBtn onClick={() => deleteLawyer(l)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredLawyers.length === 0 && (
                                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm">No lawyers found</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>





            <Dialog open={lawyerEditOpen} onOpenChange={setLawyerEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Lawyer</DialogTitle></DialogHeader>
                    {/* Reuse the dialog form inputs from the original code here */}
                    <div className="space-y-4">
                        <Label>Bio</Label>
                        <Textarea value={editLawyerForm.bio || ''} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, bio: e.target.value })} />
                        {/* Add other fields... */}
                        <Button onClick={saveLawyerEdit}>Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminLawyerPage;