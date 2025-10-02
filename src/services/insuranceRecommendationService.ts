import { 
  InsurancePlan, 
  UserHealthProfile, 
  PersonalizedInsuranceRecommendation,
  InsuranceQuote,
  AgeGroup,
  RiskCategory 
} from '../types/insurance';
import { insurancePlans } from '../data/insurancePlans';

// Calculate BMI category
export const calculateBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
};

// Calculate age group
export const calculateAgeGroup = (age: number): AgeGroup => {
  if (age <= 25) return '18-25';
  if (age <= 35) return '26-35';
  if (age <= 45) return '36-45';
  if (age <= 55) return '46-55';
  if (age <= 65) return '56-65';
  return '65+';
};

// Calculate risk category based on health profile
export const calculateRiskCategory = (profile: UserHealthProfile): RiskCategory => {
  let riskScore = 0;
  
  // Age factor
  if (profile.age > 50) riskScore += 2;
  else if (profile.age > 35) riskScore += 1;
  
  // BMI factor
  const bmiCategory = calculateBMICategory(profile.bmi);
  if (bmiCategory === 'obese') riskScore += 3;
  else if (bmiCategory === 'overweight') riskScore += 1;
  else if (bmiCategory === 'underweight') riskScore += 1;
  
  // Chronic conditions
  if (profile.chronicConditions && profile.chronicConditions.length > 0) {
    riskScore += profile.chronicConditions.length * 2;
  }
  
  // Smoking
  if (profile.smokingStatus === 'current') riskScore += 3;
  else if (profile.smokingStatus === 'former') riskScore += 1;
  
  // Exercise frequency (reduces risk)
  if (profile.exerciseFrequency === 'heavy') riskScore -= 2;
  else if (profile.exerciseFrequency === 'moderate') riskScore -= 1;
  else if (profile.exerciseFrequency === 'light') riskScore += 1;
  else if (profile.exerciseFrequency === 'none') riskScore += 2;
  
  // Family history
  if (profile.familyHistory && profile.familyHistory.length > 2) riskScore += 1;
  
  // Occupation factor
  if (profile.occupation === 'hazardous') riskScore += 2;
  else if (profile.occupation === 'physical') riskScore += 1;
  else if (profile.occupation === 'healthcare') riskScore += 1;
  
  // Determine risk category
  if (riskScore <= 1) return 'low';
  if (riskScore <= 4) return 'moderate';
  return 'high';
};

// Enhanced risk calculation based on multiple factors
export const calculateComprehensiveRisk = (
  age: number,
  height: number, // in cm
  weight: number, // in kg
  challengesCompleted: number,
  streakDays: number = 0,
  totalPoints: number = 0
): {
  riskScore: number;
  normalizedRisk: number;
  level: number;
  bmiDeviation: number;
  fitnessScore: number;
  ageRisk: number;
  percentileBetter: number;
} => {
  // 1. BMI Deviation Risk (Weight: 0.25)
  const optimalBMI = 22; // Optimal BMI
  const currentBMI = weight / Math.pow(height / 100, 2);
  const bmiDeviation = Math.abs(currentBMI - optimalBMI);
  
  // Normalize BMI deviation (0-10 scale, where 0 is optimal)
  const bmiRisk = Math.min(10, (bmiDeviation / 8) * 10); // Max deviation of 8 BMI points = 10 risk
  
  // 2. Fitness Activity Risk (Weight: 0.45)
  // Based on challenges completed and consistency
  const maxChallenges = 100; // Assumption for normalization
  const challengeScore = Math.min(10, (challengesCompleted / maxChallenges) * 10);
  
  // Streak bonus (regularity factor)
  const streakBonus = Math.min(3, streakDays / 10); // Up to 3 points bonus for 30+ day streak
  
  // Points factor
  const maxPoints = 1000; // Assumption for normalization
  const pointsScore = Math.min(5, (totalPoints / maxPoints) * 5);
  
  // Combined fitness score (lower is better for risk)
  const fitnessScore = Math.max(0, 10 - challengeScore - streakBonus - pointsScore);
  
  // 3. Age Risk (Weight: 0.3)
  // Higher age = higher risk
  let ageRisk = 0;
  if (age <= 25) ageRisk = 1;
  else if (age <= 35) ageRisk = 2;
  else if (age <= 45) ageRisk = 3;
  else if (age <= 55) ageRisk = 5;
  else if (age <= 65) ageRisk = 7;
  else ageRisk = 9;
  
  // Calculate weighted risk score
  const weightedRisk = (bmiRisk * 0.25) + (fitnessScore * 0.45) + (ageRisk * 0.3);
  
  // Normalize to 0-10 scale
  const normalizedRisk = Math.min(10, Math.max(0, weightedRisk));
  
  // Calculate level (1-7, inversely proportional to risk)
  const level = Math.max(1, Math.min(7, Math.ceil(7 - (normalizedRisk * 0.7))));
  
  // Calculate percentile (simulated - in real app would use actual user data)
  // Lower risk = better percentile
  const percentileBetter = Math.max(0, Math.min(99, Math.round((10 - normalizedRisk) * 10)));
  
  return {
    riskScore: weightedRisk,
    normalizedRisk,
    level,
    bmiDeviation,
    fitnessScore,
    ageRisk,
    percentileBetter
  };
};

