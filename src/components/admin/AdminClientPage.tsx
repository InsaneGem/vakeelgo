import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Edit, Trash2, Save } from 'lucide-react';
import AdminClientDetailsPage from "@/components/admin/AdminClientDetailsPage"


interface ClientProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    created_at: string;
    wallet_balance?: number;
    total_consultations?: number;
}

const AdminClientPage = () => {
    const { user, role, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
    const [clientEditOpen, setClientEditOpen] = useState(false);
    const [editClientForm, setEditClientForm] = useState<Partial<ClientProfile & { wallet_balance: number }>>({});

    useEffect(() => {
        if (!authLoading && (!user || role !== 'admin')) navigate('/login');
        fetchClients();
    }, [user, role, authLoading]);

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

    const EditBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick} className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-slate-700"><Edit className="h-3.5 w-3.5" /></Button>
    );
    const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
        <Button variant="ghost" size="sm" onClick={onClick} className="h-7 w-7 p-0 rounded-lg text-rose-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></Button>
    );

    const filteredClients = clients.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900">Manage Clients</h2>
                        <div className="relative w-full sm:w-52">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                            <Input placeholder="Search clients…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-9 text-xs" />
                        </div>
                    </div>

                    <div className="hidden lg:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-5">Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Wallet</TableHead>
                                    <TableHead>Sessions</TableHead>
                                    <TableHead className="text-right pr-5">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>

                                {filteredClients.map((client) => (
                                    <TableRow key={client.id}
                                        className="cursor-pointer hover:bg-slate-50 transition-colors" // Added cursor pointer
                                        // onClick={() => navigate(`/admin/AdminClientDetailsPage/${client.id}`)} // Added navigation
                                        onClick={() => navigate(`/admin/AdminClientDetailsPage/${client.id}`)}
                                    >
                                        <TableCell className="pl-5">{client.full_name}</TableCell>
                                        <TableCell>{client.email}</TableCell>
                                        <TableCell>{client.phone || '—'}</TableCell>
                                        <TableCell>₹{client.wallet_balance?.toFixed(2)}</TableCell>
                                        <TableCell>{client.total_consultations}</TableCell>
                                        <TableCell className="text-right pr-5">
                                            <EditBtn onClick={() => openClientEdit(client)} />
                                            <DeleteBtn onClick={() => deleteClient(client)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={clientEditOpen} onOpenChange={setClientEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Client</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Label>Full Name</Label>
                            <Input value={editClientForm.full_name || ''} onChange={(e) => setEditClientForm({ ...editClientForm, full_name: e.target.value })} />
                            <Label>Wallet Balance</Label>
                            <Input type="number" value={editClientForm.wallet_balance || 0} onChange={(e) => setEditClientForm({ ...editClientForm, wallet_balance: parseFloat(e.target.value) })} />
                        </div>
                        <DialogFooter>
                            <Button onClick={saveClientEdit}><Save className="mr-2 h-4 w-4" /> Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminClientPage;