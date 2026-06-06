import { OtherCardStyle } from '@/lib/buttonStyles';
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
import { cn } from '@/lib/utils';

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
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 5;
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
            // ? Math.round((totalPaidByClient * 0.9764) / 1.10)
            ? Math.floor(((totalPaidByClient * 0.9764) - 15) / 1.15)
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
  const totalPages = Math.ceil(transactions.length / perPage);

  const displayedTransactions = transactions.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

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
          {/* Changed to grid-cols-2 on mobile and reduced gap to 3 to optimize screen space */}
          <div className="grid grid-cols-2 gap-1 sm:gap-1">

            {/* LIFETIME BALANCE CARD */}
            <Card className="relative overflow-hidden border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm rounded-xl sm:rounded-2xl group transition-all hover:shadow-md">
              {/* Scaled down background icon on mobile so it doesn't overlap text layout */}
              <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 sm:opacity-10 group-hover:scale-110 transition-transform duration-300">
                <IndianRupee className="h-10 w-10 sm:h-16 sm:w-16 text-primary" />
              </div>

              {/* Adjusted padding from p-6 to p-3.5 on mobile */}
              <CardContent className="p-3.5 sm:p-6 space-y-2 sm:space-y-4">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
                    Lifetime Balance
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0">
                    <Layers className="h-3.5 w-3.5 sm:h-4 w-4" />
                  </div>
                </div>
                <div>
                  {/* Responsive text scaling from text-lg on mobile up to text-4xl on desktop grids */}
                  <h3 className="text-lg sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 truncate">
                    ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> Fully settled
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* MONTHLY BALANCE CARD */}
            <Card className="relative overflow-hidden border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm rounded-xl sm:rounded-2xl group transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 sm:opacity-10 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-10 w-10 sm:h-16 sm:w-16 text-emerald-500" />
              </div>

              {/* Adjusted padding from p-6 to p-3.5 on mobile */}
              <CardContent className="p-3.5 sm:p-6 space-y-2 sm:space-y-4">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
                    Earnings This Month
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 w-4" />
                  </div>
                </div>
                <div>
                  {/* Responsive text scaling from text-lg on mobile up to text-4xl on desktop grids */}
                  <h3 className="text-lg sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 truncate">
                    ₹{monthlyEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                    Current month cycles
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
          {/* TRANSACTIONS TABLE */}

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
                {/* {transactions.map(t => { */}
                {displayedTransactions.map(t => {
                  const style = getStatusStyle(t.payment_status);

                  return (
                    <div
                      key={t.id}
                      className={cn(OtherCardStyle, "h-auto min-h-0 p-3 flex flex-col justify-between")}
                    >
                      {/* TOP CONTAINER: Side-by-Side Flex Alignment */}
                      <div className="flex items-start justify-between gap-3 w-full">

                        {/* Left Side: Dynamic Status Icon + Text Stack */}
                        <div className="flex items-start gap-2.5 min-w-0">
                          {/* Compact Status Icon */}
                          <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center ${style.color} shrink-0 border border-current/10`}>
                            {style.icon}
                          </div>

                          {/* Identity Meta Stack */}
                          <div className="space-y-0.5 min-w-0">
                            {/* Row 1: Client Name & Badge Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-[#3B2F0B] truncate">
                                {t.client_name}
                              </span>

                            </div>

                            {/* Row 2: Date Stamp Line */}
                            <div className="flex items-center gap-1 text-[11px] text-[#3B2F0B]/60 pt-0.5">
                              <Calendar className="h-3 w-3 text-[#3B2F0B]/40 shrink-0" />
                              <span>{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <Badge className={`text-[9px] px-1 py-0 h-4 font-bold uppercase tracking-wider shadow-none border-0 ${style.badge}`}>
                                {t.payment_status}
                              </Badge>
                              <span className="text-[9px] px-1 py-0 h-4 font-bold text-[#3B2F0B]/70 bg-[#3B2F0B]/5 border border-[#3B2F0B]/10 rounded-md uppercase inline-flex items-center">
                                {t.payment_method || 'Razorpay'}
                              </span>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* BOTTOM CONTAINER: Technical Transaction Code Subtext */}
                      {t.razorpay_payment_id && (
                        <div className="pt-1.5 mt-2 border-t border-[#E6C547]/30 text-[10px] font-mono text-[#3B2F0B]/50 tracking-tight truncate w-full">
                          tx_id: <span className="text-[#3B2F0B]/80">{t.razorpay_payment_id}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] text-[#3B2F0B]/50 font-bold uppercase tracking-wider">
                          Your Earnings:
                        </span>
                        <p className={`font-extrabold text-base tracking-tight ${t.payment_status === 'completed' ? 'text-emerald-700' : style.color}`}>
                          ₹{Number(t.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center gap-4">

                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * perPage + 1}
                      –
                      {Math.min(
                        currentPage * perPage,
                        transactions.length
                      )}
                      {' '}of {transactions.length} transactions
                    </p>

                    <div className="flex items-center gap-2">

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((p) => p - 1)
                        }
                      >
                        Previous
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        className="w-9 h-9 p-0"
                      >
                        {currentPage}
                      </Button>

                      {currentPage + 1 <= totalPages && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-9 h-9 p-0"
                          onClick={() =>
                            setCurrentPage(currentPage + 1)
                          }
                        >
                          {currentPage + 1}
                        </Button>
                      )}

                      {currentPage + 1 < totalPages && (
                        <span className="px-2 text-muted-foreground">
                          ...
                        </span>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => p + 1)
                        }
                      >
                        Next
                      </Button>

                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

        </div>
      </div>
    </LawyerLayout>
  );
};

export default LawyerEarnings;