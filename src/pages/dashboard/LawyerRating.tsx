

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { LawyerLayout } from '@/components/layout/LawyerLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';
// import { Star, ArrowLeft, Calendar, ThumbsUp, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// const LawyerRating = () => {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();

//   const [rating, setRating] = useState(0);
//   const [totalReviews, setTotalReviews] = useState(0);
//   const [reviews, setReviews] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedReview, setSelectedReview] = useState<any | null>(null);
//   const REVIEWS_PER_PAGE = 4;

//   useEffect(() => {
//     if (selectedReview) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'auto';
//     }
//     return () => {
//       document.body.style.overflow = 'auto';
//     };
//   }, [selectedReview]);

//   useEffect(() => {
//     if (!authLoading && !user) {
//       navigate('/login');
//       return;
//     }
//     if (user) fetchData();
//   }, [user, authLoading]);

//   const fetchData = async () => {
//     if (!user) return;

//     const [{ data: lp }, { data: revs }] = await Promise.all([
//       supabase
//         .from('lawyer_profiles')
//         .select('rating, total_reviews')
//         .eq('user_id', user.id)
//         .maybeSingle(),
//       supabase
//         .from('reviews')
//         .select('*')
//         .eq('lawyer_id', user.id)
//         .order('created_at', { ascending: false }),
//     ]);

//     setRating(Number(lp?.rating) || 0);
//     setTotalReviews(lp?.total_reviews || 0);

//     if (revs && revs.length > 0) {
//       const clientIds = [...new Set(revs.map(r => r.client_id))];
//       const { data: profiles } = await supabase
//         .from('profiles')
//         .select('id, full_name, avatar_url')
//         .in('id', clientIds);

//       setReviews(
//         revs.map(r => {
//           const p = profiles?.find(pr => pr.id === r.client_id);
//           return {
//             ...r,
//             client_name: p?.full_name || 'Client',
//             client_avatar: p?.avatar_url,
//           };
//         })
//       );
//     }
//     setLoading(false);
//   };

//   const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
//   const paginatedReviews = reviews.slice(
//     (currentPage - 1) * REVIEWS_PER_PAGE,
//     currentPage * REVIEWS_PER_PAGE
//   );

//   const renderStars = (rating: number, sizeClass = "h-4 w-4") =>
//     [...Array(5)].map((_, i) => (
//       <Star
//         key={i}
//         className={`${sizeClass} ${i < Math.round(rating)
//           ? 'fill-amber-500 text-amber-500'
//           : 'text-muted-foreground/20 dark:text-muted-foreground/30'
//           }`}
//       />
//     ));

//   if (authLoading || loading) {
//     return (
//       <LawyerLayout>
//         <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
//           <div className="container mx-auto px-4 py-8 max-w-4xl">
//             <Skeleton className="h-9 w-44 mb-6 rounded-lg" />
//             <Skeleton className="h-44 rounded-2xl mb-6 shadow-xs" />
//             <Skeleton className="h-96 rounded-2xl shadow-xs" />
//           </div>
//         </div>
//       </LawyerLayout>
//     );
//   }

//   return (
//     <LawyerLayout>
//       <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
//         <div className="container mx-auto px-4 py-6 max-w-4xl animate-fade-in">


//           {/* Page Header (Matching Active Sessions Style) */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pt-2">
//             <div className="flex items-start gap-3">
//               {/* Back Button arrow */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-9 w-9 rounded-full shrink-0 text-foreground hover:bg-muted"
//                 onClick={() => navigate('/lawyer/dashboard')}
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </Button>

//               {/* Heading with Dot Indicator & Subtitle */}
//               <div className="space-y-1">
//                 <h1 className="font-serif text-2xl sm:text-3xl font-bold flex items-center gap-2 text-foreground">

//                   Client Ratings & Reviews
//                 </h1>
//                 <p className="text-xs sm:text-sm text-muted-foreground font-medium">
//                   Manage Performance Feedback and Client Reviews In Real-Time
//                 </p>
//               </div>
//             </div>
//           </div>



