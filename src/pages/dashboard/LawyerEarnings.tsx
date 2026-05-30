
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { LawyerLayout } from '@/components/layout/LawyerLayout';

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription
// } from '@/components/ui/card';

// import { Button } from '@/components/ui/button';

// import { Badge } from '@/components/ui/badge';

// import { supabase } from '@/integrations/supabase/client';

// import { useAuth } from '@/contexts/AuthContext';

// import {
//   DollarSign,
//   TrendingUp,
//   ArrowLeft,
//   Calendar,
//   CreditCard,
//   CheckCircle,
//   RotateCcw,
//   AlertCircle,
//   IndianRupee,
//   User
// } from 'lucide-react';

// import { Skeleton } from '@/components/ui/skeleton';

// interface PaymentRecord {
//   id: string;
//   amount: number;
//   payment_status: string;
//   payment_method: string | null;
//   created_at: string;
//   razorpay_payment_id: string | null;
//   client_id: string;
//   client_name?: string;
// }

// const LawyerEarnings = () => {
//   const { user, loading: authLoading } = useAuth();

//   const navigate = useNavigate();

//   const [totalEarnings, setTotalEarnings] = useState(0);

//   const [monthlyEarnings, setMonthlyEarnings] =
//     useState(0);

//   const [transactions, setTransactions] = useState<
//     PaymentRecord[]
//   >([]);

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!authLoading && !user) {
//       navigate('/login');
//       return;
//     }

//     if (user) {
//       fetchData();

//       const channel = supabase
//         .channel('lawyer-earnings')

//         .on(
//           'postgres_changes',
//           {
//             event: '*',
//             schema: 'public',
//             table: 'payments',
//             filter: `lawyer_id=eq.${user.id}`
//           },
//           () => fetchData()
//         )

//         .subscribe();

//       return () => {
//         supabase.removeChannel(channel);
//       };
//     }
//   }, [user, authLoading]);

//   const fetchData = async () => {
//     if (!user) return;

//     try {
//       setLoading(true);

//       const { data, error } = await supabase
//         .from('payments')
//         .select(`
//                     id,
//                     amount,
//                     payment_status,
//                     payment_method,
//                     created_at,
//                     razorpay_payment_id,
//                     client_id
//                 `)
//         .eq('lawyer_id', user.id)
//         .order('created_at', {
//           ascending: false
//         });

//       if (error) {
//         console.error(error);
//         setTransactions([]);
//         return;
//       }

//       const payments =
//         (data as PaymentRecord[]) || [];

//       // Fetch Client Names
//       if (payments.length > 0) {
//         const clientIds = [
//           ...new Set(
//             payments.map(p => p.client_id)
//           )
//         ];

//         const { data: profiles } = await supabase
//           .from('profiles')
//           .select('id, full_name')
//           .in('id', clientIds);

//         // const merged = payments.map(
//         //   payment => {
//         //     const client =
//         //       profiles?.find(
//         //         p =>
//         //           p.id ===
//         //           payment.client_id
//         //       );

//         //     return {
//         //       ...payment,
//         //       client_name:
//         //         client?.full_name ||
//         //         'Client'
//         //     };
//         //   }
//         // );

//         // ✅ UPDATED CODE WITH REVERSE MARKUP LOGIC
//         const merged = payments.map(
//           payment => {
//             const client = profiles?.find(p => p.id === payment.client_id);

//             // Deduct the 15% system markup to discover the lawyer's clean earnings
//             // We use Math.floor to strictly present their raw base amount match
//             const originalLawyerEarnings = payment.amount ? Math.floor(Number(payment.amount) / 1.15) : 0;

//             return {
//               ...payment,
//               amount: originalLawyerEarnings, // Override the total amount with raw earnings
//               client_name: client?.full_name || 'Client'
//             };
//           }
//         );

//         setTransactions(merged);

//         // Total completed earnings
//         const total = merged
//           .filter(
//             t =>
//               t.payment_status ===
//               'completed'
//           )
//           .reduce(
//             (sum, item) =>
//               sum +
//               Number(item.amount || 0),
//             0
//           );

//         setTotalEarnings(total);

//         // Current month earnings
//         const now = new Date();

//         const currentMonth =
//           now.getMonth();

//         const currentYear =
//           now.getFullYear();

//         const monthly = merged
//           .filter(item => {
//             if (
//               item.payment_status !==
//               'completed'
//             )
//               return false;

//             const d = new Date(
//               item.created_at
//             );

//             return (
//               d.getMonth() ===
//               currentMonth &&
//               d.getFullYear() ===
//               currentYear
//             );
//           })
//           .reduce(
//             (sum, item) =>
//               sum +
//               Number(item.amount || 0),
//             0
//           );

//         setMonthlyEarnings(monthly);
//       } else {
//         setTransactions([]);
//         setTotalEarnings(0);
//         setMonthlyEarnings(0);
//       }
//     } catch (err) {
//       console.error(err);
//       setTransactions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusStyle = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return {
//           icon: (
//             <CheckCircle className="h-4 w-4" />
//           ),

//           color: 'text-emerald-600',

//           bg: 'bg-emerald-500/10'
//         };

//       case 'refunded':
//         return {
//           icon: (
//             <RotateCcw className="h-4 w-4" />
//           ),

//           color: 'text-blue-600',

//           bg: 'bg-blue-500/10'
//         };

//       case 'failed':
//         return {
//           icon: (
//             <AlertCircle className="h-4 w-4" />
//           ),

//           color: 'text-red-600',

//           bg: 'bg-red-500/10'
//         };

//       default:
//         return {
//           icon: (
//             <CreditCard className="h-4 w-4" />
//           ),

//           color: 'text-amber-600',

//           bg: 'bg-amber-500/10'
//         };
//     }
//   };

//   if (authLoading || loading) {
//     return (
//       <LawyerLayout>
//         <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
//           <div className="container mx-auto px-4 py-8">
//             <Skeleton className="h-10 w-48 mb-6" />

//             <Skeleton className="h-40 rounded-2xl mb-6" />

//             <Skeleton className="h-64 rounded-2xl" />
//           </div>
//         </div>
//       </LawyerLayout>
//     );
//   }

//   return (
//     <LawyerLayout>
//       <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
//         {/* <div className="container mx-auto px-4 py-8"> */}
//         <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
//           {/* HEADER */}
//           <div className="flex items-center gap-3 mb-6">
//             {/* Back Button: Hidden on mobile, visible on desktop */}
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => navigate('/dashboard')}
//               className="hidden md:flex h-8 w-8"
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//             <div>
//               <h1 className="font-serif text-2xl sm:text-3xl font-bold">
//                 Earning & Transaction History
//               </h1>
//               <p className="text-sm text-muted-foreground mt-0.5">
//                 All your earning details and client payments at a glance
//               </p>
//             </div>
//           </div>



