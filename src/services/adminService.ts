const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface AdminAnalytics {
  totalUsers: { count: number };
  activeUsers: { count: number };
  topUsers: Array<{
    username: string;
    points: number;
    level: number;
    streak: number;
  }>;
  userGrowth: Array<{
    date: string;
    new_users: number;
  }>;
  levelDistribution: Array<{
    level: number;
    user_count: number;
  }>;
  pointsDistribution: Array<{
    points_range: string;
    user_count: number;
  }>;
}

export interface EventsAnalytics {
  totalEvents: { count: number };
  eventsByType: Array<{
    event_type: string;
    count: number;
    total_points: number;
  }>;
  recentActivity: Array<{
    date: string;
    event_count: number;
    points_awarded: number;
  }>;
  topPointEarners: Array<{
    username: string;
    total_points_earned: number;
    total_events: number;
  }>;
}

export interface InsuranceAnalytics {
  totalQuotes: { count: number };
  quotesByRiskLevel: Array<{
    risk_level: string;
    count: number;
    avg_premium: number;
  }>;
  conversionRate: {
    quotes_generated: number;
    policies_purchased: number;
    conversion_rate: number;
  };
  revenueByPlan: Array<{
    plan_type: string;
    revenue: number;
    policies: number;
  }>;
}

export interface BusinessInsights {
  engagementTrends: Array<{
    date: string;
    active_users: number;
    total_events: number;
    avg_points_per_event: number;
  }>;
  retentionMetrics: Array<{
    activity_status: string;
    user_count: number;
  }>;
  streakAnalysis: Array<{
    streak_range: string;
    user_count: number;
    avg_points: number;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
    impact: string;
  }>;
}

export interface SystemHealth {
  database: {
    status: string;
    connections: string;
    last_backup: string;
  };
  api: {
    status: string;
    response_time: string;
    uptime: string;
  };
  storage: {
    used: string;
    available: string;
    usage_percentage: number;
  };
  errors: {
    last_24h: number;
    last_week: number;
    critical: number;
  };
}

class AdminService {
  private async makeRequest<T>(endpoint: string, token?: string): Promise<T> {
    // For admin users, we'll use a predefined admin token
    const adminToken = token || 'admin-session-token';
    
    const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }

    return response.json();
  }

  async login(username: string, password: string): Promise<{ token: string; admin: boolean }> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid admin credentials');
    }

    return response.json();
  }

  async getUserAnalytics(token?: string): Promise<AdminAnalytics> {
    return this.makeRequest<AdminAnalytics>('/users/analytics', token);
  }

  async getEventsAnalytics(token?: string): Promise<EventsAnalytics> {
    return this.makeRequest<EventsAnalytics>('/events/analytics', token);
  }

  async getInsuranceAnalytics(token?: string): Promise<InsuranceAnalytics> {
    return this.makeRequest<InsuranceAnalytics>('/insurance/analytics', token);
  }

  async getBusinessInsights(token?: string): Promise<BusinessInsights> {
    return this.makeRequest<BusinessInsights>('/insights', token);
  }

  async getSystemHealth(token?: string): Promise<SystemHealth> {
    return this.makeRequest<SystemHealth>('/system/health', token);
  }
}

export const adminService = new AdminService();