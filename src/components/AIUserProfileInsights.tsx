import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, User, Target, Clock, TrendingUp } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { Progress } from "@/components/ui/progress";

export const AIUserProfileInsights = () => {
  const { userProfile, isLoading } = useAI();

  if (isLoading || !userProfile) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Brain className="w-5 h-5 text-purple-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold">AI Profile Analysis</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  const getMotivationStyleInfo = (style: string) => {
    const info = {
      competitive: {
        description: "You thrive on competition and ranking high against others",
        icon: "🏆",
        color: "bg-orange-500/10 text-orange-700"
      },
      collaborative: {
        description: "You're motivated by working together and helping others",
        icon: "🤝",
        color: "bg-blue-500/10 text-blue-700"
      },
      achievement: {
        description: "You focus on personal goals and hitting milestones",
        icon: "🎯",
        color: "bg-green-500/10 text-green-700"
      },
      intrinsic: {
        description: "You're self-motivated and driven by internal satisfaction",
        icon: "💪",
        color: "bg-purple-500/10 text-purple-700"
      }
    };
    return info[style as keyof typeof info] || info.achievement;
  };

  const getConsistencyScore = (level: string) => {
    switch (level) {
      case 'high': return 85;
      case 'medium': return 60;
      case 'low': return 35;
      default: return 50;
    }
  };

  const motivationInfo = getMotivationStyleInfo(userProfile.motivationStyle);
  const consistencyScore = getConsistencyScore(userProfile.activityPatterns.consistencyLevel);

  return (
    <Card className="p-6 shadow-card bg-gradient-to-br from-purple-50/50 to-blue-50/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <User className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Your AI Profile</h3>
            <p className="text-sm text-muted-foreground">
              Generated from your activity patterns
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-700">
          <Brain className="w-3 h-3 mr-1" />
          AI Analysis
        </Badge>
      </div>

      {/* Motivation Style */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Motivation Style
        </h4>
        <Card className="p-4 bg-white/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{motivationInfo.icon}</span>
            <div>
              <Badge className={motivationInfo.color}>
                {userProfile.motivationStyle.charAt(0).toUpperCase() + userProfile.motivationStyle.slice(1)}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {motivationInfo.description}
          </p>
        </Card>
      </div>

      {/* Activity Patterns */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Activity Patterns
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-3 bg-white/50">
            <div className="text-sm text-muted-foreground mb-1">Peak Time</div>
            <div className="font-medium">
              {userProfile.activityPatterns.mostActiveTime.charAt(0).toUpperCase() + 
               userProfile.activityPatterns.mostActiveTime.slice(1)}
            </div>
          </Card>
          <Card className="p-3 bg-white/50">
            <div className="text-sm text-muted-foreground mb-1">Duration</div>
            <div className="font-medium">
              {userProfile.activityPatterns.preferredDuration.charAt(0).toUpperCase() + 
               userProfile.activityPatterns.preferredDuration.slice(1)}
            </div>
          </Card>
          <Card className="p-3 bg-white/50">
            <div className="text-sm text-muted-foreground mb-1">Consistency</div>
            <div className="font-medium flex items-center gap-2">
              {userProfile.activityPatterns.consistencyLevel.charAt(0).toUpperCase() + 
               userProfile.activityPatterns.consistencyLevel.slice(1)}
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
          </Card>
        </div>
      </div>

      {/* Consistency Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Consistency Score</span>
          <span className="text-sm font-bold text-green-600">{consistencyScore}%</span>
        </div>
        <Progress value={consistencyScore} className="h-2" />
      </div>

      {/* Preferred Challenge Type */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Preferred Activities</h4>
        <Badge variant="outline" className="bg-blue-500/10">
          {userProfile.preferredChallengeType.charAt(0).toUpperCase() + 
           userProfile.preferredChallengeType.slice(1)}
        </Badge>
      </div>

      {/* Goals */}
      {userProfile.goals.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Your Goals</h4>
          <div className="space-y-2">
            {userProfile.goals.map((goal, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                <span className="text-sm">{goal}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personality Traits */}
      <div>
        <h4 className="font-semibold mb-3">Personality Traits</h4>
        <div className="flex flex-wrap gap-2">
          {userProfile.personalityTraits.map((trait, index) => (
            <Badge key={index} variant="secondary" className="bg-purple-500/10 text-purple-700">
              {trait}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};