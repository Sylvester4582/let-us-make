# Admin Portal Documentation

## Overview

The admin portal provides comprehensive analytics and business insights for the YouMatter health and wellness platform. It includes user analytics, event tracking, insurance metrics, and system health monitoring.

## Access

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

### URLs
- **Admin Login**: `http://localhost:8081/admin/login`
- **Admin Dashboard**: `http://localhost:8081/admin/dashboard`

## Features

### 1. User Analytics
- **Total Users**: Complete count of registered users
- **Active Users**: Users active in the last 7 days
- **User Growth**: Daily new user registrations (last 30 days)
- **Level Distribution**: Users grouped by achievement levels
- **Points Distribution**: Users grouped by points ranges
- **Top Users**: Leaderboard of highest-scoring users

### 2. Events Analytics
- **Total Events**: Complete count of user activities
- **Events by Type**: Breakdown of different activity types
- **Recent Activity**: Daily engagement over the past 30 days
- **Top Point Earners**: Most active users this month

### 3. Insurance Analytics
- **Total Quotes**: Complete count of insurance quotes generated
- **Risk Level Distribution**: Quotes categorized by risk assessment
- **Conversion Metrics**: Quote-to-policy conversion statistics
- **Revenue by Plan**: Performance breakdown by insurance plan types

### 4. Business Insights
- **Engagement Trends**: User activity patterns over time
- **Retention Metrics**: User activity status distribution
- **Streak Analysis**: User engagement streak patterns
- **AI Recommendations**: Automated business improvement suggestions

### 5. System Health
- **Database Status**: Connection status and backup information
- **API Performance**: Response times and uptime statistics
- **Storage Metrics**: Disk usage and availability
- **Error Monitoring**: System error tracking and alerts

## API Endpoints

### Authentication
```
POST /api/admin/login
```
**Body**: `{ "username": "admin", "password": "admin123" }`

### Analytics Endpoints
```
GET /api/admin/users/analytics
GET /api/admin/events/analytics
GET /api/admin/insurance/analytics
GET /api/admin/insights
GET /api/admin/system/health
```

**Headers**: `Authorization: Bearer admin-session-token`

## Data Models

### User Analytics Response
```json
{
  "totalUsers": { "count": 150 },
  "activeUsers": { "count": 89 },
  "topUsers": [
    {
      "username": "user123",
      "points": 2500,
      "level": 5,
      "streak": 15
    }
  ],
  "userGrowth": [
    {
      "date": "2025-10-02",
      "new_users": 12
    }
  ],
  "levelDistribution": [
    {
      "level": 1,
      "user_count": 45
    }
  ],
  "pointsDistribution": [
    {
      "points_range": "0-99",
      "user_count": 20
    }
  ]
}
```

### Events Analytics Response
```json
{
  "totalEvents": { "count": 5000 },
  "eventsByType": [
    {
      "event_type": "fitness_goal_set",
      "count": 250,
      "total_points": 1250
    }
  ],
  "recentActivity": [
    {
      "date": "2025-10-02",
      "event_count": 45,
      "points_awarded": 450
    }
  ],
  "topPointEarners": [
    {
      "username": "activeUser",
      "total_points_earned": 500,
      "total_events": 25
    }
  ]
}
```

### Insurance Analytics Response
```json
{
  "totalQuotes": { "count": 1250 },
  "quotesByRiskLevel": [
    {
      "risk_level": "Low",
      "count": 450,
      "avg_premium": 850
    }
  ],
  "conversionRate": {
    "quotes_generated": 1250,
    "policies_purchased": 387,
    "conversion_rate": 31.0
  },
  "revenueByPlan": [
    {
      "plan_type": "Basic",
      "revenue": 125000,
      "policies": 150
    }
  ]
}
```

### Business Insights Response
```json
{
  "engagementTrends": [
    {
      "date": "2025-10-02",
      "active_users": 89,
      "total_events": 234,
      "avg_points_per_event": 10.5
    }
  ],
  "retentionMetrics": [
    {
      "activity_status": "Daily Active",
      "user_count": 45
    }
  ],
  "streakAnalysis": [
    {
      "streak_range": "1-3 Days",
      "user_count": 35,
      "avg_points": 250
    }
  ],
  "recommendations": [
    {
      "type": "engagement",
      "title": "Boost Daily Engagement",
      "description": "Consider implementing daily challenges",
      "priority": "high",
      "impact": "Potentially increase daily active users by 25%"
    }
  ]
}
```

### System Health Response
```json
{
  "database": {
    "status": "healthy",
    "connections": "active",
    "last_backup": "2025-10-02T10:30:00Z"
  },
  "api": {
    "status": "operational",
    "response_time": "< 200ms",
    "uptime": "99.9%"
  },
  "storage": {
    "used": "2.3 GB",
    "available": "47.7 GB",
    "usage_percentage": 4.6
  },
  "errors": {
    "last_24h": 3,
    "last_week": 12,
    "critical": 0
  }
}
```

## Security

### Authentication
- Simple credential-based authentication for demo purposes
- In production, implement proper JWT-based admin authentication
- Environment variables for admin credentials

### Authorization
- All admin endpoints require proper authentication token
- Session-based access control
- Automatic logout on session expiry

### Environment Variables
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Usage Instructions

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend Server**:
   ```bash
   npm run dev
   ```

3. **Access Admin Portal**:
   - Navigate to `http://localhost:8081/admin/login`
   - Enter admin credentials (admin/admin123)
   - Access the dashboard for comprehensive analytics

4. **Navigate Through Sections**:
   - **Users**: View user growth, distribution, and top performers
   - **Events**: Analyze user activities and engagement patterns
   - **Insurance**: Monitor quote generation and conversion rates
   - **Insights**: Review AI-powered business recommendations
   - **System**: Check system health and performance metrics

## Development Notes

### Adding New Analytics
1. Create new endpoint in `backend/src/routes/admin.js`
2. Add corresponding service method in `src/services/adminService.ts`
3. Update admin dashboard component to display new data
4. Add appropriate TypeScript interfaces

### Customizing Metrics
- Modify SQL queries in admin routes for different data aggregations
- Update the dashboard visualization components
- Add new chart types or data representations

### Security Enhancements for Production
- Implement proper JWT-based admin authentication
- Add role-based access control (RBAC)
- Use secure password hashing
- Add audit logging for admin actions
- Implement session management with proper expiry

## Troubleshooting

### Common Issues
1. **Database Connection Errors**: Ensure SQLite database is properly initialized
2. **Authentication Failures**: Verify admin credentials in environment variables
3. **Missing Data**: Check if backend services are generating analytics data
4. **Port Conflicts**: Ensure both frontend (8081) and backend (3001) ports are available

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in the backend environment.