//           {/* Earnings Card */}
//           <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-accent mb-8">
//             <CardContent className="p-8 text-primary-foreground">
//               <p className="text-sm opacity-80 font-medium">
//                 Total Earnings
//               </p>

//               <p className="text-5xl font-bold mt-2">
//                 ₹
//                 {totalEarnings.toFixed(
//                   2
//                 )}
//               </p>

//               <div className="flex flex-wrap gap-4 mt-4 text-sm">
//                 <div className="flex items-center gap-1 opacity-80">
//                   <TrendingUp className="h-4 w-4" />

//                   This month:
//                   ₹
//                   {monthlyEarnings.toFixed(
//                     2
//                   )}
//                 </div>

//                 <div className="flex items-center gap-1 opacity-80">
//                   <IndianRupee className="h-4 w-4" />

//                   Completed payments only
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Payment History */}
//           <Card className="border-0 shadow-lg">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 <IndianRupee className="h-5 w-5" />
//                 Payment History
//               </CardTitle>

//               <CardDescription>
//                 All client consultation
//                 payments
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               {transactions.length ===
//                 0 ? (
//                 <div className="text-center py-12">
//                   <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
//                     <IndianRupee className="h-8 w-8 text-muted-foreground" />
//                   </div>

//                   <h3 className="font-semibold mb-2">
//                     No Payments Yet
//                   </h3>

//                   <p className="text-muted-foreground text-sm">
//                     Client payments
//                     will appear here
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {transactions.map(
//                     t => {
//                       const style =
//                         getStatusStyle(
//                           t.payment_status
//                         );

//                       return (
//                         <div
//                           key={
//                             t.id
//                           }
//                           className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors"
//                         >
//                           {/* Left */}
//                           <div className="flex items-center gap-4">
//                             <div
//                               className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}
//                             >
//                               {
//                                 style.icon
//                               }
//                             </div>

//                             <div>
//                               <div className="flex items-center gap-2 flex-wrap">
//                                 <p className="font-medium capitalize">
//                                   {
//                                     t.payment_status
//                                   }
//                                 </p>

//                                 <Badge
//                                   variant="outline"
//                                   className="text-[10px]"
//                                 >
//                                   {t.payment_method ||
//                                     'razorpay'}
//                                 </Badge>
//                               </div>

//                               <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//                                 <User className="h-3 w-3" />

//                                 {
//                                   t.client_name
//                                 }
//                               </p>

//                               <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//                                 <Calendar className="h-3 w-3" />

//                                 {new Date(
//                                   t.created_at
//                                 ).toLocaleDateString()}
//                               </p>

//                               {t.razorpay_payment_id && (
//                                 <p className="text-[10px] text-muted-foreground mt-1 break-all">
//                                   ID:{' '}
//                                   {
//                                     t.razorpay_payment_id
//                                   }
//                                 </p>
//                               )}
//                             </div>
//                           </div>

//                           {/* Amount */}
//                           <div className="text-right">
//                             <p
//                               className={`font-bold text-lg ${t.payment_status ===
//                                 'completed'
//                                 ? 'text-emerald-600'
//                                 : t.payment_status ===
//                                   'refunded'
//                                   ? 'text-blue-600'
//                                   : 'text-red-600'
//                                 }`}
//                             >
//                               ₹
//                               {Number(
//                                 t.amount
//                               ).toFixed(
//                                 2
//                               )}
//                             </p>
//                           </div>
//                         </div>
//                       );
//                     }
//                   )}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </LawyerLayout>
//   );
// };

// export default LawyerEarnings;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LawyerLayout } from '@/components/layout/LawyerLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { supabase } from '@/integrations/supabase/client';

import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  ArrowLeft,
  Calendar,
  CreditCard,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  IndianRupee,
  User,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentRecord {
  id: string;
  amount: number;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
  razorpay_payment_id: string | null;
  client_id: string;
  client_name?: string;
}

const LawyerEarnings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [transactions, setTransactions] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchData();

      const channel = supabase
        .channel('lawyer-earnings')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `lawyer_id=eq.${user.id}`
          },
          () => fetchData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('payments')
        .select(`
                    id,
                    amount,
                    payment_status,
                    payment_method,
                    created_at,
                    razorpay_payment_id,
                    client_id
                `)
        .eq('lawyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setTransactions([]);
        return;
      }

      const payments = (data as PaymentRecord[]) || [];

      if (payments.length > 0) {
        const clientIds = [...new Set(payments.map(p => p.client_id))];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', clientIds);

        const merged = payments.map(payment => {
          const client = profiles?.find(p => p.id === payment.client_id);
          const totalPaidByClient = Number(payment.amount || 0);

          // ✅ FIXED REVERSE MULTIPLIER (PURE 10% MARGIN + 2.36% RAZORPAY GATEWAY BUFFER)
          // Client Paid Amount (11.00) * Razorpay Settlement Ratio (0.9764) / Core Platform Margin (1.10)
          // Math.round fixes micro-precision floating calculations cleanly to match the base pricing integer
          const originalLawyerEarnings = totalPaidByClient
            ? Math.round((totalPaidByClient * 0.9764) / 1.10)
            : 0;

          return {
            ...payment,
            amount: originalLawyerEarnings, // Override amount field with clean baseline lawyer fees
            client_name: client?.full_name || 'Client'
          };
        });

        setTransactions(merged);

        // Total completed earnings
        const total = merged
          .filter(t => t.payment_status === 'completed')
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setTotalEarnings(total);

        // Current month earnings
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthly = merged
          .filter(item => {
            if (item.payment_status !== 'completed') return false;
            const d = new Date(item.created_at);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        setMonthlyEarnings(monthly);
      } else {
        setTransactions([]);
        setTotalEarnings(0);
        setMonthlyEarnings(0);
      }
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
        };
      case 'refunded':
        return {
          icon: <RotateCcw className="h-4 w-4" />,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10 dark:bg-blue-500/20',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-500/10 dark:bg-red-500/20',
          badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
      default:
        return {
          icon: <CreditCard className="h-4 w-4" />,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        };
    }
  };

  if (authLoading || loading) {
    return (
      <LawyerLayout>
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout>
      <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl space-y-8">

          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
            <div className="flex items-start gap-3">
              {/* Back Button: Hidden on mobile, visible on desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-8 w-8"
                onClick={() => navigate('/lawyer/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                  Financial Analytics
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                  Monitor your personal consultation earnings logs and balance history
                </p>
              </div>
            </div>
          </div>

          {/* RESPONSIVE PREMIUM DASHBOARD CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* LIFETIME BALANCE CARD */}
            <Card className="relative overflow-hidden border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl group transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                <IndianRupee className="h-16 w-16 text-primary" />
              </div>
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Lifetime Balance
                  </span>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
                    ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3" /> Fully settled earnings
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* MONTHLY BALANCE CARD */}
            <Card className="relative overflow-hidden border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl group transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-16 w-16 text-emerald-500" />
              </div>
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Earnings This Month
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
                    ₹{monthlyEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                    Based on current calendar month cycles
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LEDGER STATEMENT LOG FEED */}
          <Card className="border border-slate-200 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-zinc-800/60 px-6 py-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                Ledger Statement
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
                Itemized summary matching individual consultation payouts
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-800 mx-auto mb-3 flex items-center justify-center border border-slate-100 dark:border-zinc-700">
                    <ShieldAlert className="h-6 w-6 text-slate-400 dark:text-zinc-500" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-zinc-200 mb-1">No Transactions Registered</h3>
                  <p className="text-slate-400 dark:text-zinc-500 text-xs max-w-xs mx-auto">
                    Confirmed appointments and payout adjustments will appear dynamically here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {transactions.map(t => {
                    const style = getStatusStyle(t.payment_status);

                    return (
                      <div
                        key={t.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50/60 dark:hover:bg-zinc-800/20 transition-all gap-4"
                      >
                        {/* ITEM METADATA BLOCK */}
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center ${style.color} shrink-0`}>
                            {style.icon}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`text-[10px] font-bold uppercase tracking-wider shadow-none border-0 ${style.badge}`}>
                                {t.payment_status}
                              </Badge>
                              <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md uppercase">
                                {t.payment_method || 'Razorpay'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-slate-600 dark:text-zinc-300">
                              <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                                <User className="h-3 w-3 text-slate-400" /> {t.client_name}
                              </span>
                              <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">|</span>
                              <span className="text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>

                            {t.razorpay_payment_id && (
                              <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 tracking-tight break-all">
                                tx_id: {t.razorpay_payment_id}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* REVENUE ASSIGNMENT: SHIFTED TO CLEAN SINGLE BASE RECORD */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 dark:border-zinc-800 pt-3 sm:pt-0 shrink-0">
                          <div className="sm:text-right">
                            <span className="text-xs text-slate-400 dark:text-zinc-500 block font-medium">Your Earnings</span>
                            <p className={`font-extrabold text-lg tracking-tight ${t.payment_status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : style.color}`}>
                              ₹{Number(t.amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LawyerLayout>
  );
};

export default LawyerEarnings;