// Calculate level-based discount (now 7 levels)
export const calculateLevelDiscount = (level: number): number => {
  // 7 levels with 5% to 25% discount range
  const discountMap: Record<number, number> = {
    1: 0.05, // 5% discount (highest risk)
    2: 0.08, // 8% discount
    3: 0.12, // 12% discount
    4: 0.16, // 16% discount
    5: 0.20, // 20% discount
    6: 0.22, // 22% discount
    7: 0.25  // 25% discount (lowest risk)
  };
  
  return discountMap[level] || 0.05;
};

// Generate insurance recommendations with enhanced risk assessment
export const generateInsuranceRecommendations = (
  userLevel: number,
  userPoints: number
): {
  recommendations: PersonalizedInsuranceRecommendation[];
  riskAssessment: ReturnType<typeof calculateComprehensiveRisk>;
  profile: UserHealthProfile;
} => {
  const { profile, riskAssessment } = createHealthProfileFromFitnessData();
  const ageGroup = calculateAgeGroup(profile.age);
  const riskCategory = calculateRiskCategory(profile);
  const levelDiscount = calculateLevelDiscount(riskAssessment.level);
  
  // Use the calculated level from risk assessment instead of points-based level
  const actualLevel = riskAssessment.level;
  
  // Filter plans based on user criteria
  let eligiblePlans = insurancePlans.filter(plan => {
    return plan.minLevel <= actualLevel &&
           plan.ageGroups.includes(ageGroup) &&
           plan.riskCategories.includes(riskCategory);
  });
  
  // If no plans match exactly, include plans for moderate risk
  if (eligiblePlans.length === 0 && riskCategory === 'high') {
    eligiblePlans = insurancePlans.filter(plan => {
      return plan.minLevel <= actualLevel &&
             plan.ageGroups.includes(ageGroup) &&
             (plan.riskCategories.includes('moderate') || plan.riskCategories.includes('high'));
    });
  }
  
  // Sort plans by relevance (popular first, then by coverage amount)
  eligiblePlans.sort((a, b) => {
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    return b.coverage.hospitalCare - a.coverage.hospitalCare;
  });
  
  // Generate recommendations with proper typing
  const recommendations: PersonalizedInsuranceRecommendation[] = eligiblePlans.map(plan => {
    let score = 50; // Base score
    const reasoning: string[] = [];
    const pros: string[] = [];
    const cons: string[] = [];
    
    // Age-based scoring
    if (plan.ageGroups.includes(ageGroup)) {
      score += 20;
      reasoning.push(`Designed for your age group (${ageGroup})`);
      pros.push('Age-appropriate coverage');
    }
    
    // Risk-based scoring
    if (plan.riskCategories.includes(riskCategory)) {
      score += 15;
      reasoning.push(`Suitable for your health risk profile`);
      pros.push('Matches your health risk category');
    }
    
    // Level-based scoring
    if (plan.minLevel === actualLevel) {
      score += 10;
      reasoning.push(`Perfect match for your fitness level`);
      pros.push('Optimized for your fitness level');
    }
    
    // Popular plan bonus
    if (plan.isPopular) {
      score += 5;
      reasoning.push('Popular choice among similar users');
      pros.push('Highly rated by other users');
    }
    
    // Health-specific benefits
    if (profile.chronicConditions && profile.chronicConditions.length > 0) {
      if (plan.features.some(feature => 
        feature.toLowerCase().includes('chronic') || 
        feature.toLowerCase().includes('disease') ||
        feature.toLowerCase().includes('specialist')
      )) {
        score += 15;
        reasoning.push('Includes specialized chronic condition support');
        pros.push('Comprehensive chronic care coverage');
      }
    }
    
    // Fitness-focused benefits
    if (profile.exerciseFrequency === 'heavy' || profile.exerciseFrequency === 'moderate') {
      if (plan.features.some(feature => 
        feature.toLowerCase().includes('fitness') || 
        feature.toLowerCase().includes('wellness') ||
        feature.toLowerCase().includes('sports')
      )) {
        score += 10;
        reasoning.push('Includes fitness and wellness benefits');
        pros.push('Wellness and fitness program coverage');
      }
    }
    
    // Calculate risk adjustment
    let riskMultiplier = 1.0;
    if (riskCategory === 'high') riskMultiplier = 1.2;
    else if (riskCategory === 'low') riskMultiplier = 0.9;
    
    // Calculate final price with risk adjustment and discount
    const basePremium = plan.basePrice * riskMultiplier;
    const discountedPrice = basePremium * (1 - levelDiscount);
    
    // Add potential cons
    if (plan.deductible > 1000) {
      cons.push(`High deductible: $${plan.deductible}`);
    }
    if (plan.minLevel > actualLevel) {
      cons.push('Requires higher fitness level');
    }
    if (riskCategory === 'high' && !plan.riskCategories.includes('high')) {
      cons.push('May have coverage limitations for high-risk individuals');
    }
    
    return {
      plan,
      recommendationScore: Math.min(100, score),
      monthlyPremium: Math.round(discountedPrice * 100) / 100,
      levelDiscount: levelDiscount * 100,
      riskAdjustment: riskMultiplier,
      reasoning,
      pros,
      cons,
      isRecommended: score >= 70
    };
  });
  
  // Sort by score and return top 5
  const sortedRecommendations = recommendations
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 5);
  
  return {
    recommendations: sortedRecommendations,
    riskAssessment,
    profile
  };
};

