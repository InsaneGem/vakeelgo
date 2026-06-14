
// ********************************************************************

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft, X, User, Mail, Phone as PhoneIcon, Shield,
  Briefcase, GraduationCap, Languages, FileText, Loader2, CalendarIcon, IndianRupee, XCircle, CheckCircle, Landmark, AlertTriangle, AlertCircle
} from 'lucide-react';
import { formatLawyerName } from '@/lib/lawyer-utils';
import { rejectButtonStyle, acceptButtonStyle } from '@/lib/buttonStyles';

const SPECIALIZATION_OPTIONS = [
  'Criminal Law', 'Family Law', 'Corporate Law', 'Civil Law',
  'Real Estate Law', 'Immigration Law', 'Taxation Law', 'Intellectual Property Law',
  'Labor Law', 'NI Act Law', 'Consumer Law', 'Banking Law', 'Cyber & IT Law', 'MACT Law', 'Arbitration Law', 'Constitutional Law', 'Insolvency Law', 'Others Law'
];

const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese'
];

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string()
    .trim()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
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
  chat_price_per_minute: number;
  audio_price_per_minute: number;
  video_price_per_minute: number;
  session_price: number;
  specializations: string[];
  languages: string[];
  status: string | null;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc_code: string;
}

const LawyerManageAccount = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [experienceInput, setExperienceInput] = useState('0');
  const [hasUploadedDocs, setHasUploadedDocs] = useState(true);

  const [personal, setPersonal] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    phone: null,
    avatar_url: null,
    date_of_birth: null,
  });

  const [professional, setProfessional] = useState<ProfessionalInfo>({
    bio: '', education: '', bar_council_number: '', experience_years: 0,
    chat_price_per_minute: 5, audio_price_per_minute: 8, video_price_per_minute: 12,
    session_price: 100, specializations: [], languages: ['English'],
    status: null,
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc_code: '',
  });

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchAllData();
  }, [user, authLoading]);

  const fetchAllData = async () => {
    if (!user) return;

    const [profileRes, lawyerRes, docsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('lawyer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('lawyer_documents').select('id').eq('lawyer_user_id', user.id).limit(1)
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
      const experienceYears = lawyerRes.data.experience_years ?? 0;

      const dbSpecializations = Array.isArray(lawyerRes.data.specializations)
        ? lawyerRes.data.specializations
        : typeof lawyerRes.data.specializations === 'string'
          ? lawyerRes.data.specializations.split(',').map((spec: string) => spec.trim()).filter(Boolean)
          : [];

      const dbLanguages = Array.isArray(lawyerRes.data.languages)
        ? lawyerRes.data.languages
        : typeof lawyerRes.data.languages === 'string'
          ? lawyerRes.data.languages.split(',').map((lang: string) => lang.trim()).filter(Boolean)
          : ['English'];

      setProfessional({
        bio: lawyerRes.data.bio || '',
        education: lawyerRes.data.education || '',
        bar_council_number: lawyerRes.data.bar_council_number || '',
        experience_years: experienceYears,
        chat_price_per_minute: Number(lawyerRes.data.chat_price_per_minute ?? dbPrice) || dbPrice,
        audio_price_per_minute: Number(lawyerRes.data.audio_price_per_minute ?? dbPrice) || dbPrice,
        video_price_per_minute: Number(lawyerRes.data.video_price_per_minute ?? dbPrice) || dbPrice,
        session_price: Number(lawyerRes.data.session_price) || 100,
        specializations: dbSpecializations,
        languages: dbLanguages.length ? dbLanguages : ['English'],
        status: lawyerRes.data.status,
        bank_account_name: lawyerRes.data.bank_account_name || '',
        bank_account_number: lawyerRes.data.bank_account_number || '',
        bank_ifsc_code: lawyerRes.data.bank_ifsc_code || '',
      });
      setExperienceInput(String(experienceYears));
    }
    // Check if lawyer has uploaded any validation files
    if (docsRes.data && docsRes.data.length > 0) {
      setHasUploadedDocs(true);
    } else {
      setHasUploadedDocs(false);
    }
    // 2. Change it to this cleaner, strictly bound check:
    setHasUploadedDocs(!!docsRes.data && docsRes.data.length > 0);
    setLoading(false);
  };

  const isPersonalIncomplete = !personal.full_name.trim() || !personal.phone?.trim() || !professional.bio.trim();
  const isProfessionalIncomplete = !professional.education.trim() ||
    !professional.bar_council_number.trim() ||
    professional.specializations.length === 0 ||
    professional.chat_price_per_minute < 5 || professional.chat_price_per_minute > 100 ||
    professional.audio_price_per_minute < 5 || professional.audio_price_per_minute > 100 ||
    professional.video_price_per_minute < 5 || professional.video_price_per_minute > 100;

  const isBankIncomplete = !professional.bank_account_name.trim() ||
    !professional.bank_account_number.trim() ||
    !professional.bank_ifsc_code.trim();

  const isDocsIncomplete = !hasUploadedDocs;
  const showGlobalWarning = isPersonalIncomplete || isProfessionalIncomplete || isBankIncomplete || isDocsIncomplete;

  const handleSaveAll = async () => {
    if (!user) return;
    setErrors({});

    const profileResult = profileSchema.safeParse({
      ...personal,
      phone: personal.phone?.trim() || '',
    });

    if (!profileResult.success) {
      const fieldErrors: Record<string, string> = {};
      profileResult.error.errors.forEach(err => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast({ title: 'Validation Error', description: 'Please fix the personal details errors', variant: 'destructive' });
      return;
    }

    if (
      professional.chat_price_per_minute < 5 || professional.chat_price_per_minute > 100 ||
      professional.audio_price_per_minute < 5 || professional.audio_price_per_minute > 100 ||
      professional.video_price_per_minute < 5 || professional.video_price_per_minute > 100
    ) {
      toast({ title: 'Validation Error', description: 'Please ensure all your pricing rates are between ₹5 and ₹100', variant: 'destructive' });
      return;
    }

    if (isBankIncomplete) {
      toast({ variant: 'destructive', title: 'Missing Bank Details', description: 'You must provide your bank information to ensure payouts work correctly.' });
      return;
    }

    if (professional.bank_ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(professional.bank_ifsc_code.toUpperCase())) {
      setErrors({ bank_ifsc_code: 'Please enter a valid 11-digit Indian IFSC Code (e.g. SBIN0001234)' });
      toast({ variant: 'destructive', title: 'Invalid IFSC Code Format' });
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
        bank_account_name: professional.bank_account_name.trim(),
        bank_account_number: professional.bank_account_number.trim(),
        bank_ifsc_code: professional.bank_ifsc_code.toUpperCase().trim(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id),
    ]);

    if (profileRes.error || lawyerRes.error) {
      toast({ variant: 'destructive', title: 'Save failed', description: profileRes.error?.message || lawyerRes.error?.message });
    } else {
      toast({ title: '✅ Profile updated successfully!' });
      fetchAllData();
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
      <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8">
            <Skeleton className="h-8 w-48 sm:h-10 sm:w-64 mb-2" />
            <Skeleton className="h-4 w-40 sm:h-5 sm:w-48 mb-6 sm:mb-8" />
            <Skeleton className="h-20 w-full mb-6 rounded-xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8">

          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 flex-shrink-0"
              onClick={() => navigate('/lawyer/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Manage Account</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Keep your configuration complete to receive payments.</p>
            </div>
          </div>

          {/* GLOBAL WARNING ALERTS */}
          {showGlobalWarning && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 shadow-sm flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 w-full">
                <p className="font-semibold text-xs sm:text-sm">Action Required: Your profile setup is incomplete!</p>
                <p className="text-[11px] sm:text-xs text-red-700 leading-relaxed">
                  If configuration steps are left empty, checkout payment actions will fail for your clients. Please complete the highlighted tabs:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {isPersonalIncomplete && <Badge variant="destructive" className="bg-red-600 text-[9px] sm:text-[10px] px-2 py-0.5">Personal Missing</Badge>}
                  {isProfessionalIncomplete && <Badge variant="destructive" className="bg-red-600 text-[9px] sm:text-[10px] px-2 py-0.5">Professional Missing</Badge>}
                  {isDocsIncomplete && <Badge variant="destructive" className="bg-red-600 text-[9px] sm:text-[10px] px-2 py-0.5">Docs Missing</Badge>}
                  {isBankIncomplete && <Badge variant="destructive" className="bg-red-600 text-[9px] sm:text-[10px] px-2 py-0.5 animate-pulse">Bank Missing</Badge>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <Tabs defaultValue="personal" className="space-y-4 sm:space-y-6">
            <TabsList className="w-full grid grid-cols-4 h-10 sm:h-12 md:h-14 rounded-xl bg-muted/60 p-1 gap-0.5 sm:gap-1">
              <TabsTrigger
                value="personal"
                className={cn(
                  "rounded-lg text-[11px] sm:text-xs md:text-sm px-1 py-1.5 sm:py-2 gap-1 data-[state=active]:shadow-sm relative truncate",
                  isPersonalIncomplete && "border border-red-200 text-red-700 bg-red-50/40"
                )}
              >
                <User className="h-3.5 w-3.5 hidden md:inline" />
                <span className="truncate">Personal</span>
                {isPersonalIncomplete && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600" />}
              </TabsTrigger>

              <TabsTrigger
                value="professional"
                className={cn(
                  "rounded-lg text-[11px] sm:text-xs md:text-sm px-1 py-1.5 sm:py-2 gap-1 data-[state=active]:shadow-sm relative truncate",
                  isProfessionalIncomplete && "border border-red-200 text-red-700 bg-red-50/40"
                )}
              >
                <Briefcase className="h-3.5 w-3.5 hidden md:inline" />
                <span className="truncate">Pro Info</span>
                {isProfessionalIncomplete && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600" />}
              </TabsTrigger>

              <TabsTrigger
                value="documents"
                className={cn(
                  "rounded-lg text-[11px] sm:text-xs md:text-sm px-1 py-1.5 sm:py-2 gap-1 data-[state=active]:shadow-sm relative truncate",
                  isDocsIncomplete && "border border-red-200 text-red-700 bg-red-50/40"
                )}
              >
                <FileText className="h-3.5 w-3.5 hidden md:inline" />
                <span className="truncate">Docs</span>
                {isDocsIncomplete && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600" />}
              </TabsTrigger>

              <TabsTrigger
                value="bank"
                className={cn(
                  "rounded-lg text-[11px] sm:text-xs md:text-sm px-1 py-1.5 sm:py-2 gap-1 data-[state=active]:shadow-sm relative transition-all truncate",
                  isBankIncomplete && "border border-red-400 text-red-700 bg-red-50 font-semibold"
                )}
              >
                <Landmark className={cn("h-3.5 w-3.5 hidden md:inline", isBankIncomplete && "text-red-600")} />
                <span className="truncate">Bank</span>
                {isBankIncomplete && (
                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* PERSONAL TAB */}
            <TabsContent value="personal" className="space-y-4 focus-visible:outline-none">
              <Card className="border shadow-md">
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" /> Profile Identity
                  </CardTitle>
                  <CardDescription className="text-xs">Manage personal configurations and identification metrics</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                    {user && (
                      <AvatarUpload
                        userId={user.id}
                        currentAvatarUrl={personal.avatar_url}
                        fallbackName={personal.full_name}
                        onAvatarChange={(url) => setPersonal(prev => ({ ...prev, avatar_url: url }))}
                        size="md"
                      />
                    )}
                    <div className="space-y-1 w-full mt-2 sm:mt-0">
                      <h3 className="font-semibold text-base">{formatLawyerName(personal.full_name) || "Legal Professional"}</h3>
                      <p className="text-xs text-muted-foreground break-all">{personal.email}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2">
                        <Badge variant="secondary" className="gap-1 py-0.5 px-2 text-[10px] sm:text-xs">
                          <Shield className="h-3 w-3" /> Professional
                        </Badge>
                        {professional.status === 'approved' && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-0.5 px-2 text-[10px] sm:text-xs">Verified</Badge>
                        )}
                        {professional.status === 'pending' && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 py-0.5 px-2 text-[10px] sm:text-xs">Pending</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="full_name" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name *
                      </Label>
                      <Input
                        id="full_name"
                        value={personal.full_name}
                        onChange={(e) => setPersonal(prev => ({ ...prev, full_name: e.target.value }))}
                        className={cn("h-9 sm:h-10 text-sm", !personal.full_name.trim() && 'border-red-400 bg-red-50/10')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
                      </Label>
                      <Input id="email" value={personal.email} disabled className="h-9 sm:h-10 text-sm bg-muted text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <PhoneIcon className="h-3.5 w-3.5 text-muted-foreground" /> Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={personal.phone || ''}
                        onChange={(e) => setPersonal(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className={cn(
                          "h-9 sm:h-10 text-sm",
                          (!personal.phone?.trim() || errors.phone) && 'border-red-400 bg-red-50/10'
                        )}
                      />
                      {errors.phone && <p className="text-[11px] text-destructive mt-0.5">{errors.phone}</p>}
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /> Date of Birth
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal h-9 sm:h-10 px-3 rounded-lg border text-xs sm:text-sm bg-background text-black hover:bg-background',
                              !personal.date_of_birth && 'text-muted-foreground'
                            )}
                          >
                            <span>
                              {personal.date_of_birth ? format(parseISO(personal.date_of_birth), 'dd MMM yyyy') : 'Select date of birth'}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] sm:w-[320px] p-2 sm:p-4 rounded-xl border bg-background shadow-lg" align="start">
                          <Calendar
                            mode="single"
                            selected={personal.date_of_birth ? parseISO(personal.date_of_birth) : undefined}
                            onSelect={(date) => setPersonal(prev => ({ ...prev, date_of_birth: date ? format(date, 'yyyy-MM-dd') : null }))}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="bio" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Professional Bio *
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="Describe your legal experience, expertise..."
                        className={cn("min-h-[100px] text-xs sm:text-sm leading-relaxed", !professional.bio.trim() && 'border-red-400 bg-red-50/10')}
                        value={professional.bio}
                        onChange={(e) => setProfessional(prev => ({ ...prev, bio: e.target.value }))}
                        maxLength={1000}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PROFESSIONAL TAB */}
            <TabsContent value="professional" className="space-y-4 focus-visible:outline-none">
              <Card className="border shadow-md">
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" /> Legal Specializations *
                  </CardTitle>
                  <CardDescription className="text-xs">Select your areas of law expertise (At least 1 required)</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {SPECIALIZATION_OPTIONS.map(spec => (
                      <Badge
                        key={spec}
                        variant={professional.specializations.includes(spec) ? 'default' : 'outline'}
                        className="cursor-pointer hover:opacity-90 py-1 px-2.5 text-[11px]"
                        onClick={() => toggleSpecialization(spec)}
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-md">
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" /> Credentials & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="education" className="text-xs sm:text-sm">Education Details *</Label>
                    <Textarea
                      id="education"
                      placeholder="e.g., LLB, LLM from National Law School..."
                      className={cn("min-h-[80px] text-xs sm:text-sm", !professional.education.trim() && "border-red-400 bg-red-50/10")}
                      value={professional.education}
                      onChange={(e) => setProfessional(prev => ({ ...prev, education: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="bar_council" className="text-xs sm:text-sm">Bar Council Reg Number *</Label>
                      <Input
                        id="bar_council"
                        className={cn("h-9 sm:h-10 text-sm", !professional.bar_council_number.trim() && "border-red-400 bg-red-50/10")}
                        value={professional.bar_council_number}
                        onChange={(e) => setProfessional(prev => ({ ...prev, bar_council_number: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="experience" className="text-xs sm:text-sm">Total Years of Experience</Label>
                      <Input
                        id="experience"
                        type="text"
                        inputMode="numeric"
                        className="h-9 sm:h-10 text-sm"
                        value={experienceInput}
                        onChange={(e) => {
                          const normalized = e.target.value.replace(/\D/g, '').replace(/^0+(?!$)/, '');
                          setExperienceInput(normalized);
                          setProfessional(prev => ({ ...prev, experience_years: normalized === '' ? 0 : parseInt(normalized, 10) }));
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-md">
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Languages className="h-4 w-4 sm:h-5 sm:w-5" /> Practice Languages
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGE_OPTIONS.map(lang => (
                      <Badge
                        key={lang}
                        variant={professional.languages.includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer py-1 px-2.5 text-[11px]"
                        onClick={() => toggleLanguage(lang)}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Section */}
              <Card className="border shadow-md">
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" /> Consultation Pricing
                  </CardTitle>
                  <CardDescription className="text-xs">Set specific live consulting rates (₹5 - ₹100 per minute)</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="chat_price_per_minute" className="text-xs">Chat Rate (₹/min)</Label>
                      <Input
                        id="chat_price_per_minute"
                        type="number"
                        className="h-9 text-sm"
                        value={professional.chat_price_per_minute || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setProfessional(prev => ({ ...prev, chat_price_per_minute: val }));
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="audio_price_per_minute" className="text-xs">Audio Rate (₹/min)</Label>
                      <Input
                        id="audio_price_per_minute"
                        type="number"
                        className="h-9 text-sm"
                        value={professional.audio_price_per_minute || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setProfessional(prev => ({ ...prev, audio_price_per_minute: val }));
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="video_price_per_minute" className="text-xs">Video Rate (₹/min)</Label>
                      <Input
                        id="video_price_per_minute"
                        type="number"
                        className="h-9 text-sm"
                        value={professional.video_price_per_minute || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setProfessional(prev => ({ ...prev, video_price_per_minute: val }));
                        }}
                      />
                    </div>
                  </div>
                  {/* SMALL PRICING CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                    {/* LEFT COLUMN: INDIVIDUAL CARD BREAKDOWNS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      {/* CHAT CARD */}
                      <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                            Chat pricing
                          </p>
                          <p className="mt-1 text-sm sm:text-base font-bold tracking-tight text-foreground">
                            Extra rate: ₹{professional.chat_price_per_minute}/min
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-border/60 space-y-1 text-[11px] sm:text-xs text-muted-foreground/90">
                          {[5, 10, 15, 30].map(minutes => (
                            <div key={minutes} className="flex items-center justify-between py-0.5">
                              <span className="font-medium text-muted-foreground">{minutes} min pack</span>
                              <span className="font-semibold text-foreground">
                                ₹{(professional.chat_price_per_minute * minutes).toFixed(0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AUDIO CARD */}
                      <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                            Audio pricing
                          </p>
                          <p className="mt-1 text-sm sm:text-base font-bold tracking-tight text-foreground">
                            Extra rate: ₹{professional.audio_price_per_minute}/min
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-border/60 space-y-1 text-[11px] sm:text-xs text-muted-foreground/90">
                          {[10, 15, 20, 30].map(minutes => (
                            <div key={minutes} className="flex items-center justify-between py-0.5">
                              <span className="font-medium text-muted-foreground">{minutes} min pack</span>
                              <span className="font-semibold text-foreground">
                                ₹{(professional.audio_price_per_minute * minutes).toFixed(0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* VIDEO CARD */}
                      <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                            Video pricing
                          </p>
                          <p className="mt-1 text-sm sm:text-base font-bold tracking-tight text-foreground">
                            Extra rate: ₹{professional.video_price_per_minute}/min
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-border/60 space-y-1 text-[11px] sm:text-xs text-muted-foreground/90">
                          {[10, 15, 20, 30].map(minutes => (
                            <div key={minutes} className="flex items-center justify-between py-0.5">
                              <span className="font-medium text-muted-foreground">{minutes} min pack</span>
                              <span className="font-semibold text-foreground">
                                ₹{(professional.video_price_per_minute * minutes).toFixed(0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SESSION CARD */}
                      <div className="rounded-xl bg-muted/40 border border-border/60 p-2.5 sm:p-3.5 opacity-65 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-2 right-2">
                          <span className="text-[8px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/50">
                            Soon
                          </span>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                            Session pricing
                          </p>
                          <p className="mt-1 text-sm sm:text-base font-bold tracking-tight text-muted-foreground">
                            ₹{professional.session_price}
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-dashed border-border/80 space-y-1 text-[11px] text-muted-foreground/70">
                          {[30, 60, 120, 180].map(minutes => (
                            <div key={minutes} className="flex items-center justify-between py-0.5">
                              <span>{minutes} min slot</span>
                              <span>₹{professional.session_price}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 italic mt-2 pt-1 border-t border-border/40">
                          This feature is not available yet.
                        </p>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: PROFESSIONAL MATRIX VIEW */}
                    <div className="rounded-xl border border-border bg-background p-3 sm:p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
                        <div>
                          <p className="text-xs font-semibold text-foreground tracking-tight">Pricing Summary Matrix</p>
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                            Live editable legal consultation channel rates.
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[9px] font-medium text-emerald-600 whitespace-nowrap hidden sm:inline-block">
                          Live active rates
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 flex-grow">

                        {/* MATRIX ITEM: CHAT */}
                        <div className="rounded-lg bg-muted/20 p-2.5 border border-border/70 flex flex-col justify-center">
                          <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Chat</p>
                          <p className="mt-0.5 text-sm sm:text-lg font-bold text-foreground">
                            ₹{professional.chat_price_per_minute}<span className="text-[10px] font-normal text-muted-foreground">/min</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1">
                            5 / 10 / 15 / 30 min
                          </p>
                        </div>

                        {/* MATRIX ITEM: AUDIO */}
                        <div className="rounded-lg bg-muted/20 p-2.5 border border-border/70 flex flex-col justify-center">
                          <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Audio</p>
                          <p className="mt-0.5 text-sm sm:text-lg font-bold text-foreground">
                            ₹{professional.audio_price_per_minute}<span className="text-[10px] font-normal text-muted-foreground">/min</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1">
                            10 / 15 / 20 / 30 min
                          </p>
                        </div>

                        {/* MATRIX ITEM: VIDEO */}
                        <div className="rounded-lg bg-muted/20 p-2.5 border border-border/70 flex flex-col justify-center">
                          <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Video</p>
                          <p className="mt-0.5 text-sm sm:text-lg font-bold text-foreground">
                            ₹{professional.video_price_per_minute}<span className="text-[10px] font-normal text-muted-foreground">/min</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1">
                            15 / 20 / 30 / 45 min
                          </p>
                        </div>

                        {/* MATRIX ITEM: SESSION */}
                        <div className="rounded-lg bg-muted/10 p-2.5 border border-dashed border-border/80 opacity-60 relative overflow-hidden flex flex-col justify-center">
                          <div className="absolute top-1 right-1">
                            <span className="text-[7px] font-bold uppercase tracking-tight text-muted-foreground/80">Soon</span>
                          </div>
                          <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/70">Session</p>
                          <p className="mt-0.5 text-sm sm:text-lg font-bold text-muted-foreground/80">
                            ₹{professional.session_price}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 truncate">
                            Flat session cost
                          </p>
                        </div>

                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DOCUMENTS TAB */}
            <TabsContent value="documents" className="space-y-6">
              {isDocsIncomplete && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>Please upload your proof documents below. Profiles with zero documents cannot be processed.</span>
                </div>
              )}
              {user && <LawyerDocuments userId={user.id} />}
            </TabsContent>


            {/* BANK DETAILS TAB */}
            <TabsContent value="bank" className="focus-visible:outline-none">
              <Card className={cn("border shadow-md", isBankIncomplete && "border-red-200")}>
                <CardHeader className="p-4 sm:p-6 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Landmark className="h-4 w-4 sm:h-5 sm:w-5" /> Settlement Bank Details
                  </CardTitle>
                  <CardDescription className="text-xs">Provide matching banking records for direct payment routing</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="bank_account_name" className="text-xs sm:text-sm">Account Holder Name *</Label>
                      <Input
                        id="bank_account_name"
                        placeholder="As specified on passbook/cheque"
                        className="h-9 sm:h-10 text-sm"
                        value={professional.bank_account_name}
                        onChange={(e) => setProfessional(prev => ({ ...prev, bank_account_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bank_account_number" className="text-xs sm:text-sm">Account Number *</Label>
                      <Input
                        id="bank_account_number"
                        type="password"
                        placeholder="Enter bank account number"
                        className="h-9 sm:h-10 text-sm"
                        value={professional.bank_account_number}
                        onChange={(e) => setProfessional(prev => ({ ...prev, bank_account_number: e.target.value.replace(/\D/g, '') }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bank_ifsc_code" className="text-xs sm:text-sm">IFSC Code *</Label>
                      <Input
                        id="bank_ifsc_code"
                        placeholder="e.g. SBIN0001234"
                        className="h-9 sm:h-10 text-sm uppercase"
                        maxLength={11}
                        value={professional.bank_ifsc_code}
                        onChange={(e) => setProfessional(prev => ({ ...prev, bank_ifsc_code: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className={cn("h-9 px-4 text-xs sm:text-sm", rejectButtonStyle)}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={saving}
              className={cn(
                "h-9 px-4 text-xs sm:text-sm",
                acceptButtonStyle,
                showGlobalWarning && "bg-red-600 hover:bg-red-700 text-white border-red-600"
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  {showGlobalWarning ? "Save Profile" : "Save Changes"}
                </>
              )}
            </Button>
          </div>

        </div>
      </div>
    </LawyerLayout>
  );
};

export default LawyerManageAccount;