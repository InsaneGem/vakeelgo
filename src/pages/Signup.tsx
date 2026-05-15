// import { useState } from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Scale, ArrowLeft, Loader2, User, Briefcase, CalendarIcon } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { cn } from '@/lib/utils';
// import { supabase } from '@/integrations/supabase/client';
// import { format } from 'date-fns';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { MainLayout } from '@/components/layout/MainLayout';

// const Signup = () => {
//   const [searchParams] = useSearchParams();
//   const initialRole = searchParams.get('role') === 'lawyer' ? 'lawyer' : 'client';

//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
//   const [selectedRole, setSelectedRole] = useState<'client' | 'lawyer'>(initialRole);
//   const [loading, setLoading] = useState(false);
//   const { signUp } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     if (password.length < 6) {
//       toast({
//         variant: 'destructive',
//         title: 'Invalid password',
//         description: 'Password must be at least 6 characters long.',
//       });
//       setLoading(false);
//       return;
//     }

//     if (!dateOfBirth) {
//       toast({
//         variant: 'destructive',
//         title: 'Date of birth required',
//         description: 'Please select your date of birth.',
//       });
//       setLoading(false);
//       return;
//     }


//     const { error } = await signUp(email, password, fullName, selectedRole);

//     if (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Sign up failed',
//         description: error.message,
//       });
//       setLoading(false);
//       return;
//     }
//     // Save date of birth to profile
//     if (dateOfBirth) {
//       const { data: sessionData } = await supabase.auth.getSession();
//       if (sessionData?.session?.user) {
//         await supabase
//           .from('profiles')

//           .update({ date_of_birth: format(dateOfBirth, 'yyyy-MM-dd') } as any)
//           .eq('id', sessionData.session.user.id);
//       }
//     }

//     toast({
//       title: 'Account created!',
//       description: selectedRole === 'lawyer'
//         ? 'Your account is pending approval. You can complete your profile now.'
//         : 'Welcome to LEGALMATE!',
//     });

//     navigate(selectedRole === 'lawyer' ? '/lawyer/dashboard' : '/dashboard');
//   };

//   return (
//     <MainLayout>
//       <div className="min-h-screen flex">
//         {/* Left Panel - Form */}
//         <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
//           <div className="max-w-md w-full mx-auto">
//             <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
//               <ArrowLeft className="h-4 w-4" />
//               Back to home
//             </Link>

//             <div className="flex items-center gap-2 mb-8">
//               <Scale className="h-8 w-8" />
//               <span className="font-serif text-2xl font-semibold">LEGALMATE</span>
//             </div>

//             <h1 className="font-serif text-3xl font-bold mb-2">Create an account</h1>
//             <p className="text-muted-foreground mb-8">
//               Get started with LEGALMATE today
//             </p>

//             {/* Role Selection */}
//             <div className="grid grid-cols-2 gap-4 mb-8">
//               <button
//                 type="button"
//                 onClick={() => setSelectedRole('client')}
//                 className={cn(
//                   'p-4 rounded-lg border-2 text-left transition-all',
//                   selectedRole === 'client'
//                     ? 'border-primary bg-primary/5'
//                     : 'border-border hover:border-primary/50'
//                 )}
//               >
//                 <User className="h-6 w-6 mb-2" />
//                 <div className="font-semibold">Client</div>
//                 <div className="text-sm text-muted-foreground">Get legal advice</div>
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setSelectedRole('lawyer')}
//                 className={cn(
//                   'p-4 rounded-lg border-2 text-left transition-all',
//                   selectedRole === 'lawyer'
//                     ? 'border-primary bg-primary/5'
//                     : 'border-border hover:border-primary/50'
//                 )}
//               >
//                 <Briefcase className="h-6 w-6 mb-2" />
//                 <div className="font-semibold">Lawyer</div>
//                 <div className="text-sm text-muted-foreground">Offer consultations</div>
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="fullName">Full Name</Label>
//                 <Input
//                   id="fullName"
//                   type="text"
//                   placeholder="John Doe"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   required
//                   className="h-12"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   className="h-12"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   minLength={6}
//                   className="h-12"
//                 />
//                 <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
//               </div>

//               <div className="space-y-2">
//                 <Label>Date of Birth</Label>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         'w-full h-12 justify-start text-left font-normal',
//                         !dateOfBirth && 'text-muted-foreground'
//                       )}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {dateOfBirth ? format(dateOfBirth, 'PPP') : <span>DOB</span>}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={dateOfBirth}
//                       onSelect={setDateOfBirth}
//                       disabled={(date) =>
//                         date > new Date() || date < new Date("1900-01-01")
//                       }
//                       initialFocus
//                       captionLayout="dropdown-buttons"
//                       fromYear={1900}
//                       toYear={new Date().getFullYear()}
//                       className="rounded-2xl p-4"
//                       classNames={{
//                         caption_label: "hidden",
//                         dropdown:
//                           "h-9 rounded-lg border border-border bg-background px-2 text-sm font-medium shadow-sm hover:bg-muted transition-all",
//                         nav_button:
//                           "h-8 w-8 rounded-lg hover:bg-muted transition-all",
//                         day_selected:
//                           "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg",
//                         day_today:
//                           "border border-primary text-primary rounded-lg",
//                       }}
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               <Button type="submit" className="w-full h-12" disabled={loading}>
//                 {loading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating account...
//                   </>
//                 ) : (
//                   `Sign Up as ${selectedRole === 'lawyer' ? 'Lawyer' : 'Client'}`
//                 )

//                 }
//               </Button>
//             </form>

//             <p className="text-center mt-8 text-muted-foreground">
//               Already have an account?{' '}
//               <Link to="/login" className="text-foreground font-medium hover:underline">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </div>

//         {/* Right Panel - Decorative */}
//         <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-16">
//           <div className="max-w-md text-white">
//             <h2 className="font-serif text-4xl font-bold mb-6">
//               {selectedRole === 'lawyer'
//                 ? 'Join Our Network of Legal Experts'
//                 : 'Get Expert Legal Help Today'
//               }
//             </h2>
//             <p className="text-white/70 text-lg">
//               {selectedRole === 'lawyer'
//                 ? 'Set your own rates, work on your schedule, and help clients with their legal needs.'
//                 : 'Connect with verified lawyers for consultations via chat, audio, or video calls.'
//               }
//             </p>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );

// };


// export default Signup;
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Scale, ArrowLeft, Loader2, User, Briefcase, CalendarIcon
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
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [selectedRole, setSelectedRole] = useState<'client' | 'lawyer'>(initialRole);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid password',
        description: 'Password must be at least 6 characters long.',
      });
      setLoading(false);
      return;
    }

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
      description:
        selectedRole === 'lawyer'
          ? 'Your account is pending approval.'
          : 'Welcome to LEGALMATE!',
    });

    navigate(selectedRole === 'lawyer' ? '/lawyer/dashboard' : '/dashboard');
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
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
              />

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
                disabled={loading}
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