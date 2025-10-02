import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Shield, 
  Heart, 
  Star, 
  TrendingUp, 
  Award, 
  DollarSign,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  generateInsuranceRecommendations,
  generateInsuranceQuote,
  calculateLevelDiscount,
  calculateRiskCategory,
  calculateAgeGroup,
  getInsuranceServiceStats,
  calculateComprehensiveRisk
} from '../services/insuranceRecommendationService';
import { insurancePlans } from '../data/insurancePlans';
import { 
  InsurancePlan, 
  PersonalizedInsuranceRecommendation,
  InsuranceQuote 
} from '../types/insurance';
import { RiskAssessmentCard } from './RiskAssessmentCard';

interface UserStats {
  level: number;
  points: number;
  completedChallenges: number;
  currentStreak: number;
  age: number;
  height: number;
  weight: number;
}

export const InsuranceDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({ 
    level: 1, 
    points: 0, 
    completedChallenges: 0, 
    currentStreak: 0,
    age: 30,
    height: 170,
    weight: 70
  });
  const [recommendations, setRecommendations] = useState<PersonalizedInsuranceRecommendation[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [quote, setQuote] = useState<InsuranceQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<ReturnType<typeof calculateComprehensiveRisk> | null>(null);

  const loadUserData = () => {
    // Load user statistics from fitness service
    const storedStats = localStorage.getItem('userFitnessStats');
    const storedGoals = localStorage.getItem('userFitnessGoals');
    
    let stats = { totalPoints: 0, completedChallenges: 0, currentStreak: 0 };
    let goals = { age: 30, height: 170, currentWeight: 70 };
    
    if (storedStats) {
      stats = JSON.parse(storedStats);
    }
    
    if (storedGoals) {
      goals = JSON.parse(storedGoals);
    }
    
    // Calculate comprehensive risk assessment
    const risk = calculateComprehensiveRisk(
      goals.age || 30,
      goals.height || 170,
      goals.currentWeight || 70,
      stats.completedChallenges || 0,
      stats.currentStreak || 0,
      stats.totalPoints || 0
    );
    
    setUserStats({
      level: risk.level,
      points: stats.totalPoints || 0,
      completedChallenges: stats.completedChallenges || 0,
      currentStreak: stats.currentStreak || 0,
      age: goals.age || 30,
      height: goals.height || 170,
      weight: goals.currentWeight || 70
    });
    
    setRiskAssessment(risk);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const generateRecommendations = async () => {
      setLoading(true);
      try {
        const result = generateInsuranceRecommendations(userStats.level, userStats.points);
        setRecommendations(result.recommendations);
        setRiskAssessment(result.riskAssessment);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userStats.level > 0) {
      generateRecommendations();
    }
  }, [userStats.level, userStats.points]);

  const handleGetQuote = (plan: InsurancePlan) => {
    setLoading(true);
    try {
      const generatedQuote = generateInsuranceQuote(userStats.level, userStats.points);
      setQuote(generatedQuote);
      setSelectedPlan(plan);
    } catch (error) {
      console.error('Error generating quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDiscountInfo = () => {
    const discount = calculateLevelDiscount(userStats.level);
    return {
      percentage: discount * 100,
      nextLevel: userStats.level < 7 ? userStats.level + 1 : null,
      nextDiscount: userStats.level < 7 ? calculateLevelDiscount(userStats.level + 1) * 100 : null,
      pointsNeeded: userStats.level < 7 ? Math.max(0, ((userStats.level) * 150) - userStats.points) : 0
    };
  };

  const discountInfo = getDiscountInfo();
  const stats = getInsuranceServiceStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Insurance Hub
          </h1>
          <p className="text-gray-600 mt-2">
            Personalized insurance recommendations based on your comprehensive health profile
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="h-4 w-4" />
            Level {userStats.level} • {userStats.points} Points
          </div>
          <div className="text-lg font-semibold text-green-600">
            {discountInfo.percentage}% Discount Available
          </div>
          {riskAssessment && (
            <div className="text-sm text-blue-600 mt-1">
              Risk Score: {riskAssessment.normalizedRisk.toFixed(1)}/10 • Top {riskAssessment.percentileBetter}%
            </div>
          )}
        </div>
      </div>

      {/* Risk Assessment Card */}
      {riskAssessment && (
        <RiskAssessmentCard
          age={userStats.age}
          height={userStats.height}
          weight={userStats.weight}
          challengesCompleted={userStats.completedChallenges}
          streakDays={userStats.currentStreak}
          totalPoints={userStats.points}
        />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Level</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.level}/7</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Discount</p>
                <p className="text-2xl font-bold text-green-600">{discountInfo.percentage}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Percentile</p>
                <p className="text-2xl font-bold text-purple-600">
                  {riskAssessment ? riskAssessment.percentileBetter : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Max Discount</p>
                <p className="text-2xl font-bold text-orange-600">25%</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {userStats.level < 7 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress to Next Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {userStats.level} ({discountInfo.percentage}% discount)</span>
                <span>Level {discountInfo.nextLevel} ({discountInfo.nextDiscount}% discount)</span>
              </div>
              <Progress 
                value={riskAssessment ? ((7 - riskAssessment.normalizedRisk) / 7) * 100 : 0} 
                className="h-3"
              />
              <p className="text-sm text-gray-600">
                Continue improving your fitness metrics to achieve Level {discountInfo.nextLevel} for {discountInfo.nextDiscount}% discount
              </p>
              <div className="text-xs text-gray-500 mt-2">
                <strong>Improvement factors:</strong> Complete more challenges (45% impact), maintain BMI 20-24 (25% impact), age factor (30% impact)
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="browse">Browse Plans</TabsTrigger>
          <TabsTrigger value="quote">Get Quote</TabsTrigger>
        </TabsList>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Personalized Recommendations
              </CardTitle>
              <p className="text-gray-600">
                Based on your fitness data, age, and health profile
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-600">Analyzing your profile...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={rec.plan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{rec.plan.name}</h3>
                            {index === 0 && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <Star className="h-3 w-3 mr-1" />
                                Best Match
                              </Badge>
                            )}
                            {rec.plan.isPopular && (
                              <Badge variant="secondary">Popular</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{rec.plan.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(rec.monthlyPremium)}/month
                            </span>
                            <span className="text-gray-500 line-through">
                              {formatCurrency(rec.plan.basePrice)}/month
                            </span>
                            <Badge variant="outline" className="text-green-600">
                              {rec.levelDiscount}% Off
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-2">
                            Match Score: {rec.recommendationScore}/100
                          </div>
                          <Button 
                            onClick={() => handleGetQuote(rec.plan)}
                            size="sm"
                          >
                            Get Quote
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            Why This Works For You
                          </h4>
                          <ul className="text-sm space-y-1">
                            {rec.pros.slice(0, 3).map((pro, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Info className="h-4 w-4" />
                            Key Coverage
                          </h4>
                          <ul className="text-sm space-y-1">
                            <li>Hospital: {formatCurrency(rec.plan.coverage.hospitalCare)}</li>
                            <li>Emergency: {formatCurrency(rec.plan.coverage.emergencyCare)}</li>
                            <li>Deductible: {formatCurrency(rec.plan.deductible)}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Complete your fitness profile to get personalized recommendations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse Plans Tab */}
        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>All Insurance Plans</CardTitle>
              <p className="text-gray-600">
                Browse all available plans by category
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insurancePlans
                  .filter(plan => plan.minLevel <= userStats.level)
                  .map((plan) => {
                    const discount = calculateLevelDiscount(userStats.level);
                    const discountedPrice = plan.basePrice * (1 - discount);
                    
                    return (
                      <div key={plan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          <Badge variant={
                            plan.category === 'basic' ? 'secondary' :
                            plan.category === 'standard' ? 'default' :
                            plan.category === 'premium' ? 'destructive' : 'outline'
                          }>
                            {plan.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Monthly Premium:</span>
                            <div className="text-right">
                              <span className="font-semibold text-green-600">
                                {formatCurrency(discountedPrice)}
                              </span>
                              {discount > 0 && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatCurrency(plan.basePrice)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Deductible:</span>
                            <span>{formatCurrency(plan.deductible)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Hospital Coverage:</span>
                            <span>{formatCurrency(plan.coverage.hospitalCare)}</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleGetQuote(plan)}
                          className="w-full"
                          size="sm"
                        >
                          Get Quote
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Tab */}
        <TabsContent value="quote">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Quote</CardTitle>
              <p className="text-gray-600">
                {selectedPlan ? `Quote for ${selectedPlan.name}` : 'Select a plan to get a detailed quote'}
              </p>
            </CardHeader>
            <CardContent>
              {quote && selectedPlan ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">{selectedPlan.name}</h3>
                    <p className="text-gray-600">{selectedPlan.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Pricing Details</h4>
                      <div className="space-y-2">
                        {quote.recommendations[0] && (
                          <>
                            <div className="flex justify-between">
                              <span>Base Premium:</span>
                              <span>{formatCurrency(selectedPlan.basePrice)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Level {userStats.level} Discount ({quote.recommendations[0].levelDiscount}%):</span>
                              <span>-{formatCurrency(selectedPlan.basePrice * (quote.recommendations[0].levelDiscount / 100))}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>Monthly Premium:</span>
                              <span>{formatCurrency(quote.recommendations[0].monthlyPremium)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Annual Savings:</span>
                              <span>{formatCurrency((selectedPlan.basePrice - quote.recommendations[0].monthlyPremium) * 12)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Coverage Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hospital Care:</span>
                          <span>{formatCurrency(selectedPlan.coverage.hospitalCare)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emergency Care:</span>
                          <span>{formatCurrency(selectedPlan.coverage.emergencyCare)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Outpatient Care:</span>
                          <span>{formatCurrency(selectedPlan.coverage.outpatientCare)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prescriptions:</span>
                          <span>{formatCurrency(selectedPlan.coverage.prescriptionDrugs)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mental Health:</span>
                          <span>{formatCurrency(selectedPlan.coverage.mentalHealth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deductible:</span>
                          <span>{formatCurrency(selectedPlan.deductible)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Out-of-pocket Max:</span>
                          <span>{formatCurrency(selectedPlan.outOfPocketMax)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Level {userStats.level} Benefits</span>
                    </div>
                    <p className="text-sm text-green-700">
                      You're saving {formatCurrency((selectedPlan.basePrice - (quote.recommendations[0]?.monthlyPremium || 0)) * 12)} annually with your current fitness level!
                    </p>
                    {userStats.level < 5 && (
                      <p className="text-sm text-green-700 mt-1">
                        Reach Level {userStats.level + 1} to save even more with {discountInfo.nextDiscount}% discount.
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <Button className="flex-1">
                      Enroll Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Compare Plans
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Select a plan from the recommendations or browse section to get a detailed quote
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};