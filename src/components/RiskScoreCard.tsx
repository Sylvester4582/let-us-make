import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { TrendingUp, TrendingDown, Activity, Heart, Scale, Calendar } from 'lucide-react';
import { RiskCalculationService, RiskCalculationResult } from '../services/riskCalculationService';
import { useUser } from '../hooks/useUser';

interface RiskScoreCardProps {
  className?: string;
  showDetails?: boolean;
  basePremium?: number;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ 
  className = "", 
  showDetails = true,
  basePremium = 100 
}) => {
  const { userData } = useUser();
  
  // Calculate risk using the standardized formula
  const riskResult = React.useMemo(() => {
    const profile = userData.healthProfile;
    if (!profile.age || !profile.height || !profile.weight) {
      return null;
    }

    return RiskCalculationService.calculateRiskFromProfile(profile, basePremium);
  }, [userData.healthProfile, basePremium]);

  if (!riskResult) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Complete your health profile (age, height, weight) to see your personalized risk assessment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const riskDisplay = RiskCalculationService.formatRiskDisplay(riskResult);
  const recommendations = RiskCalculationService.getRiskImprovementRecommendations(riskResult);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Level Display */}
        <div className="flex items-center justify-between">
          <div>
            <Badge className={riskDisplay.color}>
              {riskDisplay.title}
            </Badge>
            <p className="text-sm text-gray-600 mt-1">
              {riskDisplay.subtitle}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">
              {riskDisplay.percentage}
            </div>
            <p className="text-xs text-gray-500">Premium increase</p>
          </div>
        </div>

        {/* Risk Score Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Risk Score</span>
            <span>{Math.round(riskResult.adjR * 100)}/100</span>
          </div>
          <Progress value={riskResult.adjR * 100} className="h-2" />
        </div>

        {showDetails && (
          <>
            {/* Detailed Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">BMI Factor</span>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  {(riskResult.b * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-blue-700">
                  BMI: {riskResult.BMI.toFixed(1)}
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Exercise Factor</span>
                </div>
                <p className="text-lg font-bold text-green-900">
                  {(riskResult.e * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-green-700">
                  {(riskResult.e * 7).toFixed(1)} days/week
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Age Factor</span>
                </div>
                <p className="text-lg font-bold text-purple-900">
                  {riskResult.age_factor.toFixed(2)}x
                </p>
                <p className="text-xs text-purple-700">
                  Age: {riskResult.age} years
                </p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Base Risk</span>
                </div>
                <p className="text-lg font-bold text-orange-900">
                  {(riskResult.R * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-orange-700">
                  Before age adjustment
                </p>
              </div>
            </div>

            {/* Premium Calculation */}
            {riskResult.final_premium && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Premium Calculation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base Premium:</span>
                    <span>${basePremium}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Adjustment ({riskDisplay.percentage}):</span>
                    <span>+${(riskResult.final_premium - basePremium).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Final Premium:</span>
                    <span>${riskResult.final_premium.toFixed(2)}/month</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="pt-2 border-t">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  Improvement Recommendations
                </h4>
                <ul className="space-y-1">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-1">
                      <span className="text-green-600 font-bold">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};