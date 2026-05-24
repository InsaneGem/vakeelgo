import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { rejectButtonStyle, acceptButtonStyle } from '@/lib/buttonStyles';
// import { rejectButtonStyle, acceptButtonStyle } from '../lib/buttonStyles';

import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  User, Mail, Phone, Camera, Save, Shield, ArrowLeft,
  Wallet, MessageSquare, Clock, Activity, Loader2, FileText, Star,
  CalendarIcon,
  IndianRupee, XCircle, CheckCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { profile } from 'console';
import { useCallRecording } from '@/hooks/useCallRecording';
// import { cancelButtonStyle } from './../lib/buttonStyles';
const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().trim().max(20, 'Phone number too long').optional().nullable(),
});
interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
}
interface ClientStats {
  walletBalance: number;
  totalConsultations: number;
  activeConsultations: number;
  pendingConsultations: number;
  completedConsultations: number;
  totalSpent: number;
  // totalRecordings: number;
}
const ClientManageAccount = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordingsCount, setRecordingsCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    phone: null,
    avatar_url: null,
    date_of_birth: null,
  });
  const [stats, setStats] = useState<ClientStats>({
    walletBalance: 0,
    totalConsultations: 0,
    activeConsultations: 0,
    pendingConsultations: 0,
    completedConsultations: 0,
    totalSpent: 0,
    // totalRecordings: 0,


  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchAllData();
    }
  }, [user, authLoading]);
  const fetchAllData = async () => {
    if (!user) return;
    await Promise.all([
      fetchProfile(),
      fetchStats(),
      fetchRecordingsCount()
    ]);
    setLoading(false);

  };

  const fetchRecordingsCount = async () => {
    if (!user) return;
    const { data: completedConsults } = await supabase
      .from('consultations')
      .select('id')
      .eq('client_id', user.id)
      .eq('status', 'completed');
    setCompletedCount(completedConsults?.length || 0);
    if (!completedConsults || completedConsults.length === 0) {
      setRecordingsCount(0);
      return;
    }
    const ids = completedConsults.map(c => c.id);
    const { count } = await supabase
      .from('call_recordings')
      .select('id', { count: 'exact', head: true })
      .in('consultation_id', ids);
    setRecordingsCount(count || 0);
  };


  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: data.email || user.email || '',
        phone: data.phone,
        avatar_url: data.avatar_url,
        date_of_birth: data.date_of_birth,
      });
    }
  };
  const fetchStats = async () => {
    if (!user) return;

    const [walletRes, consultRes] = await Promise.all([
      supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle(),
      supabase.from('consultations').select('status, total_amount').eq('client_id', user.id),
    ]);
    const consultations = consultRes.data || [];

    const completedConsultations = consultations.filter(c => c.status === 'completed');

    setStats({
      walletBalance: Number(walletRes.data?.balance) || 0,
      totalConsultations: consultations.length,
      activeConsultations: consultations.filter(c => c.status === 'active').length,
      pendingConsultations: consultations.filter(c => c.status === 'pending').length,
      completedConsultations: completedConsultations.length,
      totalSpent: completedConsultations.reduce((sum, c) => sum + Number(c.total_amount || 0), 0),

    });
  };
  const handleSave = async () => {
    if (!user) return;
    setErrors({});
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name.trim(),
        phone: profile.phone?.trim() || null,
        date_of_birth: profile.date_of_birth,  // ✅ ADD THIS LINE
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
      setSaving(false);
      return;
    }
    toast({ title: '✅ Profile Updated', description: 'Your changes have been saved successfully' });
    setSaving(false);
  };
  if (authLoading || loading) {
    return (

      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <Skeleton className="h-40 rounded-2xl mb-6" />
            <Skeleton className="h-64 rounded-2xl mb-6" />
          </div>
        </div>

      </ClientLayout>
    );
  }
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold">Manage Account</h1>
              <p className="text-muted-foreground">Manage your personal information and view account activity</p>
            </div>
          </div>
          {/* Account Overview Stats */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Account Overview
              </CardTitle>
              <CardDescription>Your real-time account statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Recordings</p>
                    <p className="text-lg font-bold">{recordingsCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Sessions</p>
                    <p className="text-lg font-bold">{stats.totalConsultations}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-lg font-bold">{stats.completedConsultations}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">

                    <IndianRupee className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-lg font-bold">₹{stats.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              {/* Active/Pending indicators */}
              {(stats.activeConsultations > 0 || stats.pendingConsultations > 0) && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                  {stats.activeConsultations > 0 && (
                    <Badge className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                      </span>
                      {stats.activeConsultations} Active Session{stats.activeConsultations > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {stats.pendingConsultations > 0 && (
                    <Badge className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Clock className="h-3 w-3" />
                      {stats.pendingConsultations} Pending
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Personal Information */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">

                {user && (
                  <AvatarUpload
                    userId={user.id}
                    currentAvatarUrl={profile.avatar_url}
                    fallbackName={profile.full_name}
                    onAvatarChange={(url) => setProfile(prev => ({ ...prev, avatar_url: url }))}
                  />
                )}

                <div>

                  <h3 className="font-semibold text-lg mt-2">{profile.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <Badge variant="secondary" className="gap-1 mt-1.5">
                    <Shield className="h-3 w-3" />
                    Client
                  </Badge>
                </div>
              </div>
              <Separator />
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                    className={errors.full_name ? 'border-destructive' : ''}
                  />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    Date of Birth
                  </Label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-auto py-3 px-4 rounded-xl border border-input bg-background text-black hover:bg-background hover:text-black focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-black active:bg-background active:text-black',
                          !profile.date_of_birth && 'text-black'
                        )}
                      >
                        {/* <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground shrink-0" /> */}

                        <div className="flex flex-col items-start">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              !profile.date_of_birth && 'text-muted-foreground'
                            )}
                          >
                            {profile.date_of_birth
                              ? format(parseISO(profile.date_of_birth), 'dd MMM yyyy')
                              : 'Select date of birth'}
                          </span>

                          {/* <span className="text-xs text-muted-foreground">
                            Day · Month · Year
                          </span> */}
                        </div>
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[320px] p-4 rounded-3xl border border-border bg-background shadow-lg"
                      align="start"
                    >
                      <div className="mb-3">
                        <p className="text-sm font-semibold">
                          Choose your birth date
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          Select the correct day, month and year for your profile.
                        </p>
                      </div>

                      <Calendar
                        mode="single"
                        selected={
                          profile.date_of_birth
                            ? parseISO(profile.date_of_birth)
                            : undefined
                        }
                        onSelect={(date) =>
                          setProfile(prev => ({
                            ...prev,
                            date_of_birth: date
                              ? format(date, 'yyyy-MM-dd')
                              : null
                          }))
                        }
                        disabled={(date) =>
                          date > new Date() ||
                          date < new Date('1900-01-01')
                        }
                        initialFocus
                        className={cn('pointer-events-auto')}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className={cn(rejectButtonStyle)}>
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className={cn(acceptButtonStyle)}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout >
  );
};
export default ClientManageAccount;
