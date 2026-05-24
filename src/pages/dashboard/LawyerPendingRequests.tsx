import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout/MainLayout';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, User, ArrowLeft, CheckCircle, XCircle, Video, Phone, MessageSquare, Mail, Calendar, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
interface PendingConsultation {
  id: string;
  type: 'chat' | 'audio' | 'video';
  created_at: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_avatar?: string | null;
}
const LawyerPendingRequests = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<PendingConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);
  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('consultations')
      .select('id, type, created_at, client_id')
      .eq('lawyer_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      const clientIds = [...new Set(data.map(c => c.client_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, phone, avatar_url').in('id', clientIds);
      setConsultations(data.map(c => {
        const p = profiles?.find(pr => pr.id === c.client_id);
        return { ...c, client_name: p?.full_name || 'Client', client_email: p?.email || '', client_phone: p?.phone || '', client_avatar: p?.avatar_url };
      }));
    } else {
      setConsultations([]);
    }
    setLoading(false);
  };

  const handleConsultation = async (id: string, action: 'accept' | 'reject') => {

    if (!user) return;

    if (action === 'accept') {

      const now = new Date().toISOString();

      // ✅ SAME AS BOOKING NOTIFICATION
      await supabase.from('call_signals').insert({
        consultation_id: id,
        sender_id: user.id,
        type: 'lawyer-accepted',
        data: {}
      });

      await supabase
        .from('consultations')
        .update({
          status: 'pending',        // ✅ keep same
          started_at: null,
          accepted_at: now          // ✅ IMPORTANT
        })
        .eq('id', id);

      // ✅ SET LAWYER BUSY
      await supabase
        .from('lawyer_profiles')
        .update({
          is_busy: true,
          is_available: true,
        })
        .eq('user_id', user.id);

      toast({
        title: 'Accepted',
        description: 'Waiting for client payment...'
      });

      navigate(`/consultation/${id}`);

    } else {

      // ❌ REJECT
      await supabase
        .from('consultations')
        .update({ status: 'cancelled' })
        .eq('id', id);

      toast({
        title: 'Declined',
        description: 'Client has been notified'
      });

      fetchData(); // refresh list

    }

  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'audio': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };
  if (authLoading || loading) {
    return (
      // <MainLayout showFooter={false}>
      <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
        {/* </MainLayout> */}
      </LawyerLayout>
    );
  }
  return (
    // <MainLayout showFooter={false}>
    <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" className="gap-2 mb-6" onClick={() => navigate('/lawyer/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-5 w-5 text-amber-500" /> Pending Requests
              </CardTitle>
              <CardDescription>{consultations.length} requests awaiting your response</CardDescription>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground text-sm">New consultation requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((c) => (
                    // <div key={c.id} className="p-5 bg-card rounded-xl border border-border">
                    //   <div className="flex items-start justify-between gap-4">
                    //     <div className="flex items-center gap-4 flex-1">
                    //       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center overflow-hidden">
                    //         {c.client_avatar ? <img src={c.client_avatar} alt={c.client_name} className="w-full h-full object-cover" /> : <User className="h-7 w-7 text-amber-600" />}
                    //       </div>
                    //       <div className="flex-1 min-w-0">
                    //         <p className="font-semibold text-lg">{c.client_name}</p>
                    //         <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    //           <Mail className="h-3.5 w-3.5" />
                    //           <span className="truncate">{c.client_email}</span>
                    //         </div>
                    //         <div className="flex items-center gap-3 mt-2">
                    //           <Badge className={getTypeColor(c.type)}>
                    //             {getTypeIcon(c.type)}
                    //             <span className="ml-1.5 capitalize">{c.type}</span>
                    //           </Badge>
                    //           <span className="text-xs text-muted-foreground flex items-center gap-1">
                    //             <Calendar className="h-3 w-3" />
                    //             {new Date(c.created_at).toLocaleString()}
                    //           </span>
                    //         </div>
                    //       </div>
                    //     </div>
                    //     <div className="flex gap-2">
                    //       <Button size="sm" variant="outline" className="gap-1.5 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30" onClick={() => handleConsultation(c.id, 'reject')}>
                    //         <XCircle className="h-4 w-4" /> Decline
                    //       </Button>
                    //       <Button size="sm" className="gap-1.5" onClick={() => handleConsultation(c.id, 'accept')}>
                    //         <CheckCircle className="h-4 w-4" /> Accept
                    //       </Button>
                    //     </div>
                    //   </div>
                    // </div>
                    <div
                      key={c.id}
                      className="p-4 sm:p-5 bg-card rounded-xl border border-border"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1 min-w-0">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                            {c.client_avatar ? (
                              <img
                                src={c.client_avatar}
                                alt={c.client_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-7 w-7 text-amber-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 text-center sm:text-left">
                            <p className="font-semibold text-base sm:text-lg break-words">
                              {c.client_name}
                            </p>

                            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mt-1 min-w-0">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{c.client_email}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-3">
                              <div className="flex justify-center sm:justify-start">
                                <Badge className={getTypeColor(c.type)}>
                                  {getTypeIcon(c.type)}
                                  <span className="ml-1.5 capitalize">{c.type}</span>
                                </Badge>
                              </div>

                              <span className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1 break-words">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                {new Date(c.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:min-w-[220px]">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 w-full sm:flex-1 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
                            onClick={() => handleConsultation(c.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4" />
                            Decline
                          </Button>

                          <Button
                            size="sm"
                            className="gap-1.5 w-full sm:flex-1"
                            onClick={() => handleConsultation(c.id, 'accept')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* </MainLayout> */}
    </LawyerLayout>
  );
};
export default LawyerPendingRequests;