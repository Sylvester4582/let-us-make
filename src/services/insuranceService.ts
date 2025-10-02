import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface InsurancePlan {
  id: string;
  name: string;
  type: string;
  premium: number;
  coverage: number;
  features: {
    basicMedical: boolean;
    emergency: boolean;
    prescriptions: boolean;
    annualCheckup: boolean;
    specialists: boolean;
    mentalHealth: boolean;
    preventiveCare: boolean;
    maternity: boolean;
    dental: boolean;
    vision: boolean;
  };
  max_discount: number;
  created_at: string;
}

export interface UserInsurance {
  id: string;
  user_id: string;
  plan_id: string;
  current_discount: number;
  start_date: string;
  last_update_date: string;
  status: string;
  name: string;
  premium: number;
  coverage: number;
  features: InsurancePlan['features'];
  max_discount: number;
  discountedPremium?: number;
  savings?: number;
}

export interface DiscountCalculation {
  discount: number;
  discountPercentage: number;
}

export interface DiscountHistory {
  id: string;
  user_id: string;
  plan_id: string;
  discount_type: string;
  amount: number;
  reason: string;
  timestamp: string;
  plan_name: string;
}

class InsuranceService {
  private getAuthHeaders() {
    const token = localStorage.getItem('youmatter_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async getPlans(): Promise<InsurancePlan[]> {
    try {
      const response = await axios.get(`${API_URL}/api/insurance/plans`, this.getAuthHeaders());
      return response.data.data.plans;
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
      throw new Error('Failed to fetch insurance plans');
    }
  }

  async getPlan(planId: string): Promise<InsurancePlan> {
    try {
      const response = await axios.get(`${API_URL}/api/insurance/plans/${planId}`, this.getAuthHeaders());
      return response.data.data.plan;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw new Error('Failed to fetch plan details');
    }
  }

  async calculateDiscount(): Promise<DiscountCalculation> {
    try {
      const response = await axios.get(`${API_URL}/api/insurance/calculate-discount`, this.getAuthHeaders());
      return response.data.data;
    } catch (error) {
      console.error('Error calculating discount:', error);
      throw new Error('Failed to calculate discount');
    }
  }

  async enrollInPlan(planId: string): Promise<{ message: string; enrollment: UserInsurance }> {
    try {
      const response = await axios.post(
        `${API_URL}/api/insurance/enroll`,
        { planId },
        this.getAuthHeaders()
      );
      return {
        message: response.data.message,
        enrollment: response.data.data.enrollment
      };
    } catch (error: unknown) {
      console.error('Error enrolling in plan:', error);
      const axiosError = error as { response?: { data?: { error?: { code?: string }; message?: string } } };
      if (axiosError.response?.data?.error?.code === 'ALREADY_ENROLLED') {
        throw new Error('You already have an active insurance plan');
      }
      throw new Error(axiosError.response?.data?.message || 'Failed to enroll in plan');
    }
  }

  async getCurrentPlan(): Promise<UserInsurance | null> {
    try {
      const response = await axios.get(`${API_URL}/api/insurance/current`, this.getAuthHeaders());
      return response.data.data.currentPlan;
    } catch (error) {
      console.error('Error fetching current plan:', error);
      throw new Error('Failed to fetch current insurance plan');
    }
  }

  async getDiscountHistory(limit = 10): Promise<DiscountHistory[]> {
    try {
      const response = await axios.get(
        `${API_URL}/api/insurance/discount-history?limit=${limit}`,
        this.getAuthHeaders()
      );
      return response.data.data.history;
    } catch (error) {
      console.error('Error fetching discount history:', error);
      throw new Error('Failed to fetch discount history');
    }
  }

  async updatePlanStatus(status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED'): Promise<string> {
    try {
      const response = await axios.patch(
        `${API_URL}/api/insurance/current`,
        { status },
        this.getAuthHeaders()
      );
      return response.data.message;
    } catch (error) {
      console.error('Error updating plan status:', error);
      throw new Error('Failed to update plan status');
    }
  }

  // Helper methods
  calculateSavings(originalPremium: number, discountPercentage: number): number {
    return originalPremium * (discountPercentage / 100);
  }

  calculateDiscountedPremium(originalPremium: number, discountPercentage: number): number {
    return originalPremium * (1 - discountPercentage / 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getFeaturesList(features: InsurancePlan['features']): { name: string; included: boolean }[] {
    const featureNames = {
      basicMedical: 'Basic Medical',
      emergency: 'Emergency Care',
      prescriptions: 'Prescriptions',
      annualCheckup: 'Annual Checkup',
      specialists: 'Specialists',
      mentalHealth: 'Mental Health',
      preventiveCare: 'Preventive Care',
      maternity: 'Maternity',
      dental: 'Dental',
      vision: 'Vision'
    };

    return Object.entries(features).map(([key, included]) => ({
      name: featureNames[key as keyof typeof featureNames] || key,
      included
    }));
  }
}

export const insuranceService = new InsuranceService();