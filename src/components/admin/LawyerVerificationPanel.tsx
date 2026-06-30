import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield, Clock, XCircle, CheckCircle, User, GraduationCap,
  Briefcase, Languages, DollarSign, Mail, Phone, Calendar,
  Eye, Edit, AlertTriangle, Search, Filter, RefreshCw, Loader2,
  FileText, Award, ChevronLeft, ChevronRight, Star, TrendingUp,
  Users, BarChart3, Sparkles, ArrowLeft, IndianRupee, Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  phone?: string;
  avatar_url?: string;
}

interface LawyerVerificationPanelProps {
  onRefresh?: () => void;
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-100',
    dot: 'bg-emerald-500',
    row: '',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    pill: 'bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-100',
    dot: 'bg-red-500',
    row: '',
  },
  suspended: {
    label: 'Suspended',
    icon: AlertTriangle,
    pill: 'bg-orange-50 text-orange-700 border border-orange-200 ring-1 ring-orange-100',
    dot: 'bg-orange-500',
    row: '',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    pill: 'bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100',
    dot: 'bg-amber-400',
    row: '',
  },
} as const;

const getStatusConfig = (status: string | null) =>
  STATUS_CONFIG[(status as keyof typeof STATUS_CONFIG) ?? 'pending'] ?? STATUS_CONFIG.pending;

