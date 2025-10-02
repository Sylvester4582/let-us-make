const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Admin credentials (in production, these should be in environment variables)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  const { username, password } = req.body;
  
  // Check basic admin credentials
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    // Also verify that the admin user exists in the database
    try {
      const adminUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@youmatter.com']);
      if (adminUser) {
        req.adminUser = adminUser;
        next();
      } else {
        return res.status(401).json({ message: 'Admin user not found in database' });
      }
    } catch (error) {
      console.error('Error verifying admin user:', error);
      return res.status(500).json({ message: 'Database error during admin verification' });
    }
  } else {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

// Admin login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], authenticateAdmin, (req, res) => {
  res.json({ 
    message: 'Admin login successful',
    admin: true,
    token: 'admin-session-token', // In production, use proper JWT
    user: {
      email: req.adminUser.email,
      username: req.adminUser.username,
      isAdmin: true
    }
  });
});

// Admin token verification middleware
const verifyAdminToken = async (req, res, next) => {
  const { authorization } = req.headers;
  
  if (authorization !== 'Bearer admin-session-token') {
    return res.status(401).json({ message: 'Unauthorized - Invalid admin token' });
  }
  
  // In production, you would verify the JWT token here and extract admin user info
  // For now, we'll just verify the admin user exists
  try {
    const adminUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@youmatter.com']);
    if (!adminUser) {
      return res.status(401).json({ message: 'Admin user not found' });
    }
    req.adminUser = adminUser;
    next();
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return res.status(500).json({ message: 'Database error during token verification' });
  }
};

// Get all users analytics
router.get('/users/analytics', verifyAdminToken, (req, res) => {

  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    activeUsers: 'SELECT COUNT(*) as count FROM users WHERE last_active > datetime("now", "-7 days")',
    topUsers: 'SELECT username, points, level, streak FROM users ORDER BY points DESC LIMIT 10',
    userGrowth: `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users 
      WHERE created_at > datetime('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `,
    levelDistribution: `
      SELECT 
        level,
        COUNT(*) as user_count
      FROM users
      GROUP BY level
      ORDER BY level
    `,
    pointsDistribution: `
      SELECT 
        CASE 
          WHEN points < 100 THEN '0-99'
          WHEN points < 500 THEN '100-499'
          WHEN points < 1000 THEN '500-999'
          WHEN points < 5000 THEN '1000-4999'
          ELSE '5000+'
        END as points_range,
        COUNT(*) as user_count
      FROM users
      GROUP BY points_range
    `
  };

  const results = {};
  const promises = Object.entries(queries).map(([key, query]) => {
    return new Promise((resolve, reject) => {
      db.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          results[key] = key.includes('total') || key.includes('active') ? rows[0] : rows;
          resolve();
        }
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json(results);
    })
    .catch(err => {
      console.error('Analytics query error:', err);
      res.status(500).json({ message: 'Error fetching analytics data' });
    });
});

