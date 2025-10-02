import { useState } from "react";
import { useUser } from "../hooks/useUser";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Sparkles,
  TrendingUp,
  Target,
  Shield,
  Trophy,
  Users,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { RiskAssessmentCard } from "../components/RiskAssessmentCard";
import { HealthProfileCard } from "../components/HealthProfileCard";
import { RiskScoreCard } from "../components/RiskScoreCard";

const Dashboard = () => {
  const { userData, resetUserData } = useUser();
  const { leaderboard, currentUserRank, isLoading: leaderboardLoading } = useLeaderboard();

  // Calculate points needed for next level
  const getLevelProgress = () => {
    const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];
    const currentLevel = userData.level;
    
    if (currentLevel >= LEVEL_THRESHOLDS.length - 1) {
      return { current: userData.points, needed: 0, percentage: 100 };
    }
    
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel + 1];
    const progressInLevel = userData.points - currentThreshold;
    const pointsNeededForNext = nextThreshold - currentThreshold;
    const percentage = Math.min((progressInLevel / pointsNeededForNext) * 100, 100);
    
    return {
      current: progressInLevel,
      needed: pointsNeededForNext - progressInLevel,
      percentage: Math.round(percentage)
    };
  };

  const levelProgress = getLevelProgress();

  // Check if user has health profile data
  const hasHealthProfile = userData.healthProfile.age && userData.healthProfile.height && userData.healthProfile.weight;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userData.levelTitle}! 👋
        </h1>
        <p className="text-gray-600">
          You're doing amazing! Keep up the healthy habits and level up your wellness journey.
        </p>
      </div>

      {/* Level Progress - Hero Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Level {userData.level}</h2>
            <p className="text-blue-700">{userData.levelTitle}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">{userData.points}</div>
            <p className="text-sm text-blue-700">Total Points</p>
          </div>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress.percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-blue-700">
          {levelProgress.needed > 0 ? `${levelProgress.needed} points to next level` : 'Max level reached!'}
        </p>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-900">Total Points</h3>
              <p className="text-2xl font-bold text-yellow-800">{userData.points.toLocaleString()}</p>
              <p className="text-sm text-yellow-700">Keep earning more!</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-900">Current Rank</h3>
              <p className="text-2xl font-bold text-purple-800">
                {currentUserRank ? `#${currentUserRank}` : "Unranked"}
              </p>
              <p className="text-sm text-purple-700">Global leaderboard</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900">Level Progress</h3>
              <p className="text-2xl font-bold text-green-800">{levelProgress.percentage}%</p>
              <p className="text-sm text-green-700">
                {levelProgress.needed > 0 ? `${levelProgress.needed} to next level` : 'Max level!'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Assessment - Prominently displayed */}
      {hasHealthProfile ? (
        <RiskAssessmentCard 
          age={userData.healthProfile.age!}
          height={userData.healthProfile.height!}
          weight={userData.healthProfile.weight!}
          challengesCompleted={userData.points > 0 ? Math.floor(userData.points / 50) : 0}
          streakDays={userData.streak}
          totalPoints={userData.points}
        />
      ) : (
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-amber-100 rounded-full">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">Complete Your Health Profile</h3>
              <p className="text-amber-700 mb-4">
                Set up your health information to get personalized risk assessments and unlock better insurance rates!
              </p>
              <p className="text-sm text-amber-600">
                Your data is secure and only used to calculate your personalized health level.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Health Profile Management */}
      <HealthProfileCard />

      {/* Risk Assessment with New Formula */}
      <RiskScoreCard basePremium={100} showDetails={true} />

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mini Leaderboard */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performers
            </h3>
            <Link to="/leaderboard">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {!leaderboardLoading && leaderboard.slice(0, 3).map((user, index) => (
              <div key={user.username} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Insurance Access */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Insurance Plans
            </h3>
            <Link to="/insurance">
              <Button variant="outline" size="sm">View Plans</Button>
            </Link>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Health Coverage</p>
              <p className="text-xs text-blue-700">Save up to 15% with activity rewards</p>
            </div>
            <div className="text-center">
              <Link to="/insurance">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  <Shield className="w-4 h-4 mr-2" />
                  Explore Plans
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Quick Challenges Access */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Active Challenges
            </h3>
            <Link to="/challenges">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-900">Daily Goals</p>
              <p className="text-xs text-green-700">Complete challenges to earn rewards</p>
            </div>
            <div className="text-center">
              <Link to="/challenges">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  <Target className="w-4 h-4 mr-2" />
                  Start Challenge
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" />
          Your Journey
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Health Goals</h4>
            <p className="text-sm text-blue-700">
              Track your wellness activities and earn points for healthy habits.
            </p>
            <Badge className="mt-2 bg-blue-500">Active</Badge>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Community</h4>
            <p className="text-sm text-green-700">
              Connect with others and share your wellness journey.
            </p>
            <Badge className="mt-2 bg-green-500">Growing</Badge>
          </div>
        </div>
      </Card>

      {/* Debug Panel - Remove in production */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-600">Debug Panel</h3>
          <button 
            onClick={resetUserData}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Reset Data
          </button>
        </div>
        <div className="text-xs text-gray-600">
          <p>Stored Points: {userData.points} | Level: {userData.level} ({userData.levelTitle})</p>
          <p>Data persists across page refreshes via localStorage</p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;