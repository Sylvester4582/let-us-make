// Fitness goals and preferences types
export interface UserFitnessGoal {
  id: string;
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  targetWeight?: number;
  currentWeight: number;
  currentBMI: number;
  targetBMI?: number;
  preferredExerciseTypes: ExerciseType[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  availableTime: number; // minutes per day
  daysPerWeek: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ExerciseType = 
  | 'cardio'
  | 'strength'
  | 'hiit'
  | 'yoga'
  | 'swimming'
  | 'running'
  | 'cycling'
  | 'sports_basketball'
  | 'sports_football'
  | 'sports_tennis'
  | 'sports_badminton'
  | 'aerobics'
  | 'pilates'
  | 'crossfit'
  | 'calisthenics';

// Challenge types
export interface FitnessChallenge {
  id: string;
  name: string;
  description: string;
  type: ExerciseType;
  category: 'reps' | 'time' | 'distance' | 'weight';
  difficulty: 'easy' | 'medium' | 'hard';
  defaultTarget: number;
  unit: string;
  caloriesBurnedPerUnit: number;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  tips: string[];
  safetyNotes: string[];
  isPersonalized: boolean;
  createdAt: Date;
}

// User challenge progress
export interface UserChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  target: number;
  completed: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'failed' | 'paused';
  heartRateData: HeartRateData[];
  userInput: number;
  verificationMethod: 'heart_rate' | 'user_input' | 'both';
  notes?: string;
  difficulty: number; // 1-10 scale
  personalizedFactor: number; // AI adjustment factor
}

// Heart rate monitoring
export interface HeartRateData {
  timestamp: Date;
  heartRate: number;
  isExercising: boolean;
  intensity: 'rest' | 'light' | 'moderate' | 'vigorous' | 'maximum';
  duration: number; // seconds
}

// AI model data
export interface UserFitnessProfile {
  userId: string;
  completedChallenges: number;
  averageCompletionRate: number;
  preferredDifficulty: number;
  strongExerciseTypes: ExerciseType[];
  weakExerciseTypes: ExerciseType[];
  progressTrend: 'improving' | 'stable' | 'declining';
  adaptationRate: number;
  consistencyScore: number;
  lastUpdated: Date;
  aiRecommendations: string[];
}

// OpenAI API types
export interface AIPersonalizationRequest {
  userProfile: UserFitnessProfile;
  userGoals: UserFitnessGoal;
  recentProgress: UserChallengeProgress[];
  availableChallenges: FitnessChallenge[];
}

export interface AIPersonalizationResponse {
  recommendedChallenges: PersonalizedChallenge[];
  difficultyAdjustments: { [challengeId: string]: number };
  motivationalMessage: string;
  weeklyPlan: WeeklyPlan;
  nutritionTips: string[];
}

export interface PersonalizedChallenge extends FitnessChallenge {
  personalizedTarget: number;
  personalizedDifficulty: number;
  aiReasoning: string;
  expectedCaloriesBurn: number;
  estimatedDuration: number;
}

export interface WeeklyPlan {
  monday: PersonalizedChallenge[];
  tuesday: PersonalizedChallenge[];
  wednesday: PersonalizedChallenge[];
  thursday: PersonalizedChallenge[];
  friday: PersonalizedChallenge[];
  saturday: PersonalizedChallenge[];
  sunday: PersonalizedChallenge[];
}

// Message types for OpenAI API
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChallengeResult {
  challengeId: string;
  status: 'completed' | 'failed' | 'in_progress';
  completionRate: number;
  heartRateData?: HeartRateData[];
}

export interface FitnessStatistics {
  totalChallengesCompleted: number;
  totalCaloriesBurned: number;
  averageCompletionRate: number;
  exerciseTypeBreakdown: { [type: string]: number };
  currentStreak: number;
  weeklyGoalProgress: WeeklyProgressStats;
}

export interface WeeklyProgressStats {
  completedWorkouts: number;
  targetWorkouts: number;
  progressPercentage: number;
}

export interface StoredUserProgress {
  id: string;
  userId: string;
  challengeId: string;
  target: number;
  completed: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  heartRateData: HeartRateData[];
  userInput: number;
  verificationMethod: 'heart_rate' | 'user_input' | 'both';
  notes?: string;
  difficulty: number;
  personalizedFactor: number;
}

export interface StoredHeartRateData {
  timestamp: string;
  heartRate: number;
  isExercising: boolean;
  intensity: 'rest' | 'light' | 'moderate' | 'vigorous' | 'maximum';
  duration: number;
}