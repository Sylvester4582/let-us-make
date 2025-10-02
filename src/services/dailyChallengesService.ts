export type ChallengeType = 
  | 'daily_login'
  | 'log_workout'
  | 'read_article'
  | 'view_policy'
  | 'complete_all_workouts'
  | 'invite_friend'
  | 'share_achievement';

import { RiskCalculationService } from './riskCalculationService';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  availableDate: string;
}

export interface DailyStats {
  todayPoints: number;
  weeklyPoints: number;
  totalPoints: number;
  currentStreak: number;
  completedChallenges: string[];
  lastUpdate: string;
}

export class DailyChallengesService {
  private static readonly STORAGE_KEY = 'daily_challenges';
  private static readonly STATS_KEY = 'daily_stats';
  private static readonly DAILY_LIMIT = 70;
  private static readonly WEEKLY_LIMIT = 3500;

  // Challenge definitions with points
  private challengeDefinitions: Record<ChallengeType, { title: string; points: number; description: string }> = {
    'daily_login': {
      title: 'Daily Login',
      points: 5,
      description: 'Log in to your account today'
    },
    'log_workout': {
      title: 'Log Workout',
      points: 10,
      description: 'Complete and log a workout session'
    },
    'read_article': {
      title: 'Read Article',
      points: 7,
      description: 'Read a health and wellness article'
    },
    'view_policy': {
      title: 'View Policy',
      points: 15,
      description: 'Review your insurance policy details'
    },
    'complete_all_workouts': {
      title: 'Complete All Workouts',
      points: 50,
      description: 'Complete all available workout sessions'
    },
    'invite_friend': {
      title: 'Invite Friend',
      points: 20,
      description: 'Invite a friend to join the platform'
    },
    'share_achievement': {
      title: 'Share Achievement',
      points: 5,
      description: 'Share your progress on social media'
    }
  };

  private getUserStorageKey(userId: string, key: string): string {
    return `${key}_${userId}`;
  }

  getAvailableChallenges(userId: string): DailyChallenge[] {
    const today = new Date().toDateString();
    const storageKey = this.getUserStorageKey(userId, DailyChallengesService.STORAGE_KEY);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const challenges: DailyChallenge[] = JSON.parse(stored);
      
      // Check if challenges are for today
      if (challenges.length > 0 && challenges[0].availableDate === today) {
        return challenges;
      }
    }
    
