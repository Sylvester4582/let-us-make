// Insurance plan types and interfaces
export interface InsurancePlan {
  id: string;
  name: string;
  category: 'basic' | 'standard' | 'premium' | 'comprehensive';
  basePrice: number; // Monthly premium in dollars
  coverage: {
    hospitalCare: number; // Coverage amount
    outpatientCare: number;
    emergencyCare: number;
    prescriptionDrugs: number;
    preventiveCare: number;
    mentalHealth: number;
    dentalCare: number;
    visionCare: number;
  };
  deductible: number;
  outOfPocketMax: number;
  ageGroups: AgeGroup[];
  riskCategories: RiskCategory[];
  features: string[];
  description: string;
  minLevel: number; // Minimum user level required
  isPopular?: boolean;
}

export type AgeGroup = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
export type RiskCategory = 'low' | 'moderate' | 'high';

export interface UserHealthProfile {
  age: number;
  bmi: number;
  smokingStatus: 'never' | 'former' | 'current';
  exerciseFrequency: 'none' | 'light' | 'moderate' | 'heavy';
  chronicConditions: string[];
  familyHistory: string[];
  occupation: 'desk' | 'physical' | 'hazardous' | 'healthcare' | 'other';
}

export interface PersonalizedInsuranceRecommendation {
  plan: InsurancePlan;
  recommendationScore: number; // 0-100
  monthlyPremium: number; // After discounts
  levelDiscount: number; // Percentage discount based on level
  riskAdjustment: number; // Price adjustment based on health risk
  reasoning: string[];
  pros: string[];
  cons: string[];
  isRecommended: boolean;
}

export interface InsuranceQuote {
  userId: string;
  userLevel: number;
  userPoints: number;
  healthProfile: UserHealthProfile;
  recommendations: PersonalizedInsuranceRecommendation[];
  generatedAt: Date;
  validUntil: Date;
}