// Generate complete insurance quote
export const generateInsuranceQuote = (
  userLevel: number,
  userPoints: number
): InsuranceQuote => {
  const { recommendations, riskAssessment, profile } = generateInsuranceRecommendations(userLevel, userPoints);
  
  return {
    userId: 'current-user',
    userLevel: riskAssessment.level,
    userPoints,
    healthProfile: profile,
    recommendations,
    generatedAt: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
};

// Helper function to generate risk factors
export const generateRiskFactors = (profile: UserHealthProfile): string[] => {
  const factors: string[] = [];
  
  if (profile.age > 50) factors.push('Age over 50');
  if (calculateBMICategory(profile.bmi) === 'obese') factors.push('BMI indicates obesity');
  if (profile.smokingStatus === 'current') factors.push('Current smoker');
  if (profile.chronicConditions && profile.chronicConditions.length > 0) {
    factors.push(`Has ${profile.chronicConditions.length} chronic condition(s)`);
  }
  if (profile.exerciseFrequency === 'none' || profile.exerciseFrequency === 'light') {
    factors.push('Limited physical activity');
  }
  if (profile.familyHistory && profile.familyHistory.length > 2) {
    factors.push('Significant family medical history');
  }
  if (profile.occupation === 'hazardous') {
    factors.push('High-risk occupation');
  }
  
  return factors;
};

// Helper function to calculate numeric risk score
export const calculateRiskScore = (profile: UserHealthProfile): number => {
  let score = 0;
  
  // Age scoring (0-30 points)
  if (profile.age > 65) score += 30;
  else if (profile.age > 50) score += 20;
  else if (profile.age > 35) score += 10;
  
  // BMI scoring (0-25 points)
  const bmiCategory = calculateBMICategory(profile.bmi);
  if (bmiCategory === 'obese') score += 25;
  else if (bmiCategory === 'overweight') score += 15;
  else if (bmiCategory === 'underweight') score += 10;
  
  // Smoking (0-20 points)
  if (profile.smokingStatus === 'current') score += 20;
  else if (profile.smokingStatus === 'former') score += 5;
  
  // Chronic conditions (0-15 points)
  if (profile.chronicConditions) {
    score += Math.min(15, profile.chronicConditions.length * 5);
  }
  
  // Exercise (subtract points for good habits)
  if (profile.exerciseFrequency === 'heavy') score -= 10;
  else if (profile.exerciseFrequency === 'moderate') score -= 5;
  else if (profile.exerciseFrequency === 'light') score += 5;
  else if (profile.exerciseFrequency === 'none') score += 10;
  
  // Occupation risk
  if (profile.occupation === 'hazardous') score += 15;
  else if (profile.occupation === 'physical') score += 5;
  
  return Math.max(0, Math.min(100, score));
};

// Create user health profile from fitness data with comprehensive risk assessment
export const createHealthProfileFromFitnessData = (fitnessData?: Record<string, unknown>): {
  profile: UserHealthProfile;
  riskAssessment: ReturnType<typeof calculateComprehensiveRisk>;
} => {
  // This would integrate with the fitness service to get user data
  const storedGoals = localStorage.getItem('userFitnessGoals');
  const storedStats = localStorage.getItem('userFitnessStats');
  const goals = storedGoals ? JSON.parse(storedGoals) : null;
  const stats = storedStats ? JSON.parse(storedStats) : null;
  
  // Default values if no data available
  const defaultProfile: UserHealthProfile = {
    age: 30,
    bmi: 25,
    smokingStatus: 'never',
    exerciseFrequency: 'moderate',
    chronicConditions: [],
    familyHistory: [],
    occupation: 'other'
  };
  
  if (!goals && !stats) {
    const defaultRisk = calculateComprehensiveRisk(30, 170, 70, 0, 0, 0);
    return {
      profile: defaultProfile,
      riskAssessment: defaultRisk
    };
  }
  
  // Extract data from fitness platform
  const age = goals?.age || 30;
  const height = goals?.height || 170; // cm
  const weight = goals?.currentWeight || 70; // kg
  const challengesCompleted = stats?.completedChallenges || 0;
  const totalPoints = stats?.totalPoints || 0;
  const streakDays = stats?.currentStreak || 0;
  
  // Calculate BMI
  const bmi = weight / Math.pow(height / 100, 2);
  
  // Map fitness frequency to exercise frequency
  const exerciseMapping: Record<string, UserHealthProfile['exerciseFrequency']> = {
    'daily': 'heavy',
    '6 times per week': 'heavy',
    '5 times per week': 'heavy',
    '4 times per week': 'moderate',
    '3 times per week': 'moderate',
    '2 times per week': 'light',
    '1 time per week': 'light',
    'rarely': 'light',
    'never': 'none'
  };
  
  const profile: UserHealthProfile = {
    age,
    bmi: Math.round(bmi * 100) / 100,
    smokingStatus: 'never', // This would need to be collected separately
    exerciseFrequency: exerciseMapping[goals?.exerciseFrequency] || 'moderate',
    chronicConditions: [], // This would need to be collected separately
    familyHistory: [], // This would need to be collected separately
    occupation: 'other' // This would need to be collected separately
  };
  
  // Calculate comprehensive risk assessment
  const riskAssessment = calculateComprehensiveRisk(
    age,
    height,
    weight,
    challengesCompleted,
    streakDays,
    totalPoints
  );
  
  return {
    profile,
    riskAssessment
  };
};

// Get insurance service stats
export const getInsuranceServiceStats = () => {
  return {
    totalPlans: insurancePlans.length,
    basicPlans: insurancePlans.filter(p => p.category === 'basic').length,
    standardPlans: insurancePlans.filter(p => p.category === 'standard').length,
    premiumPlans: insurancePlans.filter(p => p.category === 'premium').length,
    comprehensivePlans: insurancePlans.filter(p => p.category === 'comprehensive').length,
    maxDiscount: 25,
    avgCoverage: Math.round(insurancePlans.reduce((sum, p) => sum + p.coverage.hospitalCare, 0) / insurancePlans.length)
  };
};