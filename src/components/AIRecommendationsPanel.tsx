import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Star, ArrowRight } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { Badge } from "@/components/ui/badge";

export const AIRecommendationsPanel = () => {
  const { personalizedRecommendations, isLoading, userProfile } = useAI();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-700 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return '🏃‍♂️';
      case 'challenge': return '🎯';
      case 'tip': return '💡';
      case 'motivation': return '✨';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Brain className="w-5 h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-lg animate-pulse">
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
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Lightbulb className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Smart Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Personalized for you right now
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-500/10 text-green-700">
          <Brain className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <div className="space-y-4">
        {personalizedRecommendations.map((recommendation, index) => (
          <Card 
            key={index} 
            className="p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 border-2 border-transparent hover:border-green-500/20 transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <span className="text-lg">{getTypeIcon(recommendation.type)}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold group-hover:text-green-600 transition-colors">
                    {recommendation.title}
                  </h4>
                  <Badge className={`text-xs ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {recommendation.type}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {recommendation.description}
                </p>
                
                <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Why now:</span> {recommendation.reasoning}
                    </p>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="group-hover:bg-green-600 transition-colors"
                >
                  {recommendation.actionText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {personalizedRecommendations.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recommendations right now</p>
          <p className="text-sm">Keep using the app to get personalized suggestions!</p>
        </div>
      )}

      {userProfile && (
        <div className="mt-6 pt-4 border-t border-muted">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="w-4 h-4" />
            <span>
              Optimized for your <strong>{userProfile.motivationStyle}</strong> motivation style
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};