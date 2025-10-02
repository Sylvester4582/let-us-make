import { 
  UserFitnessGoal, 
  UserChallengeProgress, 
  UserFitnessProfile,
  FitnessChallenge,
  HeartRateData,
  ExerciseType,
  StoredUserProgress,
  StoredHeartRateData,
  FitnessStatistics,
  WeeklyProgressStats,
  AIPersonalizationResponse,
  PersonalizedChallenge,
  WeeklyPlan
} from '../types/fitness';
import { standardFitnessChallenges } from '../data/fitnessChalllenges';
import { FitnessAIService } from './fitnessAIService';

export class FitnessService {
  private static readonly STORAGE_KEY_PREFIXES = {
    USER_GOALS: 'fitness_user_goals',
    USER_PROGRESS: 'fitness_user_progress',
    USER_PROFILE: 'fitness_user_profile',
    HEART_RATE_DATA: 'fitness_heart_rate_data'
  };

  // Generate user-specific storage keys
  private static getUserStorageKey(keyType: keyof typeof this.STORAGE_KEY_PREFIXES, userId: string): string {
    return `${this.STORAGE_KEY_PREFIXES[keyType]}_${userId}`;
  }

  // Get current user ID (this should be integrated with your auth system)
  private static getCurrentUserId(): string {
    // Try to get from auth context first
    try {
      const authData = localStorage.getItem('authToken');
      if (authData) {
        // If you have user data stored with auth token, extract user ID
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          return user.id || user.username || 'default_user';
        }
      }
    } catch (error) {
      console.warn('Could not get user ID from auth:', error);
    }
    
    // Fallback to user data from UserContext
    try {
      const userData = localStorage.getItem('youmatter_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.username || 'default_user';
      }
    } catch (error) {
      console.warn('Could not get user ID from user data:', error);
    }
    
