import { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingStepCard } from '@/components/onboarding/OnboardingStepCard';
import { SpecializationSelector } from '@/components/onboarding/SpecializationSelector';
import { LanguageSelector } from '@/components/onboarding/LanguageSelector';

import {
  ArrowLeft, Save, GraduationCap, Languages, Briefcase,
  DollarSign, FileText, Award, User, Clock, Shield,
  CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { LawyerDocuments } from '@/components/profile/LawyerDocuments';
interface LawyerProfileData {
  bio: string;
  education: string;
  bar_council_number: string;
  experience_years: number;
  // price_per_minute: number;
  chat_price_per_minute: number;
  audio_price_per_minute: number;
  video_price_per_minute: number;
  session_price: number;
  specializations: string[];
  languages: string[];
  status: string;
}

const LawyerOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<LawyerProfileData>({
    bio: '',
    education: '',
    bar_council_number: '',
    experience_years: 0,
    // price_per_minute: 5,
    chat_price_per_minute: 2,
    audio_price_per_minute: 5,
    video_price_per_minute: 8,
    session_price: 100,
    specializations: [],
    languages: ['English'],
    status: 'pending',

  });

  // Calculate completion status for each step
  const getStepCompletion = useCallback(() => ({
    bio: profileData.bio.trim().length >= 50,
    specializations: profileData.specializations.length > 0,
    credentials: profileData.bar_council_number.trim().length > 0,
    pricing:
      profileData.chat_price_per_minute >= 1 &&
      profileData.audio_price_per_minute >= 1 &&
      profileData.video_price_per_minute >= 1 &&
      profileData.session_price >= 10,
    languages: profileData.languages.length > 0,
  }), [profileData]);

  const completion = getStepCompletion();
  const completedSteps = Object.values(completion).filter(Boolean).length;
  const totalSteps = Object.keys(completion).length;
  const isProfileComplete = completedSteps === totalSteps;

  const steps = [
    { id: 'bio', title: 'Bio', description: 'About you', isComplete: completion.bio, isCurrent: !completion.bio },
    { id: 'specializations', title: 'Expertise', description: 'Your areas', isComplete: completion.specializations, isCurrent: completion.bio && !completion.specializations },
    { id: 'credentials', title: 'Credentials', description: 'Verification', isComplete: completion.credentials, isCurrent: completion.specializations && !completion.credentials },
    { id: 'pricing', title: 'Pricing', description: 'Your rates', isComplete: completion.pricing, isCurrent: completion.credentials && !completion.pricing },
    { id: 'languages', title: 'Languages', description: 'Communication', isComplete: completion.languages, isCurrent: completion.pricing && !completion.languages },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfileData({
        bio: data.bio || '',
        education: data.education || '',
        bar_council_number: data.bar_council_number || '',
        experience_years: data.experience_years || 0,
        // price_per_minute: data.price_per_minute || 5,
        chat_price_per_minute: data.chat_price_per_minute || 2,
        audio_price_per_minute: data.audio_price_per_minute || 5,
        video_price_per_minute: data.video_price_per_minute || 8,
        session_price: data.session_price || 100,
        specializations: data.specializations || [],
        languages: data.languages || ['English'],
        status: data.status || 'pending',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!profileData.bio.trim()) {
      toast({ variant: 'destructive', title: 'Bio is required', description: 'Please write a professional bio (at least 50 characters).' });
      return;
    }
    if (profileData.bio.trim().length < 50) {
      toast({ variant: 'destructive', title: 'Bio too short', description: 'Please write at least 50 characters.' });
      return;
    }
    if (profileData.specializations.length === 0) {
      toast({ variant: 'destructive', title: 'Select at least one specialization' });
      return;
    }
    if (!profileData.bar_council_number.trim()) {
      toast({ variant: 'destructive', title: 'Bar Council Number required', description: 'Please enter your registration number for verification.' });
      return;
    }
    if (
      profileData.chat_price_per_minute < 1 || profileData.chat_price_per_minute > 100 ||
      profileData.audio_price_per_minute < 1 || profileData.audio_price_per_minute > 100 ||
      profileData.video_price_per_minute < 1 || profileData.video_price_per_minute > 100
    ) {
      toast({ variant: 'destructive', title: 'Each per-minute rate must be between ₹1 and ₹100' });
      return;
    }
    if (profileData.session_price < 10) {
      toast({ variant: 'destructive', title: 'Session price must be at least ₹10' });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('lawyer_profiles')
      .update({
        bio: profileData.bio.trim(),
        education: profileData.education.trim(),
        bar_council_number: profileData.bar_council_number.trim(),
        experience_years: profileData.experience_years,
        chat_price_per_minute: profileData.chat_price_per_minute,
        audio_price_per_minute: profileData.audio_price_per_minute,
        video_price_per_minute: profileData.video_price_per_minute,
        session_price: profileData.session_price,
        specializations: profileData.specializations,
        languages: profileData.languages,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to save profile', description: error.message });
    } else {
      toast({
        title: '✅ Profile saved successfully!',
        description: isProfileComplete
          ? 'Your profile is now under review.'
          : 'Complete all required fields to submit for review.'
      });
      navigate('/lawyer/dashboard');
    }
    setSaving(false);
  };

  const getStatusBadge = () => {
    switch (profileData.status) {
      case 'approved':
        return (
          <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-3 py-1">
            <Shield className="h-3.5 w-3.5" />
            Verified Lawyer
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="gap-1.5 bg-destructive/10 text-destructive border-destructive/30 px-3 py-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Application Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/30 px-3 py-1">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </Badge>
        );
    }
  };

  if (authLoading || loading) {
    return (
      // <MainLayout showFooter={false}>
      <LawyerLayout>
        {/* <div className="container mx-auto px-4 py-8 max-w-4xl"> */}
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-24 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
        {/* </MainLayout> */}
      </LawyerLayout>
    );
  }

  return (
    // <MainLayout showFooter={false}>
    // <LawyerLayout>
    //   <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
    //     <div className="container mx-auto px-4 py-8 max-w-4xl">
    //       {/* Header */}
    //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    //         <Button
    //           variant="ghost"
    //           className="gap-2 w-fit"
    //           onClick={() => navigate('/lawyer/dashboard')}
    //         >
    //           <ArrowLeft className="h-4 w-4" />
    //           Back to Dashboard
    //         </Button>
    //         {getStatusBadge()}
    //       </div>

    //       {/* Title & Description */}
    //       <div className="mb-8">
    //         <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
    //           Complete Your Profile
    //         </h1>
    //         <p className="text-muted-foreground text-lg">
    //           Fill in all required information to get verified and start accepting consultations
    //         </p>
    //       </div>

    //       {/* Progress Tracker */}
    //       <Card className="mb-8 border-2">
    //         <CardContent className="p-6">
    //           <OnboardingProgress steps={steps} currentStep={completedSteps} />

    //           {isProfileComplete ? (
    //             <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-3">
    //               <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
    //               <div>
    //                 <p className="font-medium text-emerald-700">Profile Complete!</p>
    //                 <p className="text-sm text-muted-foreground">
    //                   {profileData.status === 'pending'
    //                     ? 'Your profile is under review. We\'ll notify you once approved.'
    //                     : profileData.status === 'approved'
    //                       ? 'You\'re verified and can accept consultations.'
    //                       : 'Please update your profile and resubmit.'}
    //                 </p>
    //               </div>
    //             </div>
    //           ) : (
    //             <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-3">
    //               <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
    //               <div>
    //                 <p className="font-medium text-amber-700">Profile Incomplete</p>
    //                 <p className="text-sm text-muted-foreground">
    //                   Complete all required fields to submit your profile for verification.
    //                 </p>
    //               </div>
    //             </div>
    //           )}
    //         </CardContent>
    //       </Card>

    //       <div className="space-y-6">
    //         {/* Bio Section */}
    //         <OnboardingStepCard
    //           title="Professional Bio"
    //           description="Write a compelling bio that highlights your expertise and experience"
    //           icon={<FileText className="h-6 w-6" />}
    //           isComplete={completion.bio}
    //         >
    //           <div className="space-y-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="bio">About You *</Label>
    //               <Textarea
    //                 id="bio"
    //                 placeholder="I am a seasoned legal professional with expertise in... Describe your experience, notable cases, and approach to helping clients."
    //                 className="min-h-[150px] resize-none"
    //                 value={profileData.bio}
    //                 onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
    //                 maxLength={1000}
    //               />
    //               <div className="flex justify-between text-xs text-muted-foreground">
    //                 <span>Minimum 50 characters required</span>
    //                 <span className={profileData.bio.length < 50 ? 'text-amber-600' : 'text-emerald-600'}>
    //                   {profileData.bio.length}/1000
    //                 </span>
    //               </div>
    //             </div>
    //           </div>
    //         </OnboardingStepCard>

    //         {/* Specializations */}
    //         <OnboardingStepCard
    //           title="Areas of Expertise"
    //           description="Select your practice areas to help clients find you"
    //           icon={<Briefcase className="h-6 w-6" />}
    //           isComplete={completion.specializations}
    //         >
    //           <SpecializationSelector
    //             selected={profileData.specializations}
    //             onChange={(specs) => setProfileData(prev => ({ ...prev, specializations: specs }))}
    //           />
    //         </OnboardingStepCard>

    //         {/* Credentials */}
    //         <OnboardingStepCard
    //           title="Education & Credentials"
    //           description="Verify your qualifications for client trust"
    //           icon={<GraduationCap className="h-6 w-6" />}
    //           isComplete={completion.credentials}
    //         >
    //           <div className="space-y-6">
    //             <div className="space-y-2">
    //               <Label htmlFor="education">Education Background</Label>
    //               <Textarea
    //                 id="education"
    //                 placeholder="e.g., LLB from Harvard Law School (2015), LLM in Corporate Law from Yale (2017)"
    //                 className="min-h-[100px] resize-none"
    //                 value={profileData.education}
    //                 onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
    //                 maxLength={500}
    //               />
    //             </div>

    //             <Separator />

    //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //               <div className="space-y-2">
    //                 <Label htmlFor="bar_council">Bar Council Number *</Label>
    //                 <Input
    //                   className="w-full"
    //                   id="bar_council"
    //                   placeholder="Enter your bar registration number"
    //                   value={profileData.bar_council_number}
    //                   onChange={(e) => setProfileData(prev => ({ ...prev, bar_council_number: e.target.value }))}
    //                 />
    //                 <p className="text-xs text-muted-foreground">
    //                   Required for verification by admin
    //                 </p>
    //               </div>
    //               <div className="space-y-2">
    //                 <Label htmlFor="experience">Years of Experience</Label>
    //                 <Input
    //                   className="w-full"
    //                   id="experience"
    //                   type="number"
    //                   min="0"
    //                   max="50"
    //                   value={profileData.experience_years}
    //                   onChange={(e) => setProfileData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
    //                 />
    //                 <p className="text-xs text-muted-foreground">
    //                   Total years in legal practice
    //                 </p>
    //               </div>
    //             </div>
    //           </div>
    //         </OnboardingStepCard>

    //         {/* Languages */}
    //         <OnboardingStepCard
    //           title="Languages"
    //           description="Select languages you can consult in"
    //           icon={<Languages className="h-6 w-6" />}
    //           isComplete={completion.languages}
    //         >
    //           <LanguageSelector
    //             selected={profileData.languages}
    //             onChange={(langs) => setProfileData(prev => ({ ...prev, languages: langs }))}
    //           />
    //         </OnboardingStepCard>

    //         {/* Pricing */}
    //         {/* <OnboardingStepCard
    //           title="Consultation Rates"
    //           description="Set your pricing for different consultation types"
    //           icon={<DollarSign className="h-6 w-6" />}
    //           isComplete={completion.pricing}
    //         >
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //             <div className="space-y-2">
    //               <Label htmlFor="price_per_minute">Price per Minute ($) *</Label>
    //               <div className="relative">
    //                 <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    //                 <Input
    //                   id="price_per_minute"
    //                   type="number"
    //                   min="1"
    //                   max="100"
    //                   step="0.5"
    //                   className="pl-9"
    //                   value={profileData.price_per_minute}
    //                   onChange={(e) => setProfileData(prev => ({ ...prev, price_per_minute: parseFloat(e.target.value) || 1 }))}
    //                 />
    //               </div>
    //               <p className="text-xs text-muted-foreground">
    //                 For chat, audio, and video calls
    //               </p>
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="session_price">Session Price ($) *</Label>
    //               <div className="relative">
    //                 <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    //                 <Input
    //                   id="session_price"
    //                   type="number"
    //                   min="10"
    //                   max="1000"
    //                   step="5"
    //                   className="pl-9"
    //                   value={profileData.session_price}
    //                   onChange={(e) => setProfileData(prev => ({ ...prev, session_price: parseFloat(e.target.value) || 10 }))}
    //                 />
    //               </div>
    //               <p className="text-xs text-muted-foreground">
    //                 Fixed price for scheduled sessions
    //               </p>
    //             </div>
    //           </div> */}

    //         {/* Pricing Preview */}
    //         {/* <div className="mt-6 p-4 bg-muted/50 rounded-lg">
    //             <p className="text-sm font-medium mb-3">Pricing Preview</p>
    //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
    //               <div className="p-3 bg-background rounded-lg">
    //                 <p className="text-xs text-muted-foreground">10 min call</p>
    //                 <p className="font-semibold">${(profileData.price_per_minute * 10).toFixed(2)}</p>
    //               </div>
    //               <div className="p-3 bg-background rounded-lg">
    //                 <p className="text-xs text-muted-foreground">30 min call</p>
    //                 <p className="font-semibold">${(profileData.price_per_minute * 30).toFixed(2)}</p>
    //               </div>
    //               <div className="p-3 bg-background rounded-lg">
    //                 <p className="text-xs text-muted-foreground">60 min call</p>
    //                 <p className="font-semibold">${(profileData.price_per_minute * 60).toFixed(2)}</p>
    //               </div>
    //               <div className="p-3 bg-background rounded-lg border-2 border-primary/20">
    //                 <p className="text-xs text-muted-foreground">Session</p>
    //                 <p className="font-semibold text-primary">${profileData.session_price.toFixed(2)}</p>
    //               </div>
    //             </div>
    //           </div>
    //         </OnboardingStepCard> */}

    //         {/* Pricing */}
    //         <OnboardingStepCard
    //           title="Consultation Rates"
    //           description="Set your pricing for Chat, Audio & Video"
    //           icon={<DollarSign className="h-6 w-6" />}
    //           isComplete={completion.pricing}
    //         >
    //           {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
    //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

    //             {/* Chat */}
    //             <div className="space-y-2">
    //               <Label>Chat (₹ / min)</Label>
    //               {/* <Input
    //                 type="number"
    //                 min="1"
    //                 value={profileData.chat_price_per_minute}
    //                 onChange={(e) =>
    //                   setProfileData(prev => ({
    //                     ...prev,
    //                     // chat_price_per_minute: parseFloat(e.target.value) || 1
    //                     chat_price_per_minute: e.target.value === '' ? 0 : parseFloat(e.target.value)
    //                   }))
    //                 }
    //               /> */}
    //               <Input
    //                 className="w-full"
    //                 type="text"
    //                 inputMode="decimal"
    //                 placeholder="1 - 10"
    //                 value={profileData.chat_price_per_minute}
    //                 onChange={(e) => {
    //                   const value = e.target.value;

    //                   // allow only numbers + decimal
    //                   if (!/^\d*\.?\d*$/.test(value)) return;

    //                   let num = value === '' ? '' : parseFloat(value);

    //                   // enforce max = 10
    //                   if (num > 10) num = 10;

    //                   setProfileData(prev => ({
    //                     ...prev,
    //                     chat_price_per_minute: num === '' ? '' : num
    //                   }));
    //                 }}
    //                 onBlur={(e) => {
    //                   let num = parseFloat(e.target.value);

    //                   // enforce min = 1
    //                   if (isNaN(num) || num < 1) num = 1;

    //                   setProfileData(prev => ({
    //                     ...prev,
    //                     chat_price_per_minute: num
    //                   }));
    //                 }}
    //               />
    //             </div>

    //             {/* Audio */}
    //             <div className="space-y-2">
    //               <Label>Audio (₹ / min)</Label>
    //               <Input
    //                 className="w-full"
    //                 type="text"
    //                 inputMode="decimal"
    //                 placeholder="1 - 10"
    //                 value={profileData.audio_price_per_minute}
    //                 onChange={(e) => {
    //                   const value = e.target.value;

    //                   // allow only numbers + decimal
    //                   if (!/^\d*\.?\d*$/.test(value)) return;

    //                   let num = value === '' ? '' : parseFloat(value);

    //                   // enforce max = 10
    //                   if (num > 10) num = 10;

    //                   setProfileData(prev => ({
    //                     ...prev,
    //                     audio_price_per_minute: num === '' ? '' : num
    //                   }));
    //                 }}
    //                 onBlur={(e) => {
    //                   let num = parseFloat(e.target.value);

    //                   // enforce min = 1
    //                   if (isNaN(num) || num < 1) num = 1;

    //                   setProfileData(prev => ({
    //                     ...prev,
    //                     audio_price_per_minute: num
    //                   }));
    //                 }}
    //               />
    //             </div>

    //             {/* Video */}
    //             <div className="space-y-2">
    //               <Label>Video (₹ / min)</Label>
    //               <Input
    //                 className="w-full"
    //                 type="text"
    //                 inputMode="decimal"
    //                 placeholder="1 - 10"
    //                 value={profileData.video_price_per_minute}
    //                 onChange={(e) => {
    //                   const value = e.target.value;

    //                   // allow only numbers + decimal
    //                   if (!/^\d*\.?\d*$/.test(value)) return;

    //                   let num = value === '' ? '' : parseFloat(value);

    //                   // enforce max = 10
    //                   if (num > 10) num = 10;

    //                   setProfileData(prev => ({
    //                     ...prev,
    //                     video_price_per_minute: num === '' ? '' : num
    //                   }));
    //                 }}
    //                 onBlur={(e) => {
    //                   let num = parseFloat(e.target.value);

    //                   // enforce min = 1
    //                   if (isNaN(num) || num < 1) num = 1;

    //                   setProfileData(prev => ({
    //                     ...prev,
    //                     video_price_per_minute: num
    //                   }));
    //                 }}
    //               />
    //             </div>
    //           </div>

    //           {/* Session Price */}
    //           <div className="mt-6 space-y-2">
    //             <Label>Session Price (₹)</Label>
    //             <Input
    //               className="w-full"
    //               type="number"
    //               min="10"
    //               value={profileData.session_price}
    //               onChange={(e) =>
    //                 setProfileData(prev => ({
    //                   ...prev,
    //                   session_price: parseFloat(e.target.value) || 10
    //                 }))
    //               }
    //             />
    //           </div>

    //           {/* Pricing Preview */}
    //           <div className="mt-6 p-4 bg-muted/50 rounded-lg">
    //             <p className="text-sm font-medium mb-3">Pricing Preview</p>

    //             {/* <div className="grid md:grid-cols-3 gap-4 text-center"> */}
    //             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-center">

    //               {/* CHAT */}
    //               {/* <div className="p-3 bg-background rounded-lg"> */}
    //               <div className="p-3 bg-background rounded-lg break-words text-xs sm:text-sm">
    //                 <p className="text-xs mb-2 text-muted-foreground">Chat</p>
    //                 {[5, 10, 15, 20].map(time => (
    //                   <p key={time} className="text-sm">
    //                     {time} min →
    //                     {/* <b>₹{(profileData.chat_price_per_minute * time).toFixed(2)}</b> */}
    //                     <b className="whitespace-nowrap">
    //                       ₹{(profileData.chat_price_per_minute * time).toFixed(2)}
    //                     </b>
    //                   </p>
    //                 ))}
    //               </div>

    //               {/* AUDIO */}
    //               <div className="p-3 bg-background rounded-lg">
    //                 <p className="text-xs mb-2 text-muted-foreground">Audio</p>
    //                 {[10, 15, 20, 30].map(time => (
    //                   <p key={time} className="text-sm">
    //                     {time} min → <b>₹{(profileData.audio_price_per_minute * time).toFixed(2)}</b>
    //                   </p>
    //                 ))}
    //               </div>

    //               {/* VIDEO */}
    //               <div className="p-3 bg-background rounded-lg border border-primary/20">
    //                 <p className="text-xs mb-2 text-muted-foreground">Video</p>
    //                 {[15, 20, 30, 45].map(time => (
    //                   <p key={time} className="text-sm">
    //                     {time} min → <b>₹{(profileData.video_price_per_minute * time).toFixed(2)}</b>
    //                   </p>
    //                 ))}
    //               </div>

    //             </div>

    //             <div className="mt-4 text-center">
    //               <p className="text-sm">
    //                 Session → <b className="text-primary">${profileData.session_price.toFixed(2)}</b>
    //               </p>
    //             </div>
    //           </div>
    //         </OnboardingStepCard>

    //         {/* Actions */}
    //         <Card className="border-2">
    //           <CardContent className="p-6">
    //             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    //               <div>
    //                 <p className="font-medium">
    //                   {isProfileComplete ? 'Ready to submit!' : `${totalSteps - completedSteps} step${totalSteps - completedSteps > 1 ? 's' : ''} remaining`}
    //                 </p>
    //                 <p className="text-sm text-muted-foreground">
    //                   {isProfileComplete
    //                     ? 'Save your profile to submit for admin review'
    //                     : 'Complete all required fields to submit'}
    //                 </p>
    //               </div>
    //               <div className="flex gap-3 w-full sm:w-auto">
    //                 <Button
    //                   variant="outline"
    //                   onClick={() => navigate('/lawyer/dashboard')}
    //                   className="flex-1 sm:flex-initial"
    //                 >
    //                   Cancel
    //                 </Button>
    //                 <Button
    //                   onClick={handleSave}
    //                   disabled={saving || !isProfileComplete}
    //                   className="flex-1 sm:flex-initial gap-2"
    //                 >
    //                   {saving ? (
    //                     <>
    //                       <Loader2 className="h-4 w-4 animate-spin" />
    //                       Saving...
    //                     </>
    //                   ) : (
    //                     <>
    //                       <Save className="h-4 w-4" />
    //                       Save & Submit
    //                     </>
    //                   )}
    //                 </Button>
    //               </div>
    //             </div>
    //           </CardContent>
    //         </Card>
    //         {/* Documents
    //         {user && <LawyerDocuments userId={user.id} />} */}
    //       </div>
    //     </div>
    //   </div>
    //   {/* </MainLayout> */}
    // </LawyerLayout>

    <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => navigate('/lawyer/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {getStatusBadge()}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Finish onboarding to start accepting consultations
            </p>
          </div>

          {/* Progress */}
          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-4">
              <OnboardingProgress steps={steps} currentStep={completedSteps} />

              <div className={`p-3 rounded-md flex gap-3 items-start text-sm ${isProfileComplete
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-amber-500/10 border border-amber-500/20'
                }`}>
                {isProfileComplete ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                )}
                <p>
                  {isProfileComplete
                    ? 'Profile complete. Ready for review.'
                    : 'Complete all steps to submit profile.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {/* <div className="space-y-4"> */}
          <div className="space-y-3 sm:space-y-4">

            {/* Bio */}
            <OnboardingStepCard
              title="Professional Bio"
              description="Your introduction"
              icon={<FileText className="h-5 w-5" />}
              isComplete={completion.bio}
            >
              <div className="space-y-2">
                <Textarea
                  placeholder="Describe your experience..."
                  className="min-h-[120px] text-sm"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData(prev => ({ ...prev, bio: e.target.value }))
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min 50 chars</span>
                  <span>{profileData.bio.length}/1000</span>
                </div>
              </div>
            </OnboardingStepCard>

            {/* Specialization */}
            <OnboardingStepCard
              title="Expertise"
              description="Your practice areas"
              icon={<Briefcase className="h-5 w-5" />}
              isComplete={completion.specializations}
            >
              <SpecializationSelector
                selected={profileData.specializations}
                onChange={(specs) =>
                  setProfileData(prev => ({ ...prev, specializations: specs }))
                }
              />
            </OnboardingStepCard>

            {/* Credentials */}
            <OnboardingStepCard
              title="Credentials"
              description="Your qualifications"
              icon={<GraduationCap className="h-5 w-5" />}
              isComplete={completion.credentials}
            >
              {/* <div className="space-y-4"> */}
              <div className="space-y-3 sm:space-y-4">

                <Textarea
                  placeholder="BA LLB (Hons.) from National Law University, Odisha with specialization in Criminal and Corporate Law."
                  className="min-h-[80px] text-sm"
                  value={profileData.education}
                  onChange={(e) =>
                    setProfileData(prev => ({ ...prev, education: e.target.value }))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Bar Council Number"
                    value={profileData.bar_council_number}
                    onChange={(e) =>
                      setProfileData(prev => ({
                        ...prev,
                        bar_council_number: e.target.value
                      }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Experience (years)"
                    value={profileData.experience_years}
                    onChange={(e) =>
                      setProfileData(prev => ({
                        ...prev,
                        experience_years: parseInt(e.target.value) || 0
                      }))
                    }
                  />
                </div>
              </div>
            </OnboardingStepCard>

            {/* Languages */}
            <OnboardingStepCard
              title="Languages"
              description="Communication"
              icon={<Languages className="h-5 w-5" />}
              isComplete={completion.languages}
            >
              <LanguageSelector
                selected={profileData.languages}
                onChange={(langs) =>
                  setProfileData(prev => ({ ...prev, languages: langs }))
                }
              />
            </OnboardingStepCard>

            {/* Pricing */}
            <OnboardingStepCard
              title="Pricing"
              description="Set price per minute for each consultation type"
              icon={<DollarSign className="h-5 w-5" />}
              isComplete={completion.pricing}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'chat_price_per_minute', label: 'Chat', description: 'Instant message support' },
                  { key: 'audio_price_per_minute', label: 'Audio', description: 'Voice consultation' },
                  { key: 'video_price_per_minute', label: 'Video', description: 'Face-to-face call' },
                ].map(({ key, label, description }) => {
                  const value = profileData[key as keyof typeof profileData] as number;
                  const hasError = value < 1 || value > 100;
                  return (
                    <div key={key} className="space-y-2">
                      <Label>{label} Rate (₹ / min)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        step={0.5}
                        placeholder="Enter rate"
                        value={value}
                        className={hasError ? 'border-destructive' : ''}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const parsed = parseFloat(rawValue);
                          const val = Number.isNaN(parsed) ? 0 : parsed;
                          setProfileData(prev => ({
                            ...prev,
                            [key]: val
                          }));
                        }}
                      />
                      <p className="text-xs text-muted-foreground">{description}</p>
                      {hasError && (
                        <p className="text-xs text-destructive">Please enter a value between 1 and 100.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                <p className="text-sm font-medium mb-3">Typical duration preview</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Chat', minutes: [5, 10, 15, 30], rate: profileData.chat_price_per_minute },
                    { label: 'Audio', minutes: [10, 15, 20, 30], rate: profileData.audio_price_per_minute },
                    { label: 'Video', minutes: [15, 20, 30, 45], rate: profileData.video_price_per_minute },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-background p-3 border border-border">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{item.label}</p>
                      <div className="space-y-1 text-sm">
                        {item.minutes.map((minutes) => (
                          <div key={minutes} className="flex items-center justify-between">
                            <span>{minutes} min</span>
                            <span className="font-semibold">₹{(item.rate * minutes).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2 opacity-60 cursor-not-allowed select-none">

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">
                    Session price (₹)
                  </Label>

                  <span className="text-[10px] font-medium text-amber-600">
                    Coming Soon
                  </span>
                </div>

                <Input
                  type="number"
                  min={10}
                  step={1}
                  placeholder="Fixed session price"
                  value={profileData.session_price}
                  disabled
                  className="bg-muted/50 border-border/60"
                />

                <p className="text-xs text-muted-foreground">
                  Fixed pricing for scheduled sessions or packages.
                </p>

              </div>
            </OnboardingStepCard>

            {/* Actions */}
            <Card className="border shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {isProfileComplete
                    ? 'Ready to submit'
                    : `${totalSteps - completedSteps} steps remaining`}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/lawyer/dashboard')}
                  >
                    Cancel
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !isProfileComplete}
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </LawyerLayout>
  );
};

export default LawyerOnboarding;
