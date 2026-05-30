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
  CheckCircle, AlertTriangle, Loader2, IndianRupee, XCircle
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
  // const getStepCompletion = useCallback(() => ({
  //   bio: profileData.bio.trim().length >= 50,
  //   specializations: profileData.specializations.length > 0,
  //   credentials: profileData.bar_council_number.trim().length > 0,
  //   pricing:
  //     profileData.chat_price_per_minute >= 1 &&
  //     profileData.audio_price_per_minute >= 1 &&
  //     profileData.video_price_per_minute >= 1 &&
  //     profileData.session_price >= 10,
  //   languages: profileData.languages.length > 0,
  // }), [profileData]);

  const getStepCompletion = useCallback(() => ({
    bio: profileData.bio.trim().length >= 50,
    specializations: profileData.specializations.length > 0,
    credentials: profileData.bar_council_number.trim().length > 0,
    pricing:
      profileData.chat_price_per_minute >= 5 && profileData.chat_price_per_minute <= 100 &&
      profileData.audio_price_per_minute >= 5 && profileData.audio_price_per_minute <= 100 &&
      profileData.video_price_per_minute >= 5 && profileData.video_price_per_minute <= 100,
    // profileData.session_price >= 10,
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
        chat_price_per_minute: data.chat_price_per_minute || 5,
        audio_price_per_minute: data.audio_price_per_minute || 10,
        video_price_per_minute: data.video_price_per_minute || 20,
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
              icon={<IndianRupee className="h-5 w-5" />}
              isComplete={completion.pricing}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'chat_price_per_minute', label: 'Chat', description: 'Instant message support' },
                  { key: 'audio_price_per_minute', label: 'Audio', description: 'Voice consultation' },
                  { key: 'video_price_per_minute', label: 'Video', description: 'Face-to-face call' },
                ].map(({ key, label, description }) => {
                  const value = profileData[key as keyof typeof profileData] as number;
                  const hasError = value < 5 || value > 100;
                  return (
                    <div key={key} className="space-y-2">
                      <Label>{label} Rate (₹ / min)</Label>
                      <Input
                        type="number"
                        min={5}
                        max={100}
                        step={1}
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
                        <p className="text-xs text-destructive">Please enter a value between 5 and 100.</p>
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