//           {/* Clean Analytics Rating Summary Card */}
//           <Card className="border border-border/60 rounded-2xl shadow-xs overflow-hidden bg-card/60 backdrop-blur-md mb-6">
//             <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
//               <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 w-full sm:w-auto">
//                 <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
//                   <Star className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight flex items-baseline justify-center sm:justify-start gap-1">
//                     {rating.toFixed(1)}
//                     <span className="text-sm font-sans font-medium text-muted-foreground">/ 5.0</span>
//                   </h1>
//                   <div className="flex justify-center sm:justify-start mt-1 gap-0.5">
//                     {renderStars(rating, "h-4 w-4 sm:h-4.5 sm:w-4.5")}
//                   </div>
//                 </div>
//               </div>
//               <div className="w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-border/80 pt-4 sm:pt-0 sm:pl-8 text-center sm:text-right flex flex-col justify-center">
//                 <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{totalReviews}</p>
//                 <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
//                   Total Reviews Received
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Master Reviews Log List Block */}
//           <Card className="border border-border/60 shadow-xs rounded-2xl overflow-hidden bg-card">
//             <CardHeader className="border-b border-border/40 p-5 flex flex-row items-center justify-between gap-4">
//               <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight">
//                 <MessageSquare className="h-4.5 w-4.5 text-primary" />
//                 Client Reviews <span className="text-xs font-medium text-muted-foreground font-sans px-2 py-0.5 bg-secondary rounded-full ml-1">({reviews.length})</span>
//               </CardTitle>
//             </CardHeader>

//             <CardContent className="p-0">
//               {reviews.length === 0 ? (
//                 <div className="text-center py-16 px-4">
//                   <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3.5 text-muted-foreground">
//                     <ThumbsUp className="h-6 w-6" />
//                   </div>
//                   <h3 className="font-semibold text-sm mb-1">No Reviews Yet</h3>
//                   <p className="text-muted-foreground text-xs max-w-xs mx-auto leading-normal">
//                     Feedback shared by legal consultation clients will show up right here.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="divide-y divide-border/40">
//                   {paginatedReviews.map(r => {
//                     const isLong = r.comment && r.comment.length > 120;

//                     return (
//                       <div
//                         key={r.id}
//                         className="p-5 sm:p-6 transition-colors hover:bg-muted/10 flex flex-col gap-3"
//                       >
//                         <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//                           <div className="flex items-center gap-3.5 min-w-0">
//                             <Avatar className="h-10 w-10 border border-border/40 flex-shrink-0">
//                               <AvatarImage src={r.client_avatar || undefined} className="object-cover" />
//                               <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
//                                 {r.client_name?.charAt(0) || 'C'}
//                               </AvatarFallback>
//                             </Avatar>
//                             <div className="min-w-0">
//                               <span className="font-bold text-sm text-foreground block truncate">
//                                 {r.client_name}
//                               </span>
//                               <div className="flex mt-0.5 gap-0.5">
//                                 {renderStars(r.rating || 0, "h-3.5 w-3.5")}
//                               </div>
//                             </div>
//                           </div>

//                           <div className="flex items-center text-xs text-muted-foreground sm:text-right font-medium self-start sm:self-auto pl-13 sm:pl-0">
//                             <Calendar className="h-3.5 w-3.5 mr-1 opacity-70" />
//                             {new Date(r.created_at).toLocaleDateString('en-US', {
//                               month: 'short',
//                               day: 'numeric',
//                               year: 'numeric'
//                             })}
//                           </div>
//                         </div>

//                         {r.comment && (
//                           <div className="pl-13 w-full">
//                             <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words [word-break:break-word]">
//                               {isLong ? `${r.comment.slice(0, 120)}...` : r.comment}
//                             </p>
//                             {isLong && (
//                               <button
//                                 type="button"
//                                 onClick={() => setSelectedReview(r)}
//                                 className="text-xs font-semibold text-primary mt-1.5 hover:underline focus:outline-none block"
//                               >
//                                 Read full review
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Unified Compact Pagination Footer Row Control */}
//           {totalPages > 1 && (
//             <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 px-1">
//               <p className="text-xs text-muted-foreground font-medium order-2 sm:order-1">
//                 Showing Page <span className="text-foreground font-semibold">{currentPage}</span> of {totalPages}
//               </p>
//               <div className="flex items-center gap-1.5 order-1 sm:order-2 w-full sm:w-auto justify-center">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="h-8 text-xs gap-1 font-medium"
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage(p => p - 1)}
//                 >
//                   <ChevronLeft className="h-3.5 w-3.5" />
//                   Prev
//                 </Button>

