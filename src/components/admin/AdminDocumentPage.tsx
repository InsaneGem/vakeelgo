import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    Search,
    Edit,
    Trash2,
    Save,
    Users,
    Wallet,
    Phone,
    Mail,
    Briefcase, ArrowLeft
} from 'lucide-react';
import AdminClientDetailsPage from "@/components/admin/AdminClientDetailsPage"
import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";


interface ClientProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    created_at: string;
    wallet_balance?: number;
    total_consultations?: number;
}

const AdminDocumentPage = () => {
    const { user, role, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
    const [clientEditOpen, setClientEditOpen] = useState(false);
    const [editClientForm, setEditClientForm] = useState<Partial<ClientProfile & { wallet_balance: number }>>({});
    const [clientFilter, setClientFilter] = useState("all");

    const filteredClients = clients.filter((client) => {
        const search = searchTerm.toLowerCase().trim();

        return (
            client.full_name?.toLowerCase().includes(search) ||
            client.email?.toLowerCase().includes(search) ||
            client.id?.toLowerCase().includes(search) ||
            client.phone?.toLowerCase().includes(search)
        );
    });

    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;
    useEffect(() => {
        if (!authLoading && (!user || role !== 'admin')) navigate('/login');
        fetchClients();
    }, [user, role, authLoading]);

    // Filter Logic
    const filteredClient = clients.filter((client) =>
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (clientFilter === 'all' || client.status === clientFilter)
    );

    // Pagination calculations
    const totalItems = filteredClients.length;

    const totalPages = Math.ceil(
        totalItems / itemsPerPage
    );

    const startIndex =
        (currentPage - 1) * itemsPerPage;

    const paginatedClient =
        filteredClients.slice(
            startIndex,
            startIndex + itemsPerPage
        );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, clientFilter]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data: clientRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'client');
            if (clientRoles) {
                const clientUserIds = clientRoles.map(r => r.user_id);
                const { data: clientProfiles } = await supabase.from('profiles').select('*').in('id', clientUserIds);
                const { data: wallets } = await supabase.from('wallets').select('user_id, balance').in('user_id', clientUserIds);
                const { data: consultationCounts } = await supabase.from('consultations').select('client_id').in('client_id', clientUserIds);

                setClients((clientProfiles || []).map(client => ({
                    ...client,
                    wallet_balance: wallets?.find(w => w.user_id === client.id)?.balance || 0,
                    total_consultations: consultationCounts?.filter(c => c.client_id === client.id).length || 0,
                })));
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const openClientEdit = (client: ClientProfile) => {
        setSelectedClient(client);
        setEditClientForm({ full_name: client.full_name, email: client.email, phone: client.phone || '', wallet_balance: client.wallet_balance || 0 });
        setClientEditOpen(true);
    };

    const saveClientEdit = async () => {
        if (!selectedClient) return;
        const { error: profileError } = await supabase.from('profiles').update({ full_name: editClientForm.full_name, phone: editClientForm.phone }).eq('id', selectedClient.id);
        const { error: walletError } = await supabase.from('wallets').update({ balance: editClientForm.wallet_balance }).eq('user_id', selectedClient.id);
        if (!profileError && !walletError) {
            toast({ title: 'Success', description: 'Client profile updated.' });
            fetchClients();
            setClientEditOpen(false);
        } else {
            toast({ title: 'Error', description: 'Failed to update client.', variant: 'destructive' });
        }
    };

    const deleteClient = async (client: ClientProfile) => {
        if (!confirm(`Are you sure you want to delete ${client.full_name}?`)) return;
        try {
            await supabase.from('user_roles').delete().eq('user_id', client.id);
            await supabase.from('wallets').delete().eq('user_id', client.id);
            await supabase.from('profiles').delete().eq('id', client.id);
            toast({ title: 'Success', description: 'Client deleted successfully.' });
            fetchClients();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };


    const EditBtn = ({
        onClick,
    }: {
        onClick: React.MouseEventHandler<HTMLButtonElement>;
    }) => (<Button variant="ghost" size="sm" onClick={onClick} className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-slate-700"><Edit className="h-3.5 w-3.5" /></Button>
    );


    const DeleteBtn = ({
        onClick,
    }: {
        onClick: React.MouseEventHandler<HTMLButtonElement>;
    }) => (<Button variant="ghost" size="sm" onClick={onClick} className="h-7 w-7 p-0 rounded-lg text-rose-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></Button>
    );


    const totalClients = clients.length;

    const totalWalletBalance = clients.reduce(
        (sum, client) => sum + (client.wallet_balance || 0),
        0
    );

    const totalConsultations = clients.reduce(
        (sum, client) => sum + (client.total_consultations || 0),
        0
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
                                Manage Clients
                            </h1>
                            <p className="text-slate-300 mt-2 text-sm md:text-base">
                                View, manage and monitor all registered clients
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-5 py-3 border border-white/10">
                                <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Total Clients</p>
                                <h3 className="text-2xl font-bold mt-0.5">{totalClients}</h3>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-5 py-3 border border-white/10">
                                <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Consulation</p>
                                <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">
                                    {totalConsultations}
                                </h3>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Search */}
                <Card className="rounded-3xl border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                            <Input
                                placeholder="Search by Name, Phone Number, Client ID..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                className="pl-10 h-11"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Combined Premium Table & Mobile Card Wrapper Component */}
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden transition-all duration-300">
                    {/* 1. MOBILE RESPONSIVE CARD VIEW (Up to md breakpoint) */}
                    <div className="block md:hidden divide-y divide-slate-100 bg-white">
                        {paginatedClient.map((client) => (
                            <div key={client.id}
                                onClick={() => navigate(`/admin/AdminClientDetailsPage/${client.id}`)}
                                className="flex flex-col gap-3 p-4 hover:bg-slate-50/60 active:bg-slate-100/40 transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-base text-slate-900 truncate tracking-tight">
                                            {client.full_name}
                                        </p>

                                        <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                                            {client.email}
                                        </p>

                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase shrink-0 border">
                                            {client.id}
                                        </span>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            DOB
                                        </p>
                                        <p className="text-xs font-semibold text-slate-700">
                                            {client.date_of_birth
                                                ? new Date(client.date_of_birth).toLocaleDateString()
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {client.phone || "N/A"}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">

                                            Total session : {client.total_consultations}
                                        </span>

                                    </div>
                                    {/* Event Propagation stops main row redirection */}
                                    <div
                                        className="flex items-center gap-0.5 shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <EditBtn
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openClientEdit(client);
                                            }}
                                        />

                                        <DeleteBtn
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteClient(client);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {paginatedClient.length === 0 && (

                            <div className="text-center py-16 text-slate-400 text-sm font-medium">
                                No Client match the filter configuration.
                            </div>

                        )}


                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto w-full">
                        <Table className="w-full border-collapse">

                            <TableHeader>
                                <TableRow className="bg-slate-50/70 border-b border-slate-100 hover:bg-slate-50/70">

                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-6">Name</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client ID</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Consulatation</TableHead>
                                    <TableHead className="h-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Management</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>

                                {paginatedClient.map((client) => (

                                    <TableRow
                                        key={client.id}
                                        className="group hover:bg-slate-50/40 border-b border-slate-100 last:border-none transition-all duration-150 cursor-pointer"
                                        onClick={() =>
                                            navigate(
                                                `/admin/AdminClientDetailsPage/${client.id}`
                                            )
                                        }
                                    >
                                        <TableCell className="font-semibold text-sm text-slate-900 py-4 pl-6 group-hover:text-indigo-600 transition-colors">
                                            {client.full_name}
                                        </TableCell>

                                        <TableCell className="text-slate-700 font-medium text-xs py-4">
                                            {client.id}
                                        </TableCell>

                                        <TableCell className="text-slate-500 text-xs font-medium max-w-[200px] truncate py-4">
                                            {client.email}
                                        </TableCell>

                                        <TableCell className="text-slate-700 font-medium text-xs py-4">
                                            {client.phone || "—"}
                                        </TableCell>



                                        <TableCell className="text-slate-700 font-medium text-xs py-4">
                                            {client.total_consultations}
                                        </TableCell>

                                        <TableCell className="text-right pr-6 py-4">
                                            <div className="flex items-center justify-end gap-0.5" >
                                                <EditBtn
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openClientEdit(client);
                                                    }}
                                                />

                                                <DeleteBtn
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteClient(client);
                                                    }}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginatedClient.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16 text-slate-400 text-sm font-medium">
                                            No Client match the filter configuration.
                                        </TableCell>
                                    </TableRow>
                                )}

                            </TableBody>

                        </Table>

                    </div>
                    {/* PREMIUM INTEGRATED PAGINATION TOOLBAR */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-t border-slate-100 w-full rounded-b-3xl">
                            <p className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
                                Showing <span className="text-slate-900">{startIndex + 1}</span> to{" "}
                                <span className="text-slate-900">
                                    {Math.min(startIndex + itemsPerPage, totalItems)}
                                </span>{" "}
                                of <span className="text-slate-900">{totalItems}</span> clients
                            </p>

                            <div className="flex items-center gap-1.5 order-1 sm:order-2">
                                <Button
                                    onClick={() =>
                                        setCurrentPage((p) => Math.max(p - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                    variant="outline"
                                    className="h-8 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-black disabled:opacity-40 font-semibold text-xs transition-all hover:bg-white active:scale-95"
                                >
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1 px-1">
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1
                                    ).map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`h-7 min-w-[28px] text-xs font-bold rounded-lg transition-all ${currentPage === pageNumber
                                                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-500/20"
                                                : "text-slate-600 hover:bg-slate-200/60"
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(p + 1, totalPages)
                                        )
                                    }
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


            </div>
        </AdminLayout>
    );
};

export default AdminDocumentPage;