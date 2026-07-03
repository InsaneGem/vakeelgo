
import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Scale, ArrowLeft, Loader2, User, Briefcase, CalendarIcon, Eye, EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MainLayout } from '@/components/layout/MainLayout';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'lawyer' ? 'lawyer' : 'client';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [selectedRole, setSelectedRole] = useState<'client' | 'lawyer'>(initialRole);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if email already exists in database
  const checkEmailExists = useCallback(async (emailValue: string) => {
    if (!emailValue.trim()) {
      setEmailError('');
      return false;
    }

    setCheckingEmail(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', emailValue)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking email:', error);
        return false;
      }

      if (data) {
        setEmailError('This email has already been registered');
        return true;
      } else {
        setEmailError('');
        return false;
      }
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  // Handle email change with debouncing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Clear existing timeout
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timeout for email validation
    debounceTimer.current = setTimeout(() => {
      checkEmailExists(newEmail);
    }, 500); // 500ms debounce
  };

  // Validate password
  const validatePassword = (passwordValue: string) => {
    const errors: string[] = [];

    if (passwordValue.length < 8) {
      errors.push('At least 8 characters');
    }

    if (!/[A-Z]/.test(passwordValue)) {
      errors.push('Capital letter');
    }

    if (!/[a-z]/.test(passwordValue)) {
      errors.push('Small letter');
    }

    if (!/[0-9]/.test(passwordValue)) {
      errors.push('Digit');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue)) {
      errors.push('Special character');
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if email error exists
    if (emailError) {
      toast({
        variant: 'destructive',
        title: 'Invalid email',
        description: emailError,
      });
      return;
    }

    // Check if password has errors
    if (passwordErrors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid password',
        description: 'Password must meet all requirements.',
      });
      return;
    }

    setLoading(true);

    if (!dateOfBirth) {
      toast({
        variant: 'destructive',
        title: 'Date of birth required',
        description: 'Please select your date of birth.',
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, selectedRole);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: error.message,
      });
      setLoading(false);
      return;
    }

    if (dateOfBirth) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        await supabase
          .from('profiles')
          .update({ date_of_birth: format(dateOfBirth, 'yyyy-MM-dd') } as any)
          .eq('id', sessionData.session.user.id);
      }
    }

    toast({
      title: 'Account created!',
      description: 'Check your email to confirm the account.',
    });

    // Wait 5 seconds before navigating
    setTimeout(() => {
      navigate(selectedRole === 'lawyer' ? '/lawyer/dashboard' : '/dashboard');
    }, 8000);
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-start justify-center px-3 sm:px-4 pt-4 sm:pt-6
bg-gradient-to-br from-background via-background to-muted/40">

        {/* MAIN CARD */}
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 sm:gap-6 
        bg-background/80 backdrop-blur-xl border border-border/50 
        rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">

          {/* LEFT - FORM */}
          <div className="p-5 sm:p-6 md:p-8 lg:p-10">

            {/* HEADER */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              Create Account
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Start your legal journey
            </p>

            {/* ROLE */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => setSelectedRole('client')}
                className={cn(
                  'p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all text-left',
                  selectedRole === 'client'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <User className="h-5 w-5 mb-1" />
                <div className="text-sm font-semibold">Client</div>
                <div className="text-[10px] text-muted-foreground">
                  Get help
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('lawyer')}
                className={cn(
                  'p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all text-left',
                  selectedRole === 'lawyer'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Briefcase className="h-5 w-5 mb-1" />
                <div className="text-sm font-semibold">Lawyer</div>
                <div className="text-[10px] text-muted-foreground">
                  Offer services
                </div>
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

              <Input
                placeholder="Manish Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
              />

              <Input
                type="email"
                placeholder="Manish@gmail.com"
                value={email}
                onChange={handleEmailChange}
                required
                className={cn(
                  'h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm',
                  emailError && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {emailError && (
                <p className="text-xs sm:text-sm text-red-500 font-medium">
                  {emailError}
                </p>
              )}
              {checkingEmail && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking email...
                </p>
              )}

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className={cn(
                    'h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm pr-10',
                    passwordErrors.length > 0 && 'border-red-500 focus-visible:ring-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.length > 0 && (
                <div className="text-xs sm:text-sm text-red-500 font-medium space-y-1">
                  <p>Password must contain:</p>
                  <div className="space-y-0.5">
                    {passwordErrors.map((error) => (
                      <p key={error} className="flex items-center gap-2">
                        <span className="text-red-500">•</span>
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* DOB */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-auto py-3 px-4 rounded-xl border border-input bg-background text-black hover:bg-background hover:text-black focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-black active:bg-background active:text-black',
                      !dateOfBirth && 'text-muted-foreground'
                    )}
                  >
                    {/* <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground shrink-0" /> */}

                    <div className="flex flex-col items-start">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          !dateOfBirth && 'text-muted-foreground'
                        )}
                      >
                        {dateOfBirth
                          ? format(dateOfBirth, 'dd MMM yyyy')
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
                      Select the correct day, month and year.
                    </p>
                  </div>

                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    initialFocus
                    className={cn('pointer-events-auto')}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>

              <Button
                type="submit"
                className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold"
                disabled={loading || !!emailError || checkingEmail || passwordErrors.length > 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Sign Up as ${selectedRole}`
                )}
              </Button>
            </form>

            <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center justify-center 
          bg-gradient-to-br from-primary to-primary/70 text-white p-10">

            <div className="max-w-sm space-y-4">
              <h2 className="text-4xl font-bold">
                {selectedRole === 'lawyer'
                  ? 'Grow Your Practice'
                  : 'Get Legal Help'}
              </h2>

              <p className="text-white/80">
                {selectedRole === 'lawyer'
                  ? 'Earn and manage clients easily.'
                  : 'Connect with top lawyers instantly.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default Signup;