import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { rejectButtonStyle, acceptButtonStyle } from '@/lib/buttonStyles';
// import { rejectButtonStyle, acceptButtonStyle } from '@/lib/buttonStyles';
interface RatingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    consultationId: string;
    lawyerId: string;
    clientId: string;
    lawyerName: string;
    lawyerAvatar?: string | null;
    onRated?: () => void;
}
export const RatingDialog = ({
    open,
    onOpenChange,
    consultationId,
    lawyerId,
    clientId,
    lawyerName,
    lawyerAvatar,
    onRated,
}: RatingDialogProps) => {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async () => {
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Please select a rating' });
            return;
        }
        setSubmitting(true);
        const { error } = await supabase.from('reviews').insert({
            consultation_id: consultationId,
            lawyer_id: lawyerId,
            client_id: clientId,
            rating,
            comment: comment.trim() || null,
        });
        if (error) {
            if (error.code === '23505') {
                toast({ title: 'Already rated', description: 'You have already rated this consultation.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit rating.' });
            }
        } else {
            toast({ title: '⭐ Thank you!', description: 'Your rating has been submitted.' });
            onRated?.();
        }
        setSubmitting(false);
        onOpenChange(false);
        setRating(0);
        setComment('');
    };
    const handleSkip = () => {
        onOpenChange(false);
        setRating(0);
        setComment('');
    };
    const displayRating = hoveredRating || rating;
    return (
        //         <Dialog open={open} onOpenChange={onOpenChange}>
        //             {/* <DialogContent className="sm:max-w-md"> */}
        //             <DialogContent
        //                 className="
        //     w-[95%] sm:max-w-md
        //     max-h-[90vh]
        //     overflow-hidden
        //     rounded-2xl
        //     p-0
        //   "
        //             >
        //                 <DialogHeader className="text-center px-4 pt-4 sm:px-6 sm:pt-6">
        //                     <DialogTitle className="text-xl">Rate Your Experience</DialogTitle>
        //                     <DialogDescription>
        //                         How was your consultation with {lawyerName}?
        //                     </DialogDescription>
        //                 </DialogHeader>
        //                 <div className="flex flex-col items-center gap-5 py-4">
        //                     {/* Lawyer Avatar */}
        //                     <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/20 shadow-sm">
        //                         <AvatarImage src={lawyerAvatar || undefined} />
        //                         <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-semibold">
        //                             {lawyerName?.charAt(0) || 'L'}
        //                         </AvatarFallback>
        //                     </Avatar>
        //                     {/* Star Rating */}
        //                     <div className="flex items-center gap-1">
        //                         {[1, 2, 3, 4, 5].map((star) => (
        //                             <button
        //                                 key={star}
        //                                 type="button"
        //                                 onClick={() => setRating(star)}
        //                                 onMouseEnter={() => setHoveredRating(star)}
        //                                 onMouseLeave={() => setHoveredRating(0)}
        //                                 // className="p-1 transition-transform hover:scale-110 focus:outline-none"
        //                                 className="p-1 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
        //                             >
        //                                 <Star
        //                                     className={`h-7 w-7 sm:h-8 sm:w-8 transition-all duration-200 ${star <= displayRating
        //                                         ? 'fill-amber-400 text-amber-400'
        //                                         : 'text-muted-foreground/30'
        //                                         }`}
        //                                 />
        //                             </button>
        //                         ))}
        //                     </div>

        //                     {/* Rating Label - FIXED HEIGHT */}
        //                     <div className="h-5 flex items-center justify-center">
        //                         <p
        //                             className={`
        //       text-sm font-medium transition-all duration-200
        //       ${displayRating ? 'opacity-100 text-muted-foreground' : 'opacity-0'}
        //     `}
        //                         >
        //                             {displayRating === 1 && 'Poor'}
        //                             {displayRating === 2 && 'Fair'}
        //                             {displayRating === 3 && 'Good'}
        //                             {displayRating === 4 && 'Very Good'}
        //                             {displayRating === 5 && 'Excellent'}
        //                         </p>
        //                     </div>
        //                     {/* Comment */}
        //                     <Textarea
        //                         placeholder="Share your experience (optional)..."
        //                         value={comment}
        //                         onChange={(e) => setComment(e.target.value)}
        //                         // className="resize-none"
        //                         className="resize-none rounded-xl border-muted focus:ring-2 focus:ring-primary/30"
        //                         rows={3}
        //                     />
        //                     {/* Actions */}
        //                     <div className="flex w-full gap-3 ">
        //                         <Button variant="outline" className="flex-1" onClick={handleSkip}>
        //                             Skip
        //                         </Button>
        //                         <Button
        //                             // className="flex-1 gap-2"
        //                             className="flex-1 gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
        //                             onClick={handleSubmit}
        //                             disabled={rating === 0 || submitting}
        //                         >
        //                             {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        //                             Submit Rating
        //                         </Button>
        //                     </div>
        //                 </div>
        //             </DialogContent>
        //         </Dialog>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
      w-[95vw]
      max-w-md
      max-h-[92vh]
      overflow-hidden
      rounded-3xl
      p-0
      border-0
      shadow-2xl
    "
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b">
                    <DialogHeader className="text-center px-5 py-5">
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            Rate Your Experience
                        </DialogTitle>

                        <DialogDescription className="text-xs sm:text-sm">
                            Share your feedback about your consultation with {lawyerName}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center gap-4 p-5 sm:p-6">

                    {/* Avatar */}
                    <Avatar className="h-20 w-20 border-4 border-background shadow-xl ring-4 ring-primary/10">
                        <AvatarImage src={lawyerAvatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-semibold">
                            {lawyerName?.charAt(0) || 'L'}
                        </AvatarFallback>
                    </Avatar>

                    {/* Lawyer Name */}
                    <div className="text-center -mt-1">
                        <p className="font-semibold text-sm">
                            {lawyerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Legal Professional
                        </p>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center justify-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="p-1 transition-all duration-200 hover:scale-125 active:scale-95 focus:outline-none"
                            >
                                <Star
                                    className={`h-8 w-8 sm:h-9 sm:w-9 transition-all duration-200 ${star <= displayRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-muted-foreground/25'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Rating Label */}
                    <div className="h-8 flex items-center justify-center">
                        <p
                            className={`
            text-sm font-semibold tracking-wide transition-all duration-200
            ${displayRating ? 'opacity-100 text-muted-foreground' : 'opacity-0'}
          `}
                        >
                            {displayRating === 1 && 'Poor'}
                            {displayRating === 2 && 'Fair'}
                            {displayRating === 3 && 'Good'}
                            {displayRating === 4 && 'Very Good'}
                            {displayRating === 5 && 'Excellent'}
                        </p>
                    </div>

                    {/* Comment */}
                    <Textarea
                        placeholder="Share your experience (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="
          resize-none
          rounded-2xl
          border-muted
          bg-muted/30
          focus-visible:ring-2
          focus-visible:ring-primary/20
          min-h-[90px]
        "
                        rows={3}
                    />

                    {/* Footer */}
                    <div className="flex w-full gap-3 pt-1">

                        <Button
                            variant="outline"
                            className={cn(rejectButtonStyle, "h-11")}
                            onClick={handleSkip}
                        >
                            Skip
                        </Button>

                        <Button
                            className={cn(acceptButtonStyle, "h-11")}
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                        >
                            {submitting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Submit Rating
                        </Button>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};