function StatusPill({ status }: { status: string | null }) {
  const cfg = getStatusConfig(status);
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-1 py-0 rounded-full text-xs font-semibold tracking-wide', cfg.pill)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ─── Stat card for header ─────────────────────────────────────────────────────
function StatChip({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl px-4 py-2.5 min-w-[72px]', color)}>
      <span className="text-xl font-bold leading-none">{count}</span>
      <span className="text-[10px] font-medium uppercase tracking-widest mt-0.5 opacity-75">{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const LawyerVerificationPanel = ({ onRefresh }: LawyerVerificationPanelProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LawyerProfile>>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchLawyers();
    const channel = supabase
      .channel('lawyer-verification-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lawyer_profiles' }, (payload) => {
        console.log('Lawyer profile changed:', payload);
        fetchLawyers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, lawyers]);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const fetchLawyers = async () => {
    setRefreshing(true);
    try {
      const { data: lawyersData, error } = await supabase
        .from('lawyer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (lawyersData) {
        const userIds = lawyersData.map(l => l.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, avatar_url')
          .in('id', userIds);

        const enrichedLawyers = lawyersData.map(lawyer => {
          const profile = profiles?.find(p => p.id === lawyer.user_id);
          return {
            ...lawyer,
            full_name: profile?.full_name || 'Unknown',
            email: profile?.email || 'N/A',
            phone: profile?.phone || null,
            avatar_url: profile?.avatar_url || null,
          };
        });
        setLawyers(enrichedLawyers);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handleApprove = async (lawyer: LawyerProfile) => {
    const { error } = await supabase
      .from('lawyer_profiles')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', lawyer.id);

    if (!error) {
      toast({
        title: '✅ Lawyer Approved',
        description: `${lawyer.full_name} is now verified and can accept clients.`,
      });
      fetchLawyers();
      onRefresh?.();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve lawyer.' });
    }
  };

  const handleReject = async (lawyer: LawyerProfile) => {
    const { error } = await supabase
      .from('lawyer_profiles')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', lawyer.id);

    if (!error) {
      toast({
        title: '❌ Lawyer Rejected',
        description: `${lawyer.full_name}'s application has been rejected.`,
      });
      fetchLawyers();
      onRefresh?.();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject lawyer.' });
    }
  };

  const handleSuspend = async (lawyer: LawyerProfile) => {
    const { error } = await supabase
      .from('lawyer_profiles')
      .update({ status: 'suspended', is_available: false, updated_at: new Date().toISOString() })
      .eq('id', lawyer.id);

    if (!error) {
      toast({
        title: '⚠️ Lawyer Suspended',
        description: `${lawyer.full_name} has been suspended.`,
      });
      fetchLawyers();
      onRefresh?.();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to suspend lawyer.' });
    }
  };

  const openDetails = (lawyer: LawyerProfile) => {
    setSelectedLawyer(lawyer);
    setEditForm({
      bio: lawyer.bio || '',
      education: lawyer.education || '',
      bar_council_number: lawyer.bar_council_number || '',
      experience_years: lawyer.experience_years || 0,
      price_per_minute: lawyer.price_per_minute || 5,
      session_price: lawyer.session_price || 100,
      status: lawyer.status,
      specializations: lawyer.specializations || [],
      languages: lawyer.languages || [],
    });
    setDetailsOpen(true);
    setEditMode(false);
  };

  const saveEdit = async () => {
    if (!selectedLawyer) return;
    setSaving(true);

    const { error } = await supabase
      .from('lawyer_profiles')
      .update({
        bio: editForm.bio,
        education: editForm.education,
        bar_council_number: editForm.bar_council_number,
        experience_years: editForm.experience_years,
        price_per_minute: editForm.price_per_minute,
        session_price: editForm.session_price,
        status: editForm.status as any,
        specializations: editForm.specializations,
        languages: editForm.languages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedLawyer.id);

    if (!error) {
      toast({ title: '✅ Profile Updated', description: 'Lawyer profile has been updated.' });
      fetchLawyers();
      setEditMode(false);
      onRefresh?.();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
    }
    setSaving(false);
  };

  // ── Derived data ──────────────────────────────────────────────────────────────
  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch =
      lawyer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.bar_council_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lawyer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLawyers.length / PAGE_SIZE));
  const displayedLawyers = filteredLawyers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = lawyers.filter(l => l.status === 'pending').length;
  const approvedCount = lawyers.filter(l => l.status === 'approved').length;
  const suspendedCount = lawyers.filter(l => l.status === 'suspended').length;

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-56 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Panel ────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-7 py-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-blue-500 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-indigo-500 blur-3xl" />
          </div>
          {/* subtle grid texture */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" />

          {/* ── Fixed Control Row to prevent absolute overlap ── */}
          <div className="relative flex items-center justify-between w-full mb-4 z-50">
            <button
              onClick={() => navigate(-1)}
              className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>


            <button
              onClick={fetchLawyers}
              disabled={refreshing}
              className={cn(
                'absolute top-0 right-0 sm:-top-1 sm:right-0 h-9 w-9 rounded-xl bg-white/10 border border-white/20',
                'flex items-center justify-center',
                'hover:bg-white/20 transition-colors disabled:opacity-50'
              )}
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4 text-white', refreshing && 'animate-spin')} />
            </button>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Title block */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold tracking-tight text-white">Lawyer Verification</h2>
                  {pendingCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950">
                      <Sparkles className="h-2.5 w-2.5" />
                      {pendingCount} needs review
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-0.5">Review, verify and manage lawyer applications</p>
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <StatChip count={approvedCount} label="Active" color="bg-emerald-500/15 text-emerald-300" />
              <StatChip count={pendingCount} label="Pending" color="bg-amber-500/15 text-amber-300" />
              <StatChip count={suspendedCount} label="Suspended" color="bg-orange-500/15 text-orange-300" />
            </div>
          </div>

          {/* ── Search + Filter bar ──────────────────────────────────────────── */}
          <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-2.5 mt-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email or bar number…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full h-10 rounded-xl bg-white/10 border border-white/20 pl-9 pr-4 text-sm text-white placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all'
                )}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:ring-2 focus:ring-white/30">
                <Filter className="h-3.5 w-3.5 mr-1.5 opacity-60" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6">
          {filteredLawyers.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No lawyers found</p>
              <p className="text-slate-400 text-sm mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'New applications will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {displayedLawyers.map((lawyer) => {
                return (
                  <div
                    key={lawyer.id}
                    className={cn(
                      'group relative rounded-xl border border-slate-200 bg-white hover:border-slate-300',
                      'shadow-sm hover:shadow-md transition-all duration-200',
                      lawyer.status === 'pending' && 'bg-amber-50/30'
                    )}
                  >
                    <div className="p-4 md:p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* ── Avatar + Info ──────────────────────────────── */}
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-white shadow-sm">
                              <AvatarImage src={lawyer.avatar_url || ''} className="object-cover" />
                              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold text-lg">
                                {lawyer.full_name?.charAt(0) || 'L'}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online dot */}
                            {lawyer.is_available && (
                              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Name + status */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-base tracking-tight truncate max-w-[200px] sm:max-w-xs">
                                {lawyer.full_name}
                              </h3>
                              <StatusPill status={lawyer.status} />
                            </div>

                            {/* Essential metadata grids */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5 truncate">
                                <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                {lawyer.email}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                Bar No: <span className="font-mono text-slate-700 font-semibold">{lawyer.bar_council_number || 'N/A'}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                Exp: <span className="text-slate-700 font-semibold">{lawyer.experience_years ?? 0} Years</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                ID: <span className="text-slate-700 font-semibold">{lawyer.id}</span>

                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ── Action buttons ─────────────────────────────── */}
                        <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:items-center">
                          {/* View Detail Trigger */}
                          <button
                            // onClick={() => openDetails(lawyer)}
                            onClick={() => navigate(`/admin/AdminLawyerDetailsPage/${lawyer.user_id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </button>

                          {/* Conditional action states */}
                          {lawyer.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(lawyer)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleReject(lawyer)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100/70 transition-colors"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </button>
                            </>
                          )}

                          {lawyer.status === 'approved' && (
                            <button
                              onClick={() => handleSuspend(lawyer)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100/70 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" /> Suspend
                            </button>
                          )}

                          {lawyer.status === 'suspended' && (
                            <button
                              onClick={() => handleApprove(lawyer)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Reactivate
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination controls ────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-5">
              <p className="text-xs text-slate-500 font-medium">
                Showing Page <span className="font-semibold text-slate-800">{page}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4 mr-0.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Details / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl gap-0 bg-white">
          <DialogHeader className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
            <DialogTitle className="text-base font-bold tracking-tight flex items-center gap-2">
              <User className="h-4 w-4 opacity-70" />
              {editMode ? 'Edit Professional Profile' : 'Detailed Lawyer Profile'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {editMode ? 'Modify registration settings directly in system records.' : 'Verification metadata and operational variables.'}
            </DialogDescription>
          </DialogHeader>

          {selectedLawyer && (
            <ScrollArea className="max-h-[70vh] px-6 py-5">
              {editMode ? (
                /* ── EDIT MODE FORM ── */
                <div className="space-y-4 py-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Bar Council Number</Label>
                      <Input
                        value={editForm.bar_council_number || ''}
                        onChange={e => setEditForm(f => ({ ...f, bar_council_number: e.target.value }))}
                        className="h-9 text-sm rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Years of Experience</Label>
                      <Input
                        type="number"
                        value={editForm.experience_years || 0}
                        onChange={e => setEditForm(f => ({ ...f, experience_years: parseInt(e.target.value) || 0 }))}
                        className="h-9 text-sm rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Price per minute (INR)</Label>
                      <Input
                        type="number"
                        value={editForm.price_per_minute || 0}
                        onChange={e => setEditForm(f => ({ ...f, price_per_minute: parseFloat(e.target.value) || 0 }))}
                        className="h-9 text-sm rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Fixed Session Price (INR)</Label>
                      <Input
                        type="number"
                        value={editForm.session_price || 0}
                        onChange={e => setEditForm(f => ({ ...f, session_price: parseFloat(e.target.value) || 0 }))}
                        className="h-9 text-sm rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">System Status Override</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={v => setEditForm(f => ({ ...f, status: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Institutional Education</Label>
                    <Input
                      value={editForm.education || ''}
                      onChange={e => setEditForm(f => ({ ...f, education: e.target.value }))}
                      className="h-9 text-sm rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Professional Bio</Label>
                    <Textarea
                      rows={4}
                      value={editForm.bio || ''}
                      onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      className="text-sm rounded-lg resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* ── VIEW DETAIL LAYOUT ── */
                <div className="space-y-5">
                  {/* Bio statement */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Professional Bio
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {selectedLawyer.bio || 'No professional bio statement provided by the lawyer yet.'}
                    </p>
                  </div>

                  {/* Core profile stats metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Education</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedLawyer.education || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Email Address</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5 select-all">{selectedLawyer.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Contact Number</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedLawyer.phone || 'Not Shared'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Bar Council Id</p>
                          <p className="text-sm font-mono font-bold text-slate-800 mt-0.5 tracking-wide">{selectedLawyer.bar_council_number || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                          <Languages className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Languages Spoken</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedLawyer.languages && selectedLawyer.languages.length > 0 ? (
                              selectedLawyer.languages.map((l, i) => (
                                <Badge key={i} variant="secondary" className="px-1.5 py-0 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600 border-none">
                                  {l}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs font-semibold text-slate-400">None Specified</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Practice Specializations</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedLawyer.specializations && selectedLawyer.specializations.length > 0 ? (
                              selectedLawyer.specializations.map((s, i) => (
                                <Badge key={i} className="px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded-md bg-blue-50 text-blue-700 border border-blue-100 shadow-none">
                                  {s}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs font-semibold text-slate-400">None Specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Micro dashboard layout footer links */}
                  <div className="grid grid-cols-3 gap-3 text-center bg-slate-50/50 rounded-xl p-3 border border-slate-100 text-slate-500 text-xs font-medium">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Joined Platform</span>
                      <span className="text-slate-700 font-semibold">{new Date(selectedLawyer.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="space-y-0.5 border-x border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Consultations</span>
                      <span className="text-slate-800 font-bold flex items-center justify-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                        {selectedLawyer.total_consultations ?? 0}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rating Score</span>
                      <span className="text-slate-800 font-bold flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        {selectedLawyer.rating?.toFixed(1) ?? 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          )}

          {/* Dialog footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};