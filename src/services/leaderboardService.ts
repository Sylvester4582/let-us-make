import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
  avatarUrl?: string;
}

export interface LeaderboardResponse {
  success: boolean;
  data?: {
    leaderboard: LeaderboardEntry[];
  };
  message?: string;
  errors?: string[];
}

export interface UserRankResponse {
  success: boolean;
  data?: {
    rank: number;
  };
  message?: string;
  errors?: string[];
}

class LeaderboardService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
    try {
      const response = await axios.get<LeaderboardResponse>(
        `${API_BASE_URL}/leaderboard?limit=${limit}`
      );
      
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getUserRank(): Promise<UserRankResponse> {
    try {
      const response = await axios.get<UserRankResponse>(
        `${API_BASE_URL}/leaderboard/my-rank`,
        {
          headers: this.getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      return this.handleRankError(error as AxiosError);
    }
  }

  private handleError(error: AxiosError): LeaderboardResponse {
    if (error.response?.data) {
      return error.response.data as LeaderboardResponse;
    }
    
    return {
      success: false,
      message: 'Network error',
      errors: [error.message || 'Something went wrong']
    };
  }

  private handleRankError(error: AxiosError): UserRankResponse {
    if (error.response?.data) {
      return error.response.data as UserRankResponse;
    }
    
    return {
      success: false,
      message: 'Network error',
      errors: [error.message || 'Something went wrong']
    };
  }
}

export const leaderboardService = new LeaderboardService();