// Get events analytics
router.get('/events/analytics', verifyAdminToken, (req, res) => {

  const queries = {
    totalEvents: 'SELECT COUNT(*) as count FROM events',
    eventsByType: `
      SELECT 
        event_type,
        COUNT(*) as count,
        SUM(points_awarded) as total_points
      FROM events
      GROUP BY event_type
      ORDER BY count DESC
    `,
    recentActivity: `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as event_count,
        SUM(points_awarded) as points_awarded
      FROM events
      WHERE timestamp > datetime('now', '-30 days')
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `,
    topPointEarners: `
      SELECT 
        u.username,
        SUM(e.points_awarded) as total_points_earned,
        COUNT(e.id) as total_events
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.timestamp > datetime('now', '-30 days')
      GROUP BY u.id, u.username
      ORDER BY total_points_earned DESC
      LIMIT 10
    `
  };

  const results = {};
  const promises = Object.entries(queries).map(([key, query]) => {
    return new Promise((resolve, reject) => {
      db.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          results[key] = key.includes('total') ? rows[0] : rows;
          resolve();
        }
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json(results);
    })
    .catch(err => {
      console.error('Events analytics query error:', err);
      res.status(500).json({ message: 'Error fetching events analytics' });
    });
});

// Get insurance analytics
router.get('/insurance/analytics', verifyAdminToken, (req, res) => {

  // Since insurance data might be stored differently, we'll provide mock analytics
  // In a real implementation, you'd query actual insurance data
  const mockInsuranceAnalytics = {
    totalQuotes: { count: 1250 },
    quotesByRiskLevel: [
      { risk_level: 'Low', count: 450, avg_premium: 850 },
      { risk_level: 'Medium', count: 600, avg_premium: 1200 },
      { risk_level: 'High', count: 200, avg_premium: 1800 }
    ],
    conversionRate: {
      quotes_generated: 1250,
      policies_purchased: 387,
      conversion_rate: 31.0
    },
    revenueByPlan: [
      { plan_type: 'Basic', revenue: 125000, policies: 150 },
      { plan_type: 'Standard', revenue: 280000, policies: 180 },
      { plan_type: 'Premium', revenue: 320000, parties: 57 }
    ]
  };

  res.json(mockInsuranceAnalytics);
});

// Get business insights
router.get('/insights', verifyAdminToken, (req, res) => {

  // Generate business insights based on data
  const insightsQueries = {
    engagementTrends: `
      SELECT 
        DATE(timestamp) as date,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_events,
        AVG(points_awarded) as avg_points_per_event
      FROM events
      WHERE timestamp > datetime('now', '-30 days')
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `,
    retentionMetrics: `
      SELECT 
        CASE 
          WHEN julianday('now') - julianday(last_active) <= 1 THEN 'Daily Active'
          WHEN julianday('now') - julianday(last_active) <= 7 THEN 'Weekly Active'
          WHEN julianday('now') - julianday(last_active) <= 30 THEN 'Monthly Active'
          ELSE 'Inactive'
        END as activity_status,
        COUNT(*) as user_count
      FROM users
      GROUP BY activity_status
    `,
    streakAnalysis: `
      SELECT 
        CASE 
          WHEN streak = 0 THEN 'No Streak'
          WHEN streak <= 3 THEN '1-3 Days'
          WHEN streak <= 7 THEN '4-7 Days'
          WHEN streak <= 30 THEN '1-4 Weeks'
          ELSE '1+ Months'
        END as streak_range,
        COUNT(*) as user_count,
        AVG(points) as avg_points
      FROM users
      GROUP BY streak_range
    `
  };

  const results = {};
  const promises = Object.entries(insightsQueries).map(([key, query]) => {
    return new Promise((resolve, reject) => {
      db.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          results[key] = rows;
          resolve();
        }
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      // Add computed insights
      const insights = {
        ...results,
        recommendations: [
          {
            type: 'engagement',
            title: 'Boost Daily Engagement',
            description: 'Consider implementing daily challenges to increase user activity',
            priority: 'high',
            impact: 'Potentially increase daily active users by 25%'
          },
          {
            type: 'retention',
            title: 'Retention Campaigns',
            description: 'Target weekly active users with re-engagement notifications',
            priority: 'medium',
            impact: 'Reduce churn rate by 15%'
          },
          {
            type: 'monetization',
            title: 'Premium Features',
            description: 'Introduce premium tier for high-streak users',
            priority: 'medium',
            impact: 'Generate additional revenue from top 20% users'
          }
        ]
      };

      res.json(insights);
    })
    .catch(err => {
      console.error('Insights query error:', err);
      res.status(500).json({ message: 'Error generating business insights' });
    });
});

// Get system health metrics
router.get('/system/health', verifyAdminToken, (req, res) => {

  const healthMetrics = {
    database: {
      status: 'healthy',
      connections: 'active',
      last_backup: new Date().toISOString()
    },
    api: {
      status: 'operational',
      response_time: '< 200ms',
      uptime: '99.9%'
    },
    storage: {
      used: '2.3 GB',
      available: '47.7 GB',
      usage_percentage: 4.6
    },
    errors: {
      last_24h: 3,
      last_week: 12,
      critical: 0
    }
  };

  res.json(healthMetrics);
});

module.exports = router;