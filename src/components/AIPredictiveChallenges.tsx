import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Clock } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { Badge } from "@/components/ui/badge";

export const AIPredictiveChallenges = () => {
  const { predictiveChallenges, isLoading, userProfile } = useAI();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold">AI Predictive Challenges</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-muted/50 rounded-lg animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Brain className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Predictive Challenges</h3>
            <p className="text-sm text-muted-foreground">
              Tailored for your {userProfile?.motivationStyle || 'unique'} style
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
          <Brain className="w-3 h-3 mr-1" />
          AI Generated
        </Badge>
      </div>

      <div className="space-y-4">
        {predictiveChallenges.slice(0, 3).map((challenge) => (
          <Card key={challenge.id} className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-2 border-transparent hover:border-blue-500/20 transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold group-hover:text-blue-600 transition-colors">
                    {challenge.title}
                  </h4>
                  <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {challenge.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-primary">+{challenge.points}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>

            {/* Success Probability */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Success Probability
                </span>
                <span className="font-medium text-green-600">
                  {Math.round(challenge.successProbability * 100)}%
                </span>
              </div>
              <Progress 
                value={challenge.successProbability * 100} 
                className="h-2 bg-green-100"
              />
            </div>

            {/* Duration and Personalized Reason */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                {challenge.duration}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Target className="w-3 h-3" />
                {challenge.type}
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Why this challenge:</span> {challenge.personalizedReason}
              </p>
            </div>

            <Button className="w-full group-hover:bg-blue-600 transition-colors">
              Accept Challenge
            </Button>
          </Card>
        ))}
      </div>

      {predictiveChallenges.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>AI is learning your patterns...</p>
          <p className="text-sm">Complete a few activities to get personalized challenges!</p>
        </div>
      )}
    </Card>
  );
};