import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  Shield, 
  TrendingUp, 
  BarChart3, 
  AlertCircle,
  LogOut,
  Database,
  Server,
  HardDrive
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { adminService, AdminAnalytics, EventsAnalytics, InsuranceAnalytics, BusinessInsights, SystemHealth } from '@/services/adminService';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userAnalytics, setUserAnalytics] = useState<AdminAnalytics | null>(null);
  const [eventsAnalytics, setEventsAnalytics] = useState<EventsAnalytics | null>(null);
  const [insuranceAnalytics, setInsuranceAnalytics] = useState<InsuranceAnalytics | null>(null);
  const [businessInsights, setBusinessInsights] = useState<BusinessInsights | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdminUser = user?.email === 'admin@youmatter.com';

  useEffect(() => {
    if (!user || !isAdminUser) {
      navigate('/dashboard');
      return;
    }

    const fetchAllData = async () => {
      try {
        const [users, events, insurance, insights, health] = await Promise.all([
          adminService.getUserAnalytics(),
          adminService.getEventsAnalytics(),
          adminService.getInsuranceAnalytics(),
          adminService.getBusinessInsights(),
          adminService.getSystemHealth()
        ]);

        setUserAnalytics(users);
        setEventsAnalytics(events);
        setInsuranceAnalytics(insurance);
        setBusinessInsights(insights);
        setSystemHealth(health);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user, isAdminUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics?.totalUsers.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                {userAnalytics?.activeUsers.count || 0} active this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventsAnalytics?.totalEvents.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                User engagement activities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insurance Quotes</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insuranceAnalytics?.totalQuotes.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                {insuranceAnalytics?.conversionRate.conversion_rate.toFixed(1) || 0}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemHealth?.api.uptime || '99.9%'}
              </div>
              <p className="text-xs text-muted-foreground">
                API uptime
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userAnalytics?.userGrowth.slice(0, 7).map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.date}</span>
                        <Badge variant="secondary">{item.new_users} users</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Level Distribution</CardTitle>
                  <CardDescription>Users by achievement level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userAnalytics?.levelDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">Level {item.level}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${(item.user_count / (userAnalytics?.totalUsers.count || 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.user_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Users</CardTitle>
                <CardDescription>Highest scoring users in the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAnalytics?.topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{user.username}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{user.points} points</span>
                        <span>Level {user.level}</span>
                        <span>{user.streak} day streak</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Events by Type</CardTitle>
                  <CardDescription>Breakdown of user activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventsAnalytics?.eventsByType.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium capitalize">{event.event_type.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>{event.count} events</span>
                          <Badge variant="secondary">{event.total_points} points</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Point Earners</CardTitle>
                  <CardDescription>Most active users this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventsAnalytics?.topPointEarners.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{user.username}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>{user.total_points_earned} points</span>
                          <span>{user.total_events} events</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Daily engagement over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eventsAnalytics?.recentActivity.slice(0, 10).map((day, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{day.date}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{day.event_count} events</span>
                        <Badge variant="secondary">{day.points_awarded} points</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Distribution</CardTitle>
                  <CardDescription>Insurance quotes by risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insuranceAnalytics?.quotesByRiskLevel.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{risk.risk_level} Risk</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>{risk.count} quotes</span>
                          <Badge variant="secondary">${risk.avg_premium}/month</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                  <CardDescription>Insurance plan performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insuranceAnalytics?.revenueByPlan.map((plan, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{plan.plan_type}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>${plan.revenue.toLocaleString()}</span>
                          <Badge variant="secondary">{plan.policies} policies</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
                <CardDescription>Quote to policy conversion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {insuranceAnalytics?.conversionRate.quotes_generated}
                    </div>
                    <div className="text-sm text-blue-600">Quotes Generated</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {insuranceAnalytics?.conversionRate.policies_purchased}
                    </div>
                    <div className="text-sm text-green-600">Policies Purchased</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {insuranceAnalytics?.conversionRate.conversion_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-600">Conversion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Retention Metrics</CardTitle>
                <CardDescription>User activity and retention analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {businessInsights?.retentionMetrics.map((metric, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold">{metric.user_count}</div>
                      <div className="text-sm text-gray-600">{metric.activity_status}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Recommendations</CardTitle>
                <CardDescription>AI-powered insights and suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessInsights?.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-xs text-green-600 font-medium">{rec.impact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="default" className="bg-green-500">
                        {systemHealth?.database.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Connections</span>
                      <span className="text-sm font-medium">{systemHealth?.database.connections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Backup</span>
                      <span className="text-sm">{new Date(systemHealth?.database.last_backup || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="default" className="bg-green-500">
                        {systemHealth?.api.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm font-medium">{systemHealth?.api.response_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium">{systemHealth?.api.uptime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HardDrive className="h-5 w-5 mr-2" />
                    Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Used</span>
                      <span className="text-sm font-medium">{systemHealth?.storage.used}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Available</span>
                      <span className="text-sm font-medium">{systemHealth?.storage.available}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Usage</span>
                        <span>{systemHealth?.storage.usage_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${systemHealth?.storage.usage_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Error Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {systemHealth?.errors.critical}
                    </div>
                    <div className="text-sm text-red-600">Critical Errors</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {systemHealth?.errors.last_24h}
                    </div>
                    <div className="text-sm text-yellow-600">Last 24 Hours</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {systemHealth?.errors.last_week}
                    </div>
                    <div className="text-sm text-orange-600">Last Week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}