    // Final fallback
    return 'default_user';
  }

  // User Goals Management
  static saveUserGoals(goals: UserFitnessGoal, userId?: string): void {
    const currentUserId = userId || this.getCurrentUserId();
    const storageKey = this.getUserStorageKey('USER_GOALS', currentUserId);
    
    localStorage.setItem(storageKey, JSON.stringify({
      ...goals,
      createdAt: goals.createdAt.toISOString(),
      updatedAt: goals.updatedAt.toISOString()
    }));
  }

  static getUserGoals(userId?: string): UserFitnessGoal | null {
    const currentUserId = userId || this.getCurrentUserId();
    const storageKey = this.getUserStorageKey('USER_GOALS', currentUserId);
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt)
    };
  }

  static calculateBMI(weight: number, height: number): number {
    // height in meters, weight in kg
    return weight / (height * height);
  }

  static getTargetBMI(currentBMI: number, goalType: string): number {
    // Healthy BMI range is 18.5-24.9
    if (goalType === 'weight_loss' && currentBMI > 25) {
      return Math.max(22, currentBMI - 3); // Target 3 BMI points lower, but not below 22
    } else if (goalType === 'muscle_gain' && currentBMI < 22) {
      return Math.min(24, currentBMI + 2); // Target 2 BMI points higher, but not above 24
    }
    return currentBMI; // Maintain current BMI for other goals
  }

  // Challenge Progress Management
  static saveUserProgress(progress: UserChallengeProgress, userId?: string): void {
    const currentUserId = userId || this.getCurrentUserId();
    const storageKey = this.getUserStorageKey('USER_PROGRESS', currentUserId);
    const existingStored = localStorage.getItem(storageKey);
    const allStored: StoredUserProgress[] = existingStored ? JSON.parse(existingStored) : [];
    const filteredStored = allStored.filter(p => p.id !== progress.id);
    
    const storedProgress: StoredUserProgress = {
      ...progress,
      startDate: progress.startDate.toISOString(),
      endDate: progress.endDate?.toISOString()
    };
    
    filteredStored.push(storedProgress);
    localStorage.setItem(storageKey, JSON.stringify(filteredStored));
  }

  static getAllUserProgress(userId?: string): UserChallengeProgress[] {
    const currentUserId = userId || this.getCurrentUserId();
    const storageKey = this.getUserStorageKey('USER_PROGRESS', currentUserId);
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((p: StoredUserProgress) => ({
      ...p,
      startDate: new Date(p.startDate),
      endDate: p.endDate ? new Date(p.endDate) : undefined
    }));
  }

  static getProgressByChallenge(challengeId: string, userId?: string): UserChallengeProgress[] {
    return this.getAllUserProgress(userId).filter(p => p.challengeId === challengeId);
  }

  static getActiveProgress(userId?: string): UserChallengeProgress[] {
    return this.getAllUserProgress(userId).filter(p => p.status === 'active');
  }

  static getRecentProgress(days: number = 30, userId?: string): UserChallengeProgress[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.getAllUserProgress(userId).filter(p => p.startDate > cutoffDate);
  }

  // User Profile Management
  static saveUserProfile(profile: UserFitnessProfile, userId?: string): void {
    const currentUserId = userId || this.getCurrentUserId();
    const storageKey = this.getUserStorageKey('USER_PROFILE', currentUserId);
    
    localStorage.setItem(storageKey, JSON.stringify({
      ...profile,
      lastUpdated: profile.lastUpdated.toISOString()
    }));
  }

  static getUserProfile(userId?: string): UserFitnessProfile | null {
    const currentUserId = userId || this.getCurrentUserId();
    const storageKey = this.getUserStorageKey('USER_PROFILE', currentUserId);
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      lastUpdated: new Date(parsed.lastUpdated)
    };
  }

  static createInitialProfile(userId: string): UserFitnessProfile {
    return {
      userId,
      completedChallenges: 0,
      averageCompletionRate: 0,
      preferredDifficulty: 3,
      strongExerciseTypes: [],
      weakExerciseTypes: [],
      progressTrend: 'stable',
      adaptationRate: 1.0,
      consistencyScore: 0,
      lastUpdated: new Date(),
      aiRecommendations: []
    };
  }

  // Heart Rate Data Management
  static saveHeartRateData(data: HeartRateData[], userId?: string): void {
    const currentUserId = userId || this.getCurrentUserId();
    const storageKey = this.getUserStorageKey('HEART_RATE_DATA', currentUserId);
    const existing = this.getHeartRateData(userId);
    const combined = [...existing, ...data];
    
    // Keep only last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filtered = combined.filter(d => new Date(d.timestamp) > thirtyDaysAgo);
    
    localStorage.setItem(storageKey, JSON.stringify(
      filtered.map(d => ({
        ...d,
        timestamp: d.timestamp.toISOString()
      }))
    ));
  }

  static getHeartRateData(userId?: string): HeartRateData[] {
    const currentUserId = userId || this.getCurrentUserId();
    const storageKey = this.getUserStorageKey('HEART_RATE_DATA', currentUserId);
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((d: StoredHeartRateData) => ({
      ...d,
      timestamp: new Date(d.timestamp)
    }));
  }

  static getHeartRateDataForChallenge(challengeId: string, startTime: Date, endTime: Date, userId?: string): HeartRateData[] {
    const allData = this.getHeartRateData(userId);
    return allData.filter(d => 
      d.timestamp >= startTime && 
      d.timestamp <= endTime
    );
  }

  // Challenge Management
  static getAllChallenges(): FitnessChallenge[] {
    return standardFitnessChallenges;
  }

  static getChallengesByType(type: ExerciseType): FitnessChallenge[] {
    return standardFitnessChallenges.filter(c => c.type === type);
  }

  static getChallengesByGoal(goalType: string): FitnessChallenge[] {
    const goalMappings: { [key: string]: ExerciseType[] } = {
      weight_loss: ['cardio', 'hiit', 'running', 'cycling'],
      muscle_gain: ['strength'],
      endurance: ['cardio', 'running', 'cycling', 'swimming'],
      strength: ['strength'],
      general_fitness: ['cardio', 'strength', 'hiit', 'yoga']
    };

    const relevantTypes = goalMappings[goalType] || [];
    return standardFitnessChallenges.filter(c => relevantTypes.includes(c.type));
  }

  // Progress Tracking and Analysis
  static async startChallenge(
    userId: string, 
    challengeId: string, 
    personalizedTarget?: number
  ): Promise<UserChallengeProgress> {
    const challenge = standardFitnessChallenges.find(c => c.id === challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const progress: UserChallengeProgress = {
      id: `${userId}-${challengeId}-${Date.now()}`,
      userId,
      challengeId,
      target: personalizedTarget || challenge.defaultTarget,
      completed: 0,
      startDate: new Date(),
      status: 'active',
      heartRateData: [],
      userInput: 0,
      verificationMethod: 'user_input',
      difficulty: 5,
      personalizedFactor: 1.0
    };

    this.saveUserProgress(progress, userId);
    return progress;
  }

  static async completeChallenge(
    progressId: string,
    completed: number,
    heartRateData: HeartRateData[] = [],
    userInput: number = 0,
    userId?: string
  ): Promise<UserChallengeProgress> {
    const allProgress = this.getAllUserProgress(userId);
    const progress = allProgress.find(p => p.id === progressId);
    
    if (!progress) throw new Error('Progress not found');

    // Analyze heart rate data if provided
    let isValidWorkout = true;
    if (heartRateData.length > 0) {
      const analysis = await FitnessAIService.analyzeHeartRateData(heartRateData, '');
      isValidWorkout = analysis.isValidWorkout;
    }

    // Update progress
    const updatedProgress: UserChallengeProgress = {
      ...progress,
      completed: Math.max(completed, userInput),
      endDate: new Date(),
      status: completed >= progress.target ? 'completed' : 'failed',
      heartRateData,
      userInput,
      verificationMethod: heartRateData.length > 0 ? 'both' : 'user_input'
    };

    // If heart rate data suggests no real workout, mark as suspicious
    if (heartRateData.length > 0 && !isValidWorkout) {
      updatedProgress.notes = 'Heart rate data suggests minimal exercise activity';
    }

    this.saveUserProgress(updatedProgress, userId);

    // Update user profile with new data
    await this.updateUserProfileFromProgress(updatedProgress.userId);

    return updatedProgress;
  }

  static async updateUserProfileFromProgress(userId: string): Promise<void> {
    let profile = this.getUserProfile(userId);
    if (!profile) {
      profile = this.createInitialProfile(userId);
    }

    const recentProgress = this.getRecentProgress(15, userId); // Last 15 days
    
    if (recentProgress.length > 0) {
      const updatedProfile = await FitnessAIService.updateUserProfile(
        profile,
        recentProgress.map(p => ({
          challengeId: p.challengeId,
          status: p.status === 'active' ? 'in_progress' as const : 
                  p.status === 'paused' ? 'in_progress' as const : 
                  p.status as 'completed' | 'failed',
          completionRate: p.completed / p.target * 100,
          heartRateData: p.heartRateData
        }))
      );

      this.saveUserProfile(updatedProfile, userId);
    }
  }

  // AI-Powered Personalization
  static async getPersonalizedRecommendations(userId: string): Promise<AIPersonalizationResponse> {
    const userGoals = this.getUserGoals(userId);
    const userProfile = this.getUserProfile(userId);
    const recentProgress = this.getRecentProgress(30, userId);
    
    if (!userGoals) {
      throw new Error('User goals must be set before getting recommendations');
    }

    // Create or get user profile
    let profile = userProfile;
    if (!profile) {
      profile = this.createInitialProfile(userId);
      this.saveUserProfile(profile, userId);
    }

    const availableChallenges = this.getChallengesByGoal(userGoals.type);
    
    // Always provide fallback recommendations for new users or when AI fails
    const fallbackRecommendations = this.generateDefaultRecommendations(userGoals, availableChallenges);
    
    // If user has completed fewer than 3 challenges, use default recommendations
    if (profile.completedChallenges < 3) {
      return fallbackRecommendations;
    }

    const request = {
      userProfile: profile,
      userGoals,
      recentProgress,
      availableChallenges
    };

    try {
      return await FitnessAIService.generatePersonalizedWorkoutPlan(request);
    } catch (error) {
      console.error('Error getting AI recommendations, using fallback:', error);
      return fallbackRecommendations;
    }
  }

  private static generateDefaultRecommendations(userGoals: UserFitnessGoal, availableChallenges: FitnessChallenge[]): AIPersonalizationResponse {
    // Select beginner-friendly challenges based on user goals and fitness level
    let selectedChallenges: FitnessChallenge[] = [];
    
    // Goal-specific default challenges
    const goalBasedChallenges = {
      weight_loss: ['walking-steps', 'jumping-jacks', 'high-knees', 'butt-kicks', 'stretching-routine'],
      muscle_gain: ['pushups', 'squats', 'planks', 'lunges', 'wall-sit'],
      endurance: ['walking-steps', 'running-distance', 'cycling-time', 'elliptical-training', 'stretching-routine'],
      strength: ['pushups', 'squats', 'planks', 'sit-ups', 'wall-sit'],
      general_fitness: ['walking-steps', 'pushups', 'squats', 'planks', 'jumping-jacks']
    };

    const recommendedIds = goalBasedChallenges[userGoals.type] || goalBasedChallenges.general_fitness;
    
    // Get challenges by ID, fallback to first available if not found
    selectedChallenges = recommendedIds.map(id => {
      const challenge = standardFitnessChallenges.find(c => c.id === id);
      return challenge || availableChallenges[0];
    }).filter(Boolean);

    // Adjust difficulty based on fitness level
    const difficultyMultiplier = {
      beginner: 0.7,
      intermediate: 1.0,
      advanced: 1.3
    }[userGoals.fitnessLevel];

    const personalizedChallenges: PersonalizedChallenge[] = selectedChallenges.map(challenge => ({
      ...challenge,
      personalizedTarget: Math.round(challenge.defaultTarget * difficultyMultiplier),
      personalizedDifficulty: userGoals.fitnessLevel === 'beginner' ? 3 : 
                             userGoals.fitnessLevel === 'intermediate' ? 5 : 7,
      aiReasoning: `Great starter challenge for your ${userGoals.type.replace('_', ' ')} goal at ${userGoals.fitnessLevel} level`,
      expectedCaloriesBurn: Math.round(challenge.defaultTarget * challenge.caloriesBurnedPerUnit * difficultyMultiplier),
      estimatedDuration: Math.round(userGoals.availableTime * 0.8) // Use 80% of available time
    }));

    // Create a balanced weekly plan
    const weeklyPlan: WeeklyPlan = {
      monday: personalizedChallenges.slice(0, 2),
      tuesday: personalizedChallenges.slice(2, 3),
      wednesday: [], // Rest day
      thursday: personalizedChallenges.slice(1, 3),
      friday: personalizedChallenges.slice(0, 1),
      saturday: personalizedChallenges.slice(3, 5),
      sunday: [] // Rest day
    };

    return {
      recommendedChallenges: personalizedChallenges,
      difficultyAdjustments: {},
      motivationalMessage: `Welcome to your fitness journey! These ${userGoals.fitnessLevel}-friendly challenges are perfect for your ${userGoals.type.replace('_', ' ')} goal. Complete a few to unlock AI-powered personalized recommendations!`,
      weeklyPlan,
      nutritionTips: this.getGoalBasedNutritionTips(userGoals.type)
    };
  }

  private static getGoalBasedNutritionTips(goalType: string): string[] {
    const tips = {
      weight_loss: [
        'Create a caloric deficit by eating 300-500 calories below your maintenance level',
        'Focus on lean proteins like chicken, fish, and legumes to maintain muscle mass',
        'Include plenty of vegetables and fruits for fiber and nutrients',
        'Drink water before meals to help control portion sizes'
      ],
      muscle_gain: [
        'Eat in a slight caloric surplus (200-300 calories above maintenance)',
        'Consume 1.6-2.2g of protein per kg of body weight daily',
        'Include complex carbohydrates around workouts for energy',
        'Don\'t forget healthy fats for hormone production and recovery'
      ],
      endurance: [
        'Focus on complex carbohydrates for sustained energy',
        'Stay well hydrated before, during, and after workouts',
        'Include antioxidant-rich foods to support recovery',
        'Time your meals 2-3 hours before longer training sessions'
      ],
      strength: [
        'Prioritize protein intake within 2 hours post-workout',
        'Include creatine-rich foods like red meat and fish',
        'Eat adequate carbohydrates to fuel intense training',
        'Consider timing protein intake throughout the day'
      ],
      general_fitness: [
        'Follow a balanced diet with all macronutrients',
        'Stay hydrated throughout the day',
        'Include a variety of colorful fruits and vegetables',
        'Practice portion control and mindful eating'
      ]
    };

    return tips[goalType] || tips.general_fitness;
  }

  // Statistics and Analytics
  static getStatistics(userId: string): FitnessStatistics {
    const allProgress = this.getAllUserProgress().filter(p => p.userId === userId);
    const completedChallenges = allProgress.filter(p => p.status === 'completed');
    
    const totalCaloriesBurned = completedChallenges.reduce((total, progress) => {
      const challenge = standardFitnessChallenges.find(c => c.id === progress.challengeId);
      if (challenge) {
        return total + (progress.completed * challenge.caloriesBurnedPerUnit);
      }
      return total;
    }, 0);

    const exerciseTypeStats = completedChallenges.reduce((stats: { [type: string]: number }, progress) => {
      const challenge = standardFitnessChallenges.find(c => c.id === progress.challengeId);
      if (challenge) {
        stats[challenge.type] = (stats[challenge.type] || 0) + 1;
      }
      return stats;
    }, {});

    return {
      totalChallengesCompleted: completedChallenges.length,
      totalCaloriesBurned: Math.round(totalCaloriesBurned),
      averageCompletionRate: allProgress.length > 0 
        ? allProgress.reduce((sum, p) => sum + (p.completed / p.target * 100), 0) / allProgress.length 
        : 0,
      exerciseTypeBreakdown: exerciseTypeStats,
      currentStreak: this.getCurrentStreak(userId),
      weeklyGoalProgress: this.getWeeklyProgress(userId)
    };
  }

  private static getCurrentStreak(userId: string): number {
    const progress = this.getAllUserProgress(userId)
      .filter(p => p.status === 'completed')
      .sort((a, b) => b.endDate!.getTime() - a.endDate!.getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999); // End of today

    for (const p of progress) {
      if (!p.endDate) continue;
      
      const daysDiff = Math.floor((currentDate.getTime() - p.endDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) { // Today or yesterday
        streak++;
        currentDate = new Date(p.endDate);
        currentDate.setHours(0, 0, 0, 0); // Start of that day
      } else {
        break;
      }
    }

    return streak;
  }

  private static getWeeklyProgress(userId: string): WeeklyProgressStats {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekProgress = this.getAllUserProgress(userId)
      .filter(p => 
        p.startDate >= weekStart &&
        p.status === 'completed'
      );

    const userGoals = this.getUserGoals(userId);
    const targetWorkouts = userGoals?.daysPerWeek || 5;

    return {
      completedWorkouts: weekProgress.length,
      targetWorkouts,
      progressPercentage: Math.round((weekProgress.length / targetWorkouts) * 100)
    };
  }

  // Mock heart rate data for testing
  static generateMockHeartRateData(
    duration: number, // minutes
    exerciseType: ExerciseType,
    intensity: 'light' | 'moderate' | 'vigorous'
  ): HeartRateData[] {
    const data: HeartRateData[] = [];
    const startTime = new Date();
    
    const baseHeartRate = {
      light: 100,
      moderate: 140,
      vigorous: 170
    }[intensity];

    // Generate heart rate data every 30 seconds
    for (let i = 0; i < duration * 2; i++) {
      const timestamp = new Date(startTime.getTime() + i * 30 * 1000);
      const variation = Math.random() * 20 - 10; // ±10 bpm variation
      const heartRate = Math.max(60, Math.min(200, baseHeartRate + variation));
      
      data.push({
        timestamp,
        heartRate: Math.round(heartRate),
        isExercising: heartRate > 100,
        intensity: heartRate > 160 ? 'vigorous' : heartRate > 130 ? 'moderate' : 'light',
        duration: 30
      });
    }

    return data;
  }
}