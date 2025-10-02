import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Share2, 
  BookOpen, 
  FileText,
  CheckCircle,
  Lock,
  Gift,
  Zap,
  Calendar,
  Award
} from 'lucide-react';
import { DailyChallengesService, DailyChallenge, ChallengeType } from '../services/dailyChallengesService';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useUser } from '../hooks/useUser';
import { EventType } from '../services/eventService';

interface DailyChallengesPageProps {
  userId: string;
}

export const DailyChallengesPage: React.FC<DailyChallengesPageProps> = ({ userId }) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [stats, setStats] = useState({
    todayPoints: 0,
    weeklyPoints: 0,
    currentStreak: 0,
    totalChallengesCompleted: 0,
    riskScore: 85,
    currentLevel: 1,
    nextLevelProgress: 0
  });
  
  const challengeService = useMemo(() => new DailyChallengesService(), []);
  const { updateLeaderboard } = useLeaderboard();
  const { updatePoints, userData } = useUser();

  // Map challenge types to event types
  const challengeToEventType = useMemo(() => ({
    'daily_login': EventType.DAILY_LOGIN,
    'log_workout': EventType.LOG_WORKOUT,
    'read_article': EventType.READ_ARTICLE,
    'view_policy': EventType.VIEW_POLICY,
    'complete_all_workouts': EventType.COMPLETE_CHALLENGE,
    'invite_friend': EventType.INVITE_FRIEND,
    'share_achievement': EventType.SHARE_ACHIEVEMENT
  }), []);

  const challengeIcons: Record<ChallengeType, React.ReactNode> = {
    'daily_login': <Gift className="w-6 h-6" />,
    'log_workout': <Target className="w-6 h-6" />,
    'read_article': <BookOpen className="w-6 h-6" />,
    'view_policy': <FileText className="w-6 h-6" />,
    'complete_all_workouts': <Trophy className="w-6 h-6" />,
    'invite_friend': <Users className="w-6 h-6" />,
    'share_achievement': <Share2 className="w-6 h-6" />
  };

  const challengeDescriptions: Record<ChallengeType, string> = {
    'daily_login': 'Log in to your account today',
    'log_workout': 'Complete and log a workout session',
    'read_article': 'Read a health and wellness article',
    'view_policy': 'Review your insurance policy details',
    'complete_all_workouts': 'Complete all available workout sessions',
    'invite_friend': 'Invite a friend to join the platform',
    'share_achievement': 'Share your progress on social media'
  };

  const loadChallenges = useCallback(() => {
    const availableChallenges = challengeService.getAvailableChallenges(userId);
    setChallenges(availableChallenges);
  }, [userId, challengeService]);

  const updateStats = useCallback(() => {
    const userStats = challengeService.getUserStats(userId);
    console.log('=== UPDATE STATS DEBUG ===');
    console.log('User stats from service:', userStats);
    console.log('UserData from context:', userData);
    
    // Use UserContext points if available, otherwise fall back to localStorage
    let actualTotalPoints = userData?.points || 0;
    
    // If userData points is 0 or undefined, check localStorage as fallback
    if (actualTotalPoints === 0) {
      try {
        const saved = localStorage.getItem('youmatter_user_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          actualTotalPoints = parsed.points || 0;
          console.log('Using localStorage points:', actualTotalPoints);
        }
      } catch (error) {
        console.warn('Could not read points from localStorage:', error);
      }
    }
    
    console.log('Final total points used:', actualTotalPoints);
    
    const level = Math.floor(actualTotalPoints / 500) + 1;
    const nextLevelProgress = (actualTotalPoints % 500) / 500 * 100;
    
    const newStats = {
      todayPoints: userStats.todayPoints,
      weeklyPoints: userStats.weeklyPoints,
      currentStreak: userStats.currentStreak,
      totalChallengesCompleted: userStats.completedChallenges.length,
      riskScore: challengeService.calculateRiskScore(userId),
      currentLevel: level,
      nextLevelProgress
    };
    
    console.log('Setting new stats:', newStats);
    setStats(newStats);
    console.log('=== END UPDATE STATS DEBUG ===');
  }, [userId, challengeService, userData]);

  const handleCompleteChallenge = useCallback(async (challengeId: string) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      console.log('=== CHALLENGE COMPLETION DEBUG ===');
      console.log('Challenge:', challenge.title, 'Points:', challenge.points);
      console.log('Current userData:', userData);
      console.log('Backend connection check - about to test connectivity...');

      // Check if challenge can be completed (daily/weekly limits)
      const stats = challengeService.getUserStats(userId);
      if (stats.todayPoints + challenge.points > 70) {
        alert('Daily points limit reached (70 points)');
        return;
      }
      if (stats.weeklyPoints + challenge.points > 3500) {
        alert('Weekly points limit reached (3500 points)');
        return;
      }

      // Mark challenge as completed locally
      challengeService.markChallengeCompleted(userId, challengeId);
      
      // Update points through UserContext (syncs with backend and leaderboard)
      const eventType = challengeToEventType[challenge.type];
      console.log('Updating points with eventType:', eventType);
      
      const result = await updatePoints(challenge.points, eventType);
      console.log('Points update result:', result);
      console.log('Updated userData after points update:', userData);
      
      // Refresh local data
      loadChallenges();
      
      // Wait a bit for state to update, then update stats
      setTimeout(() => {
        updateStats();
      }, 100);
      
      // Update leaderboard
      updateLeaderboard();
      
      console.log('=== END CHALLENGE COMPLETION DEBUG ===');
      
    } catch (error) {
      console.error('Failed to complete challenge:', error);
    }
  }, [challenges, userId, challengeService, loadChallenges, updateStats, updateLeaderboard, updatePoints, challengeToEventType, userData]);

  const checkDailyLoginBonus = useCallback(() => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem(`lastLogin_${userId}`);
    
    if (lastLogin !== today) {
      const loginChallenge = challenges.find(c => c.type === 'daily_login');
      if (loginChallenge && !loginChallenge.completed) {
        // Auto-complete the daily login challenge
        setTimeout(() => {
          handleCompleteChallenge(loginChallenge.id);
        }, 1000);
      }
      localStorage.setItem(`lastLogin_${userId}`, today);
    }
  }, [userId, challenges, handleCompleteChallenge]);

  useEffect(() => {
    loadChallenges();
    updateStats();
    checkDailyLoginBonus();
  }, [loadChallenges, updateStats, checkDailyLoginBonus]);

  const getDifficultyColor = (points: number) => {
    if (points <= 5) return 'bg-green-500';
    if (points <= 15) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyText = (points: number) => {
    if (points <= 5) return 'Easy';
    if (points <= 15) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Daily Challenges
        </h1>
        <p className="text-gray-600">Complete challenges to earn points and improve your wellness score</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.todayPoints}</div>
            <div className="text-xs text-gray-500">/ 70 points</div>
            <Progress value={(stats.todayPoints / 70) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.weeklyPoints}</div>
            <div className="text-xs text-gray-500">/ 3500 points</div>
            <Progress value={(stats.weeklyPoints / 3500) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Level</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.currentLevel}</div>
            <div className="text-xs text-gray-500">{stats.nextLevelProgress.toFixed(0)}% to next</div>
            <Progress value={stats.nextLevelProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm font-medium">Risk Score</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.riskScore}%</div>
            <div className="text-xs text-gray-500">Lower is better</div>
            <Progress value={100 - stats.riskScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Daily Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Today's Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className={`relative transition-all hover:shadow-md ${
                challenge.completed ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${challenge.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {challengeIcons[challenge.type]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{challenge.title}</h3>
                        <p className="text-xs text-gray-600">{challengeDescriptions[challenge.type]}</p>
                      </div>
                    </div>
                    {challenge.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className={`${getDifficultyColor(challenge.points)} text-white`}>
                      {getDifficultyText(challenge.points)}
                    </Badge>
                    <span className="text-lg font-bold text-blue-600">+{challenge.points} pts</span>
                  </div>

                  <Button
                    onClick={() => handleCompleteChallenge(challenge.id)}
                    disabled={challenge.completed}
                    className="w-full"
                    variant={challenge.completed ? "outline" : "default"}
                  >
                    {challenge.completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      'Complete Challenge'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Points Progress</span>
              <span className="text-sm text-gray-600">{stats.weeklyPoints} / 3500 points</span>
            </div>
            <Progress value={(stats.weeklyPoints / 3500) * 100} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalChallengesCompleted}</div>
                <div className="text-sm text-gray-600">Total Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.currentLevel}</div>
                <div className="text-sm text-gray-600">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{(100 - stats.riskScore)}%</div>
                <div className="text-sm text-gray-600">Health Score</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};