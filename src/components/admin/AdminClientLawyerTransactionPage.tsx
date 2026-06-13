import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Transaction {
    id: string;
    user_name: string;
    type: string;
    amount: number;
    description: string | null;
    created_at: string;
}

const AdminTransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        fetchTransactions();
        const channel = supabase.channel('transactions-page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchTransactions)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchTransactions = async () => {
        const { data } = await supabase.from('transactions').select('*, profiles(full_name)').order('created_at', { ascending: false });
        if (data) {
            setTransactions(data.map((tx: any) => ({
                id: tx.id,
                user_name: tx.profiles?.full_name || 'Unknown',
                type: tx.type,
                amount: tx.amount,
                description: tx.description,
                created_at: tx.created_at
            })));
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-screen-xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold mb-6">All Transactions</h1>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Mobile cards */}
                    <div className="block lg:hidden divide-y divide-slate-50">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm text-slate-900 truncate">{tx.user_name}</p>
                                    <p className="text-[11px] text-slate-400 capitalize mt-0.5">{tx.type.replace('_', ' ')}</p>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{tx.description || '—'}</p>
                                </div>
                                <span className={`font-semibold text-sm flex-shrink-0 ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                    {tx.type === 'deposit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="text-center py-12 text-slate-400 text-sm">No transactions found</div>
                        )}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                    {['User', 'Type', 'Amount', 'Description', 'Date'].map((h, i) => (
                                        <TableHead key={h} className={`text-[11px] font-semibold text-slate-500 uppercase tracking-wide ${i === 0 ? 'pl-5' : ''}`}>{h}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id} className="hover:bg-slate-50/60 border-slate-100 transition-colors">
                                        <TableCell className="font-medium text-sm text-slate-900 pl-5">{tx.user_name}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize text-[11px] px-2 py-0.5 rounded-full border-slate-200 text-slate-600">{tx.type.replace('_', ' ')}</Badge></TableCell>
                                        <TableCell className={`font-semibold text-sm ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                            {tx.type === 'deposit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-xs max-w-[200px] truncate">{tx.description || '—'}</TableCell>
                                        <TableCell className="text-slate-400 text-xs">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                                {transactions.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 text-sm">No transactions found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTransactionsPage;