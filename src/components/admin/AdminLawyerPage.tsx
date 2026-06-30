
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import {
    Briefcase, CheckCircle, XCircle, Clock, Ban, Edit, Trash2, Search, Shield, ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatLawyerName } from '@/lib/lawyer-utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    const openLawyerEdit = (lawyer: LawyerProfile) => {
        setSelectedLawyer(lawyer);
        setEditLawyerForm({
            bio: lawyer.bio || '',
            education: lawyer.education || '',
            bar_council_number: lawyer.bar_council_number || '',
            experience_years: lawyer.experience_years || 0,
            price_per_minute: lawyer.price_per_minute || 0,
            session_price: lawyer.session_price || 0,
            status: lawyer.status,
            is_available: lawyer.is_available,
            specializations: lawyer.specializations || [],
            languages: lawyer.languages || []
        });
        setLawyerEditOpen(true);
    };

    const saveLawyerEdit = async () => {
        if (!selectedLawyer) return;
        const { error } = await supabase.from('lawyer_profiles').update({
            bio: editLawyerForm.bio,
            education: editLawyerForm.education,
            bar_council_number: editLawyerForm.bar_council_number,
            experience_years: editLawyerForm.experience_years,
            price_per_minute: editLawyerForm.price_per_minute,
            session_price: editLawyerForm.session_price,
            status: editLawyerForm.status as any,
            is_available: editLawyerForm.is_available,
            specializations: editLawyerForm.specializations,
            languages: editLawyerForm.languages
        }).eq('id', selectedLawyer.id);

        if (!error) {
            toast({ title: 'Success', description: 'Lawyer profile updated.' });
            fetchLawyers();
            setLawyerEditOpen(false);
        } else {
            toast({ title: 'Error', description: 'Failed to update lawyer.', variant: 'destructive' });
        }
    };

    const approveLawyer = async (lawyer: LawyerProfile) => {
        const { error } = await supabase.from('lawyer_profiles').update({ status: 'approved' }).eq('id', lawyer.id);
        if (!error) {
            toast({ title: 'Lawyer Approved', description: `${lawyer.full_name} is now approved.` });
            fetchLawyers();
        } else {
            toast({ title: 'Error', description: 'Failed to approve lawyer.', variant: 'destructive' });
        }
    };

    const rejectLawyer = async (lawyer: LawyerProfile) => {
        const { error } = await supabase.from('lawyer_profiles').update({ status: 'rejected' }).eq('id', lawyer.id);
        if (!error) {
            toast({ title: 'Lawyer Rejected', description: `${lawyer.full_name} has been rejected.` });
            fetchLawyers();
        } else {
            toast({ title: 'Error', description: 'Failed to reject lawyer.', variant: 'destructive' });
        }
    };

    const deleteLawyer = async (lawyer: LawyerProfile) => {
        if (!confirm(`Are you sure you want to delete ${lawyer.full_name}?`)) return;
        const { error } = await supabase.from('lawyer_profiles').delete().eq('id', lawyer.id);
        if (!error) {
            toast({ title: 'Success', description: 'Lawyer deleted.' });
            fetchLawyers();
        }
    };

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm rounded-md px-2.5 py-0.5 font-semibold text-xs">Approved</Badge>;
            case 'pending': return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 shadow-sm rounded-md px-2.5 py-0.5 font-semibold text-xs">Pending</Badge>;
            case 'rejected': return <Badge className="bg-red-50 text-red-700 border border-red-200 shadow-sm rounded-md px-2.5 py-0.5 font-semibold text-xs">Rejected</Badge>;
            case 'suspended': return <Badge className="bg-orange-50 text-orange-700 border border-orange-200 shadow-sm rounded-md px-2.5 py-0.5 font-semibold text-xs">Suspended</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    // Filter Logic
    const filteredLawyers = lawyers.filter(l =>
        l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (lawyerFilter === 'all' || l.status === lawyerFilter)
    );

    // Pagination calculations
    const totalItems = filteredLawyers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLawyers = filteredLawyers.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 on search filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, lawyerFilter]);

    // Action button helper subcomponents
    const ApproveBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick}
            className="h-8 w-8 p-0 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200">
            <CheckCircle className="h-4 w-4" />
        </Button>
    );
    const RejectBtn = ({ onClick, title }: { onClick: () => void; title?: string }) => (
        <Button variant="ghost" size="sm" onClick={onClick} title={title}
            className="h-8 w-8 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
            <XCircle className="h-4 w-4" />
        </Button>
    );
    const BanBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick}
            className="h-8 w-8 p-0 rounded-xl text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200">
            <Ban className="h-4 w-4" />
        </Button>
    );
    const EditBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick}
            className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200">
            <Edit className="h-4 w-4" />
        </Button>
    );
    const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick}
            className="h-8 w-8 p-0 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200">
            <Trash2 className="h-4 w-4" />
        </Button>
    );

    return (
        <AdminLayout>
            <div className="p-3 md:p-6 space-y-6">

                {/* Top Premium Page Header Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white mb-6 shadow-xl shadow-indigo-950/20">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 h-40 w-40 bg-violet-500 rounded-full blur-3xl"></div>
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
                                Manage Lawyers
                            </h1>
                            <p className="text-slate-300 mt-2 text-sm md:text-base">
                                Monitor, approve, reject, edit and manage lawyer accounts.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-5 py-3 border border-white/10">
                                <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Total Lawyers</p>
                                <h3 className="text-2xl font-bold mt-0.5">{lawyers.length}</h3>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-5 py-3 border border-white/10">
                                <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Approved</p>
                                <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">
                                    {lawyers.filter(l => l.status === "approved").length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter controls */}
                <Card className="border border-slate-100 shadow-md shadow-slate-100/40 rounded-3xl mb-6 bg-white">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search lawyers by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                />
                            </div>

                            <Select value={lawyerFilter} onValueChange={setLawyerFilter}>
                                <SelectTrigger className="w-full md:w-[180px] h-11 rounded-xl border-slate-200 focus:ring-indigo-500">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Combined Premium Table & Mobile Card Wrapper Component */}
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden transition-all duration-300">

                    {/* 1. MOBILE RESPONSIVE CARD VIEW (Up to md breakpoint) */}
                    <div className="block md:hidden divide-y divide-slate-100 bg-white">
                        {paginatedLawyers.map((l) => (
                            <div
                                key={l.id}
                                onClick={() => navigate(`/admin/AdminLawyerDetailsPage/${l.user_id}`)}
                                className="flex flex-col gap-3 p-4 hover:bg-slate-50/60 active:bg-slate-100/40 transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-base text-slate-900 truncate tracking-tight">
                                            {l.full_name}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                                            {l.email}
                                        </p>
                                    </div>

                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase shrink-0 border ${l.is_available
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                        {l.is_available ? 'Online' : 'Offline'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {getStatusBadge(l.status)}
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {l.experience_years || 0} Yrs Exp
                                        </span>
                                    </div>

                                    {/* Event Propagation stops main row redirection */}
                                    <div
                                        className="flex items-center gap-0.5 shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {l.status === 'pending' && (
                                            <>
                                                <ApproveBtn onClick={() => approveLawyer(l)} />
                                                <RejectBtn onClick={() => rejectLawyer(l)} />
                                            </>
                                        )}
                                        {l.status === 'approved' && <BanBtn onClick={() => rejectLawyer(l)} />}
                                        {l.status === 'rejected' && <ApproveBtn onClick={() => approveLawyer(l)} />}
                                        <EditBtn onClick={() => openLawyerEdit(l)} />
                                        <DeleteBtn onClick={() => deleteLawyer(l)} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {paginatedLawyers.length === 0 && (
                            <div className="text-center py-16 text-slate-400 text-sm font-medium">
                                No lawyers found matching the layout filters.
                            </div>
                        )}
                    </div>

                    {/* 2. DESKTOP/TABLET TABLE VIEW (From md breakpoint and above) */}
                    <div className="hidden md:block overflow-x-auto w-full">
                        <Table className="w-full border-collapse">
                            <TableHeader>
                                <TableRow className="bg-slate-50/70 border-b border-slate-100 hover:bg-slate-50/70">
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-6">Name</TableHead>

                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lawyer ID</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verification Status</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Experience</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Availability</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Management</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedLawyers.map((l) => (
                                    <TableRow
                                        key={l.id}
                                        onClick={() => navigate(`/admin/AdminLawyerDetailsPage/${l.user_id}`)}
                                        className="group hover:bg-slate-50/40 border-b border-slate-100 last:border-none transition-all duration-150 cursor-pointer"
                                    >
                                        <TableCell className="font-semibold text-sm text-slate-900 py-4 pl-6 group-hover:text-indigo-600 transition-colors">
                                            {l.full_name}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs font-medium max-w-[200px] truncate py-4">
                                            {l.id}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs font-medium max-w-[200px] truncate py-4">
                                            {l.email}

                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getStatusBadge(l.status)}
                                        </TableCell>
                                        <TableCell className="text-slate-700 font-medium text-xs py-4">
                                            <span className="inline-flex items-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                                                {l.experience_years || 0} years
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border transition-all ${l.is_available
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                {l.is_available ? 'Online' : 'Offline'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <div
                                                className="flex items-center justify-end gap-0.5"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {l.status === 'pending' && (
                                                    <>
                                                        <ApproveBtn onClick={() => approveLawyer(l)} />
                                                        <RejectBtn onClick={() => rejectLawyer(l)} />
                                                    </>
                                                )}
                                                {l.status === 'rejected' && <ApproveBtn onClick={() => approveLawyer(l)} />}
                                                {l.status === 'approved' && <BanBtn onClick={() => rejectLawyer(l)} />}
                                                <EditBtn onClick={() => openLawyerEdit(l)} />
                                                <DeleteBtn onClick={() => deleteLawyer(l)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {paginatedLawyers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16 text-slate-400 text-sm font-medium">
                                            No lawyers match the filter configuration.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* 3. PREMIUM INTEGRATED PAGINATION TOOLBAR */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-t border-slate-100 w-full">
                            <p className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
                                Showing <span className="text-slate-900">{startIndex + 1}</span> to{' '}
                                <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
                                <span className="text-slate-900">{totalItems}</span> specialists
                            </p>

                            <div className="flex items-center gap-1.5 order-1 sm:order-2">
                                <Button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    variant="outline"
                                    className="h-8 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-black disabled:opacity-40 font-semibold text-xs transition-all hover:bg-white active:scale-95"
                                >
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1 px-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`h-7 min-w-[28px] text-xs font-bold rounded-lg transition-all ${currentPage === pageNumber
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-500/20'
                                                : 'text-slate-600 hover:bg-slate-200/60'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    variant="outline"
                                    className="h-8 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-black disabled:opacity-40 font-semibold text-xs transition-all hover:bg-white active:scale-95"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Drawer Dialog Box Wrapper */}
                <Dialog open={lawyerEditOpen} onOpenChange={setLawyerEditOpen}>
                    <DialogContent className="rounded-3xl max-w-md border border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-slate-900">Edit Lawyer Profile</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Biography Statement</Label>
                                <Textarea
                                    value={editLawyerForm.bio || ''}
                                    onChange={(e) => setEditLawyerForm({ ...editLawyerForm, bio: e.target.value })}
                                    className="rounded-xl border-slate-200 min-h-[100px] focus-visible:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Education Details</Label>
                                <Input
                                    value={editLawyerForm.education || ''}
                                    onChange={(e) => setEditLawyerForm({ ...editLawyerForm, education: e.target.value })}
                                    className="rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Exp. (Years)</Label>
                                    <Input
                                        type="number"
                                        value={editLawyerForm.experience_years || 0}
                                        onChange={(e) => setEditLawyerForm({ ...editLawyerForm, experience_years: parseInt(e.target.value) || 0 })}
                                        className="rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Bar Council ID</Label>
                                    <Input
                                        value={editLawyerForm.bar_council_number || ''}
                                        onChange={(e) => setEditLawyerForm({ ...editLawyerForm, bar_council_number: e.target.value })}
                                        className="rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={saveLawyerEdit}
                                className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/10 hover:opacity-95 mt-2"
                            >
                                Save Profile Changes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

        </AdminLayout>
    );
};

export default AdminLawyerPage;