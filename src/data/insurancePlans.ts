import { InsurancePlan, AgeGroup, RiskCategory } from '../types/insurance';

export const insurancePlans: InsurancePlan[] = [
  // Basic Plans (Level 1+)
  {
    id: 'basic-starter',
    name: 'Starter Health Plan',
    category: 'basic',
    basePrice: 89,
    coverage: {
      hospitalCare: 10000,
      outpatientCare: 2000,
      emergencyCare: 5000,
      prescriptionDrugs: 1000,
      preventiveCare: 500,
      mentalHealth: 500,
      dentalCare: 0,
      visionCare: 0
    },
    deductible: 2000,
    outOfPocketMax: 8000,
    ageGroups: ['18-25', '26-35'],
    riskCategories: ['low'],
    features: [
      'Basic emergency coverage',
      'Preventive care included',
      'Generic prescription coverage',
      'Telehealth consultations'
    ],
    description: 'Perfect for young, healthy individuals who need basic coverage for unexpected medical events.',
    minLevel: 1,
    isPopular: true
  },
  
  {
    id: 'basic-essential',
    name: 'Essential Care Plan',
    category: 'basic',
    basePrice: 129,
    coverage: {
      hospitalCare: 25000,
      outpatientCare: 5000,
      emergencyCare: 10000,
      prescriptionDrugs: 2500,
      preventiveCare: 1000,
      mentalHealth: 1000,
      dentalCare: 500,
      visionCare: 300
    },
    deductible: 1500,
    outOfPocketMax: 6500,
    ageGroups: ['18-25', '26-35', '36-45'],
    riskCategories: ['low', 'moderate'],
    features: [
      'Enhanced outpatient care',
      'Mental health support',
      'Basic dental and vision',
      'Chronic disease management',
      'Health coaching'
    ],
    description: 'Comprehensive basic coverage with essential health services for individuals and young families.',
    minLevel: 1
  },

  // Standard Plans (Level 2+)
  {
    id: 'standard-family',
    name: 'Family Protection Plan',
    category: 'standard',
    basePrice: 189,
    coverage: {
      hospitalCare: 50000,
      outpatientCare: 15000,
      emergencyCare: 25000,
      prescriptionDrugs: 5000,
      preventiveCare: 2000,
      mentalHealth: 3000,
      dentalCare: 1500,
      visionCare: 800
    },
    deductible: 1000,
    outOfPocketMax: 5000,
    ageGroups: ['26-35', '36-45', '46-55'],
    riskCategories: ['low', 'moderate'],
    features: [
      'Family-friendly coverage',
      'Maternity and newborn care',
      'Pediatric services',
      'Specialist consultations',
      'Prescription drug coverage',
      'Annual health assessments'
    ],
    description: 'Designed for families with comprehensive coverage for all family members.',
    minLevel: 2,
    isPopular: true
  },

  {
    id: 'standard-active',
    name: 'Active Lifestyle Plan',
    category: 'standard',
    basePrice: 169,
    coverage: {
      hospitalCare: 40000,
      outpatientCare: 12000,
      emergencyCare: 20000,
      prescriptionDrugs: 4000,
      preventiveCare: 3000,
      mentalHealth: 2500,
      dentalCare: 1200,
      visionCare: 600
    },
    deductible: 800,
    outOfPocketMax: 4500,
    ageGroups: ['18-25', '26-35', '36-45'],
    riskCategories: ['low'],
    features: [
      'Sports injury coverage',
      'Physical therapy',
      'Nutritionist consultations',
      'Fitness program discounts',
      'Wellness rewards',
      'Alternative medicine coverage'
    ],
    description: 'Perfect for active individuals with coverage for sports-related injuries and wellness services.',
    minLevel: 2
  },

  // Premium Plans (Level 3+)
  {
    id: 'premium-complete',
    name: 'Complete Care Premium',
    category: 'premium',
    basePrice: 289,
    coverage: {
      hospitalCare: 100000,
      outpatientCare: 30000,
      emergencyCare: 50000,
      prescriptionDrugs: 10000,
      preventiveCare: 5000,
      mentalHealth: 6000,
      dentalCare: 3000,
      visionCare: 1500
    },
    deductible: 500,
    outOfPocketMax: 3000,
    ageGroups: ['26-35', '36-45', '46-55', '56-65'],
    riskCategories: ['low', 'moderate', 'high'],
    features: [
      'Comprehensive specialist care',
      'Advanced diagnostic testing',
      'Premium hospital rooms',
      'Concierge medical services',
      'International coverage',
      'Second opinion services',
      'Executive health programs'
    ],
    description: 'Premium coverage with access to top specialists and comprehensive medical services.',
    minLevel: 3,
    isPopular: true
  },

  {
    id: 'premium-executive',
    name: 'Executive Health Plan',
    category: 'premium',
    basePrice: 349,
    coverage: {
      hospitalCare: 150000,
      outpatientCare: 40000,
      emergencyCare: 75000,
      prescriptionDrugs: 15000,
      preventiveCare: 8000,
      mentalHealth: 8000,
      dentalCare: 4000,
      visionCare: 2000
    },
    deductible: 250,
    outOfPocketMax: 2000,
    ageGroups: ['36-45', '46-55', '56-65'],
    riskCategories: ['low', 'moderate'],
    features: [
      'VIP treatment at all facilities',
      'Same-day specialist appointments',
      'Personal health coordinator',
      'Advanced preventive screening',
      'Luxury amenities',
      'Global emergency coverage',
      'Experimental treatment coverage'
    ],
    description: 'Elite healthcare experience with personalized service and premium benefits.',
    minLevel: 3
  },

  // Comprehensive Plans (Level 4+)
  {
    id: 'comprehensive-senior',
    name: 'Senior Care Comprehensive',
    category: 'comprehensive',
    basePrice: 419,
    coverage: {
      hospitalCare: 200000,
      outpatientCare: 50000,
      emergencyCare: 100000,
      prescriptionDrugs: 20000,
      preventiveCare: 10000,
      mentalHealth: 10000,
      dentalCare: 5000,
      visionCare: 3000
    },
    deductible: 300,
    outOfPocketMax: 1500,
    ageGroups: ['46-55', '56-65', '65+'],
    riskCategories: ['moderate', 'high'],
    features: [
      'Specialized geriatric care',
      'Chronic disease management',
      'Home health services',
      'Long-term care options',
      'Medication management',
      'Fall prevention programs',
      'Cognitive health support',
      'Caregiver support services'
    ],
    description: 'Comprehensive coverage designed specifically for seniors with age-related health needs.',
    minLevel: 4
  },

  {
    id: 'comprehensive-platinum',
    name: 'Platinum Elite Plan',
    category: 'comprehensive',
    basePrice: 549,
    coverage: {
      hospitalCare: 500000,
      outpatientCare: 100000,
      emergencyCare: 200000,
      prescriptionDrugs: 50000,
      preventiveCare: 20000,
      mentalHealth: 20000,
      dentalCare: 10000,
      visionCare: 5000
    },
    deductible: 0,
    outOfPocketMax: 1000,
    ageGroups: ['36-45', '46-55', '56-65', '65+'],
    riskCategories: ['high'],
    features: [
      'No deductible coverage',
      'Unlimited specialist visits',
      'Premium facility access',
      'Experimental treatment coverage',
      'Organ transplant coverage',
      'Stem cell therapy',
      'Personalized medicine',
      'Concierge service 24/7',
      'Global medical evacuation'
    ],
    description: 'Ultimate healthcare coverage with no limits and access to cutting-edge treatments.',
    minLevel: 4
  },

  // Specialized Plans
  {
    id: 'specialized-chronic',
    name: 'Chronic Care Specialist',
    category: 'standard',
    basePrice: 229,
    coverage: {
      hospitalCare: 75000,
      outpatientCare: 25000,
      emergencyCare: 35000,
      prescriptionDrugs: 12000,
      preventiveCare: 4000,
      mentalHealth: 5000,
      dentalCare: 2000,
      visionCare: 1000
    },
    deductible: 600,
    outOfPocketMax: 3500,
    ageGroups: ['26-35', '36-45', '46-55', '56-65'],
    riskCategories: ['moderate', 'high'],
    features: [
      'Diabetes management program',
      'Heart disease support',
      'Cancer care coordination',
      'Specialized pharmacy network',
      'Disease-specific education',
      'Remote monitoring devices',
      'Care coordination team'
    ],
    description: 'Specialized coverage for individuals with chronic conditions requiring ongoing medical care.',
    minLevel: 2
  },

  {
    id: 'specialized-wellness',
    name: 'Wellness Champion Plan',
    category: 'standard',
    basePrice: 159,
    coverage: {
      hospitalCare: 30000,
      outpatientCare: 10000,
      emergencyCare: 15000,
      prescriptionDrugs: 3000,
      preventiveCare: 5000,
      mentalHealth: 4000,
      dentalCare: 2000,
      visionCare: 1000
    },
    deductible: 750,
    outOfPocketMax: 4000,
    ageGroups: ['18-25', '26-35', '36-45'],
    riskCategories: ['low'],
    features: [
      'Fitness program coverage',
      'Nutrition counseling',
      'Wellness coaching',
      'Health screening bonuses',
      'Mental wellness programs',
      'Stress management courses',
      'Sleep therapy coverage'
    ],
    description: 'Focus on preventive care and wellness with enhanced benefits for healthy lifestyle choices.',
    minLevel: 2
  }
];

export const getInsurancePlanById = (id: string): InsurancePlan | undefined => {
  return insurancePlans.find(plan => plan.id === id);
};

export const getInsurancePlansByLevel = (level: number): InsurancePlan[] => {
  return insurancePlans.filter(plan => plan.minLevel <= level);
};

export const getInsurancePlansByAgeGroup = (ageGroup: AgeGroup): InsurancePlan[] => {
  return insurancePlans.filter(plan => 
    plan.ageGroups.includes(ageGroup)
  );
};

export const getInsurancePlansByRisk = (riskCategory: RiskCategory): InsurancePlan[] => {
  return insurancePlans.filter(plan => 
    plan.riskCategories.includes(riskCategory)
  );
};