import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Challenge {
  id: string;
  user_id: string;
  challenge_type: string;
  title: string;
  description: string;
  target_value: number;
  current_progress: number;
  category: string;
  difficulty: string;
  reward_points: number;
  status: 'active' | 'completed' | 'expired';
  start_date: string;
  end_date: string;
  completed_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChallengeType {
  key: string;
  value: string;
  template: {
    title: string;
    description: string;
    category: string;
    targetValue: number;
    rewardPoints: number;
    durationDays: number;
  };
}

export interface ChallengeStats {
  total_challenges: number;
  completed_challenges: number;
  active_challenges: number;
  expired_challenges: number;
  total_rewards_earned: number;
  completion_rate: string;
}

export interface CreateChallengeRequest {
  challengeType: string;
  title?: string;
  description?: string;
  targetValue?: number;
  durationDays?: number;
}

class ChallengesService {
  private getAuthHeaders() {
    const token = localStorage.getItem('youmatter_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const response = await axios.get(`${API_URL}/api/challenges/active`, this.getAuthHeaders());
      return response.data.data.challenges;
    } catch (error) {
      console.error('Error fetching active challenges:', error);
      throw new Error('Failed to fetch active challenges');
    }
  }

  async getCompletedChallenges(limit = 10): Promise<Challenge[]> {
    try {
      const response = await axios.get(
        `${API_URL}/api/challenges/completed?limit=${limit}`,
        this.getAuthHeaders()
      );
      return response.data.data.challenges;
    } catch (error) {
      console.error('Error fetching completed challenges:', error);
      throw new Error('Failed to fetch completed challenges');
    }
  }

  async generatePersonalizedChallenge(): Promise<Challenge> {
    try {
      const response = await axios.get(`${API_URL}/api/challenges/personalized`, this.getAuthHeaders());
      return response.data.data.challenge;
    } catch (error) {
      console.error('Error generating personalized challenge:', error);
      throw new Error('Failed to generate personalized challenge');
    }
  }

  async getChallengeStats(): Promise<ChallengeStats> {
    try {
      const response = await axios.get(`${API_URL}/api/challenges/stats`, this.getAuthHeaders());
      return response.data.data.stats;
    } catch (error) {
      console.error('Error fetching challenge stats:', error);
      throw new Error('Failed to fetch challenge statistics');
    }
  }

  async updateChallengeProgress(challengeId: string, increment = 1): Promise<{ challenge: Challenge; message: string }> {
    try {
      const response = await axios.post(
        `${API_URL}/api/challenges/${challengeId}/progress`,
        { increment },
        this.getAuthHeaders()
      );
      return {
        challenge: response.data.data.challenge,
        message: response.data.message
      };
    } catch (error: unknown) {
      console.error('Error updating challenge progress:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Failed to update challenge progress');
    }
  }

  async createChallenge(challengeData: CreateChallengeRequest): Promise<Challenge> {
    try {
      const response = await axios.post(
        `${API_URL}/api/challenges/create`,
        challengeData,
        this.getAuthHeaders()
      );
      return response.data.data.challenge;
    } catch (error: unknown) {
      console.error('Error creating challenge:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Failed to create challenge');
    }
  }

  async getChallengeTypes(): Promise<ChallengeType[]> {
    try {
      const response = await axios.get(`${API_URL}/api/challenges/types`, this.getAuthHeaders());
      return response.data.data.types;
    } catch (error) {
      console.error('Error fetching challenge types:', error);
      throw new Error('Failed to fetch challenge types');
    }
  }

  async expireOldChallenges(): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/api/challenges/expire-old`, {}, this.getAuthHeaders());
      return response.data.message;
    } catch (error) {
      console.error('Error expiring old challenges:', error);
      throw new Error('Failed to expire old challenges');
    }
  }

  // Helper methods
  calculateProgress(challenge: Challenge): number {
    return Math.min((challenge.current_progress / challenge.target_value) * 100, 100);
  }

  isExpiringSoon(challenge: Challenge, hoursThreshold = 24): boolean {
    const endDate = new Date(challenge.end_date);
    const now = new Date();
    const hoursUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= hoursThreshold && hoursUntilExpiry > 0;
  }

  getDaysRemaining(challenge: Challenge): number {
    const endDate = new Date(challenge.end_date);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }

  getDifficultyColor(difficulty: string): string {
    const colors = {
      easy: 'green',
      medium: 'yellow',
      hard: 'red'
    };
    return colors[difficulty as keyof typeof colors] || 'gray';
  }

  getCategoryIcon(category: string): string {
    const icons = {
      fitness: '💪',
      education: '📚',
      insurance: '🛡️',
      social: '🤝',
      platform: '🚀',
      general: '⭐',
      progression: '📈'
    };
    return icons[category as keyof typeof icons] || '🎯';
  }

  formatRewardPoints(points: number): string {
    return `${points.toLocaleString()} pts`;
  }

  getStatusBadgeVariant(status: Challenge['status']): 'default' | 'success' | 'destructive' | 'secondary' {
    const variants = {
      active: 'default' as const,
      completed: 'success' as const,
      expired: 'destructive' as const
    };
    return variants[status] || 'secondary';
  }

  canUpdateProgress(challenge: Challenge): boolean {
    return challenge.status === 'active' && new Date(challenge.end_date) > new Date();
  }

  getProgressMessage(challenge: Challenge): string {
    const progress = this.calculateProgress(challenge);
    const remaining = challenge.target_value - challenge.current_progress;
    
    if (progress === 100) {
      return '🎉 Completed!';
    } else if (progress >= 75) {
      return `Almost there! ${remaining} to go`;
    } else if (progress >= 50) {
      return `Halfway there! ${remaining} remaining`;
    } else if (progress >= 25) {
      return `Good start! ${remaining} to go`;
    } else {
      return `${remaining} remaining`;
    }
  }
}

export const challengesService = new ChallengesService();