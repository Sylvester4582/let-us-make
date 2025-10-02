import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Shield, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  Scale,
  Calendar
} from 'lucide-react';
import { calculateComprehensiveRisk } from '../services/insuranceRecommendationService';

interface RiskAssessmentCardProps {
  age: number;
  height: number; // cm
  weight: number; // kg
  challengesCompleted: number;
  streakDays: number;
  totalPoints: number;
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  age,
  height,
  weight,
  challengesCompleted,
  streakDays,
  totalPoints
}) => {
  const riskAssessment = calculateComprehensiveRisk(
    age,
    height,
    weight,
    challengesCompleted,
    streakDays,
    totalPoints
  );

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return 'text-green-600';
    if (risk <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeColor = (level: number) => {
    if (level >= 6) return 'bg-green-100 text-green-800';
    if (level >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskIcon = (risk: number) => {
    if (risk <= 3) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (risk <= 6) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getLevelDescription = (level: number) => {
    const descriptions = {
      7: 'Excellent - Lowest Risk',
      6: 'Very Good - Low Risk',
      5: 'Good - Below Average Risk',
      4: 'Fair - Average Risk',
      3: 'Moderate - Above Average Risk',
      2: 'High - Elevated Risk',
      1: 'Very High - Maximum Risk'
    };
    return descriptions[level as keyof typeof descriptions] || 'Unknown';
  };

  const getDiscountPercentage = (level: number) => {
    const discounts = { 7: 25, 6: 22, 5: 20, 4: 16, 3: 12, 2: 8, 1: 5 };
    return discounts[level as keyof typeof discounts] || 5;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Insurance Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Risk Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getRiskIcon(riskAssessment.normalizedRisk)}
            <div className="text-3xl font-bold">
              Level {riskAssessment.level}
            </div>
          </div>
          <Badge className={getRiskBadgeColor(riskAssessment.level)}>
            {getLevelDescription(riskAssessment.level)}
          </Badge>
          <div className="mt-2 text-sm text-gray-600">
            Risk Score: {riskAssessment.normalizedRisk.toFixed(1)}/10
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Risk Level</span>
            <span className={getRiskColor(riskAssessment.normalizedRisk)}>
              {riskAssessment.normalizedRisk.toFixed(1)}/10
            </span>
          </div>
          <Progress 
            value={(10 - riskAssessment.normalizedRisk) * 10} 
            className="h-3"
          />
          <div className="text-xs text-gray-500 text-center">
            Lower is better (10 = Highest Risk, 0 = Lowest Risk)
          </div>
        </div>

        {/* Percentile */}
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {riskAssessment.percentileBetter}%
          </div>
          <div className="text-sm text-blue-700">
            You have lower risk than {riskAssessment.percentileBetter}% of users
          </div>
        </div>

        {/* Discount Information */}
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-800">
              Current Discount: {getDiscountPercentage(riskAssessment.level)}%
            </span>
          </div>
          <div className="text-sm text-green-700">
            Your low risk profile qualifies you for significant insurance savings!
          </div>
        </div>

        {/* Risk Factors Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">Risk Factors Breakdown</h4>
          
          {/* BMI Factor */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-gray-600" />
              <span className="text-sm">BMI Deviation</span>
            </div>
            <div className="text-sm font-medium">
              {riskAssessment.bmiDeviation.toFixed(1)} points (25% weight)
            </div>
          </div>

          {/* Fitness Factor */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Fitness Activity</span>
            </div>
            <div className="text-sm font-medium">
              {riskAssessment.fitnessScore.toFixed(1)} points (45% weight)
            </div>
          </div>

          {/* Age Factor */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Age Factor</span>
            </div>
            <div className="text-sm font-medium">
              {riskAssessment.ageRisk.toFixed(1)} points (30% weight)
            </div>
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-1">
            <Target className="h-4 w-4" />
            Ways to Improve Your Level
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {riskAssessment.level < 7 && (
              <>
                <li>• Complete more daily challenges (45% impact)</li>
                <li>• Maintain consistent workout streaks</li>
                {riskAssessment.bmiDeviation > 2 && (
                  <li>• Work towards optimal BMI range (20-24)</li>
                )}
                <li>• Accumulate more fitness points through activities</li>
              </>
            )}
            {riskAssessment.level >= 6 && (
              <li>• Excellent work! Maintain your current fitness routine.</li>
            )}
          </ul>
        </div>

        {/* Long-term Insurance Advice */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            💡 Pro Tip: Lock in Lower Rates
          </h4>
          <p className="text-sm text-amber-700">
            <strong>Consider long-term insurance plans now!</strong> Insurance premiums typically increase with age. 
            By securing coverage at your current age and fitness level, you can lock in lower rates for years to come. 
            This strategy can save thousands in the long run compared to waiting until you're older when premiums are naturally higher.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};