import { useContext } from 'react';
import { InsuranceContext } from '@/contexts/InsuranceContext';

export const useInsurance = () => {
  const context = useContext(InsuranceContext);
  if (!context) {
    throw new Error('useInsurance must be used within an InsuranceProvider');
  }
  return context;
};