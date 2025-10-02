import { useLeaderboard } from '../hooks/useLeaderboard';
import { useUser } from '../hooks/useUser';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { 
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp,
  Users,
  User
} from 'lucide-react';

const Leaderboard = () => {
  const { leaderboard, currentUserRank, isLoading } = useLeaderboard();
  const { userData } = useUser();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Loading rankings...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getLevelTitle = (points: number) => {
    if (points >= 1500) return 'Wellness Master';
    if (points >= 1000) return 'Health Champion';
    if (points >= 600) return 'Fitness Enthusiast';
    if (points >= 300) return 'Wellness Warrior';
    if (points >= 100) return 'Health Seeker';
    return 'Beginner';
  };

  const topThree = leaderboard.slice(0, 3);
  const otherUsers = leaderboard.slice(3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Global Leaderboard
        </h1>
        <p className="text-gray-600">
          See how you rank against the wellness community
        </p>
      </div>

      {/* Current User Stats */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-full">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-900">Your Position</h2>
              <p className="text-purple-700">{userData.levelTitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-900">
              {currentUserRank ? `#${currentUserRank}` : 'Unranked'}
            </div>
            <p className="text-sm text-purple-700">{userData.points} points</p>
          </div>
        </div>
      </Card>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThree.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.username === userData.username;
          
          return (
            <Card 
              key={user.username} 
              className={`p-6 text-center ${getRankColor(rank)} ${
                isCurrentUser ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="flex justify-center mb-4">
                {getRankIcon(rank)}
              </div>
              <div className="mb-4">
                <Avatar className="w-16 h-16 mx-auto mb-3">
                  <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
                <h3 className="text-lg font-bold">{user.username}</h3>
                <p className="text-sm text-gray-600">{getLevelTitle(user.points)}</p>
                {isCurrentUser && (
                  <Badge className="mt-1 bg-purple-500">You</Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {user.points.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">points</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Complete Rankings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">Complete Rankings</h2>
        </div>
        
        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.username === userData.username;
            
            return (
              <div 
                key={user.username}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  isCurrentUser 
                    ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-300' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {/* Rank */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                  rank <= 3 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {rank}
                </div>

                {/* User Info */}
                <Avatar className="w-12 h-12">
                  <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.username}</h3>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                    {rank <= 3 && (
                      <div className="flex items-center">
                        {getRankIcon(rank)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{getLevelTitle(user.points)}</p>
                </div>

                {/* Points and Trend */}
                <div className="text-right">
                  <div className="font-bold text-lg">{user.points.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">points</p>
                </div>

                {/* Rank Change (placeholder for future feature) */}
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-yellow-600">{leaderboard.length}</p>
          <p className="text-sm text-gray-600">Active members</p>
        </Card>

        <Card className="p-6 text-center">
          <Star className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Average Points</h3>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(leaderboard.reduce((sum, user) => sum + user.points, 0) / leaderboard.length || 0)}
          </p>
          <p className="text-sm text-gray-600">Community average</p>
        </Card>

        <Card className="p-6 text-center">
          <Crown className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Top Score</h3>
          <p className="text-2xl font-bold text-purple-600">
            {leaderboard[0]?.points.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-600">Highest achievement</p>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;