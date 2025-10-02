import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useBenefits } from '@/hooks/useBenefits';
import { Benefit } from '@/services/benefitsService';
import { 
  Award, 
  Gift, 
  Lock, 
  CheckCircle2, 
  Star,
  Zap,
  Crown,
  Target,
  Rocket,
  Bot,
  BookOpen
} from 'lucide-react';

const getBenefitIcon = (iconType: string, category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    '🎯': <Target className="w-5 h-5" />,
    '⭐': <Star className="w-5 h-5" />,
    '🏆': <Award className="w-5 h-5" />,
    '👑': <Crown className="w-5 h-5" />,
    '🚀': <Rocket className="w-5 h-5" />,
    '🤖': <Bot className="w-5 h-5" />,
    '📚': <BookOpen className="w-5 h-5" />
  };

  return iconMap[iconType] || <Gift className="w-5 h-5" />;
};

const getBenefitColor = (category: string, isUnlocked: boolean, isClaimed: boolean) => {
  if (isClaimed) return 'text-green-600 bg-green-100 border-green-200';
  if (isUnlocked) return 'text-blue-600 bg-blue-100 border-blue-200';
  return 'text-muted-foreground bg-muted border-muted';
};

interface BenefitCardProps {
  benefit: Benefit;
  onClaim?: (benefitId: string) => Promise<void>;
  showClaimButton?: boolean;
}

const BenefitCard = ({ benefit, onClaim, showClaimButton = false }: BenefitCardProps) => {
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  const handleClaim = async () => {
    if (!onClaim) return;
    
    setIsClaimLoading(true);
    try {
      await onClaim(benefit.id);
    } finally {
      setIsClaimLoading(false);
    }
  };

  const colorClasses = getBenefitColor(benefit.category, benefit.isUnlocked, benefit.isClaimed);

  return (
    <Card className={`p-4 transition-all hover:scale-105 cursor-pointer border-2 ${colorClasses}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${benefit.isClaimed ? 'bg-green-500' : benefit.isUnlocked ? 'bg-blue-500' : 'bg-muted'}`}>
          {benefit.isClaimed ? (
            <CheckCircle2 className="w-5 h-5 text-white" />
          ) : (
            <div className={benefit.isUnlocked ? 'text-white' : 'text-muted-foreground'}>
              {getBenefitIcon(benefit.icon, benefit.category)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{benefit.title}</h3>
            {benefit.category === 'discount' && (
              <Badge variant={benefit.isUnlocked ? 'default' : 'secondary'} className="text-xs">
                {benefit.discountPercentage}% OFF
              </Badge>
            )}
            {benefit.isClaimed && (
              <Badge variant="default" className="text-xs bg-green-500">
                CLAIMED
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {benefit.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {benefit.isUnlocked ? (
                <span className="text-green-600 font-medium">✓ Unlocked</span>
              ) : (
                <span>
                  Need {benefit.requiredPoints} pts • Level {benefit.requiredLevel}
                </span>
              )}
            </div>
            
            {showClaimButton && benefit.isUnlocked && !benefit.isClaimed && (
              <Button
                size="sm"
                onClick={handleClaim}
                disabled={isClaimLoading}
                className="h-7 px-3 text-xs"
              >
                {isClaimLoading ? 'Claiming...' : 'Claim'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const BenefitsCard = () => {
  const { benefits, isLoading, claimBenefit, getNextBenefit, getPointsToNext } = useBenefits();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const nextBenefit = getNextBenefit();
  const pointsToNext = getPointsToNext();

  const handleClaimBenefit = async (benefitId: string) => {
    await claimBenefit(benefitId);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Your Benefits</h2>
            <p className="text-sm text-muted-foreground">
              {benefits.totalSavings > 0 && (
                <span className="text-green-600 font-medium">
                  {benefits.totalSavings}% total savings unlocked
                </span>
              )}
            </p>
          </div>
        </div>
        
        {nextBenefit && pointsToNext > 0 && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Next unlock:</div>
            <div className="text-sm font-medium">{pointsToNext} points to go</div>
          </div>
        )}
      </div>

      {/* Unlocked Benefits */}
      {benefits.unlockedBenefits.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            Ready to Claim ({benefits.unlockedBenefits.length})
          </h3>
          <div className="grid gap-3">
            {benefits.unlockedBenefits.map((benefit) => (
              <BenefitCard
                key={benefit.id}
                benefit={benefit}
                onClaim={handleClaimBenefit}
                showClaimButton={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Claimed Benefits */}
      {benefits.claimedBenefits.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Claimed Benefits ({benefits.claimedBenefits.length})
          </h3>
          <div className="grid gap-3">
            {benefits.claimedBenefits.map((benefit) => (
              <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </div>
        </div>
      )}

      {/* Available Benefits (Locked) */}
      {benefits.availableBenefits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Upcoming Benefits ({benefits.availableBenefits.length})
          </h3>
          <div className="grid gap-3">
            {benefits.availableBenefits
              .sort((a, b) => a.requiredPoints - b.requiredPoints)
              .slice(0, 5) // Show only next 5 benefits
              .map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {benefits.unlockedBenefits.length === 0 && 
       benefits.claimedBenefits.length === 0 && 
       benefits.availableBenefits.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No benefits available yet. Keep earning points!</p>
        </div>
      )}
    </Card>
  );
};