    // Create new challenges for today
    return this.createDailyChallenges(userId, today);
  }

  private createDailyChallenges(userId: string, date: string): DailyChallenge[] {
    const challenges: DailyChallenge[] = Object.entries(this.challengeDefinitions).map(([type, def]) => ({
      id: `${type}_${date}_${userId}`,
      type: type as ChallengeType,
      title: def.title,
      description: def.description,
      points: def.points,
      completed: false,
      availableDate: date
    }));

    // Save to localStorage
    const storageKey = this.getUserStorageKey(userId, DailyChallengesService.STORAGE_KEY);
    localStorage.setItem(storageKey, JSON.stringify(challenges));
    
    return challenges;
  }

  completeChallenge(userId: string, challengeId: string): void {
    const challenges = this.getAvailableChallenges(userId);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge || challenge.completed) {
      throw new Error('Challenge not found or already completed');
    }

    // Check daily and weekly limits
    const stats = this.getUserStats(userId);
    if (stats.todayPoints + challenge.points > DailyChallengesService.DAILY_LIMIT) {
      throw new Error('Daily points limit reached');
    }
    if (stats.weeklyPoints + challenge.points > DailyChallengesService.WEEKLY_LIMIT) {
      throw new Error('Weekly points limit reached');
    }

    // Mark challenge as completed
    challenge.completed = true;
    
    // Update localStorage
    const storageKey = this.getUserStorageKey(userId, DailyChallengesService.STORAGE_KEY);
    localStorage.setItem(storageKey, JSON.stringify(challenges));
    
    // Update user stats
    this.updateUserStats(userId, challenge.points);
    
    // Record event for analytics
    this.recordChallengeEvent(userId, challenge);
  }

  markChallengeCompleted(userId: string, challengeId: string): void {
    const challenges = this.getAvailableChallenges(userId);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge || challenge.completed) {
      throw new Error('Challenge not found or already completed');
    }

    // Mark challenge as completed
    challenge.completed = true;
    
    // Update localStorage
    const storageKey = this.getUserStorageKey(userId, DailyChallengesService.STORAGE_KEY);
    localStorage.setItem(storageKey, JSON.stringify(challenges));
    
    // Update local daily/weekly stats (but not total points - those come from backend)
    this.updateLocalDailyStats(userId, challenge.points);
    
    // Record event for analytics (without points since they're handled externally)
    this.recordChallengeEvent(userId, challenge);
  }

  private updateLocalDailyStats(userId: string, points: number): void {
    const stats = this.getUserStats(userId);
    const today = new Date().toDateString();
    
    stats.todayPoints += points;
    stats.weeklyPoints += points;
    // Don't update totalPoints - that comes from backend
    stats.lastUpdate = today;
    
    // Update streak logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastUpdate = new Date(stats.lastUpdate);
    
    if (lastUpdate.toDateString() === yesterday.toDateString()) {
      stats.currentStreak++;
    } else if (lastUpdate.toDateString() !== today) {
      stats.currentStreak = 1;
    }
    
    const statsKey = this.getUserStorageKey(userId, DailyChallengesService.STATS_KEY);
    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  getUserStats(userId: string): DailyStats {
    const statsKey = this.getUserStorageKey(userId, DailyChallengesService.STATS_KEY);
    const stored = localStorage.getItem(statsKey);
    
    if (stored) {
      const stats: DailyStats = JSON.parse(stored);
      const today = new Date().toDateString();
      const lastUpdate = new Date(stats.lastUpdate);
      const todayDate = new Date(today);
      
      // Reset daily stats if it's a new day
      if (lastUpdate.toDateString() !== today) {
        stats.todayPoints = 0;
        stats.lastUpdate = today;
        
        // Reset weekly stats if it's a new week
        const daysDiff = Math.floor((todayDate.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 7) {
          stats.weeklyPoints = 0;
        }
        
        localStorage.setItem(statsKey, JSON.stringify(stats));
      }
      
      return stats;
    }
    
    // Create default stats
    const defaultStats: DailyStats = {
      todayPoints: 0,
      weeklyPoints: 0,
      totalPoints: 0,
      currentStreak: 0,
      completedChallenges: [],
      lastUpdate: new Date().toDateString()
    };
    
    localStorage.setItem(statsKey, JSON.stringify(defaultStats));
    return defaultStats;
  }

  private updateUserStats(userId: string, points: number): void {
    const stats = this.getUserStats(userId);
    const today = new Date().toDateString();
    
    stats.todayPoints += points;
    stats.weeklyPoints += points;
    stats.totalPoints += points;
    stats.lastUpdate = today;
    
    // Update streak logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastUpdate = new Date(stats.lastUpdate);
    
    if (lastUpdate.toDateString() === yesterday.toDateString()) {
      stats.currentStreak++;
    } else if (lastUpdate.toDateString() !== today) {
      stats.currentStreak = 1;
    }
    
    const statsKey = this.getUserStorageKey(userId, DailyChallengesService.STATS_KEY);
    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  calculateRiskScore(userId: string, healthProfile?: {
    age?: number;
    height?: number;
    weight?: number;
    workoutDaysPerWeek?: number;
  }): number {
    // If health profile is provided, use the new standardized formula
    if (healthProfile && healthProfile.age && healthProfile.height && healthProfile.weight) {
      const riskResult = RiskCalculationService.calculateRiskFromProfile(healthProfile);
      if (riskResult) {
        // Convert adjR (0-1) to risk score (0-100, where higher is worse)
        // Level 1 (adjR ≤ 0.20) → Risk Score 20
        // Level 5 (adjR > 0.80) → Risk Score 100
        return Math.round(riskResult.adjR * 100);
      }
    }

    // Fallback to activity-based calculation if health profile incomplete
    const stats = this.getUserStats(userId);
    
    // Base risk score (higher is worse)
    let riskScore = 100;
    
    // Reduce risk based on activity level
    const weeklyActivity = stats.weeklyPoints / DailyChallengesService.WEEKLY_LIMIT;
    riskScore -= weeklyActivity * 30; // Up to 30 points reduction
    
    // Reduce risk based on consistency (streak)
    const streakBonus = Math.min(stats.currentStreak * 2, 20); // Up to 20 points
    riskScore -= streakBonus;
    
    // Reduce risk based on total engagement
    const totalActivity = Math.min(stats.totalPoints / 10000, 1); // Normalized to 0-1
    riskScore -= totalActivity * 25; // Up to 25 points reduction
    
    // Ensure score stays within bounds
    return Math.max(25, Math.min(100, Math.round(riskScore)));
  }

  private recordChallengeEvent(userId: string, challenge: DailyChallenge): void {
    // This would typically send to your analytics service
    const event = {
      type: 'challenge_completed',
      userId,
      challengeType: challenge.type,
      points: challenge.points,
      timestamp: new Date().toISOString()
    };
    
    console.log('Challenge event recorded:', event);
    
    // Store locally for demo purposes
    const eventsKey = `challenge_events_${userId}`;
    const events = JSON.parse(localStorage.getItem(eventsKey) || '[]');
    events.push(event);
    localStorage.setItem(eventsKey, JSON.stringify(events));
  }

  // Admin/Analytics methods
  getAllUserStats(): Record<string, DailyStats> {
    const allStats: Record<string, DailyStats> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes(DailyChallengesService.STATS_KEY)) {
        const userId = key.split('_').pop();
        if (userId) {
          allStats[userId] = JSON.parse(localStorage.getItem(key) || '{}');
        }
      }
    }
    
    return allStats;
  }

  getChallengeAnalytics(): Record<ChallengeType, { completions: number; totalPoints: number }> {
    const analytics: Record<ChallengeType, { completions: number; totalPoints: number }> = Object.keys(this.challengeDefinitions).reduce((acc, type) => {
      acc[type as ChallengeType] = { completions: 0, totalPoints: 0 };
      return acc;
    }, {} as Record<ChallengeType, { completions: number; totalPoints: number }>);
    
    // Initialize analytics
    Object.keys(this.challengeDefinitions).forEach(type => {
      analytics[type as ChallengeType] = { completions: 0, totalPoints: 0 };
    });
    
    // Process all events
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('challenge_events_')) {
        const events = JSON.parse(localStorage.getItem(key) || '[]');
        events.forEach((event: { challengeType?: string; points?: number }) => {
          if (event.challengeType && analytics[event.challengeType as ChallengeType]) {
            analytics[event.challengeType as ChallengeType].completions++;
            analytics[event.challengeType as ChallengeType].totalPoints += event.points || 0;
          }
        });
      }
    }
    
    return analytics;
  }
}

// Export singleton instance
export const dailyChallengesService = new DailyChallengesService();