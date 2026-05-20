import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Clock, Shield, XCircle, CheckCircle,
  ArrowRight, FileText, Briefcase, GraduationCap, DollarSign
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
    if (field.includes('bio')) return <FileText className="h-3.5 w-3.5" />;
    if (field.includes('specialization')) return <Briefcase className="h-3.5 w-3.5" />;
    if (field.includes('credential') || field.includes('bar')) return <GraduationCap className="h-3.5 w-3.5" />;
    if (field.includes('pricing') || field.includes('price')) return <IndianRupee className="h-3.5 w-3.5" />;
    return <AlertTriangle className="h-3.5 w-3.5" />;
  };

  return (
    <Card className={cn("border-2 shadow-lg mb-8", config.bgClass)}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Icon */}
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
            config.iconBgClass
          )}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h3 className="font-semibold text-lg">{config.title}</h3>
              {completionPercentage < 100 && status === 'pending' && (
                <Badge variant="outline" className="w-fit">
                  {completionPercentage}% Complete
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-4">{config.description}</p>

            {/* Progress bar for incomplete profiles */}
            {completionPercentage < 100 && status !== 'approved' && (
              <div className="mb-4">
                <Progress value={completionPercentage} className="h-2" />
              </div>
            )}

            {/* Missing fields */}
            {missingFields.length > 0 && status !== 'approved' && (
              <div className="flex flex-wrap gap-2 mb-4">
                {missingFields.map((field, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="gap-1.5 text-amber-600 border-amber-500/30"
                  >
                    {getFieldIcon(field)}
                    {field}
                  </Badge>
                ))}
              </div>
            )}

            {/* CTA Button */}
            {config.showCta && (
              <Button
                className="gap-2"
                onClick={() => navigate('/lawyer/profile-setup')}
              >
                {config.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
