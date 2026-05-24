import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LawyerCard } from '@/components/lawyers/LawyerCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedLawyers } from '@/hooks/useSavedLawyers';
import { ArrowLeft, Heart, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ClientLayout } from '@/components/layout/ClientLayout';
interface LawyerWithProfile {
    id: string;
    user_id: string;
    bio: string | null;
    experience_years: number | null;
    specializations: string[] | null;
    languages: string[] | null;
    price_per_minute: number | null;
    rating: number | null;
    total_reviews: number | null;
    is_available: boolean | null;
    status: string | null;
    full_name?: string;
    avatar_url?: string | null;
}
const SavedLawyers = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { savedIds, refetch } = useSavedLawyers();
    const [lawyers, setLawyers] = useState<LawyerWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading]);
    useEffect(() => {
        const fetchSavedLawyers = async () => {
            if (savedIds.size === 0) {
                setLawyers([]);
                setLoading(false);
                return;
            }
            const ids = Array.from(savedIds);
            const { data: lawyerData } = await supabase
                .from('lawyer_profiles')
                .select('*')
                .in('id', ids);
            if (lawyerData && lawyerData.length > 0) {
                const userIds = lawyerData.map(l => l.user_id);
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', userIds);
                const enriched = lawyerData.map(lawyer => {
                    const profile = profilesData?.find(p => p.id === lawyer.user_id);
                    return {
                        ...lawyer,
                        full_name: profile?.full_name || 'Legal Professional',
                        avatar_url: profile?.avatar_url,
                    };
                });
                setLawyers(enriched as LawyerWithProfile[]);
            } else {
                setLawyers([]);
            }
            setLoading(false);
        };
        fetchSavedLawyers();
    }, [savedIds]);
    const filtered = lawyers.filter(l => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        return (
            l.full_name?.toLowerCase().includes(q) ||
            l.specializations?.join(' ').toLowerCase().includes(q)
        );
    });
    if (authLoading || loading) {
        return (
            <MainLayout showFooter={false}>
                <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                    <div className="container mx-auto px-4 py-8">
                        <Skeleton className="h-10 w-48 mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }
    return (

        <ClientLayout>


            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8 animate-fade-in">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="hover:bg-secondary rounded-xl h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold">Saved Lawyers</h1>
                                <p className="text-sm text-muted-foreground">
                                    {lawyers.length} lawyer{lawyers.length !== 1 ? 's' : ''} saved as favrouite
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Search */}
                    {/* {lawyers.length > 0 && (
                        <div className="relative mb-6 max-w-md animate-fade-in">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search saved lawyers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-11 bg-card border-border"
                            />
                        </div>
                    )} */}
                    {/* Content */}
                    {filtered.length === 0 ? (
                        <Card className="border-0 shadow-lg animate-fade-in">
                            <CardContent className="py-20 text-center">
                                <div className="w-20 h-20 rounded-full bg-rose-500/10 mx-auto mb-6 flex items-center justify-center">
                                    <Heart className="h-10 w-10 text-rose-300" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {searchQuery ? 'No Matching Lawyers' : 'No Saved Lawyers Yet'}
                                </h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                    {searchQuery
                                        ? 'Try adjusting your search terms'
                                        : 'Tap the heart icon on any lawyer card to save them for quick access later.'}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => navigate('/lawyers')} className="gap-2">
                                        <Users className="h-4 w-4" />
                                        Browse Lawyers
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filtered.map((lawyer, i) => (
                                <div
                                    key={lawyer.id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    <LawyerCard
                                        lawyer={lawyer}
                                        showActions={true}
                                        onBooking={refetch}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>

    );
};
export default SavedLawyers;