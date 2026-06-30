
import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface OnboardingStepCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  isComplete: boolean;
  isRequired?: boolean;
  children: ReactNode;
  className?: string;
}

export const OnboardingStepCard = ({
  title,
  description,
  icon,
  isComplete,
  isRequired = true,
  children,
  className,
}: OnboardingStepCardProps) => {
  return (
    <Card
      className={cn(
        // 🔥 PREMIUM BASE
        "transition-all duration-200 border rounded-xl shadow-sm",

        // subtle compact hover
        "hover:shadow-md",

        // status colors (softer than before)
        isComplete
          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
          : isRequired
            ? "border-amber-500/20 bg-amber-500/[0.03]"
            : "border-border",

        className
      )}
    >
      {/* HEADER */}
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">

          {/* LEFT SIDE */}
          <div className="flex items-start gap-3">

            {/* ICON (smaller + cleaner) */}
            <div
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                isComplete
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-primary/10 text-primary"
              )}
            >
              {icon}
            </div>

            {/* TEXT */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm sm:text-base font-semibold">
                  {title}
                </CardTitle>

                {isRequired && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5"
                  >
                    Required
                  </Badge>
                )}
              </div>

              <CardDescription className="text-xs sm:text-sm leading-snug">
                {description}
              </CardDescription>
            </div>
          </div>

          {/* RIGHT STATUS */}
          <div className="flex-shrink-0 mt-1">
            {isComplete ? (
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
              </div>
            ) : isRequired ? (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-4 w-4" />
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-5">
        {children}
      </CardContent>
    </Card>
  );
};