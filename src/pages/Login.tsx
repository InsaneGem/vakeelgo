

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, ArrowLeft, Loader2, Shield, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpExpiryTime, setOtpExpiryTime] = useState<number | null>(null);

  const { signIn, role, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && role && !loading) {
      if (loginType === 'admin') {
        if (role === 'admin') {
          navigate('/admin');
        } else {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Only admin accounts can use admin login.',
          });
        }
      } else {
        if (role === 'admin') navigate('/admin');
        else if (role === 'lawyer') navigate('/lawyer/dashboard');
        else navigate('/dashboard');
      }
    }
  }, [user, role, loading, loginType, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Welcome back!',
      description: 'You have successfully signed in.',
    });

    setTimeout(() => setLoading(false), 1000);
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

    return errors;
  };

  // Handle new password change
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    const errors = validatePassword(value);
    setPasswordErrors(errors);
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const errors: string[] = [];

    if (value.length < 8) {
      errors.push('At least 8 characters');
    }

    if (!/[A-Z]/.test(value)) {
      errors.push('Capital letter');
    }

    if (!/[a-z]/.test(value)) {
      errors.push('Small letter');
    }

    if (!/[0-9]/.test(value)) {
      errors.push('Digit');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors.push('Special character');
    }

    setConfirmPasswordErrors(errors);
  };

  // Check if email exists for forgot password
  const handleCheckEmailExists = async () => {
    if (!forgotEmail.trim()) {
      setForgotEmailError('Please enter your email');
      return;
    }

    setForgotLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', forgotEmail)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking email:', error);
        setForgotEmailError('Error checking email. Please try again.');
        return;
      }

      if (!data) {
        setForgotEmailError('Email not found in our records');
        return;
      }

      setForgotEmailError('');
      // Send OTP
      await handleSendOTP();
    } catch (error) {
      console.error('Error:', error);
      setForgotEmailError('An error occurred. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    setForgotLoading(true);
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      // Store OTP in Supabase's built-in auth.one_time_tokens
      const { error: insertError } = await supabase
        .from('one_time_tokens')
        .insert([
          {
            email: forgotEmail,
            token: otp,
            type: 'password_reset',
            expires_at: new Date(expiryTime).toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error storing OTP:', insertError);
        setGeneratedOTP(otp);
        setOtpExpiryTime(expiryTime);
      } else {
        setGeneratedOTP(otp);
        setOtpExpiryTime(expiryTime);
      }

      // Send OTP via email using Resend
      const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: {
          email: forgotEmail,
          otp: otp,
        },
      });

      if (emailError) {
        console.error('Email send warning (OTP stored):', emailError);
        // Continue even if email fails, OTP is stored
      }

      setOtpSent(true);
      setForgotStep('otp');
      toast({
        title: 'OTP Sent',
        description: 'Check your email for the 6-digit OTP code.',
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Verify OTP and go to new password step
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast({
        variant: 'destructive',
        title: 'OTP Required',
        description: 'Please enter the OTP.',
      });
      return;
    }

    // Check expiry time
    if (otpExpiryTime && Date.now() > otpExpiryTime) {
      toast({
        variant: 'destructive',
        title: 'OTP Expired',
        description: 'OTP has expired. Please request a new one.',
      });
      setForgotStep('email');
      setOtpSent(false);
      return;
    }

    // Verify OTP
    if (otp !== generatedOTP) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect.',
      });
      return;
    }

    setOtpVerified(true);
    setForgotStep('newPassword');
    toast({
      title: 'OTP Verified',
      description: 'Please enter your new password.',
    });
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (passwordErrors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Password',
        description: 'New password must meet all requirements.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
      });
      return;
    }

    setForgotLoading(true);
    try {
      // Call Edge Function to reset password (doesn't require active session)
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          email: forgotEmail,
          password: newPassword,
        },
      });

      // Check for error in response data (even if status is 2xx)
      if (error || (data && data.error)) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: (data && data.error) || error?.message || 'Failed to update password.',
        });
        setForgotLoading(false);
        return;
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
      });

      // Reset forgot password state
      setShowForgot(false);
      setForgotStep('email');
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
      setOtpVerified(false);
      setForgotEmailError('');
      setPasswordErrors([]);
      setConfirmPasswordErrors([]);
      setGeneratedOTP('');
      setOtpExpiryTime(null);
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update password. Please try again.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-start justify-center px-3 sm:px-4 pt-4 sm:pt-6
      bg-gradient-to-br from-background via-background to-muted/40">

        {/* MAIN CARD */}
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 sm:gap-6 
        bg-background/80 backdrop-blur-xl border border-border/50 
        rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">

          {/* LEFT SIDE */}
          <div className="p-5 sm:p-6 md:p-8 lg:p-10">

            {/* HEADER */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            {/* <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Scale className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="font-serif text-lg sm:text-xl font-semibold">
                VakeelGo
              </span>
            </div> */}

            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              Welcome Back
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Sign in to continue
            </p>

            {/* TABS */}
            <Tabs
              value={loginType}
              onValueChange={(v) => setLoginType(v as 'user' | 'admin')}
              className="mb-4"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="user" className="gap-2 text-xs sm:text-sm">
                  <User className="h-4 w-4" />
                  User
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-2 text-xs sm:text-sm">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* USER LOGIN */}
              <TabsContent value="user" className="mt-4">
                {!showForgot ? (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                      />

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Password</span>
                          <button
                            type="button"
                            onClick={() => setShowForgot(true)}
                            className="text-muted-foreground hover:text-foreground transition"
                          >
                            Forgot?
                          </button>
                        </div>

                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm pr-10"
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
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>

                    <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <Link to="/signup" className="font-medium hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </>
                ) : (
                  <>
                    {/* FORGOT PASSWORD FORM */}
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          setShowForgot(false);
                          setForgotStep('email');
                          setForgotEmail('');
                          setOtp('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setOtpSent(false);
                          setOtpVerified(false);
                          setForgotEmailError('');
                          setPasswordErrors([]);
                          setConfirmPasswordErrors([]);
                          setGeneratedOTP('');
                          setOtpExpiryTime(null);
                        }}
                        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                      </button>

                      <h2 className="text-lg sm:text-xl font-bold">Reset Password</h2>

                      {/* STEP 1: EMAIL */}
                      {forgotStep === 'email' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs sm:text-sm font-medium">Registered Email</label>
                            <Input
                              type="email"
                              placeholder="Enter your registered email"
                              value={forgotEmail}
                              onChange={(e) => {
                                setForgotEmail(e.target.value);
                                setForgotEmailError('');
                              }}
                              required
                              className={cn(
                                'h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm mt-2',
                                forgotEmailError && 'border-red-500 focus-visible:ring-red-500'
                              )}
                            />
                            {forgotEmailError && (
                              <p className="text-xs sm:text-sm text-red-500 font-medium mt-1">
                                {forgotEmailError}
                              </p>
                            )}
                          </div>

                          <Button
                            onClick={handleCheckEmailExists}
                            className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold"
                            disabled={forgotLoading}
                          >
                            {forgotLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending OTP...
                              </>
                            ) : (
                              'Send OTP'
                            )}
                          </Button>
                        </div>
                      )}

                      {/* STEP 2: OTP */}
                      {forgotStep === 'otp' && otpSent && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs sm:text-sm font-medium">Enter OTP</label>
                            <p className="text-xs text-muted-foreground mt-1 mb-2">
                              OTP has been sent to {forgotEmail}
                            </p>
                            <Input
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              required
                              className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                            />
                          </div>

                          <Button
                            onClick={handleVerifyOTP}
                            className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold"
                            disabled={forgotLoading || otp.length < 6}
                          >
                            {forgotLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              'Verify OTP'
                            )}
                          </Button>
                        </div>
                      )}

                      {/* STEP 3: NEW PASSWORD */}
                      {forgotStep === 'newPassword' && otpVerified && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs sm:text-sm font-medium">New Password</label>
                            <div className="relative mt-2">
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => handleNewPasswordChange(e.target.value)}
                                required
                                className={cn(
                                  'h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm pr-10',
                                  passwordErrors.length > 0 && 'border-red-500 focus-visible:ring-red-500'
                                )}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                tabIndex={-1}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {passwordErrors.length > 0 && (
                              <div className="text-xs sm:text-sm text-red-500 font-medium space-y-1 mt-2">
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
                          </div>

                          <div>
                            <label className="text-xs sm:text-sm font-medium">Re-enter Password</label>
                            <div className="relative mt-2">
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                required
                                className={cn(
                                  'h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm pr-10',
                                  confirmPasswordErrors.length > 0 && 'border-red-500 focus-visible:ring-red-500'
                                )}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                              <p className="text-xs sm:text-sm text-red-500 font-medium mt-1">
                                Passwords do not match
                              </p>
                            )}
                          </div>

                          <Button
                            onClick={handleUpdatePassword}
                            className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold"
                            disabled={
                              forgotLoading ||
                              passwordErrors.length > 0 ||
                              confirmPasswordErrors.length > 0 ||
                              newPassword !== confirmPassword
                            }
                          >
                            {forgotLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Update Password'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ADMIN LOGIN */}
              <TabsContent value="admin" className="mt-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 text-xs">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Admin access only
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

                  <Input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                  />

                  <Input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                  />

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT PANEL */}
          <div className="hidden lg:flex items-center justify-center 
          bg-gradient-to-br from-primary to-primary/70 text-white p-10">

            <div className="max-w-sm space-y-4">
              <h2 className="text-4xl font-bold">
                {loginType === 'admin'
                  ? 'Admin Control Panel'
                  : 'Legal Help Made Easy'}
              </h2>

              <p className="text-white/80">
                {loginType === 'admin'
                  ? 'Manage platform, users, and operations.'
                  : 'Connect with verified lawyers instantly.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default Login;