import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserData } from '../contexts/UserContext';

// Initialize Gemini AI (you'll need to add your API key to environment variables)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ActivityLog {
  id: string;
  type: string;
  timestamp: Date;
  points: number;
  duration?: number;
}

export interface CurrentContext {
  streak: number;
  recentActivities?: string[];
  timeOfDay: string;
  recentProgress?: string;
}

export interface CurrentStats {
  level: number;
  streak: number;
  recentProgress?: string;
}

export interface UserProfile {
  motivationStyle: 'competitive' | 'collaborative' | 'achievement' | 'intrinsic';
  preferredChallengeType: 'fitness' | 'wellness' | 'social' | 'learning';
  activityPatterns: {
    mostActiveTime: string;
    preferredDuration: 'short' | 'medium' | 'long';
    consistencyLevel: 'low' | 'medium' | 'high';
  };
  personalityTraits: string[];
  goals: string[];
}

export interface PredictiveChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  points: number;
  personalizedReason: string;
  successProbability: number;
}

export interface PersonalizedRecommendation {
  type: 'activity' | 'challenge' | 'tip' | 'motivation';
  title: string;
  description: string;
  actionText: string;
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
}

class GeminiAIService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeUserProfile(userData: UserData): Promise<UserProfile> {
    try {
      const prompt = `
        Analyze the following user data and create a motivation profile:
        
        User Data:
        - Points: ${userData.points}
        - Level: ${userData.level} (${userData.levelTitle})
        - Streak: ${userData.streak} days
        - Activity History: [This would include real activity logs]
        
        Based on this data, determine:
        1. Motivation style (competitive, collaborative, achievement, intrinsic)
        2. Preferred challenge type (fitness, wellness, social, learning)
        3. Activity patterns (most active time, preferred duration, consistency)
        4. Personality traits
        5. Likely goals
        
        Return a JSON object with the analysis.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse AI response and return structured data
      try {
        return JSON.parse(text);
      } catch {
        // Fallback profile if parsing fails
        return this.getFallbackProfile(userData);
      }
    } catch (error) {
      console.error('Error analyzing user profile:', error);
      return this.getFallbackProfile(userData);
    }
  }

  async generatePredictiveChallenges(userProfile: UserProfile, activityHistory: ActivityLog[]): Promise<PredictiveChallenge[]> {
    try {
      const prompt = `
        Based on the user profile and activity history, generate 3-5 personalized challenges:
        
        User Profile:
        - Motivation Style: ${userProfile.motivationStyle}
        - Preferred Challenge Type: ${userProfile.preferredChallengeType}
        - Activity Patterns: ${JSON.stringify(userProfile.activityPatterns)}
        - Goals: ${userProfile.goals.join(', ')}
        
        Create challenges that:
        1. Match their motivation style
        2. Are achievable based on their patterns
        3. Progress their goals
        4. Have high success probability
        
        Return a JSON array of challenge objects.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return this.getFallbackChallenges(userProfile);
      }
    } catch (error) {
      console.error('Error generating challenges:', error);
      return this.getFallbackChallenges(userProfile);
    }
  }

  async getPersonalizedRecommendations(userProfile: UserProfile, currentContext: CurrentContext): Promise<PersonalizedRecommendation[]> {
    try {
      const prompt = `
        Generate personalized recommendations for a user with this profile:
        
        Profile: ${JSON.stringify(userProfile)}
        Current Context:
        - Time of day: ${new Date().toLocaleTimeString()}
        - Current streak: ${currentContext.streak}
        - Recent activities: ${currentContext.recentActivities || 'None'}
        
        Provide 3-4 actionable recommendations that:
        1. Match their motivation style
        2. Are relevant to current time/context
        3. Help maintain/improve their streak
        4. Align with their goals
        
        Return a JSON array of recommendation objects.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return this.getFallbackRecommendations(userProfile);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getFallbackRecommendations(userProfile);
    }
  }

  async generateMotivationalMessage(userProfile: UserProfile, currentStats: CurrentStats): Promise<string> {
    try {
      const prompt = `
        Create a personalized motivational message for a user with:
        - Motivation Style: ${userProfile.motivationStyle}
        - Current Level: ${currentStats.level}
        - Streak: ${currentStats.streak} days
        - Recent Progress: ${currentStats.recentProgress || 'steady'}
        
        Make it encouraging, personal, and aligned with their motivation style.
        Keep it under 50 words.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating motivational message:', error);
      return this.getFallbackMotivation(userProfile);
    }
  }

  private getFallbackProfile(userData: UserData): UserProfile {
    // Determine motivation style based on current behavior
    let motivationStyle: UserProfile['motivationStyle'] = 'achievement';
    if (userData.streak > 10) motivationStyle = 'intrinsic';
    if (userData.level > 3) motivationStyle = 'competitive';

    return {
      motivationStyle,
      preferredChallengeType: 'wellness',
      activityPatterns: {
        mostActiveTime: 'evening',
        preferredDuration: 'medium',
        consistencyLevel: userData.streak > 7 ? 'high' : 'medium'
      },
      personalityTraits: ['goal-oriented', 'persistent'],
      goals: ['improve fitness', 'build healthy habits']
    };
  }

  private getFallbackChallenges(userProfile: UserProfile): PredictiveChallenge[] {
    return [
      {
        id: 'challenge-1',
        title: 'Weekly Wellness Warrior',
        description: 'Complete 5 wellness activities this week',
        type: 'wellness',
        difficulty: 'medium',
        duration: '7 days',
        points: 100,
        personalizedReason: 'Perfect for your consistent activity pattern',
        successProbability: 0.85
      },
      {
        id: 'challenge-2',
        title: 'Knowledge Boost',
        description: 'Read 3 health articles this week',
        type: 'learning',
        difficulty: 'easy',
        duration: '7 days',
        points: 60,
        personalizedReason: 'Matches your learning preference',
        successProbability: 0.92
      }
    ];
  }

  private getFallbackRecommendations(userProfile: UserProfile): PersonalizedRecommendation[] {
    return [
      {
        type: 'activity',
        title: 'Take a wellness break',
        description: 'Based on your activity pattern, now is a great time for a quick wellness activity',
        actionText: 'Start Activity',
        priority: 'high',
        reasoning: 'Matches your preferred activity time'
      }
    ];
  }

  private getFallbackMotivation(userProfile: UserProfile): string {
    const messages = {
      competitive: "You're climbing the leaderboard! Keep pushing to reach the top!",
      collaborative: "Your wellness journey inspires others. Keep making a difference!",
      achievement: "Another milestone awaits! You're so close to your next achievement!",
      intrinsic: "You're building amazing habits that will benefit you for life. Keep going!"
    };
    return messages[userProfile.motivationStyle];
  }
}

export const aiService = new GeminiAIService();