/**
 * Insurance Risk Calculation Service
 * Implements the standardized risk formula for insurance premium calculation
 */

export interface RiskCalculationInputs {
  weight_kg: number;
  height_m: number;
  exercise_days: number; // 0-7 days per week
  age: number;
  base_premium?: number; // Optional, for premium calculation
}

export interface RiskCalculationResult {
  BMI: number;
  Delta_BMI: number;
  b: number; // BMI risk factor
  e: number; // Exercise factor
  R: number; // Base risk score
  age_factor: number;
  adjR: number; // Adjusted risk score
  risk_level: number; // 1-5
  premium_percentage: number; // 0.05-0.25
  final_premium?: number; // If base_premium provided
  risk_description: string;
  age: number; // Include age for recommendations
}

export class RiskCalculationService {
  // Default parameters
  private static readonly BMI_OPT = 22.5;
  private static readonly BMI_DEV_MAX = 10;
  private static readonly W_B = 0.6; // BMI weight
  private static readonly W_E = 0.4; // Exercise weight

  /**
   * Calculate comprehensive risk score using the standardized formula
   */
  static calculateRisk(inputs: RiskCalculationInputs): RiskCalculationResult {
    const { weight_kg, height_m, exercise_days, age, base_premium } = inputs;

    // Step 1: Calculate BMI
    const BMI = weight_kg / (height_m ** 2);

    // Step 2: Calculate BMI deviation factor
    const Delta_BMI = Math.abs(BMI - this.BMI_OPT);
    const b = Math.min(1.0, Delta_BMI / this.BMI_DEV_MAX);

    // Step 3: Calculate exercise factor
    const e = exercise_days / 7.0;

    // Step 4: Calculate base risk score
    const R = this.W_B * b + this.W_E * (1 - e);

    // Step 5: Calculate age factor
    const age_factor = age <= 35 
      ? 1.0 
      : 1.0 + 0.02 * Math.floor((age - 35) / 10);

    // Step 6: Calculate adjusted risk score
    const adjR = Math.min(1.0, R * age_factor);

    // Step 7: Determine risk level and premium percentage
    let risk_level: number;
    let premium_percentage: number;
    let risk_description: string;

    if (adjR <= 0.20) {
      risk_level = 1;
      premium_percentage = 0.05;
      risk_description = "Lowest risk - Excellent health profile";
    } else if (adjR <= 0.40) {
      risk_level = 2;
      premium_percentage = 0.10;
      risk_description = "Low risk - Good health profile";
    } else if (adjR <= 0.60) {
      risk_level = 3;
      premium_percentage = 0.15;
      risk_description = "Medium risk - Average health profile";
    } else if (adjR <= 0.80) {
      risk_level = 4;
      premium_percentage = 0.20;
      risk_description = "High risk - Health improvement recommended";
    } else {
      risk_level = 5;
      premium_percentage = 0.25;
      risk_description = "Highest risk - Significant health concerns";
    }

    // Step 8: Calculate final premium if base provided
    const final_premium = base_premium 
      ? base_premium * (1 + premium_percentage)
      : undefined;

    return {
      BMI,
      Delta_BMI,
      b,
      e,
      R,
      age_factor,
      adjR,
      risk_level,
      premium_percentage,
      final_premium,
      risk_description,
      age
    };
  }

  /**
   * Calculate risk from health profile data
   */
  static calculateRiskFromProfile(profile: {
    age?: number;
    height?: number; // cm
    weight?: number; // kg
    workoutDaysPerWeek?: number;
  }, base_premium?: number): RiskCalculationResult | null {
    if (!profile.age || !profile.height || !profile.weight) {
      return null;
    }

    const inputs: RiskCalculationInputs = {
      weight_kg: profile.weight,
      height_m: profile.height / 100, // Convert cm to meters
      exercise_days: profile.workoutDaysPerWeek || 0,
      age: profile.age,
      base_premium
    };

    return this.calculateRisk(inputs);
  }

  /**
   * Get risk improvement recommendations
   */
  static getRiskImprovementRecommendations(result: RiskCalculationResult): string[] {
    const recommendations: string[] = [];

    // BMI recommendations
    if (result.BMI < 18.5) {
      recommendations.push("Consider healthy weight gain strategies");
    } else if (result.BMI > 25) {
      recommendations.push("Consider healthy weight management");
    }

    // Exercise recommendations
    if (result.e < 0.5) { // Less than 3.5 days per week
      recommendations.push("Increase exercise frequency to 4-5 days per week");
    }

    // Age-specific recommendations
    if (result.age > 35) {
      recommendations.push("Consider age-appropriate fitness programs");
      recommendations.push("Regular health check-ups recommended");
    }

    // Risk level specific recommendations
    if (result.risk_level >= 4) {
      recommendations.push("Consult with healthcare professionals");
      recommendations.push("Consider comprehensive health assessment");
    }

    return recommendations;
  }

  /**
   * Format risk result for display
   */
  static formatRiskDisplay(result: RiskCalculationResult): {
    title: string;
    subtitle: string;
    color: string;
    percentage: string;
  } {
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-blue-100 text-blue-800", 
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800"
    };

    return {
      title: `Risk Level ${result.risk_level}`,
      subtitle: result.risk_description,
      color: colors[result.risk_level as keyof typeof colors],
      percentage: `+${(result.premium_percentage * 100).toFixed(0)}%`
    };
  }
}

export default RiskCalculationService;