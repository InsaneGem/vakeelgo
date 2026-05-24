
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Video, Phone, Clock, Verified, Award, Cake, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatLawyerName } from '@/lib/lawyer-utils';
import { calculateAge } from '@/lib/ageUtils';
import { useSavedLawyers } from '@/hooks/useSavedLawyers';
import { BookingAgendaModal } from './BookingAgendaModal';
import { cn } from '@/lib/utils';
import { bookNowButtonStyle, lawyerCardStyle } from '@/lib/buttonStyles';
// import { lawyerCardStyle } from '@/lib/Styles';
// import { lawyerCardStyle } from './../../lib/buttonStyles';


interface LawyerWithProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  price_per_minute: number | null;
  chat_price_per_minute?: number | null;
  audio_price_per_minute?: number | null;
  video_price_per_minute?: number | null;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  is_busy?: boolean | null;
  status: string | null;
  full_name?: string;
  avatar_url?: string | null;
  date_of_birth?: string | null;
}

interface LawyerCardProps {
  lawyer: LawyerWithProfile;
  showActions?: boolean;
  onBooking?: () => void;
  // isBusy?: boolean;
}

export const LawyerCard = ({
  lawyer,
  showActions = true,
  onBooking,
  // isBusy = false
}: LawyerCardProps) => {

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // const isOnline = lawyer.is_available;
  // const isBusy = lawyer.is_busy;
  // const isBusy = !lawyer.is_available;
  // const isBusy = lawyer.is_busy;
  // const isOnline = lawyer.is_available;
  const isBusy = lawyer.is_busy === true;
  const isOnline =
    lawyer.is_available === true && lawyer.is_busy !== true;
  const isApproved = lawyer.status === 'approved';

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'chat' | 'audio' | 'video'>('chat');

  const { isSaved, toggleSave } = useSavedLawyers();
  const [heartAnimating, setHeartAnimating] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to save lawyers.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setHeartAnimating(true);
    await toggleSave(lawyer.id);
    setTimeout(() => setHeartAnimating(false), 300);
  };

  const handleBookClick = (type: 'chat' | 'audio' | 'video', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to book a consultation.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (isBusy) {
      toast({
        title: 'Lawyer Busy',
        description: 'This lawyer is currently in a consultation.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedType(type);
    setShowBookingModal(true);
  };

  const handleCardClick = () => {
    navigate(`/lawyersCard/${lawyer.id}`);
  };

  const ratingValue = lawyer.rating?.toFixed(1) || '0.0';
  const reviewCount = lawyer.total_reviews || 0;

  return (
    <div className="group block w-full h-full">

      {/* CARD */}
      {/* <div
        onClick={handleCardClick}
        className={`
        relative bg-card rounded-lg border overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]
        cursor-pointer flex flex-col h-full min-h-[220px]

        ${isOnline
            ? 'border-emerald-500/30 hover:border-emerald-500/60'
            : 'border-border hover:border-primary/30'
          }
        `}
      > */}

      <div
        onClick={handleCardClick}
        className={cn(
          lawyerCardStyle,

          isOnline
            ? "border-emerald-500/30 hover:border-emerald-500/60"
            : "border-border hover:border-primary/30"
        )}
      >

        {/* Pending Banner */}
        {lawyer.status === 'pending' && (
          <div className="bg-amber-500 text-white text-center py-1 text-[10px] font-medium">
            <Award className="h-3 w-3 inline mr-1" />
            PENDING VERIFICATION
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex flex-col flex-1">

          {/* TOP */}
          <div className="px-3 py-1.5 sm:px-4 sm:py-3 ">
            <div className="flex items-start gap-3">

              {/* AVATAR */}
              <div className="relative shrink-0">

                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full
                bg-gradient-to-br from-primary/20 to-accent/20
                flex items-center justify-center
                text-sm font-bold
                overflow-hidden
                ring-2 ring-background shadow-sm">

                  {lawyer.avatar_url ? (
                    <img
                      src={lawyer.avatar_url}
                      alt={lawyer.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary">
                      {lawyer.full_name?.charAt(0).toUpperCase() || 'L'}
                    </span>
                  )}

                </div>

                {/* STATUS DOT */}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card
                  ${isBusy
                      ? 'bg-red-500'
                      : isOnline
                        ? 'bg-emerald-500'
                        : 'bg-gray-400'
                    }`}
                />

                {isApproved && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-card">
                    <Verified className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">

                <h3 className="font-semibold text-sm sm:text-[15px] truncate group-hover:text-primary">
                  {formatLawyerName(lawyer.full_name)}
                </h3>

                {/* Rating + Exp */}
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">

                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600">
                      {ratingValue}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({reviewCount})
                    </span>
                  </div>

                  {(lawyer.experience_years !== null && lawyer.experience_years !== undefined) && (
                    <>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lawyer.experience_years}y
                      </span>
                    </>
                  )}

                  {calculateAge(lawyer.date_of_birth) !== null && (
                    <>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Cake className="h-3 w-3" />
                        {calculateAge(lawyer.date_of_birth)} yrs
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* PRICE */}
              <div className="text-right shrink-0">
                <span className="text-base sm:text-lg font-bold">
                  ₹{lawyer.chat_price_per_minute ?? lawyer.audio_price_per_minute ?? lawyer.video_price_per_minute ?? lawyer.price_per_minute ?? 5}
                </span>
                <span className="text-[10px] text-muted-foreground block -mt-0.5">
                  /min
                </span>
              </div>
            </div>
          </div>

          {/* BLUE DIVIDER */}
          <div className="px-3 sm:px-4 py-1">
            <div className="h-px bg-blue-500/30 w-full rounded-full" />
          </div>
          {/* SPECIALIZATIONS */}
          {lawyer.specializations && (
            <div className="px-3 sm:px-4 pb-2">

              {/* Mobile Screen */}
              <div className="flex flex-wrap gap-1 sm:hidden">
                {lawyer.specializations.slice(0, 2).map((spec) => (
                  <Badge
                    key={spec}
                    variant="secondary"
                    className="text-[9px] px-1.5 py-0 h-4"
                  >
                    {spec}
                  </Badge>
                ))}

                {lawyer.specializations.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 h-4"
                  >
                    +{lawyer.specializations.length - 2}
                  </Badge>
                )}
              </div>

              {/* Bigger Screen */}
              <div className="hidden sm:flex flex-wrap gap-1">
                {lawyer.specializations.slice(0, 4).map((spec) => (
                  <Badge
                    key={spec}
                    variant="secondary"
                    className="text-[9px] px-1.5 py-0 h-4"
                  >
                    {spec}
                  </Badge>
                ))}

                {lawyer.specializations.length > 4 && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 h-4"
                  >
                    +{lawyer.specializations.length - 4}
                  </Badge>
                )}
              </div>

            </div>
          )}

          {/* BIO */}
          <div className="px-3 sm:px-4 pb-3 flex-grow">
            <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-3">
              {lawyer.bio || 'Experienced legal professional ready to help.'}
            </p>
          </div>

        </div>

        {/* ACTIONS (Pinned Bottom) */}
        {showActions && (
          <div className="px-2 sm:px-3 py-2 border-t border-border bg-muted/30 flex items-center gap-1 mt-auto">

            {/* Heart */}
            <button
              onClick={handleToggleSave}
              className="ml-1 hover:scale-110 transition"
            >
              <Heart
                className={`h-4 w-4
                      ${isSaved(lawyer.id)
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-muted-foreground'
                  }
                      ${heartAnimating ? 'scale-125' : ''}
                      `}
              />
            </button>

            {/* STATUS */}
            <div className="mt-1 px-2">
              {isBusy ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200/60 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700 shadow-sm backdrop-blur-sm transition-all">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  Busy
                </span>
              ) : isOnline ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm backdrop-blur-sm transition-all">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  Offline
                </span>
              )}
            </div>

            <Button
              size="sm"
              disabled={isBusy}
              className={cn(
                "ml-auto h-8 text-xs px-1.5",
                bookNowButtonStyle,
                isBusy && "bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-70"
              )}
              onClick={(e) => handleBookClick('chat', e)}
            >
              Book Now

              <Video className="h-3.5 w-3.5" />
              <Phone className="h-3.5 w-3.5" />
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

      </div>

      {/* BOOKING MODAL */}
      <BookingAgendaModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        lawyer={{
          id: lawyer.id,
          user_id: lawyer.user_id,
          full_name: lawyer.full_name || 'Legal Professional',
          avatar_url: lawyer.avatar_url,
          price_per_minute: lawyer.price_per_minute,
          chat_price_per_minute: lawyer.chat_price_per_minute,
          audio_price_per_minute: lawyer.audio_price_per_minute,
          video_price_per_minute: lawyer.video_price_per_minute,
          rating: lawyer.rating,
          specializations: lawyer.specializations,
        }}
        consultationType={selectedType}
        onSuccess={onBooking}
      />

    </div>
  );
};