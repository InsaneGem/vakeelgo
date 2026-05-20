// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// // import { MainLayout } from '@/components/layout/MainLayout';
// import { LawyerLayout } from '@/components/layout/LawyerLayout';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { DollarSign, TrendingUp, ArrowLeft, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// const LawyerEarnings = () => {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [walletBalance, setWalletBalance] = useState(0);
//   const [transactions, setTransactions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     if (!authLoading && !user) { navigate('/login'); return; }
//     if (user) fetchData();
//   }, [user, authLoading]);
//   const fetchData = async () => {
//     if (!user) return;
//     const [{ data: wallet }, { data: txns }] = await Promise.all([
//       supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle(),
//       supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
//     ]);
//     setWalletBalance(Number(wallet?.balance) || 0);
//     setTransactions(txns || []);
//     setLoading(false);
//   };
//   const getTypeStyle = (type: string) => {
//     if (type === 'consultation_fee') return { icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
//     if (type === 'withdrawal') return { icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-500/10' };
//     if (type === 'commission') return { icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-amber-600', bg: 'bg-amber-500/10' };
//     return { icon: <DollarSign className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-500/10' };
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
//         <div className="container mx-auto px-4 py-8">
//           <Button variant="ghost" className="gap-2 mb-6" onClick={() => navigate('/lawyer/dashboard')}>
//             <ArrowLeft className="h-4 w-4" /> Back to Dashboard
//           </Button>
//           <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-accent mb-8">
//             <CardContent className="p-8 text-primary-foreground">
//               <p className="text-sm opacity-80 font-medium">Total Earnings</p>
//               <p className="text-5xl font-bold mt-2">₹{walletBalance.toFixed(2)}</p>
//               <p className="text-sm opacity-70 mt-3 flex items-center gap-1">
//                 <TrendingUp className="h-4 w-4" /> Available for withdrawal
//               </p>
//             </CardContent>
//           </Card>
//           <Card className="border-0 shadow-lg">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 <DollarSign className="h-5 w-5" /> Transaction History
//               </CardTitle>
//               <CardDescription>All your earnings and withdrawals</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {transactions.length === 0 ? (
//                 <div className="text-center py-12">
//                   <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
//                     <DollarSign className="h-8 w-8 text-muted-foreground" />
//                   </div>
//                   <h3 className="font-semibold mb-2">No Transactions Yet</h3>
//                   <p className="text-muted-foreground text-sm">Your transactions will appear here</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {transactions.map((t) => {
//                     const style = getTypeStyle(t.type);
//                     return (
//                       <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors">
//                         <div className="flex items-center gap-4">
//                           <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}>
//                             {style.icon}
//                           </div>
//                           <div>
//                             <p className="font-medium capitalize">{t.type.replace(/_/g, ' ')}</p>
//                             <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//                               <Calendar className="h-3 w-3" />
//                               {new Date(t.created_at).toLocaleDateString()}
//                             </p>
//                           </div>
//                         </div>
//                         <p className={`font-bold ${t.type === 'withdrawal' || t.type === 'commission' ? 'text-red-600' : 'text-emerald-600'}`}>
//                           {t.type === 'withdrawal' || t.type === 'commission' ? '-' : '+'}${t.amount.toFixed(2)}
//                         </p>
//                       </div>
//                     );
//                   })}
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
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Calendar,
  CreditCard,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  IndianRupee,
  User
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

  const [monthlyEarnings, setMonthlyEarnings] =
    useState(0);

  const [transactions, setTransactions] = useState<
    PaymentRecord[]
  >([]);

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
        .order('created_at', {
          ascending: false
        });

      if (error) {
        console.error(error);
        setTransactions([]);
        return;
      }

      const payments =
        (data as PaymentRecord[]) || [];

      // Fetch Client Names
      if (payments.length > 0) {
        const clientIds = [
          ...new Set(
            payments.map(p => p.client_id)
          )
        ];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', clientIds);

        const merged = payments.map(
          payment => {
            const client =
              profiles?.find(
                p =>
                  p.id ===
                  payment.client_id
              );

            return {
              ...payment,
              client_name:
                client?.full_name ||
                'Client'
            };
          }
        );

        setTransactions(merged);

        // Total completed earnings
        const total = merged
          .filter(
            t =>
              t.payment_status ===
              'completed'
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(item.amount || 0),
            0
          );

        setTotalEarnings(total);

        // Current month earnings
        const now = new Date();

        const currentMonth =
          now.getMonth();

        const currentYear =
          now.getFullYear();

        const monthly = merged
          .filter(item => {
            if (
              item.payment_status !==
              'completed'
            )
              return false;

            const d = new Date(
              item.created_at
            );

            return (
              d.getMonth() ===
              currentMonth &&
              d.getFullYear() ===
              currentYear
            );
          })
          .reduce(
            (sum, item) =>
              sum +
              Number(item.amount || 0),
            0
          );

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
          icon: (
            <CheckCircle className="h-4 w-4" />
          ),

          color: 'text-emerald-600',

          bg: 'bg-emerald-500/10'
        };

      case 'refunded':
        return {
          icon: (
            <RotateCcw className="h-4 w-4" />
          ),

          color: 'text-blue-600',

          bg: 'bg-blue-500/10'
        };

      case 'failed':
        return {
          icon: (
            <AlertCircle className="h-4 w-4" />
          ),

          color: 'text-red-600',

          bg: 'bg-red-500/10'
        };

      default:
        return {
          icon: (
            <CreditCard className="h-4 w-4" />
          ),

          color: 'text-amber-600',

          bg: 'bg-amber-500/10'
        };
    }
  };

  if (authLoading || loading) {
    return (
      <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-6" />

            <Skeleton className="h-40 rounded-2xl mb-6" />

            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back */}
          <Button
            variant="ghost"
            className="gap-2 mb-6"
            onClick={() =>
              navigate(
                '/lawyer/dashboard'
              )
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Earnings Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-accent mb-8">
            <CardContent className="p-8 text-primary-foreground">
              <p className="text-sm opacity-80 font-medium">
                Total Earnings
              </p>

              <p className="text-5xl font-bold mt-2">
                ₹
                {totalEarnings.toFixed(
                  2
                )}
              </p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1 opacity-80">
                  <TrendingUp className="h-4 w-4" />

                  This month:
                  ₹
                  {monthlyEarnings.toFixed(
                    2
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-80">
                  <DollarSign className="h-4 w-4" />

                  Completed payments only
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <IndianRupee className="h-5 w-5" />
                Payment History
              </CardTitle>

              <CardDescription>
                All client consultation
                payments
              </CardDescription>
            </CardHeader>

            <CardContent>
              {transactions.length ===
                0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <h3 className="font-semibold mb-2">
                    No Payments Yet
                  </h3>

                  <p className="text-muted-foreground text-sm">
                    Client payments
                    will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(
                    t => {
                      const style =
                        getStatusStyle(
                          t.payment_status
                        );

                      return (
                        <div
                          key={
                            t.id
                          }
                          className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors"
                        >
                          {/* Left */}
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}
                            >
                              {
                                style.icon
                              }
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium capitalize">
                                  {
                                    t.payment_status
                                  }
                                </p>

                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {t.payment_method ||
                                    'razorpay'}
                                </Badge>
                              </div>

                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <User className="h-3 w-3" />

                                {
                                  t.client_name
                                }
                              </p>

                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />

                                {new Date(
                                  t.created_at
                                ).toLocaleDateString()}
                              </p>

                              {t.razorpay_payment_id && (
                                <p className="text-[10px] text-muted-foreground mt-1 break-all">
                                  ID:{' '}
                                  {
                                    t.razorpay_payment_id
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <p
                              className={`font-bold text-lg ${t.payment_status ===
                                  'completed'
                                  ? 'text-emerald-600'
                                  : t.payment_status ===
                                    'refunded'
                                    ? 'text-blue-600'
                                    : 'text-red-600'
                                }`}
                            >
                              ₹
                              {Number(
                                t.amount
                              ).toFixed(
                                2
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
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