import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Clock, Shield, XCircle, CheckCircle,
  ArrowRight, FileText, Briefcase, GraduationCap, DollarSign, IndianRupee
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingAlertProps {
  status: string;
  completionPercentage: number;
  missingFields: string[];
}

export const OnboardingAlert = ({
  status,
  completionPercentage,
  missingFields
}: OnboardingAlertProps) => {
  const navigate = useNavigate();

  // if (status === 'approved' && completionPercentage >= 100) {
  if (status === 'approved') {
    return null; // No alert needed for fully verified lawyers
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <Shield className="h-6 w-6" />,
          bgClass: 'bg-emerald-500/5 border-emerald-500/30',
          iconBgClass: 'bg-emerald-500/10 text-emerald-600',
          title: 'Profile Verified',
          description: 'You are verified and can accept consultations.',
          showCta: false,
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-6 w-6" />,
          bgClass: 'bg-destructive/5 border-destructive/30',
          iconBgClass: 'bg-destructive/10 text-destructive',
          title: 'Application Rejected',
          description: 'Please update your profile and resubmit for review.',
          showCta: true,
          ctaText: 'Update Profile',
        };
      case 'suspended':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          bgClass: 'bg-orange-500/5 border-orange-500/30',
          iconBgClass: 'bg-orange-500/10 text-orange-600',
          title: 'Account Suspended',
          description: 'Your account has been suspended. Contact support for assistance.',
          showCta: false,
        };
      default: // pending
        return {
          icon: <Clock className="h-6 w-6" />,
          bgClass: 'bg-amber-500/5 border-amber-500/30',
          iconBgClass: 'bg-amber-500/10 text-amber-600',
          title: completionPercentage < 100 ? 'Complete Your Profile' : 'Pending Verification',
          description: completionPercentage < 100
            ? 'Fill in all required information to submit for review.'
            : 'Your profile is under review. We\'ll notify you once approved.',
          showCta: completionPercentage < 100,
          ctaText: 'Complete Onboarding',
        };
    }
  };

  const config = getStatusConfig();

  const getFieldIcon = (field: string) => {
    const lowerField = field.toLowerCase(); // Prevents case sensitivity mismatches
    if (lowerField.includes('bio')) return <FileText className="h-3.5 w-3.5" />;
    if (lowerField.includes('specialization') || lowerField.includes('spec')) return <Briefcase className="h-3.5 w-3.5" />;
    if (lowerField.includes('credential') || lowerField.includes('bar') || lowerField.includes('education')) return <GraduationCap className="h-3.5 w-3.5" />;
    if (lowerField.includes('pricing') || lowerField.includes('price') || lowerField.includes('rate')) return <IndianRupee className="h-3.5 w-3.5" />;
    return <AlertTriangle className="h-3.5 w-3.5" />;
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/40 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 mb-6 rounded-xl bg-background/60 backdrop-blur-[6px]",
        config.bgClass
      )}
    >
      {/* Ultra-faint subtle vector lines background grid for a sleek look */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808004_1px,transparent_1px),linear-gradient(to_bottom,#80808004_1px,transparent_1px)] bg-[size:10px_16px] pointer-events-none" />

      <CardContent className="p-4 sm:p-5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-5">

          {/* Compact, premium icon container box */}
          <div className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm transition-transform duration-300 hover:scale-105",
            config.iconBgClass
          )}>
            {/* FIXED: Uses standard inline props mapping to scale the icon sizes correctly */}
            <div className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full">
              {config.icon}
            </div>
          </div>

          {/* Content Details Layer */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="font-semibold text-sm sm:text-base tracking-tight text-foreground/90">
                {config.title}
              </h3>
              {completionPercentage < 100 && status === 'pending' && (
                <Badge
                  variant="secondary"
                  className="w-fit font-medium text-[10px] sm:text-[11px] px-2 py-0 bg-background/90 border border-border/30 shadow-none rounded-md"
                >
                  {completionPercentage}% Complete
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-2xl">
              {config.description}
            </p>

            {/* Sleek, thin premium progress slider rule */}
            {completionPercentage < 100 && status !== 'approved' && (
              <div className="w-full pt-0.5">
                <Progress
                  value={completionPercentage}
                  className="h-1 bg-muted/40"
                />
              </div>
            )}

            {/* Minimalist modern error/missing field tracking labels */}
            {missingFields.length > 0 && status !== 'approved' && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {missingFields.map((field, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="gap-1 text-[10px] font-medium px-2 py-0.5 text-amber-700 bg-amber-500/5 border-amber-500/15 rounded-md shadow-none transition-colors duration-200 hover:bg-amber-500/10"
                  >
                    {getFieldIcon(field)}
                    {field}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Responsive, low-profile action handler button */}
          {config.showCta && (
            <div className="flex-shrink-0 pt-1 md:pt-0 w-full md:w-auto">
              <Button
                size="sm"
                className="gap-1.5 w-full md:w-auto px-4 h-8 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 rounded-md"
                onClick={() => navigate('/lawyer/profile-setup')}
              >
                {config.ctaText}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
};
