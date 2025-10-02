import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PointsUpdateResponse {
  success: boolean;
  data?: {
    points: number;
    level: number;
    totalPoints: number;
  };
  message?: string;
  errors?: string[];
}

class PointsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async addPoints(points: number): Promise<PointsUpdateResponse> {
    try {
      // Check if we have an auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated - points saved locally only',
          errors: ['Authentication required for backend sync']
        };
      }

      const response = await axios.post<PointsUpdateResponse>(
        `${API_BASE_URL}/profile/add-points`,
        { points },
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error('Points service error:', error);
      
      // Check if it's an axios error
      if (axios.isAxiosError(error)) {
        // Check if it's an authentication error
        if (error.response?.status === 401) {
          return {
            success: false,
            message: 'Authentication failed - points saved locally only',
            errors: ['Invalid or expired token']
          };
        }
        
        // Check if it's a network error
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          return {
            success: false,
            message: 'Backend unavailable - points saved locally only',
            errors: ['Could not connect to server']
          };
        }
      }
      
      return {
        success: false,
        message: 'Backend error - points saved locally only',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: this.getAuthHeaders()
      });
      
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const pointsService = new PointsService();