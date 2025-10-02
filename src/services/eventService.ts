import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Event types matching the backend
export enum EventType {
  DAILY_LOGIN = 'DAILY_LOGIN',
  LOG_WORKOUT = 'LOG_WORKOUT',
  READ_ARTICLE = 'READ_ARTICLE',
  VIEW_POLICY = 'VIEW_POLICY',
  COMPLETE_CHALLENGE = 'COMPLETE_CHALLENGE',
  INVITE_FRIEND = 'INVITE_FRIEND',
  SHARE_ACHIEVEMENT = 'SHARE_ACHIEVEMENT',
  USE_NEW_FEATURE = 'USE_NEW_FEATURE'
}

export interface EventMetadata {
  source?: string;
  duration?: number;
  category?: string;
  value?: string | number;
  [key: string]: string | number | boolean | undefined;
}

export interface EventResponse {
  success: boolean;
  data?: {
    event: {
      id: string;
      eventType: string;
      pointsAwarded: number;
      timestamp: string;
    };
    pointsAwarded: number;
    totalPoints: number;
    levelUp: boolean;
    newLevel: number;
    unlockedPremiumDiscount: boolean;
    discountPercentage: number;
    message: string;
  };
  message?: string;
  errors?: string[];
}

export interface Event {
  id: string;
  eventType: string;
  pointsAwarded: number;
  metadata: EventMetadata;
  timestamp: string;
}

export interface EventHistoryResponse {
  success: boolean;
  data?: {
    events: Event[];
  };
  message?: string;
  errors?: string[];
}

class EventService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async logEvent(eventType: EventType, metadata?: EventMetadata): Promise<EventResponse> {
    try {
      const response = await axios.post<EventResponse>(
        `${API_BASE_URL}/events`,
        {
          eventType,
          metadata: metadata || {}
        },
        {
          headers: this.getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getEventHistory(): Promise<EventHistoryResponse> {
    try {
      const response = await axios.get<EventHistoryResponse>(
        `${API_BASE_URL}/events/history`,
        {
          headers: this.getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      return this.handleHistoryError(error as AxiosError);
    }
  }

  // Convenience methods for common events
  async logWorkout(metadata?: EventMetadata): Promise<EventResponse> {
    return this.logEvent(EventType.LOG_WORKOUT, metadata);
  }

  async logArticleRead(metadata?: EventMetadata): Promise<EventResponse> {
    return this.logEvent(EventType.READ_ARTICLE, metadata);
  }

  async logPolicyView(metadata?: EventMetadata): Promise<EventResponse> {
    return this.logEvent(EventType.VIEW_POLICY, metadata);
  }

  async logFriendInvite(metadata?: EventMetadata): Promise<EventResponse> {
    return this.logEvent(EventType.INVITE_FRIEND, metadata);
  }

  async logChallengeComplete(metadata?: EventMetadata): Promise<EventResponse> {
    return this.logEvent(EventType.COMPLETE_CHALLENGE, metadata);
  }

  async logDailyLogin(metadata?: EventMetadata): Promise<EventResponse> {
    return this.logEvent(EventType.DAILY_LOGIN, metadata);
  }

  async logAchievementShare(metadata?: EventMetadata): Promise<EventResponse> {
    return this.logEvent(EventType.SHARE_ACHIEVEMENT, metadata);
  }

  async logNewFeatureUse(metadata?: EventMetadata): Promise<EventResponse> {
    return this.logEvent(EventType.USE_NEW_FEATURE, metadata);
  }

  private handleError(error: AxiosError): EventResponse {
    if (error.response?.data) {
      return error.response.data as EventResponse;
    }
    
    return {
      success: false,
      message: 'Network error',
      errors: [error.message || 'Something went wrong']
    };
  }

  private handleHistoryError(error: AxiosError): EventHistoryResponse {
    if (error.response?.data) {
      return error.response.data as EventHistoryResponse;
    }
    
    return {
      success: false,
      message: 'Network error',
      errors: [error.message || 'Something went wrong']
    };
  }
}

export const eventService = new EventService();