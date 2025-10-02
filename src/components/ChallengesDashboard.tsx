import { useChallenges } from '../hooks/useChallenges';
import { EnhancedChallengeCard } from './EnhancedChallengeCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Target, 
  Trophy,
  Star,
  TrendingUp,
  RefreshCw,
  Plus,
  Timer,
  Calendar
} from 'lucide-react';

export const ChallengesDashboard = () => {
  const { 
    activeChallenges, 
    completedChallenges,
    stats,
    isLoading, 
    refreshChallenges, 
    generatePersonalized,
    updateProgress 
  } = useChallenges();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Daily Challenges</h2>
              <p className="text-gray-600">Complete challenges to earn points and level up</p>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const allChallenges = [...activeChallenges, ...completedChallenges];
  const totalPoints = stats?.total_rewards_earned || 0;
  const completionRate = parseFloat(stats?.completion_rate || '0');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-900">Daily Challenges</h2>
              <p className="text-purple-700">Complete challenges to earn points and unlock rewards</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generatePersonalized}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Challenge
            </Button>
            <Button
              onClick={refreshChallenges}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Active</p>
              <p className="text-2xl font-bold text-blue-800">{activeChallenges.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Completed</p>
              <p className="text-2xl font-bold text-green-800">{completedChallenges.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-900">Points Earned</p>
              <p className="text-2xl font-bold text-yellow-800">{totalPoints}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-800">{completionRate.toFixed(0)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Active Challenges</h3>
              <p className="text-gray-600">Currently available challenges to complete</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeChallenges.map((challenge) => (
              <EnhancedChallengeCard
                key={challenge.id}
                challenge={challenge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Completed Challenges</h3>
              <p className="text-gray-600">Challenges you've successfully completed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedChallenges.slice(0, 4).map((challenge) => (
              <EnhancedChallengeCard
                key={challenge.id}
                challenge={challenge}
                showProgressButton={false}
              />
            ))}
          </div>

          {completedChallenges.length > 4 && (
            <div className="text-center mt-4">
              <Button variant="outline">
                View All {completedChallenges.length} Completed Challenges
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {allChallenges.length === 0 && (
        <Card className="p-12 text-center">
          <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Challenges Available</h3>
          <p className="text-gray-600 mb-4">
            Start your fitness journey by generating your first personalized challenge!
          </p>
          <Button
            onClick={generatePersonalized}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Your First Challenge
          </Button>
        </Card>
      )}

      {/* Challenge Types Info */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-500 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold">Challenge Types</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { type: 'Exercise', icon: '🏃‍♂️', description: 'Physical activity challenges' },
            { type: 'Diet', icon: '🥗', description: 'Healthy eating goals' },
            { type: 'Sleep', icon: '😴', description: 'Better sleep habits' },
            { type: 'Mindfulness', icon: '🧘‍♀️', description: 'Mental wellness activities' },
            { type: 'Steps', icon: '👣', description: 'Daily step targets' },
            { type: 'Water', icon: '💧', description: 'Hydration goals' },
            { type: 'Social', icon: '👥', description: 'Community activities' }
          ].map((challengeType) => (
            <div key={challengeType.type} className="bg-white p-4 rounded-lg border">
              <div className="text-2xl mb-2">{challengeType.icon}</div>
              <h4 className="font-semibold mb-1">{challengeType.type}</h4>
              <p className="text-sm text-gray-600">{challengeType.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};