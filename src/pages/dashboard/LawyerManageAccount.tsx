
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { LawyerDocuments } from '@/components/profile/LawyerDocuments';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft, Save, X, User, Mail, Phone as PhoneIcon, Shield,
  Briefcase, GraduationCap, Languages, DollarSign, FileText, Award, Loader2, CalendarIcon, Pencil, IndianRupee
} from 'lucide-react';
import { formatLawyerName } from '@/lib/lawyer-utils';
const SPECIALIZATION_OPTIONS = [
  'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Law',
  'Real Estate', 'Immigration', 'Tax Law', 'Intellectual Property',
  'Labor Law', 'Environmental Law', 'Consumer Law', 'Banking Law'
];
const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Spanish', 'French', 'German',
  'Mandarin', 'Arabic', 'Portuguese', 'Japanese', 'Korean'
];
const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().trim().max(20, 'Phone number too long').optional().nullable(),
});
interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
}
interface ProfessionalInfo {
  bio: string;
  education: string;
  bar_council_number: string;
  experience_years: number;
  price_per_minute: number;
  chat_price_per_minute: number;
  audio_price_per_minute: number;
  video_price_per_minute: number;
  session_price: number;
  specializations: string[];
  languages: string[];
  status: string | null;
}
const LawyerManageAccount = () => {
  const [editingBio, setEditingBio] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personal, setPersonal] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    phone: null,
    avatar_url: null,
    date_of_birth: null,
  });
  const [professional, setProfessional] = useState<ProfessionalInfo>({
    bio: '', education: '', bar_council_number: '', experience_years: 0,
    price_per_minute: 5, chat_price_per_minute: 5, audio_price_per_minute: 8, video_price_per_minute: 12,
    session_price: 100, specializations: [], languages: ['English'],
    status: null,
  });
  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchAllData();
  }, [user, authLoading]);
  const fetchAllData = async () => {
    if (!user) return;
    const [profileRes, lawyerRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('lawyer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    if (profileRes.data) {
      setPersonal({
        full_name: profileRes.data.full_name || '',
        email: profileRes.data.email || user.email || '',
        phone: profileRes.data.phone,
        avatar_url: profileRes.data.avatar_url,
        date_of_birth: profileRes.data.date_of_birth,
      });
    }
    if (lawyerRes.data) {
      const dbPrice = Number(lawyerRes.data.price_per_minute) || 5;
      setProfessional({
        bio: lawyerRes.data.bio || '',
        education: lawyerRes.data.education || '',
        bar_council_number: lawyerRes.data.bar_council_number || '',
        experience_years: lawyerRes.data.experience_years || 0,
        price_per_minute: dbPrice,
        chat_price_per_minute: Number(lawyerRes.data.chat_price_per_minute ?? dbPrice) || dbPrice,
        audio_price_per_minute: Number(lawyerRes.data.audio_price_per_minute ?? dbPrice) || dbPrice,
        video_price_per_minute: Number(lawyerRes.data.video_price_per_minute ?? dbPrice) || dbPrice,
        session_price: Number(lawyerRes.data.session_price) || 100,
        specializations: lawyerRes.data.specializations || [],
        languages: lawyerRes.data.languages || ['English'],
        status: lawyerRes.data.status,
      });
    }
    setLoading(false);
  };
  const handleSaveAll = async () => {
    if (!user) return;
    setErrors({});
    const profileResult = profileSchema.safeParse(personal);
    if (!profileResult.success) {
      const fieldErrors: Record<string, string> = {};
      profileResult.error.errors.forEach(err => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
      return;
    }
    const priceErrors: Record<string, string> = {};
    if (professional.chat_price_per_minute < 1 || professional.chat_price_per_minute > 100) {
      priceErrors.chat_price_per_minute = 'Enter a chat rate between ₹1 and ₹100';
    }
    if (professional.audio_price_per_minute < 1 || professional.audio_price_per_minute > 100) {
      priceErrors.audio_price_per_minute = 'Enter an audio rate between ₹1 and ₹100';
    }
    if (professional.video_price_per_minute < 1 || professional.video_price_per_minute > 100) {
      priceErrors.video_price_per_minute = 'Enter a video rate between ₹1 and ₹100';
    }
    if (Object.keys(priceErrors).length > 0) {
      setErrors(priceErrors);
      toast({ variant: 'destructive', title: 'Pricing values must be between ₹1 and ₹100' });
      return;
    }
    if (!professional.bio.trim()) {
      setErrors({ bio: 'Bio is required' });
      toast({ variant: 'destructive', title: 'Bio is required' });
      return;
    }
    if (professional.specializations.length === 0) {
      toast({ variant: 'destructive', title: 'Select at least one specialization' });
      return;
    }
    setSaving(true);
    const [profileRes, lawyerRes] = await Promise.all([
      supabase.from('profiles').update({
        full_name: personal.full_name.trim(),
        phone: personal.phone?.trim() || null,
        date_of_birth: personal.date_of_birth || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id),
      supabase.from('lawyer_profiles').update({
        bio: professional.bio.trim(),
        education: professional.education.trim(),
        bar_council_number: professional.bar_council_number.trim(),
        experience_years: professional.experience_years,
        chat_price_per_minute: professional.chat_price_per_minute,
        audio_price_per_minute: professional.audio_price_per_minute,
        video_price_per_minute: professional.video_price_per_minute,
        session_price: professional.session_price,
        specializations: professional.specializations,
        languages: professional.languages,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id),
    ]);
    if (profileRes.error || lawyerRes.error) {
      toast({ variant: 'destructive', title: 'Save failed', description: profileRes.error?.message || lawyerRes.error?.message });
    } else {
      toast({ title: '✅ All changes saved successfully!' });
    }
    setSaving(false);
  };
  const toggleSpecialization = (spec: string) => {
    setProfessional(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec],
    }));
  };
  const toggleLanguage = (lang: string) => {
    setProfessional(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };
  if (authLoading || loading) {
    return (
      // <MainLayout showFooter={false}>
      <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container max-w-5xl mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48 mb-8" />
            <Skeleton className="h-16 w-full mb-6 rounded-xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
        {/* </MainLayout> */}
      </LawyerLayout>
    );
  }
  return (
    // <MainLayout showFooter={false}>
    <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/lawyer/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold">Manage Account</h1>
                <p className="text-sm text-muted-foreground">Your personal & professional details in one place</p>
              </div>
            </div>

          </div>
          {/* Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="w-full grid grid-cols-3 h-12 sm:h-14 rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="personal" className="rounded-lg text-xs sm:text-sm gap-1.5 data-[state=active]:shadow-md">
                <User className="h-4 w-4 hidden sm:inline" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="professional" className="rounded-lg text-xs sm:text-sm gap-1.5 data-[state=active]:shadow-md">
                <Briefcase className="h-4 w-4 hidden sm:inline" />
                Professional
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-lg text-xs sm:text-sm gap-1.5 data-[state=active]:shadow-md">
                <FileText className="h-4 w-4 hidden sm:inline" />
                Documents
              </TabsTrigger>
            </TabsList>
            {/* ─── PERSONAL TAB ─── */}
            <TabsContent value="personal" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" /> Profile Photo & Identity
                  </CardTitle>
                  <CardDescription>Upload your photo and manage basic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {user && (
                      <AvatarUpload
                        userId={user.id}
                        currentAvatarUrl={personal.avatar_url}
                        fallbackName={personal.full_name}
                        onAvatarChange={(url) => setPersonal(prev => ({ ...prev, avatar_url: url }))}
                        size="lg"
                      />
                    )}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{formatLawyerName(personal.full_name)}</h3>
                      <p className="text-sm text-muted-foreground">{personal.email}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" /> Professional
                        </Badge>
                        {professional.status === 'approved' && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Verified</Badge>
                        )}
                        {professional.status === 'pending' && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Approval</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {/* Name / Email / Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" /> Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={personal.full_name}
                        onChange={(e) => setPersonal(prev => ({ ...prev, full_name: e.target.value }))}
                        className={errors.full_name ? 'border-destructive' : ''}
                      />
                      {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                      </Label>
                      <Input id="email" value={personal.email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-muted-foreground" /> Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={personal.phone || ''}
                        onChange={(e) => setPersonal(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
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
                              !personal.date_of_birth && 'text-muted-foreground'
                            )}
                          >
                            {/* <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground" /> */}
                            <div className="flex flex-col items-start">
                              <span className={cn('text-sm font-medium', !personal.date_of_birth && 'text-muted-foreground')}>
                                {personal.date_of_birth ? format(parseISO(personal.date_of_birth), 'dd MMM yyyy') : 'Select date of birth'}
                              </span>
                              {/* <span className="text-xs text-muted-foreground">Day · Month · Year</span> */}
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-4 rounded-3xl border border-border bg-background shadow-lg" align="start">
                          <div className="mb-3">
                            <p className="text-sm font-semibold">Choose your birth date</p>
                            <p className="text-xs text-muted-foreground mt-1">Select the correct day, month and year for your profile.</p>
                          </div>
                          <Calendar
                            mode="single"
                            selected={personal.date_of_birth ? parseISO(personal.date_of_birth) : undefined}
                            onSelect={(date) => setPersonal(prev => ({ ...prev, date_of_birth: date ? format(date, 'yyyy-MM-dd') : null }))}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            className={cn('pointer-events-auto')}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>


                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />About You
                      </Label>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Write a compelling bio that highlights your expertise *</Label>
                        <Textarea
                          id="bio"
                          placeholder="Describe your experience, expertise, and approach to legal practice..."
                          className={`min-h-[140px] text-xs sm:text-sm leading-5 ${errors.bio ? 'border-destructive' : ''}`}
                          value={professional.bio}
                          onChange={(e) => setProfessional(prev => ({ ...prev, bio: e.target.value }))}
                          maxLength={1000}
                        />
                        <div className="flex justify-between">
                          {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                          <p className="text-xs text-muted-foreground ml-auto">{professional.bio.length}/1000</p>
                        </div>
                      </div>
                    </div>


                  </div>
                </CardContent>
              </Card>
            </TabsContent>





            {/* ─── PROFESSIONAL TAB ─── */}
            <TabsContent value="professional" className="space-y-6">
              {/* Specializations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5" /> Specializations
                  </CardTitle>
                  <CardDescription>Select your areas of legal expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATION_OPTIONS.map(spec => (
                      <Badge
                        key={spec}
                        variant={professional.specializations.includes(spec) ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4"
                        onClick={() => toggleSpecialization(spec)}
                      >
                        {professional.specializations.includes(spec) && <X className="h-3 w-3 mr-1" />}
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  {professional.specializations.length === 0 && (
                    <p className="text-sm text-destructive mt-2">Please select at least one specialization</p>
                  )}
                </CardContent>
              </Card>
              {/* Education & Credentials */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5" /> Education & Credentials
                  </CardTitle>
                  <CardDescription>Your educational background and bar council details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      placeholder="e.g., LLB from Harvard Law School, LLM in Corporate Law..."
                      className="min-h-[140px] text-xs sm:text-sm leading-5"
                      value={professional.education}
                      onChange={(e) => setProfessional(prev => ({ ...prev, education: e.target.value }))}
                      maxLength={500}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bar_council">Bar Council Number</Label>
                      <Input
                        id="bar_council"
                        placeholder="Enter your bar council number"
                        value={professional.bar_council_number}
                        onChange={(e) => setProfessional(prev => ({ ...prev, bar_council_number: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        min={0}
                        max={50}
                        value={professional.experience_years}
                        onChange={(e) => setProfessional(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Languages */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Languages className="h-5 w-5" /> Languages
                  </CardTitle>
                  <CardDescription>Select languages you can consult in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map(lang => (
                      <Badge
                        key={lang}
                        variant={professional.languages.includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4"
                        onClick={() => toggleLanguage(lang)}
                      >
                        {professional.languages.includes(lang) && <X className="h-3 w-3 mr-1" />}
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>


              {/* Pricing */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                    Pricing
                  </CardTitle>

                  <CardDescription className="text-xs sm:text-sm">
                    Set your consultation rates and preview mode pricing
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-3 sm:p-6">
                  <div className="grid grid-cols-1 xl:grid-cols-[1fr,1.1fr] gap-4 sm:gap-6">

                    {/* LEFT SIDE */}
                    <div className="space-y-4">

                      {/* INPUTS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* CHAT */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="chat_price_per_minute"
                            className="text-xs sm:text-sm"
                          >
                            Chat Rate (₹ / min)
                          </Label>

                          <Input
                            id="chat_price_per_minute"
                            type="number"
                            min={1}
                            max={100}
                            step={0.5}
                            value={professional.chat_price_per_minute === 0 ? '' : professional.chat_price_per_minute}
                            className={`h-9 sm:h-10 text-sm ${errors.chat_price_per_minute ? 'border-destructive' : ''}`}
                            onChange={(e) => {
                              const input = e.target.value;
                              const parsed = parseFloat(input);
                              const value = input === '' ? 0 : Number.isNaN(parsed) ? 0 : parsed;

                              setProfessional(prev => ({
                                ...prev,
                                chat_price_per_minute: value,
                              }));

                              setErrors(prev => {
                                const next = { ...prev };

                                if (value < 1 || value > 100) {
                                  next.chat_price_per_minute = 'Enter a chat rate between ₹1 and ₹100';
                                } else {
                                  delete next.chat_price_per_minute;
                                }

                                return next;
                              });
                            }}
                          />

                          {errors.chat_price_per_minute && (
                            <p className="text-[11px] text-destructive">
                              {errors.chat_price_per_minute}
                            </p>
                          )}
                        </div>

                        {/* AUDIO */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="audio_price_per_minute"
                            className="text-xs sm:text-sm"
                          >
                            Audio Rate (₹ / min)
                          </Label>

                          <Input
                            id="audio_price_per_minute"
                            type="number"
                            min={1}
                            max={100}
                            step={0.5}
                            value={professional.audio_price_per_minute === 0 ? '' : professional.audio_price_per_minute}
                            className={`h-9 sm:h-10 text-sm ${errors.audio_price_per_minute ? 'border-destructive' : ''}`}
                            onChange={(e) => {
                              const input = e.target.value;
                              const parsed = parseFloat(input);
                              const value = input === '' ? 0 : Number.isNaN(parsed) ? 0 : parsed;

                              setProfessional(prev => ({
                                ...prev,
                                audio_price_per_minute: value,
                              }));

                              setErrors(prev => {
                                const next = { ...prev };

                                if (value < 1 || value > 100) {
                                  next.audio_price_per_minute = 'Enter an audio rate between ₹1 and ₹100';
                                } else {
                                  delete next.audio_price_per_minute;
                                }

                                return next;
                              });
                            }}
                          />

                          {errors.audio_price_per_minute && (
                            <p className="text-[11px] text-destructive">
                              {errors.audio_price_per_minute}
                            </p>
                          )}
                        </div>

                        {/* VIDEO */}
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="video_price_per_minute"
                            className="text-xs sm:text-sm"
                          >
                            Video Rate (₹ / min)
                          </Label>

                          <Input
                            id="video_price_per_minute"
                            type="number"
                            min={1}
                            max={100}
                            step={0.5}
                            value={professional.video_price_per_minute === 0 ? '' : professional.video_price_per_minute}
                            className={`h-9 sm:h-10 text-sm ${errors.video_price_per_minute ? 'border-destructive' : ''}`}
                            onChange={(e) => {
                              const input = e.target.value;
                              const parsed = parseFloat(input);
                              const value = input === '' ? 0 : Number.isNaN(parsed) ? 0 : parsed;

                              setProfessional(prev => ({
                                ...prev,
                                video_price_per_minute: value,
                              }));

                              setErrors(prev => {
                                const next = { ...prev };

                                if (value < 1 || value > 100) {
                                  next.video_price_per_minute = 'Enter a video rate between ₹1 and ₹100';
                                } else {
                                  delete next.video_price_per_minute;
                                }

                                return next;
                              });
                            }}
                          />

                          {errors.video_price_per_minute && (
                            <p className="text-[11px] text-destructive">
                              {errors.video_price_per_minute}
                            </p>
                          )}
                        </div>

                        {/* SESSION */}
                        <div className="space-y-1.5 opacity-60 pointer-events-none">
                          <div className="flex items-center justify-between gap-2">
                            <Label
                              htmlFor="session_price"
                              className="text-xs sm:text-sm"
                            >
                              Session Price
                            </Label>

                            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                              Coming Soon
                            </span>
                          </div>

                          <Input
                            id="session_price"
                            type="number"
                            min={10}
                            step={5}
                            value={professional.session_price}
                            disabled
                            className="h-9 sm:h-10 text-sm bg-muted cursor-not-allowed"
                            onChange={(e) => setProfessional(prev => ({
                              ...prev,
                              session_price: parseFloat(e.target.value) || 10,
                            }))}
                          />

                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            This feature is not available yet.
                          </p>
                        </div>
                      </div>

                      {/* SMALL PRICING CARDS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* CHAT CARD */}
                        <div className="rounded-xl border border-border bg-muted/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            Chat pricing
                          </p>

                          <p className="mt-2 text-base sm:text-lg font-semibold">
                            ₹{professional.chat_price_per_minute}/min
                          </p>

                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {[5, 10, 15, 30].map(minutes => (
                              <div
                                key={minutes}
                                className="flex items-center justify-between"
                              >
                                <span>{minutes} min</span>
                                <span>
                                  ₹{(professional.chat_price_per_minute * minutes).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AUDIO CARD */}
                        <div className="rounded-xl border border-border bg-muted/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            Audio pricing
                          </p>

                          <p className="mt-2 text-base sm:text-lg font-semibold">
                            ₹{professional.audio_price_per_minute}/min
                          </p>

                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {[10, 15, 20, 30].map(minutes => (
                              <div
                                key={minutes}
                                className="flex items-center justify-between"
                              >
                                <span>{minutes} min</span>
                                <span>
                                  ₹{(professional.audio_price_per_minute * minutes).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* VIDEO CARD */}
                        <div className="rounded-xl border border-border bg-muted/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            Video pricing
                          </p>

                          <p className="mt-2 text-base sm:text-lg font-semibold">
                            ₹{professional.video_price_per_minute}/min
                          </p>

                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {[10, 15, 20, 30].map(minutes => (
                              <div
                                key={minutes}
                                className="flex items-center justify-between"
                              >
                                <span>{minutes} min</span>
                                <span>
                                  ₹{(professional.video_price_per_minute * minutes).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* SESSION CARD */}
                        <div className="rounded-xl bg-muted/50 border border-border/70 p-3 opacity-60 relative overflow-hidden">

                          {/* Coming Soon Badge */}
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              Coming Soon
                            </span>
                          </div>

                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            Session pricing
                          </p>

                          <p className="mt-2 text-base sm:text-lg font-semibold text-muted-foreground">
                            ₹{professional.session_price}
                          </p>

                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {[30, 60, 120, 180].map(minutes => (
                              <div
                                key={minutes}
                                className="flex items-center justify-between"
                              >
                                <span>{minutes} min</span>
                                <span>
                                  ₹{professional.session_price}
                                </span>
                              </div>
                            ))}
                          </div>

                          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-3 leading-relaxed">
                            This feature is not available yet.
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="rounded-2xl sm:rounded-3xl border border-border bg-background p-3 sm:p-5">

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div>
                          <p className="text-sm font-medium">
                            Pricing chart
                          </p>

                          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                            Editable lawyer rates for all call modes.
                          </p>
                        </div>

                        <div className="rounded-xl bg-secondary/80 px-3 py-2 text-[10px] sm:text-xs text-muted-foreground w-fit">
                          Current rates saved live
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-5 space-y-3">

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-xl bg-card p-3 sm:p-4 border border-border">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              Chat
                            </p>

                            <p className="mt-2 text-lg sm:text-2xl font-semibold">
                              ₹{professional.chat_price_per_minute}/min
                            </p>

                            <p className="text-[11px] sm:text-sm text-muted-foreground mt-1">
                              5 / 10 / 15 / 30 min
                            </p>
                          </div>

                          <div className="rounded-xl bg-card p-3 sm:p-4 border border-border">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              Audio
                            </p>

                            <p className="mt-2 text-lg sm:text-2xl font-semibold">
                              ₹{professional.audio_price_per_minute}/min
                            </p>

                            <p className="text-[11px] sm:text-sm text-muted-foreground mt-1">
                              10 / 15 / 20 / 30 min
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-xl bg-card p-3 sm:p-4 border border-border">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              Video
                            </p>

                            <p className="mt-2 text-lg sm:text-2xl font-semibold">
                              ₹{professional.video_price_per_minute}/min
                            </p>

                            <p className="text-[11px] sm:text-sm text-muted-foreground mt-1">
                              15 / 20 / 30 / 45 min
                            </p>
                          </div>

                          <div className="rounded-xl bg-muted/50 border border-border/70 p-3 sm:p-4 opacity-60 relative overflow-hidden">

                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                Coming Soon
                              </span>
                            </div>

                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              Session
                            </p>

                            <p className="mt-2 text-lg sm:text-2xl font-semibold text-muted-foreground">
                              ₹{professional.session_price}
                            </p>

                            <p className="text-[11px] sm:text-sm text-muted-foreground mt-1">
                              Flat session cost
                            </p>

                            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-2 leading-relaxed">
                              This feature is not available yet.
                            </p>
                          </div>

                        </div>

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            {/* ─── DOCUMENTS TAB ─── */}
            <TabsContent value="documents" className="space-y-6">
              {user && <LawyerDocuments userId={user.id} />}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end w-full sm:w-auto mt-3">
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              className="gap-2 min-w-20"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
      {/* </MainLayout> */}
    </LawyerLayout>
  );
};
export default LawyerManageAccount;