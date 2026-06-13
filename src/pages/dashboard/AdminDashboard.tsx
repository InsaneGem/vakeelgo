

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Briefcase, TrendingUp, CheckCircle, XCircle, Clock, Shield, Eye,
  GraduationCap, Languages, DollarSign, Search, Edit, Ban, UserCheck,
  MessageSquare, Calendar, Wallet, Save, CreditCard, ArrowDownUp, Trash2, FileText
} from 'lucide-react';
import { DocumentVerification } from '@/components/admin/DocumentVerification';
import { Skeleton } from '@/components/ui/skeleton';
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
import { LawyerVerificationPanel } from '@/components/admin/LawyerVerificationPanel';
import { AdminLayout } from '@/components/layout/AdminLayout';

// ─── Interfaces (unchanged) ────────────────────────────────────────────────────
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

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  wallet_balance?: number;
  total_consultations?: number;
}

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

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
  user_name?: string;
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  bank_details: any;
  created_at: string;
  user_name?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── State (unchanged) ──────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalClients: 0, totalLawyers: 0, pendingLawyers: 0, totalConsultations: 0, totalRevenue: 0 });
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const [lawyerEditOpen, setLawyerEditOpen] = useState(false);
  const [clientEditOpen, setClientEditOpen] = useState(false);
  const [consultationEditOpen, setConsultationEditOpen] = useState(false);

  const [editLawyerForm, setEditLawyerForm] = useState<Partial<LawyerProfile>>({});
  const [editClientForm, setEditClientForm] = useState<Partial<ClientProfile & { wallet_balance: number }>>({});
  const [editConsultationForm, setEditConsultationForm] = useState<Partial<Consultation>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [lawyerFilter, setLawyerFilter] = useState<string>('all');

  // ── Effects (unchanged) ────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading) {
      if (!user) { navigate('/login'); return; }
      if (role !== 'admin') { navigate('/dashboard'); return; }
      fetchDashboardData();
    }
  }, [user, role, authLoading]);

  useEffect(() => {
    if (!user || role !== 'admin') return;
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { fetchDashboardData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lawyer_profiles' }, () => { fetchDashboardData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => { fetchDashboardData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => { fetchDashboardData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => { fetchDashboardData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, () => { fetchDashboardData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => { fetchDashboardData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, role]);

  // ── Data fetching (unchanged) ──────────────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      const [clientsRes, lawyersRes, pendingRes, consultationsRes] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('lawyer_profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('lawyer_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('consultations').select('*', { count: 'exact', head: true }),
      ]);
      const { data: revenueData } = await supabase.from('consultations').select('commission_amount').eq('status', 'completed');
      const totalRevenue = revenueData?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
      setStats({ totalClients: clientsRes.count || 0, totalLawyers: lawyersRes.count || 0, pendingLawyers: pendingRes.count || 0, totalConsultations: consultationsRes.count || 0, totalRevenue });

      const { data: lawyersData } = await supabase.from('lawyer_profiles').select('*').order('created_at', { ascending: false });
      if (lawyersData) {
        const userIds = lawyersData.map(l => l.user_id);
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
        setLawyers(lawyersData.map(lawyer => {
          const profile = profiles?.find(p => p.id === lawyer.user_id);
          return { ...lawyer, full_name: formatLawyerName(profile?.full_name, 'Unknown'), email: profile?.email || 'N/A' };
        }));
      }

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

      const { data: consultationsData } = await supabase.from('consultations').select('*').order('created_at', { ascending: false }).limit(100);
      if (consultationsData) {
        const allUserIds = [...new Set([...consultationsData.map(c => c.client_id), ...consultationsData.map(c => c.lawyer_id)])];
        const { data: allProfiles } = await supabase.from('profiles').select('id, full_name').in('id', allUserIds);
        setConsultations(consultationsData.map(consultation => ({
          ...consultation,
          client_name: allProfiles?.find(p => p.id === consultation.client_id)?.full_name || 'Unknown',
          lawyer_name: formatLawyerName(allProfiles?.find(p => p.id === consultation.lawyer_id)?.full_name, 'Unknown'),
        })));
      }

      const { data: transactionsData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100);
      if (transactionsData) {
        const txUserIds = [...new Set(transactionsData.map(t => t.user_id))];
        const { data: txProfiles } = await supabase.from('profiles').select('id, full_name').in('id', txUserIds);
        setTransactions(transactionsData.map(tx => ({ ...tx, user_name: txProfiles?.find(p => p.id === tx.user_id)?.full_name || 'Unknown' })));
      }

      const { data: withdrawalsData } = await supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false }).limit(100);
      if (withdrawalsData) {
        const wdUserIds = [...new Set(withdrawalsData.map(w => w.user_id))];
        const { data: wdProfiles } = await supabase.from('profiles').select('id, full_name').in('id', wdUserIds);
        setWithdrawals(withdrawalsData.map(wd => ({ ...wd, user_name: wdProfiles?.find(p => p.id === wd.user_id)?.full_name || 'Unknown' })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Mutations (unchanged) ──────────────────────────────────────────────────
  const openLawyerEdit = (lawyer: LawyerProfile) => {
    setSelectedLawyer(lawyer);
    setEditLawyerForm({ bio: lawyer.bio || '', education: lawyer.education || '', bar_council_number: lawyer.bar_council_number || '', experience_years: lawyer.experience_years || 0, price_per_minute: lawyer.price_per_minute || 0, session_price: lawyer.session_price || 0, status: lawyer.status, is_available: lawyer.is_available, specializations: lawyer.specializations || [], languages: lawyer.languages || [] });
    setLawyerEditOpen(true);
  };

  const saveLawyerEdit = async () => {
    if (!selectedLawyer) return;
    const { error } = await supabase.from('lawyer_profiles').update({ bio: editLawyerForm.bio, education: editLawyerForm.education, bar_council_number: editLawyerForm.bar_council_number, experience_years: editLawyerForm.experience_years, price_per_minute: editLawyerForm.price_per_minute, session_price: editLawyerForm.session_price, status: editLawyerForm.status as any, is_available: editLawyerForm.is_available, specializations: editLawyerForm.specializations, languages: editLawyerForm.languages }).eq('id', selectedLawyer.id);
    if (!error) { toast({ title: 'Success', description: 'Lawyer profile updated.' }); fetchDashboardData(); setLawyerEditOpen(false); }
    else { toast({ title: 'Error', description: 'Failed to update lawyer.', variant: 'destructive' }); }
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
    if (!profileError && !walletError) { toast({ title: 'Success', description: 'Client profile updated.' }); fetchDashboardData(); setClientEditOpen(false); }
    else { toast({ title: 'Error', description: 'Failed to update client.', variant: 'destructive' }); }
  };

  const openConsultationEdit = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setEditConsultationForm({ status: consultation.status, total_amount: consultation.total_amount, commission_amount: consultation.commission_amount, lawyer_amount: consultation.lawyer_amount, notes: consultation.notes || '' });
    setConsultationEditOpen(true);
  };

  const saveConsultationEdit = async () => {
    if (!selectedConsultation) return;
    const { error } = await supabase.from('consultations').update({ status: editConsultationForm.status as any, total_amount: editConsultationForm.total_amount, commission_amount: editConsultationForm.commission_amount, lawyer_amount: editConsultationForm.lawyer_amount, notes: editConsultationForm.notes }).eq('id', selectedConsultation.id);
    if (!error) { toast({ title: 'Success', description: 'Consultation updated.' }); fetchDashboardData(); setConsultationEditOpen(false); }
    else { toast({ title: 'Error', description: 'Failed to update consultation.', variant: 'destructive' }); }
  };

  const updateWithdrawalStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('withdrawal_requests').update({ status, processed_at: new Date().toISOString() }).eq('id', id);
    if (!error) { toast({ title: 'Success', description: `Withdrawal ${status}.` }); fetchDashboardData(); }
    else { toast({ title: 'Error', description: 'Failed to update withdrawal.', variant: 'destructive' }); }
  };

  const approveLawyer = async (lawyer: LawyerProfile) => {
    const { error } = await supabase.from('lawyer_profiles').update({ status: 'approved' }).eq('id', lawyer.id);
    if (!error) { toast({ title: 'Lawyer Approved', description: `${lawyer.full_name} is now approved and visible to clients.` }); fetchDashboardData(); }
    else { toast({ title: 'Error', description: 'Failed to approve lawyer.', variant: 'destructive' }); }
  };

  const rejectLawyer = async (lawyer: LawyerProfile) => {
    const { error } = await supabase.from('lawyer_profiles').update({ status: 'rejected' }).eq('id', lawyer.id);
    if (!error) { toast({ title: 'Lawyer Rejected', description: `${lawyer.full_name} has been rejected.` }); fetchDashboardData(); }
    else { toast({ title: 'Error', description: 'Failed to reject lawyer.', variant: 'destructive' }); }
  };

  const deleteLawyer = async (lawyer: LawyerProfile) => {
    if (!confirm(`Are you sure you want to delete lawyer ${lawyer.full_name}? This will also delete their profile and role.`)) return;
    try {
      const { error: lawyerError } = await supabase.from('lawyer_profiles').delete().eq('id', lawyer.id);
      if (lawyerError) throw lawyerError;
      const { error: roleError } = await supabase.from('user_roles').delete().eq('user_id', lawyer.user_id);
      if (roleError) throw roleError;
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', lawyer.user_id);
      if (profileError) throw profileError;
      await supabase.from('wallets').delete().eq('user_id', lawyer.user_id);
      toast({ title: 'Success', description: 'Lawyer deleted successfully.' });
      fetchDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete lawyer.', variant: 'destructive' });
    }
  };

  const deleteClient = async (client: ClientProfile) => {
    if (!confirm(`Are you sure you want to delete client ${client.full_name}? This will also delete their profile and wallet.`)) return;
    try {
      const { error: roleError } = await supabase.from('user_roles').delete().eq('user_id', client.id);
      if (roleError) throw roleError;
      await supabase.from('wallets').delete().eq('user_id', client.id);
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', client.id);
      if (profileError) throw profileError;
      toast({ title: 'Success', description: 'Client deleted successfully.' });
      fetchDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete client.', variant: 'destructive' });
    }
  };

  // ── Badge helpers (unchanged logic, refined classes) ───────────────────────
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Approved</Badge>;
      case 'pending': return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Pending</Badge>;
      case 'rejected': return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Rejected</Badge>;
      case 'suspended': return <Badge className="bg-slate-100 text-slate-600 border border-slate-200 font-medium text-[11px] px-2 py-0.5 rounded-full">Suspended</Badge>;
      default: return <Badge variant="outline" className="text-[11px] px-2 py-0.5 rounded-full">Unknown</Badge>;
    }
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

  // ── Filtered lists (unchanged) ─────────────────────────────────────────────
  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || lawyer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = lawyerFilter === 'all' || lawyer.status === lawyerFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-slate-50/60 px-3 py-6 sm:px-6 lg:px-8">
          <div className="max-w-screen-xl mx-auto space-y-6">
            <Skeleton className="h-10 w-56 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50/70">
        <div className="max-w-screen-xl mx-auto px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-9">

          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-slate-900 shadow-sm flex-shrink-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg sm:text-2xl text-slate-900 tracking-tight leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">Full control over platform data</p>
            </div>
          </div>

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-6">
            {[
              { label: 'Clients', value: stats.totalClients, icon: Users, color: 'text-violet-500', bg: 'bg-violet-50', path: '/admin/clientPage' },
              { label: 'Lawyers', value: stats.totalLawyers, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50', path: '/admin/lawyerPage' },
              { label: 'Verification', value: stats.totalVerificationRequests, icon: Users, color: 'text-violet-500', bg: 'bg-violet-50', path: '/admin/lawyerverificationPage' },
              { label: 'Pending', value: stats.pendingLawyers, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Consultations', value: stats.totalConsultations, icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-50', path: '/admin/consultationPage' },
              { label: 'Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'text-green-500', bg: 'bg-green-50', path: '/admin/documentverificationPage' },
              { label: 'Client/Lawyer Transactions', value: stats.totalTransaction, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50', path: '/admin/AdminClientLawyerTransactionPage' },
            ].map(({ label, value, icon: Icon, color, bg, path }) => (
              <div key={label}
                onClick={path ? () => navigate(path) : undefined}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-2 hover:shadow-md transition-shadow">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wide truncate">{label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{value}</p>
                </div>
                <div className={`flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="verification" className="space-y-4">
            {/* Tab list — horizontally scrollable on mobile */}
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-px">
              <TabsList className="inline-flex w-max sm:w-full gap-0.5 bg-white border border-slate-100 shadow-sm rounded-xl p-1 min-w-full">
                {[
                  { value: 'verification', icon: Shield, label: 'Verification' },
                  { value: 'lawyers', icon: Briefcase, label: 'Lawyers' },
                  { value: 'clients', icon: Users, label: 'Clients' },
                  { value: 'documents', icon: FileText, label: 'Documents' },
                  { value: 'consultations', icon: MessageSquare, label: 'Sessions' },
                  { value: 'transactions', icon: CreditCard, label: 'Transactions' },
                  { value: 'withdrawals', icon: ArrowDownUp, label: 'Withdrawals' },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger key={value} value={value}
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap flex-1 justify-center
                               data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm
                               text-slate-500 hover:text-slate-700 transition-all">
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    <span className="hidden xs:inline sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ── Verification tab ── */}
            <TabsContent value="verification">
              <LawyerVerificationPanel onRefresh={fetchDashboardData} />
            </TabsContent>

            {/* ── Lawyers tab ── */}
            <TabsContent value="lawyers">
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
                  {filteredLawyers.map((lawyer) => (
                    <div key={lawyer.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-slate-900 truncate">{lawyer.full_name}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{lawyer.email}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {getStatusBadge(lawyer.status)}
                          <span className="text-[11px] text-slate-400">{lawyer.experience_years || 0} yrs</span>
                          <span className="text-[11px] text-slate-400">₹{lawyer.price_per_minute}/min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {lawyer.status === 'pending' && (<><ApproveBtn onClick={() => approveLawyer(lawyer)} /><RejectBtn onClick={() => rejectLawyer(lawyer)} /></>)}
                        {lawyer.status === 'approved' && <BanBtn onClick={() => rejectLawyer(lawyer)} />}
                        {lawyer.status === 'rejected' && <ApproveBtn onClick={() => approveLawyer(lawyer)} />}
                        <EditBtn onClick={() => openLawyerEdit(lawyer)} />
                        <DeleteBtn onClick={() => deleteLawyer(lawyer)} />
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
                      {filteredLawyers.map((lawyer) => (
                        <TableRow key={lawyer.id} className="hover:bg-slate-50/60 border-slate-100 transition-colors">
                          <TableCell className="font-medium text-sm text-slate-900 pl-5">{lawyer.full_name}</TableCell>
                          <TableCell className="text-slate-400 text-xs max-w-[180px] truncate">{lawyer.email}</TableCell>
                          <TableCell>{getStatusBadge(lawyer.status)}</TableCell>
                          <TableCell className="text-slate-600 text-xs">{lawyer.experience_years || 0} yrs</TableCell>
                          <TableCell className="text-slate-600 text-xs">₹{lawyer.price_per_minute}/min</TableCell>
                          <TableCell>
                            <Badge className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${lawyer.is_available ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {lawyer.is_available ? 'Online' : 'Offline'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-5">
                            <div className="flex items-center justify-end gap-0.5">
                              {lawyer.status === 'pending' && (<><ApproveBtn onClick={() => approveLawyer(lawyer)} /><RejectBtn onClick={() => rejectLawyer(lawyer)} /></>)}
                              {lawyer.status === 'rejected' && <ApproveBtn onClick={() => approveLawyer(lawyer)} />}
                              {lawyer.status === 'approved' && <BanBtn onClick={() => rejectLawyer(lawyer)} />}
                              <EditBtn onClick={() => openLawyerEdit(lawyer)} />
                              <DeleteBtn onClick={() => deleteLawyer(lawyer)} />
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
            </TabsContent>

            {/* ── Clients tab ── */}


            {/* ── Documents tab ── */}
            <TabsContent value="documents">
              <DocumentVerification />
            </TabsContent>

            {/* ── Consultations tab ── */}
            <TabsContent value="consultations">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-4 sm:px-5 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900 text-sm sm:text-base">All Consultations</h2>
                </div>

                {/* Mobile cards */}
                <div className="block lg:hidden divide-y divide-slate-50">
                  {consultations.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-slate-900 truncate">{c.client_name} → {c.lawyer_name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{c.type} · {new Date(c.created_at).toLocaleDateString()}</p>
                        <div className="mt-1.5">{getConsultationStatusBadge(c.status)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="font-semibold text-sm text-slate-900">₹{c.total_amount?.toFixed(2) || '0.00'}</span>
                        <EditBtn onClick={() => openConsultationEdit(c)} />
                      </div>
                    </div>
                  ))}
                  {consultations.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">No consultations found</div>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
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
                </div>
              </div>
            </TabsContent>

            {/* ── Transactions tab ── */}
            <TabsContent value="transactions">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-4 sm:px-5 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900 text-sm sm:text-base">All Transactions</h2>
                </div>

                {/* Mobile cards */}
                <div className="block lg:hidden divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-slate-900 truncate">{tx.user_name}</p>
                        <p className="text-[11px] text-slate-400 capitalize mt-0.5">{tx.type.replace('_', ' ')}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{tx.description || '—'}</p>
                      </div>
                      <span className={`font-semibold text-sm flex-shrink-0 ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">No transactions found</div>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        {['User', 'Type', 'Amount', 'Description', 'Date'].map((h, i) => (
                          <TableHead key={h} className={`text-[11px] font-semibold text-slate-500 uppercase tracking-wide ${i === 0 ? 'pl-5' : ''}`}>{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-slate-50/60 border-slate-100 transition-colors">
                          <TableCell className="font-medium text-sm text-slate-900 pl-5">{tx.user_name}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize text-[11px] px-2 py-0.5 rounded-full border-slate-200 text-slate-600">{tx.type.replace('_', ' ')}</Badge></TableCell>
                          <TableCell className={`font-semibold text-sm ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-slate-400 text-xs max-w-[200px] truncate">{tx.description || '—'}</TableCell>
                          <TableCell className="text-slate-400 text-xs">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 text-sm">No transactions found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* ── Withdrawals tab ── */}
            <TabsContent value="withdrawals">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-4 sm:px-5 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Withdrawal Requests</h2>
                </div>

                {/* Mobile cards */}
                <div className="block lg:hidden divide-y divide-slate-50">
                  {withdrawals.map((wd) => (
                    <div key={wd.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-slate-900 truncate">{wd.user_name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(wd.created_at).toLocaleDateString()}</p>
                        <div className="mt-1.5">{getStatusBadge(wd.status)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="font-semibold text-sm text-slate-900">₹{wd.amount.toFixed(2)}</span>
                        {wd.status === 'pending' && (
                          <div className="flex gap-0.5">
                            <ApproveBtn onClick={() => updateWithdrawalStatus(wd.id, 'approved')} />
                            <RejectBtn onClick={() => updateWithdrawalStatus(wd.id, 'rejected')} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {withdrawals.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">No withdrawal requests</div>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        {['User', 'Amount', 'Status', 'Requested', 'Actions'].map((h, i) => (
                          <TableHead key={h} className={`text-[11px] font-semibold text-slate-500 uppercase tracking-wide ${i === 0 ? 'pl-5' : ''} ${h === 'Actions' ? 'text-right pr-5' : ''}`}>{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((wd) => (
                        <TableRow key={wd.id} className="hover:bg-slate-50/60 border-slate-100 transition-colors">
                          <TableCell className="font-medium text-sm text-slate-900 pl-5">{wd.user_name}</TableCell>
                          <TableCell className="font-semibold text-sm text-slate-800">₹{wd.amount.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(wd.status)}</TableCell>
                          <TableCell className="text-slate-400 text-xs">{new Date(wd.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right pr-5">
                            {wd.status === 'pending' && (
                              <div className="flex justify-end gap-0.5">
                                <ApproveBtn onClick={() => updateWithdrawalStatus(wd.id, 'approved')} />
                                <RejectBtn onClick={() => updateWithdrawalStatus(wd.id, 'rejected')} />
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {withdrawals.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 text-sm">No withdrawal requests</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Lawyer Edit Dialog ── */}
      <Dialog open={lawyerEditOpen} onOpenChange={setLawyerEditOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-900">Edit Lawyer</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">{selectedLawyer?.full_name} · {selectedLawyer?.email}</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Status</Label>
                <Select value={editLawyerForm.status || ''} onValueChange={(v) => setEditLawyerForm({ ...editLawyerForm, status: v })}>
                  <SelectTrigger className="h-9 text-sm rounded-lg border-slate-200"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {['pending', 'approved', 'rejected', 'suspended'].map(s => <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Availability</Label>
                <Select value={editLawyerForm.is_available ? 'online' : 'offline'} onValueChange={(v) => setEditLawyerForm({ ...editLawyerForm, is_available: v === 'online' })}>
                  <SelectTrigger className="h-9 text-sm rounded-lg border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Bio</Label>
              <Textarea value={editLawyerForm.bio || ''} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, bio: e.target.value })} rows={3} className="text-sm rounded-lg border-slate-200 resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Education</Label>
                <Input value={editLawyerForm.education || ''} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, education: e.target.value })} className="h-9 text-sm rounded-lg border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Bar Council Number</Label>
                <Input value={editLawyerForm.bar_council_number || ''} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, bar_council_number: e.target.value })} className="h-9 text-sm rounded-lg border-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Experience (yrs)</Label>
                <Input type="number" value={editLawyerForm.experience_years || 0} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, experience_years: parseInt(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Price/Min (₹)</Label>
                <Input type="number" step="0.01" value={editLawyerForm.price_per_minute || 0} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, price_per_minute: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Session (₹)</Label>
                <Input type="number" step="0.01" value={editLawyerForm.session_price || 0} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, session_price: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Specializations (comma-separated)</Label>
              <Input value={editLawyerForm.specializations?.join(', ') || ''} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, specializations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="h-9 text-sm rounded-lg border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Languages (comma-separated)</Label>
              <Input value={editLawyerForm.languages?.join(', ') || ''} onChange={(e) => setEditLawyerForm({ ...editLawyerForm, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="h-9 text-sm rounded-lg border-slate-200" />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 gap-2">
            <Button variant="outline" onClick={() => setLawyerEditOpen(false)} className="h-9 text-sm rounded-lg border-slate-200">Cancel</Button>
            <Button onClick={saveLawyerEdit} className="h-9 text-sm rounded-lg bg-slate-900 hover:bg-slate-800 gap-1.5">
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Client Edit Dialog ── */}
      <Dialog open={clientEditOpen} onOpenChange={setClientEditOpen}>
        <DialogContent className="rounded-2xl p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-900">Edit Client</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">{selectedClient?.full_name} · {selectedClient?.email}</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Full Name</Label>
              <Input value={editClientForm.full_name || ''} onChange={(e) => setEditClientForm({ ...editClientForm, full_name: e.target.value })} className="h-9 text-sm rounded-lg border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Phone</Label>
              <Input value={editClientForm.phone || ''} onChange={(e) => setEditClientForm({ ...editClientForm, phone: e.target.value })} className="h-9 text-sm rounded-lg border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Wallet Balance (₹)</Label>
              <Input type="number" step="0.01" value={editClientForm.wallet_balance || 0} onChange={(e) => setEditClientForm({ ...editClientForm, wallet_balance: parseFloat(e.target.value) || 0 })} className="h-9 text-sm rounded-lg border-slate-200" />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 gap-2">
            <Button variant="outline" onClick={() => setClientEditOpen(false)} className="h-9 text-sm rounded-lg border-slate-200">Cancel</Button>
            <Button onClick={saveClientEdit} className="h-9 text-sm rounded-lg bg-slate-900 hover:bg-slate-800 gap-1.5">
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Consultation Edit Dialog ── */}
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
    </AdminLayout>
  );
};

export default AdminDashboard;
