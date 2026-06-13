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
  FileText, Award
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

export const LawyerVerificationPanel = ({ onRefresh }: LawyerVerificationPanelProps) => {
  const { toast } = useToast();
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
  // Pagination (5 per page) and compact layout
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchLawyers();

    // Real-time subscription
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

  const handleApprove = async (lawyer: LawyerProfile) => {
    const { error } = await supabase
      .from('lawyer_profiles')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', lawyer.id);

    if (!error) {
      toast({
        title: '✅ Lawyer Approved',
        description: `${lawyer.full_name} is now verified and can accept clients.`
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
        description: `${lawyer.full_name}'s application has been rejected.`
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
        description: `${lawyer.full_name} has been suspended.`
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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="gap-1 bg-destructive/10 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="gap-1 bg-orange-500/10 text-orange-600 border-orange-500/30">
            <AlertTriangle className="h-3 w-3" /> Suspended
          </Badge>
        );
      default:
        return (
          <Badge className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

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

  // reset page when filters/search/data change
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, lawyers]);

  const pendingCount = lawyers.filter(l => l.status === 'pending').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Lawyer Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5 text-primary" />
                Lawyer Verification
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingCount} Pending
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                Review and verify lawyer applications
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={fetchLawyers}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or bar number..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
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
        </CardHeader>

        <CardContent>
          <ScrollArea className="max-h-[60vh] sm:h-[500px] pr-4">
            {filteredLawyers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No lawyers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedLawyers.map((lawyer) => (
                  <Card
                    key={lawyer.id}
                    className={cn(
                      "transition-all duration-200 hover:shadow-md",
                      lawyer.status === 'pending' && "border-amber-500/30 bg-amber-500/5"
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Avatar & Basic Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-12 w-12 border-2">
                            <AvatarImage src={lawyer.avatar_url || ''} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {lawyer.full_name?.charAt(0) || 'L'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold truncate text-sm">{lawyer.full_name}</h3>
                              {getStatusBadge(lawyer.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate max-w-full break-words">{lawyer.email}</span>
                              </span>
                              {lawyer.bar_council_number && (
                                <span className="flex items-center gap-1">
                                  <Award className="h-3.5 w-3.5" />
                                  {lawyer.bar_council_number}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {lawyer.specializations?.slice(0, 3).map((spec, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {(lawyer.specializations?.length || 0) > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{lawyer.specializations!.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openDetails(lawyer)}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>

                          {lawyer.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove(lawyer)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handleReject(lawyer)}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}

                          {lawyer.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-orange-600 border-orange-600/30 hover:bg-orange-500/10"
                              onClick={() => handleSuspend(lawyer)}
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Suspend
                            </Button>
                          )}

                          {(lawyer.status === 'rejected' || lawyer.status === 'suspended') && (
                            <Button
                              size="sm"
                              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApprove(lawyer)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-3 px-2">
            <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <Button size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lawyer Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedLawyer?.avatar_url || ''} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedLawyer?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="block font-semibold truncate max-w-full">{selectedLawyer?.full_name}</span>
                  <div className="text-sm font-normal text-muted-foreground truncate max-w-full">{selectedLawyer?.email}</div>
                </div>
              </DialogTitle>
              {getStatusBadge(selectedLawyer?.status || 'pending')}
            </div>
            <DialogDescription>
              Review and edit lawyer profile details
            </DialogDescription>
          </DialogHeader>

          {selectedLawyer && (
            <div className="space-y-6 mt-4">
              {/* Bio */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Professional Bio
                </Label>
                {editMode ? (
                  <Textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedLawyer.bio || 'No bio provided'}
                  </p>
                )}
              </div>

              <Separator />

              {/* Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Bar Council Number
                  </Label>
                  {editMode ? (
                    <Input
                      value={editForm.bar_council_number || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bar_council_number: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{selectedLawyer.bar_council_number || 'Not provided'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </Label>
                  {editMode ? (
                    <Input
                      type="number"
                      value={editForm.experience_years || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{selectedLawyer.experience_years || 0} years</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </Label>
                {editMode ? (
                  <Textarea
                    value={editForm.education || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {selectedLawyer.education || 'No education details provided'}
                  </p>
                )}
              </div>

              {/* Specializations */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Specializations
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedLawyer.specializations?.map((spec, i) => (
                    <Badge key={i} variant="secondary">{spec}</Badge>
                  )) || <span className="text-sm text-muted-foreground">None selected</span>}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Languages
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedLawyer.languages?.map((lang, i) => (
                    <Badge key={i} variant="outline">{lang}</Badge>
                  )) || <span className="text-sm text-muted-foreground">None selected</span>}
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price per Minute
                  </Label>
                  {editMode ? (
                    <Input
                      type="number"
                      value={editForm.price_per_minute || 5}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price_per_minute: parseFloat(e.target.value) || 5 }))}
                    />
                  ) : (
                    <p className="text-lg font-semibold">${selectedLawyer.price_per_minute || 5}/min</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Session Price</Label>
                  {editMode ? (
                    <Input
                      type="number"
                      value={editForm.session_price || 100}
                      onChange={(e) => setEditForm(prev => ({ ...prev, session_price: parseFloat(e.target.value) || 100 }))}
                    />
                  ) : (
                    <p className="text-lg font-semibold">${selectedLawyer.session_price || 100}/session</p>
                  )}
                </div>
              </div>

              {/* Status (Edit Mode) */}
              {editMode && (
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <Select
                    value={editForm.status || 'pending'}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
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
              )}

              {/* Meta Info */}
              <div className="text-xs text-muted-foreground flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Applied: {new Date(selectedLawyer.created_at).toLocaleDateString()}
                </span>
                <span>Consultations: {selectedLawyer.total_consultations || 0}</span>
                <span>Rating: {selectedLawyer.rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => setEditMode(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