//                 <div className="hidden sm:flex items-center gap-1">
//                   {[...Array(totalPages)].map((_, i) => (
//                     <Button
//                       key={i}
//                       size="sm"
//                       variant={currentPage === i + 1 ? "default" : "outline"}
//                       className="h-8 w-8 p-0 text-xs font-semibold"
//                       onClick={() => setCurrentPage(i + 1)}
//                     >
//                       {i + 1}
//                     </Button>
//                   ))}
//                 </div>

//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="h-8 text-xs gap-1 font-medium"
//                   disabled={currentPage === totalPages}
//                   onClick={() => setCurrentPage(p => p + 1)}
//                 >
//                   Next
//                   <ChevronRight className="h-3.5 w-3.5" />
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* FULL DETAILED REVIEW MODAL OVERLAY */}
//       {selectedReview && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
//           onClick={() => setSelectedReview(null)}
//         >
//           <div
//             className="w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-xl p-5 sm:p-6 relative flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Exit Box */}
//             <button
//               type="button"
//               onClick={() => setSelectedReview(null)}
//               className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors text-sm focus:outline-none"
//               aria-label="Close modal"
//             >
//               ✕
//             </button>

//             {/* Modal Identification Info Header */}
//             <div className="flex items-center gap-3.5 mb-4 pr-8">
//               <Avatar className="h-11 w-11 border border-border/40 shrink-0">
//                 <AvatarImage src={selectedReview.client_avatar || undefined} className="object-cover" />
//                 <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
//                   {selectedReview.client_name?.charAt(0) || 'C'}
//                 </AvatarFallback>
//               </Avatar>

//               <div className="min-w-0">
//                 <p className="font-bold text-sm text-foreground truncate">
//                   {selectedReview.client_name}
//                 </p>
//                 <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
//                   <Calendar className="h-3 w-3" />
//                   {new Date(selectedReview.created_at).toLocaleDateString('en-US', {
//                     month: 'short',
//                     day: 'numeric',
//                     year: 'numeric'
//                   })}
//                 </p>
//               </div>
//             </div>

//             {/* Micro Rating Indicator Row */}
//             <div className="flex gap-0.5 mb-4 bg-muted/30 p-2 rounded-xl justify-center">
//               {renderStars(selectedReview.rating || 0, "h-4.5 w-4.5")}
//             </div>

//             {/* Modal Content Message Box */}
//             <div className="flex-1 overflow-y-auto pr-1 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap max-h-[50vh]">
//               {selectedReview.comment || "No comment provided."}
//             </div>
//           </div>
//         </div>
//       )}
//     </LawyerLayout>
//   );
// };

