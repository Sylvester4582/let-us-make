import { Card } from "@/components/ui/card";
import { Brain, Sparkles, RefreshCw } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { Button } from "@/components/ui/button";

export const AIMotivationCard = () => {
  const { motivationalMessage, userProfile, isLoading, refreshAIData } = useAI();

  const getMotivationIcon = () => {
    if (!userProfile) return <Brain className="w-6 h-6" />;
    
    switch (userProfile.motivationStyle) {
      case 'competitive': return <span className="text-2xl">🏆</span>;
      case 'collaborative': return <span className="text-2xl">🤝</span>;
      case 'achievement': return <span className="text-2xl">🎯</span>;
      case 'intrinsic': return <span className="text-2xl">💪</span>;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/20 shadow-card relative overflow-hidden">
      {/* AI Sparkle Animation */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
          <Brain className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-purple-400 font-medium">AI</span>
        </div>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white animate-pulse">
          {getMotivationIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">Personalized Motivation</h3>
          <p className="text-sm text-muted-foreground">
            {userProfile ? `${userProfile.motivationStyle} style` : 'Learning your preferences...'}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshAIData}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Sparkles className="w-4 h-4 animate-pulse text-purple-400" />
            <span className="text-sm text-muted-foreground">AI is crafting your message...</span>
          </div>
        ) : (
          <blockquote className="text-base font-medium leading-relaxed text-foreground border-l-4 border-purple-500 pl-4 py-2">
            "{motivationalMessage || 'Keep up the great work! Every step counts towards your wellness journey.'}"
          </blockquote>
        )}
      </div>

      {userProfile && (
        <div className="mt-4 flex flex-wrap gap-2">
          {userProfile.personalityTraits.slice(0, 3).map((trait, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-purple-500/10 text-purple-700 rounded-full text-xs"
            >
              {trait}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};