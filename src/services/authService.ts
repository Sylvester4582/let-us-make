import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add token to requests if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
  points?: number;
  level?: number;
  streak?: number;
  badges?: string[];
  unlockedPremiumDiscount?: boolean;
  discountPercentage?: number;
  avatarUrl?: string;
  lastActive?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  message?: string;
  errors?: string[];
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load existing auth data from localStorage
    this.token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>('/auth/register', data);
      
      if (response.data.success && response.data.data) {
        this.setAuthData(response.data.data.token, response.data.data.user);
      }
      
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>('/auth/login', data);
      
      if (response.data.success && response.data.data) {
        this.setAuthData(response.data.data.token, response.data.data.user);
      }
      
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getProfile(): Promise<{ success: boolean; user?: User; errors?: string[] }> {
    try {
      if (!this.token) {
        return { success: false, errors: ['No authentication token'] };
      }

      const response = await axios.get<{ success: boolean; data: { user: User } }>('/auth/profile');
      
      if (response.data.success) {
        this.user = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return { success: true, user: this.user };
      }
      
      return { success: false, errors: ['Failed to fetch profile'] };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { message?: string };
      const errorMessage = errorData?.message || 'Error fetching profile';
      return { success: false, errors: [errorMessage] };
    }
  }

  async updatePoints(pointsToAdd: number): Promise<{ success: boolean; user?: User; errors?: string[] }> {
    try {
      const response = await axios.post<{ success: boolean; data: { user: User } }>('/events', {
        eventType: 'points_earned',
        pointsAwarded: pointsToAdd,
        metadata: { source: 'activity_completion' }
      });
      
      if (response.data.success) {
        this.user = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return { success: true, user: this.user };
      }
      
      return { success: false, errors: ['Failed to update points'] };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { message?: string };
      const errorMessage = errorData?.message || 'Error updating points';
      return { success: false, errors: [errorMessage] };
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData'); // Also clear any cached user data
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  private setAuthData(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private handleError(error: AxiosError): AuthResponse {
    if (error.response?.data) {
      return error.response.data as AuthResponse;
    }
    
    return {
      success: false,
      message: 'Network error',
      errors: [error.message || 'Something went wrong']
    };
  }
}

export const authService = new AuthService();