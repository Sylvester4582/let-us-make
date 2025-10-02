import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { useInsurance } from '../hooks/useInsurance';
import { InsurancePlan } from '../services/insuranceService';
import { 
  Shield, 
  Heart, 
  Users, 
  Check, 
  X, 
  DollarSign,
  Percent,
  Sparkles
} from 'lucide-react';

const getFeatureIcon = (featureKey: string) => {
  const icons: Record<string, React.ReactNode> = {
    basicMedical: <Heart className="w-4 h-4" />,
    emergency: <Shield className="w-4 h-4" />,
    prescriptions: <Heart className="w-4 h-4" />,
    annualCheckup: <Heart className="w-4 h-4" />,
    specialists: <Users className="w-4 h-4" />,
    mentalHealth: <Heart className="w-4 h-4" />,
    preventiveCare: <Shield className="w-4 h-4" />,
    maternity: <Users className="w-4 h-4" />,
    dental: <Heart className="w-4 h-4" />,
    vision: <Heart className="w-4 h-4" />
  };
  return icons[featureKey] || <Heart className="w-4 h-4" />;
};

const formatFeatureName = (key: string): string => {
  const names: Record<string, string> = {
    basicMedical: 'Basic Medical',
    emergency: 'Emergency Care',
    prescriptions: 'Prescriptions',
    annualCheckup: 'Annual Checkup',
    specialists: 'Specialists',
    mentalHealth: 'Mental Health',
    preventiveCare: 'Preventive Care',
    maternity: 'Maternity Care',
    dental: 'Dental Coverage',
    vision: 'Vision Coverage'
  };
  return names[key] || key.replace(/([A-Z])/g, ' $1').trim();
};

interface InsurancePlanCardProps {
  plan: InsurancePlan;
  isEnrolled?: boolean;
  showEnrollButton?: boolean;
}

export const InsurancePlanCard = ({ plan, isEnrolled = false, showEnrollButton = true }: InsurancePlanCardProps) => {
  const { discount, enrollInPlan, calculateSavings } = useInsurance();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await enrollInPlan(plan.id);
    } finally {
      setIsEnrolling(false);
    }
  };

  const savings = calculateSavings(plan);
  const discountedPremium = plan.premium - savings;
  const discountPercentage = discount?.discountPercentage || 0;

  const getPlanIcon = () => {
    switch (plan.type) {
      case 'family':
        return <Users className="w-8 h-8 text-purple-500" />;
      case 'health':
        return plan.name.includes('Premium') 
          ? <Sparkles className="w-8 h-8 text-blue-500" />
          : <Shield className="w-8 h-8 text-green-500" />;
      default:
        return <Shield className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <Card className={`relative p-6 transition-all hover:scale-105 border-2 ${
      isEnrolled 
        ? 'border-green-500 bg-green-50' 
        : 'border-gray-200 hover:border-blue-300'
    }`}>
      {isEnrolled && (
        <div className="absolute top-4 right-4">
          <Badge variant="default" className="bg-green-500 text-white">
            ENROLLED
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-lg bg-gray-100">
          {getPlanIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-2xl font-bold">
                ${discountedPremium.toFixed(0)}
              </span>
              <span className="text-gray-500">/month</span>
            </div>
            {savings > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <Percent className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {discountPercentage}% off
                </span>
              </div>
            )}
          </div>
          {savings > 0 && (
            <p className="text-sm text-gray-500">
              Original: <span className="line-through">${plan.premium}</span>
              <span className="text-green-600 font-medium ml-1">
                Save ${savings.toFixed(0)}/month
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">Coverage</span>
        </div>
        <p className="text-2xl font-bold text-blue-600">
          ${plan.coverage.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">Maximum coverage amount</p>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Features Included
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(plan.features).map(([key, included]) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`p-1 rounded ${included ? 'text-green-600' : 'text-gray-400'}`}>
                {included ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <span className={`text-sm ${included ? 'text-gray-900' : 'text-gray-400'}`}>
                {formatFeatureName(key)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showEnrollButton && !isEnrolled && (
        <Button
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="w-full"
          size="lg"
        >
          {isEnrolling ? 'Enrolling...' : `Enroll Now - $${discountedPremium.toFixed(0)}/month`}
        </Button>
      )}

      {isEnrolled && (
        <div className="flex items-center justify-center gap-2 p-3 bg-green-100 rounded-lg">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">You're enrolled in this plan</span>
        </div>
      )}
    </Card>
  );
};

export const InsurancePlanCardSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-start gap-4 mb-6">
      <Skeleton className="w-14 h-14 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
    <div className="mb-6">
      <Skeleton className="h-5 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-1" />
      <Skeleton className="h-4 w-40" />
    </div>
    <div className="mb-6">
      <Skeleton className="h-5 w-32 mb-3" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
    <Skeleton className="h-12 w-full" />
  </Card>
);