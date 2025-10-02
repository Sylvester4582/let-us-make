import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { benefitsService, UserBenefits, Benefit, ClaimBenefitResponse } from '@/services/benefitsService';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface BenefitsContextType {
  benefits: UserBenefits;
  isLoading: boolean;
  claimBenefit: (benefitId: string) => Promise<boolean>;
  refreshBenefits: () => Promise<void>;
  getNextBenefit: () => Benefit | null;
  getPointsToNext: () => number;
}

export const BenefitsContext = createContext<BenefitsContextType | undefined>(undefined);

const DEFAULT_BENEFITS: UserBenefits = {
  unlockedBenefits: [],
  availableBenefits: [],
  claimedBenefits: [],
  totalSavings: 0
};

export const BenefitsProvider = ({ children }: { children: ReactNode }) => {
  const [benefits, setBenefits] = useState<UserBenefits>(DEFAULT_BENEFITS);
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useUser();

  const loadBenefits = async () => {
    setIsLoading(true);
    try {
      const userBenefits = await benefitsService.getUserBenefits();
      setBenefits(userBenefits);
    } catch (error) {
      console.error('Error loading benefits:', error);
      // Fallback to local calculation
      const localBenefits = benefitsService['calculateBenefitsLocally']();
      setBenefits(localBenefits);
    } finally {
      setIsLoading(false);
    }
  };

  const claimBenefit = async (benefitId: string): Promise<boolean> => {
    try {
      // First try backend
      let response: ClaimBenefitResponse;
      
      try {
        response = await benefitsService.claimBenefit(benefitId);
      } catch (error) {
        // Fallback to local claim
        response = await benefitsService.claimBenefitLocally(benefitId);
      }

      if (response.success) {
        toast.success(`🎉 ${response.message}`, {
          description: response.benefit ? `You've unlocked ${response.benefit.title}!` : undefined,
          duration: 5000,
        });
        
        // Refresh benefits after successful claim
        await loadBenefits();
        return true;
      } else {
        toast.error(response.message);
        return false;
      }
    } catch (error) {
      console.error('Error claiming benefit:', error);
      toast.error('Failed to claim benefit. Please try again.');
      return false;
    }
  };

  const refreshBenefits = async () => {
    await loadBenefits();
  };

  const getNextBenefit = (): Benefit | null => {
    return benefitsService.getNextBenefit(userData.points, userData.level);
  };

  const getPointsToNext = (): number => {
    return benefitsService.getPointsToNextBenefit(userData.points, userData.level);
  };

  // Load benefits when component mounts or user data changes
  useEffect(() => {
    loadBenefits();
  }, [userData.points, userData.level]);

  return (
    <BenefitsContext.Provider
      value={{
        benefits,
        isLoading,
        claimBenefit,
        refreshBenefits,
        getNextBenefit,
        getPointsToNext
      }}
    >
      {children}
    </BenefitsContext.Provider>
  );
};