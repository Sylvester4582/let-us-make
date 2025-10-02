import { useContext } from 'react';
import { BenefitsContext } from '@/contexts/BenefitsContext';

export const useBenefits = () => {
  const context = useContext(BenefitsContext);
  if (!context) {
    throw new Error('useBenefits must be used within a BenefitsProvider');
  }
  return context;
};