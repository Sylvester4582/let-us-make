import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  UserFitnessGoal, 
  UserChallengeProgress, 
  FitnessChallenge,
  PersonalizedChallenge,
  AIPersonalizationResponse,
  HeartRateData,
  FitnessStatistics
} from '../types/fitness';
import { FitnessService } from '../services/fitnessService';
import { FitnessGoalSetup } from './FitnessGoalSetup';
import { useUser } from '../hooks/useUser';
import { 
  Target,
  Activity,
  Heart,
  Zap,
  Trophy,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  Play,
  CheckCircle,
  Flame
} from 'lucide-react';

export const AIFitnessDashboard: React.FC = () => {
  const { userData } = useUser();
  const [userGoal, setUserGoal] = useState<UserFitnessGoal | null>(null);
  const [activeProgress, setActiveProgress] = useState<UserChallengeProgress[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIPersonalizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<PersonalizedChallenge | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [showGoalSetup, setShowGoalSetup] = useState(false);
  const [statistics, setStatistics] = useState<FitnessStatistics | null>(null);
  const [activeTab, setActiveTab] = useState('recommendations');

  const loadUserData = useCallback(async () => {
    const goal = FitnessService.getUserGoals(userData.username);
    setUserGoal(goal);
    
    if (goal) {
      const progress = FitnessService.getActiveProgress(userData.username);
      setActiveProgress(progress);
      
      const stats = FitnessService.getStatistics(userData.username);
      setStatistics(stats);
      
      // Load AI recommendations
      try {
        setIsLoading(true);
        const recommendations = await FitnessService.getPersonalizedRecommendations(userData.username);
        setAiRecommendations(recommendations);
      } catch (error) {
        console.error('Failed to load AI recommendations:', error);
        // Set a basic fallback if the service fails completely
        setAiRecommendations({
          recommendedChallenges: [],
          difficultyAdjustments: {},
          motivationalMessage: 'Set up your goals to get personalized recommendations!',
          weeklyPlan: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          },
          nutritionTips: ['Stay hydrated throughout the day', 'Include protein in every meal']
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowGoalSetup(true);
    }
  }, [userData.username]); // Add dependency for useCallback

  useEffect(() => {
    loadUserData();
  }, [loadUserData]); // Use loadUserData as dependency

  const handleGoalSet = (goal: UserFitnessGoal) => {
    setUserGoal(goal);
    setShowGoalSetup(false);
    loadUserData();
  };

  const startChallenge = async (challenge: PersonalizedChallenge) => {
    try {
      const progress = await FitnessService.startChallenge(
        userData.username,
        challenge.id,
        challenge.personalizedTarget
      );
      setActiveProgress(prev => [...prev, progress]);
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Failed to start challenge:', error);
    }
  };

  const completeChallenge = async (progressId: string, completed: number) => {
    try {
      // Generate mock heart rate data for demonstration
      const mockHeartRateData = FitnessService.generateMockHeartRateData(
        30, // 30 minutes
        'cardio',
        'moderate'
      );

      const updatedProgress = await FitnessService.completeChallenge(
        progressId,
        completed,
        mockHeartRateData,
        parseFloat(userInput) || completed,
        userData.username
      );

      setActiveProgress(prev => 
        prev.map(p => p.id === progressId ? updatedProgress : p)
      );
      setUserInput('');
      
      // Reload statistics and recommendations
      loadUserData();
    } catch (error) {
      console.error('Failed to complete challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (showGoalSetup || !userGoal) {
    return (
      <div className="container mx-auto p-4">
        <FitnessGoalSetup onGoalSet={handleGoalSet} existingGoal={userGoal} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Fitness Coach</h1>
          <p className="text-gray-600">Personalized workout recommendations powered by AI</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowGoalSetup(true)}
        >
          Update Goals
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{statistics.totalChallengesCompleted}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Calories Burned</p>
                  <p className="text-2xl font-bold">{statistics.totalCaloriesBurned}</p>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold">{statistics.currentStreak} days</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weekly Progress</p>
                  <p className="text-2xl font-bold">{statistics.weeklyGoalProgress.progressPercentage}%</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="browse">Browse Challenges</TabsTrigger>
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
        </TabsList>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Generating personalized recommendations...</p>
              </CardContent>
            </Card>
          ) : aiRecommendations && aiRecommendations.recommendedChallenges.length > 0 ? (
            <>
              {/* Motivational Message */}
              <Alert>
                <Heart className="w-4 h-4" />
                <AlertDescription>
                  {aiRecommendations.motivationalMessage}
                </AlertDescription>
              </Alert>

              {/* Recommended Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiRecommendations.recommendedChallenges.map((challenge) => (
                  <Card key={challenge.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <Badge 
                          className={`${getDifficultyColor(challenge.personalizedDifficulty)} border-0`}
                        >
                          Difficulty: {challenge.personalizedDifficulty}/10
                        </Badge>
                      </div>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Target:</span>
                        <span className="font-medium">
                          {challenge.personalizedTarget} {challenge.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Est. Duration:</span>
                        <span className="font-medium">{challenge.estimatedDuration} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Calories:</span>
                        <span className="font-medium">{challenge.expectedCaloriesBurn} cal</span>
                      </div>
                      
                      <div className="p-2 bg-blue-50 rounded text-xs">
                        <strong>AI Insight:</strong> {challenge.aiReasoning}
                      </div>

                      <Button 
                        onClick={() => startChallenge(challenge)}
                        className="w-full"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Challenge
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Nutrition Tips */}
              {aiRecommendations.nutritionTips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Nutrition Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiRecommendations.nutritionTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Getting Your Personalized Plan Ready!</h3>
                <p className="text-gray-600 mb-4">
                  Complete 3-5 challenges from the "Browse Challenges" tab to unlock AI-powered personalized recommendations.
                </p>
                <Button 
                  onClick={() => setActiveTab('browse')}
                  className="mx-auto"
                >
                  Browse Available Challenges
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Browse All Challenges Tab */}
        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Available Challenges</CardTitle>
              <CardDescription>
                Browse and start any challenge that interests you. Complete a few to unlock personalized AI recommendations!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FitnessService.getAllChallenges().slice(0, 15).map((challenge) => {
                  const personalizedChallenge: PersonalizedChallenge = {
                    ...challenge,
                    personalizedTarget: challenge.defaultTarget,
                    personalizedDifficulty: challenge.difficulty === 'easy' ? 3 : 
                                           challenge.difficulty === 'medium' ? 5 : 7,
                    aiReasoning: `Standard ${challenge.difficulty} level challenge`,
                    expectedCaloriesBurn: challenge.defaultTarget * challenge.caloriesBurnedPerUnit,
                    estimatedDuration: 30
                  };

                  return (
                    <Card key={challenge.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{challenge.name}</CardTitle>
                          <Badge 
                            className={`${getDifficultyColor(personalizedChallenge.personalizedDifficulty)} border-0`}
                          >
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <CardDescription>{challenge.description}</CardDescription>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {challenge.type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {challenge.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Target:</span>
                          <span className="font-medium">
                            {challenge.defaultTarget} {challenge.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Calories:</span>
                          <span className="font-medium">
                            {Math.round(challenge.defaultTarget * challenge.caloriesBurnedPerUnit)} cal
                          </span>
                        </div>
                        
                        {challenge.equipment.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <strong>Equipment:</strong> {challenge.equipment.join(', ')}
                          </div>
                        )}

                        <Button 
                          onClick={() => startChallenge(personalizedChallenge)}
                          className="w-full"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Challenge
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Complete 3-5 challenges to unlock AI-powered personalized recommendations 
                  tailored specifically to your goals, fitness level, and progress!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Challenges Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProgress.map((progress) => {
                const challenge = FitnessService.getAllChallenges().find(c => c.id === progress.challengeId);
                const progressPercentage = (progress.completed / progress.target) * 100;
                
                return (
                  <Card key={progress.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{challenge?.name}</span>
                        <Badge variant="outline">{progress.status}</Badge>
                      </CardTitle>
                      <CardDescription>{challenge?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{progress.completed}/{progress.target} {challenge?.unit}</span>
                        </div>
                        <Progress 
                          value={progressPercentage} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(progressPercentage)}% complete
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Enter completion amount"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => completeChallenge(progress.id, parseFloat(userInput) || 0)}
                          disabled={!userInput}
                          size="sm"
                        >
                          Complete
                        </Button>
                      </div>

                      {progress.verificationMethod === 'both' && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          <Heart className="w-3 h-3 inline mr-1" />
                          Heart rate monitoring enabled for verification
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active challenges. Start one from the AI recommendations!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Goals & Progress Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Primary Goal</Label>
                  <p className="capitalize">{userGoal.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="font-medium">Fitness Level</Label>
                  <p className="capitalize">{userGoal.fitnessLevel}</p>
                </div>
                <div>
                  <Label className="font-medium">Current Weight</Label>
                  <p>{userGoal.currentWeight} kg</p>
                </div>
                {userGoal.targetWeight && (
                  <div>
                    <Label className="font-medium">Target Weight</Label>
                    <p>{userGoal.targetWeight} kg</p>
                  </div>
                )}
                <div>
                  <Label className="font-medium">Current BMI</Label>
                  <p>{userGoal.currentBMI.toFixed(1)}</p>
                </div>
                <div>
                  <Label className="font-medium">Workout Schedule</Label>
                  <p>{userGoal.daysPerWeek} days/week, {userGoal.availableTime} min/session</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Preferred Exercise Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userGoal.preferredExerciseTypes.map(type => (
                    <Badge key={type} variant="secondary">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Exercise Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(statistics.exerciseTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="outline">{count as number} completed</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};