// export default LawyerRating;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star, ArrowLeft, Calendar, ThumbsUp, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LawyerRating = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  // Changed configuration name to match the dataset context cleanly
  const REVIEWS_PER_PAGE = 4;

  useEffect(() => {
    if (selectedReview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedReview]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    const [{ data: lp }, { data: revs }] = await Promise.all([
      supabase
        .from('lawyer_profiles')
        .select('rating, total_reviews')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('reviews')
        .select('*')
        .eq('lawyer_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    setRating(Number(lp?.rating) || 0);
    setTotalReviews(lp?.total_reviews || 0);

    if (revs && revs.length > 0) {
      const clientIds = [...new Set(revs.map(r => r.client_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', clientIds);

      setReviews(
        revs.map(r => {
          const p = profiles?.find(pr => pr.id === r.client_id);
          return {
            ...r,
            client_name: p?.full_name || 'Client',
            client_avatar: p?.avatar_url,
          };
        })
      );
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const renderStars = (rating: number, sizeClass = "h-4 w-4") =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${sizeClass} ${i < Math.round(rating)
          ? 'fill-amber-500 text-amber-500'
          : 'text-muted-foreground/20 dark:text-muted-foreground/30'
          }`}
      />
    ));

  if (authLoading || loading) {
    return (
      <LawyerLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Skeleton className="h-12 w-full mb-6 rounded-xl" />
            <Skeleton className="h-44 rounded-2xl mb-6 shadow-xs" />
            <Skeleton className="h-96 rounded-2xl shadow-xs" />
          </div>
        </div>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl animate-fade-in">

          {/* Page Header (Matching Active Sessions Style Layout) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pt-2">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full shrink-0 text-foreground hover:bg-muted"
                onClick={() => navigate('/lawyer/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="space-y-1">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold flex items-center gap-2 text-foreground">

                  Client Ratings & Reviews
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Manage Performance Feedback and Client Reviews In Real-Time
                </p>
              </div>
            </div>


          </div>

          {/* Analytics Rating Summary Card */}
          <Card className="border border-border/60 rounded-2xl shadow-xs overflow-hidden bg-card/60 backdrop-blur-md mb-6">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                  <Star className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight flex items-baseline justify-center sm:justify-start gap-1">
                    {rating.toFixed(1)}
                    <span className="text-sm font-sans font-medium text-muted-foreground">/ 5.0</span>
                  </h2>
                  <div className="flex justify-center sm:justify-start mt-1 gap-0.5">
                    {renderStars(rating, "h-4 w-4 sm:h-4.5 sm:w-4.5")}
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-border/80 pt-4 sm:pt-0 sm:pl-8 text-center sm:text-right flex flex-col justify-center">
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{totalReviews}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
                  Total Reviews Received
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Master Reviews Log List Block */}
          <Card className="border border-border/60 shadow-xs rounded-2xl overflow-hidden bg-card">
            <CardHeader className="border-b border-border/40 p-5 flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight">
                <MessageSquare className="h-4.5 w-4.5 text-primary" />
                Client Reviews <span className="text-xs font-medium text-muted-foreground font-sans px-2 py-0.5 bg-secondary rounded-full ml-1">({reviews.length})</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {reviews.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3.5 text-muted-foreground">
                    <ThumbsUp className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">No Reviews Yet</h3>
                  <p className="text-muted-foreground text-xs max-w-xs mx-auto leading-normal">
                    Feedback shared by legal consultation clients will show up right here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {paginatedReviews.map(r => {
                    const isLong = r.comment && r.comment.length > 120;

                    return (
                      <div key={r.id} className="p-5 sm:p-6 transition-colors hover:bg-muted/10 flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Avatar className="h-10 w-10 border border-border/40 flex-shrink-0">
                              <AvatarImage src={r.client_avatar || undefined} className="object-cover" />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {r.client_name?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="font-bold text-sm text-foreground block truncate">
                                {r.client_name}
                              </span>
                              <div className="flex mt-0.5 gap-0.5">
                                {renderStars(r.rating || 0, "h-3.5 w-3.5")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center text-xs text-muted-foreground sm:text-right font-medium self-start sm:self-auto pl-13 sm:pl-0">
                            <Calendar className="h-3.5 w-3.5 mr-1 opacity-70" />
                            {new Date(r.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>

                        {r.comment && (
                          <div className="pl-13 w-full">
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words [word-break:break-word]">
                              {isLong ? `${r.comment.slice(0, 120)}...` : r.comment}
                            </p>
                            {isLong && (
                              <button
                                type="button"
                                onClick={() => setSelectedReview(r)}
                                className="text-xs font-semibold text-primary mt-1.5 hover:underline focus:outline-none block"
                              >
                                Read full review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* PAGINATION (Using your exact logic and responsive space-between alignment) */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-4 px-1">

              <p className="text-xs sm:text-sm text-muted-foreground font-medium order-2 sm:order-1">
                Showing {(currentPage - 1) * REVIEWS_PER_PAGE + 1}
                –
                {Math.min(currentPage * REVIEWS_PER_PAGE, reviews.length)}
                {' '}of {reviews.length} reviews
              </p>

              <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>

                {/* CURRENT PAGE */}
                <Button
                  variant="default"
                  size="sm"
                  className="w-9 h-9 p-0 text-xs font-semibold"
                >
                  {currentPage}
                </Button>

                {/* NEXT PAGE */}
                {currentPage + 1 <= totalPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-9 h-9 p-0 text-xs"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </Button>
                )}

                {/* ELLIPSIS */}
                {currentPage + 1 < totalPages && (
                  <span className="px-1 text-muted-foreground text-sm tracking-widest">...</span>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULL DETAILED REVIEW MODAL OVERLAY */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-xl p-5 sm:p-6 relative flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedReview(null)}
              className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors text-sm focus:outline-none"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-4 pr-8">
              <Avatar className="h-11 w-11 border border-border/40 shrink-0">
                <AvatarImage src={selectedReview.client_avatar || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {selectedReview.client_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">
                  {selectedReview.client_name}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedReview.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-0.5 mb-4 bg-muted/30 p-2 rounded-xl justify-center">
              {renderStars(selectedReview.rating || 0, "h-4.5 w-4.5")}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap max-h-[50vh]">
              {selectedReview.comment || "No comment provided."}
            </div>
          </div>
        </div>
      )}
    </LawyerLayout>
  );
};

export default LawyerRating;