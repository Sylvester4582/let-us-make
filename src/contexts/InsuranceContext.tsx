import { createContext, useState, useEffect, ReactNode } from 'react';
import { insuranceService, InsurancePlan, UserInsurance, DiscountCalculation } from '@/services/insuranceService';
import { toast } from 'sonner';

interface InsuranceContextType {
  plans: InsurancePlan[];
  currentPlan: UserInsurance | null;
  discount: DiscountCalculation | null;
  isLoading: boolean;
  enrollInPlan: (planId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  calculateSavings: (plan: InsurancePlan) => number;
}

export const InsuranceContext = createContext<InsuranceContextType | undefined>(undefined);

const DEFAULT_STATE = {
  plans: [],
  currentPlan: null,
  discount: null,
  isLoading: true
};

export const InsuranceProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(DEFAULT_STATE);

  const loadInsuranceData = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Load all data in parallel
      const [plans, currentPlan, discount] = await Promise.all([
        insuranceService.getPlans(),
        insuranceService.getCurrentPlan().catch(() => null),
        insuranceService.calculateDiscount().catch(() => null)
      ]);

      setState({
        plans,
        currentPlan,
        discount,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading insurance data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error('Failed to load insurance data');
    }
  };

  const enrollInPlan = async (planId: string): Promise<boolean> => {
    try {
      const result = await insuranceService.enrollInPlan(planId);
      toast.success(result.message, {
        description: 'Your insurance plan is now active!',
        duration: 5000,
      });
      
      // Refresh data after enrollment
      await loadInsuranceData();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in plan';
      toast.error(errorMessage);
      return false;
    }
  };

  const refreshData = async () => {
    await loadInsuranceData();
  };

  const calculateSavings = (plan: InsurancePlan): number => {
    if (!state.discount) return 0;
    return insuranceService.calculateSavings(plan.premium, state.discount.discountPercentage);
  };

  // Load data on mount
  useEffect(() => {
    loadInsuranceData();
  }, []);

  return (
    <InsuranceContext.Provider
      value={{
        ...state,
        enrollInPlan,
        refreshData,
        calculateSavings
      }}
    >
      {children}
    </InsuranceContext.Provider>
  );
};