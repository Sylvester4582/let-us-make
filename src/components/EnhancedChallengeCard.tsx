import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { useChallenges } from '../hooks/useChallenges';
import { Challenge } from '../services/challengesService';
import { challengesService } from '../services/challengesService';
import { 
  Target, 
  Trophy, 
  Clock, 
  Star, 
  Calendar,
  Play,
  Check,
  AlertTriangle
} from 'lucide-react';

interface EnhancedChallengeCardProps {
  challenge: Challenge;
  showProgressButton?: boolean;
}

export const EnhancedChallengeCard = ({ challenge, showProgressButton = true }: EnhancedChallengeCardProps) => {
  const { updateProgress } = useChallenges();
  const [isUpdating, setIsUpdating] = useState(false);

  const progress = challengesService.calculateProgress(challenge);
  const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = daysRemaining <= 3 && challenge.status === 'active';
  const canUpdate = challenge.status === 'active' && challenge.current_progress < challenge.target_value;

  const progressMessage = challengesService.getProgressMessage(challenge);

  const handleUpdateProgress = async () => {
    setIsUpdating(true);
    try {
      await updateProgress(challenge.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      exercise: '🏃‍♂️',
      diet: '🥗',
      sleep: '😴',
      mindfulness: '🧘‍♀️',
      steps: '👣',
      water: '💧',
      social: '👥'
    };
    return icons[challenge.category] || '🎯';
  };

  const categoryIcon = getCategoryIcon();

  const getStatusColor = () => {
    const colors = {
      active: 'border-blue-200 bg-blue-50',
      completed: 'border-green-200 bg-green-50',
      expired: 'border-red-200 bg-red-50'
    };
    return colors[challenge.status as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  const getBadgeVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    const variants = {
      active: 'default' as const,
      completed: 'secondary' as const,
      expired: 'destructive' as const
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  const getDifficultyColor = () => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[challenge.difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={`p-6 transition-all hover:scale-105 border-2 ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{categoryIcon}</div>
          <div>
            <h3 className="font-bold text-lg">{challenge.title}</h3>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Badge variant={getBadgeVariant(challenge.status)}>
            {challenge.status.toUpperCase()}
          </Badge>
          <Badge variant="outline" className={getDifficultyColor()}>
            {challenge.difficulty.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Progress</span>
          </div>
          <span className="text-sm text-gray-600">
            {challenge.current_progress} / {challenge.target_value}
          </span>
        </div>
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-xs text-gray-500">{progressMessage}</p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <div>
            <p className="text-xs text-gray-500">Reward</p>
            <p className="text-sm font-medium">{challenge.reward_points} pts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Time Left</p>
            <p className={`text-sm font-medium ${isExpiringSoon ? 'text-yellow-600' : ''}`}>
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Category Tag */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="text-xs">
          {challenge.category.toUpperCase()}
        </Badge>
        {isExpiringSoon && challenge.status === 'active' && (
          <div className="flex items-center gap-1 text-yellow-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Expires Soon!</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      {showProgressButton && canUpdate && (
        <Button
          onClick={handleUpdateProgress}
          disabled={isUpdating}
          className="w-full"
          variant={challenge.status === 'completed' ? 'outline' : 'default'}
        >
          {isUpdating ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : challenge.status === 'completed' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Completed!
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Update Progress
            </>
          )}
        </Button>
      )}

      {challenge.status === 'completed' && challenge.completed_at && (
        <div className="mt-3 flex items-center gap-2 text-green-600">
          <Trophy className="w-4 h-4" />
          <span className="text-sm">
            Completed on {new Date(challenge.completed_at).toLocaleDateString()}
          </span>
        </div>
      )}

      {challenge.status === 'expired' && (
        <div className="mt-3 flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Challenge expired</span>
        </div>
      )}
    </Card>
  );
};

export const EnhancedChallengeCardSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded" />
        <div>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
    
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-20" />
    </div>

    <Skeleton className="h-10 w-full" />
  </Card>
);