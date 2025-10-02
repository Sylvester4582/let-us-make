interface HealthProfile {
  age?: number;
  height?: number;
  weight?: number;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  updatedAt?: string;
}

interface RiskAssessment {
  riskScore: number;
  level: number;
  discountPercentage: number;
  factors: {
    bmi: number;
    bmiRisk: number;
    fitnessRisk: number;
    ageRisk: number;
  };
  challengesCompleted: number;
  userPoints: number;
  userStreak: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

class HealthProfileService {
  private baseURL = 'http://localhost:3001/api/profile';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getHealthProfile(): Promise<ApiResponse<HealthProfile>> {
    try {
      const response = await fetch(`${this.baseURL}/health-profile`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching health profile:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async updateHealthProfile(healthData: Partial<HealthProfile>): Promise<ApiResponse<HealthProfile>> {
    try {
      const response = await fetch(`${this.baseURL}/health-profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(healthData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating health profile:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async getRiskAssessment(): Promise<ApiResponse<RiskAssessment>> {
    try {
      const response = await fetch(`${this.baseURL}/risk-assessment`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Sync health profile with backend when user logs in
  async syncHealthProfile(localHealthProfile: HealthProfile): Promise<ApiResponse<HealthProfile>> {
    try {
      // First try to get existing profile from backend
      const existingProfile = await this.getHealthProfile();
      
      if (existingProfile.success && existingProfile.data) {
        // Backend has data, use it
        return existingProfile;
      } else if (localHealthProfile.age || localHealthProfile.height || localHealthProfile.weight) {
        // Local has data, sync to backend
        return await this.updateHealthProfile(localHealthProfile);
      }
      
      // No data in either location
      return {
        success: true,
        data: null,
        message: 'No health profile data found'
      };
    } catch (error) {
      console.error('Error syncing health profile:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export const healthProfileService = new HealthProfileService();
export type { HealthProfile, RiskAssessment, ApiResponse };