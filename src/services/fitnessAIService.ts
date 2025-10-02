import { 
  AIPersonalizationRequest, 
  AIPersonalizationResponse, 
  UserFitnessProfile, 
  UserFitnessGoal,
  PersonalizedChallenge,
  WeeklyPlan,
  OpenAIMessage,
  ChallengeResult,
  HeartRateData
} from '../types/fitness';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class FitnessAIService {
  private static async makeOpenAIRequest(messages: OpenAIMessage[]): Promise<string> {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }
    
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  static async generatePersonalizedWorkoutPlan(request: AIPersonalizationRequest): Promise<AIPersonalizationResponse> {
    const systemPrompt = `You are an expert AI fitness coach with deep knowledge of exercise science, biomechanics, and personalized training. Your goal is to create highly personalized workout plans based on user data, goals, and performance history.

Key principles to follow:
1. Safety first - never recommend exercises that could be dangerous for the user's fitness level
2. Progressive overload - gradually increase difficulty based on user's adaptation rate
3. Goal alignment - ensure all recommendations align with the user's primary fitness goal
4. Exercise variety - include different types of exercises to prevent boredom and plateaus
5. Recovery consideration - balance challenge with adequate recovery time
6. Realistic expectations - set achievable targets that build confidence

Consider the user's:
- Current fitness level and adaptation rate
- Preferred exercise types and equipment availability
- Goal-specific requirements (weight loss, muscle gain, endurance, etc.)
- Time constraints and frequency preferences
- Past performance and completion rates
- Areas of strength and weakness

Provide specific, actionable recommendations with clear reasoning.`;

    const userPrompt = `
Please analyze the following user data and create a personalized fitness plan:

USER PROFILE:
- Completed Challenges: ${request.userProfile.completedChallenges}
- Average Completion Rate: ${request.userProfile.averageCompletionRate}%
- Preferred Difficulty: ${request.userProfile.preferredDifficulty}/10
- Strong Exercise Types: ${request.userProfile.strongExerciseTypes.join(', ')}
- Weak Exercise Types: ${request.userProfile.weakExerciseTypes.join(', ')}
- Progress Trend: ${request.userProfile.progressTrend}
- Consistency Score: ${request.userProfile.consistencyScore}%

USER GOALS:
- Primary Goal: ${request.userGoals.type}
- Current Weight: ${request.userGoals.currentWeight}kg
- Current BMI: ${request.userGoals.currentBMI}
- Target Weight: ${request.userGoals.targetWeight || 'Not specified'}kg
- Target BMI: ${request.userGoals.targetBMI || 'Not specified'}
- Fitness Level: ${request.userGoals.fitnessLevel}
- Preferred Exercise Types: ${request.userGoals.preferredExerciseTypes.join(', ')}
- Available Time: ${request.userGoals.availableTime} minutes/day
- Days Per Week: ${request.userGoals.daysPerWeek}

RECENT PERFORMANCE:
${request.recentProgress.map(progress => 
  `- ${progress.challengeId}: ${progress.completed}/${progress.target} (${Math.round(progress.completed/progress.target*100)}%) - Status: ${progress.status}`
).join('\n')}

AVAILABLE CHALLENGES:
${request.availableChallenges.slice(0, 20).map(challenge => 
  `- ${challenge.name} (${challenge.type}, ${challenge.difficulty}): ${challenge.defaultTarget} ${challenge.unit}`
).join('\n')}

Please provide your response in the following JSON format:
{
  "recommendedChallenges": [
    {
      "challengeId": "challenge-id",
      "personalizedTarget": number,
      "personalizedDifficulty": number (1-10),
      "aiReasoning": "explanation for this recommendation",
      "expectedCaloriesBurn": number,
      "estimatedDuration": number (minutes)
    }
  ],
  "difficultyAdjustments": {
    "challenge-id": adjustment_factor (-2 to +2)
  },
  "motivationalMessage": "personalized motivation message",
  "weeklyPlan": {
    "monday": ["challenge-id-1", "challenge-id-2"],
    "tuesday": ["challenge-id-3"],
    "wednesday": ["challenge-id-4", "challenge-id-5"],
    "thursday": ["challenge-id-6"],
    "friday": ["challenge-id-7", "challenge-id-8"],
    "saturday": ["challenge-id-9"],
    "sunday": ["rest-or-light-activity"]
  },
  "nutritionTips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ]
}

Focus on creating a balanced plan that challenges the user while being achievable. Consider their weak areas for improvement and leverage their strengths. Adjust difficulty based on their completion rates and progress trend.`;

    try {
      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await this.makeOpenAIRequest(messages);
      
      // Parse the JSON response
      const aiResponse = JSON.parse(response);
      
      // Transform the response to match our interface
      const personalizedResponse: AIPersonalizationResponse = {
        recommendedChallenges: aiResponse.recommendedChallenges.map((rec: {
          challengeId: string;
          personalizedTarget: number;
          personalizedDifficulty: number;
          aiReasoning: string;
          expectedCaloriesBurn: number;
          estimatedDuration: number;
        }) => {
          const baseChal = request.availableChallenges.find(c => c.id === rec.challengeId);
          if (!baseChal) return null;
          
          return {
            ...baseChal,
            personalizedTarget: rec.personalizedTarget,
            personalizedDifficulty: rec.personalizedDifficulty,
            aiReasoning: rec.aiReasoning,
            expectedCaloriesBurn: rec.expectedCaloriesBurn,
            estimatedDuration: rec.estimatedDuration
          } as PersonalizedChallenge;
        }).filter(Boolean),
        difficultyAdjustments: aiResponse.difficultyAdjustments,
        motivationalMessage: aiResponse.motivationalMessage,
        weeklyPlan: aiResponse.weeklyPlan as WeeklyPlan,
        nutritionTips: aiResponse.nutritionTips
      };

      return personalizedResponse;
    } catch (error) {
      console.error('Error generating personalized workout plan:', error);
      
      // Fallback response if AI fails
      return this.generateFallbackPlan(request);
    }
  }

  private static generateFallbackPlan(request: AIPersonalizationRequest): AIPersonalizationResponse {
    // Simple rule-based fallback plan
    const userLevel = request.userGoals.fitnessLevel;
    const goalType = request.userGoals.type;
    
    let recommendedChallenges: PersonalizedChallenge[] = [];
    
    // Select challenges based on goal and fitness level
    const suitableChallenges = request.availableChallenges.filter(challenge => {
      if (userLevel === 'beginner' && challenge.difficulty === 'hard') return false;
      if (userLevel === 'advanced' && challenge.difficulty === 'easy') return false;
      
      // Goal-specific filtering
      if (goalType === 'weight_loss' && ['cardio', 'hiit'].includes(challenge.type)) return true;
      if (goalType === 'muscle_gain' && challenge.type === 'strength') return true;
      if (goalType === 'endurance' && ['cardio', 'running', 'cycling'].includes(challenge.type)) return true;
      
      return true;
    });

    // Select top 5 challenges
    recommendedChallenges = suitableChallenges.slice(0, 5).map(challenge => ({
      ...challenge,
      personalizedTarget: challenge.defaultTarget,
      personalizedDifficulty: userLevel === 'beginner' ? 3 : userLevel === 'intermediate' ? 5 : 7,
      aiReasoning: `Selected based on your ${goalType} goal and ${userLevel} fitness level`,
      expectedCaloriesBurn: challenge.defaultTarget * challenge.caloriesBurnedPerUnit,
      estimatedDuration: 30
    }));

    return {
      recommendedChallenges,
      difficultyAdjustments: {},
      motivationalMessage: `Great job on your fitness journey! Keep pushing towards your ${goalType} goal.`,
      weeklyPlan: {
        monday: recommendedChallenges.slice(0, 1),
        tuesday: recommendedChallenges.slice(1, 2),
        wednesday: [], // rest day
        thursday: recommendedChallenges.slice(2, 3),
        friday: recommendedChallenges.slice(3, 4),
        saturday: recommendedChallenges.slice(4, 5),
        sunday: [] // rest day
      },
      nutritionTips: [
        'Stay hydrated throughout the day',
        'Include protein in every meal',
        'Eat a balanced diet with fruits and vegetables'
      ]
    };
  }

  static async analyzeHeartRateData(heartRateData: HeartRateData[], exerciseType: string): Promise<{
    averageHeartRate: number;
    maxHeartRate: number;
    timeInZones: { [zone: string]: number };
    caloriesBurned: number;
    exerciseIntensity: string;
    isValidWorkout: boolean;
  }> {
    // Analyze heart rate data to determine if user actually exercised
    if (!heartRateData || heartRateData.length === 0) {
      return {
        averageHeartRate: 0,
        maxHeartRate: 0,
        timeInZones: {},
        caloriesBurned: 0,
        exerciseIntensity: 'none',
        isValidWorkout: false
      };
    }

    const heartRates = heartRateData.map(d => d.heartRate);
    const averageHeartRate = heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;
    const maxHeartRate = Math.max(...heartRates);
    
    // Calculate time in different heart rate zones
    const zones = {
      rest: heartRateData.filter(d => d.heartRate < 100).length,
      light: heartRateData.filter(d => d.heartRate >= 100 && d.heartRate < 130).length,
      moderate: heartRateData.filter(d => d.heartRate >= 130 && d.heartRate < 160).length,
      vigorous: heartRateData.filter(d => d.heartRate >= 160 && d.heartRate < 190).length,
      maximum: heartRateData.filter(d => d.heartRate >= 190).length
    };

    // Determine if it's a valid workout (elevated heart rate for sufficient time)
    const exerciseTime = zones.moderate + zones.vigorous + zones.maximum;
    const isValidWorkout = exerciseTime >= 5; // at least 5 minutes of elevated heart rate

    // Estimate calories burned based on heart rate and exercise type
    const baseCalorieRate = 5; // calories per minute at moderate intensity
    const intensityMultiplier = averageHeartRate > 140 ? 1.5 : averageHeartRate > 120 ? 1.2 : 1.0;
    const caloriesBurned = Math.round((exerciseTime * baseCalorieRate * intensityMultiplier));

    let exerciseIntensity = 'light';
    if (averageHeartRate > 160) exerciseIntensity = 'vigorous';
    else if (averageHeartRate > 130) exerciseIntensity = 'moderate';

    return {
      averageHeartRate: Math.round(averageHeartRate),
      maxHeartRate,
      timeInZones: zones,
      caloriesBurned,
      exerciseIntensity,
      isValidWorkout
    };
  }

  static async updateUserProfile(
    currentProfile: UserFitnessProfile,
    newChallengeResults: ChallengeResult[]
  ): Promise<UserFitnessProfile> {
    // Update user profile based on new challenge completion data
    const totalChallenges = currentProfile.completedChallenges + newChallengeResults.length;
    const completedCount = newChallengeResults.filter(result => result.status === 'completed').length;
    const newCompletionRate = completedCount / newChallengeResults.length * 100;
    
    // Weighted average of completion rates
    const updatedCompletionRate = (
      (currentProfile.averageCompletionRate * currentProfile.completedChallenges) +
      (newCompletionRate * newChallengeResults.length)
    ) / totalChallenges;

    // Analyze consistency (how often user exercises)
    const daysSinceLastUpdate = Math.ceil((Date.now() - currentProfile.lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    const expectedChallenges = daysSinceLastUpdate; // assuming 1 challenge per day
    const consistencyScore = Math.min(100, (newChallengeResults.length / expectedChallenges) * 100);

    // Determine progress trend
    let progressTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (newCompletionRate > currentProfile.averageCompletionRate + 10) {
      progressTrend = 'improving';
    } else if (newCompletionRate < currentProfile.averageCompletionRate - 10) {
      progressTrend = 'declining';
    }

    return {
      ...currentProfile,
      completedChallenges: totalChallenges,
      averageCompletionRate: updatedCompletionRate,
      progressTrend,
      consistencyScore: Math.round((currentProfile.consistencyScore + consistencyScore) / 2),
      lastUpdated: new Date()
    };
  }
}