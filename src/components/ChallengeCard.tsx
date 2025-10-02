import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Clock } from "lucide-react";

interface ChallengeCardProps {
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  timeLeft: string;
  onComplete?: () => void;
}

export const ChallengeCard = ({ 
  title, 
  description, 
  progress, 
  target, 
  reward, 
  timeLeft,
  onComplete 
}: ChallengeCardProps) => {
  const progressPercentage = (progress / target) * 100;
  const isComplete = progress >= target;

  return (
    <Card className={`p-6 shadow-card hover:shadow-xl transition-all border-2 relative overflow-hidden group ${
      isComplete ? "border-success animate-pulse-success" : "border-transparent hover:border-secondary/50"
    }`}>
      {/* Animated background for complete challenges */}
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-success/20 to-success/10 animate-pulse" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl transition-all ${
              isComplete 
                ? "bg-success text-white animate-bounce-subtle" 
                : "bg-secondary/10 text-secondary group-hover:scale-110"
            }`}>
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold group-hover:text-secondary transition-colors">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isComplete 
              ? "bg-success/20 text-success animate-pulse" 
              : "bg-accent/10 text-accent"
          }`}>
            {reward} pts
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Progress value={progressPercentage} className={`h-3 ${isComplete ? "animate-pulse" : ""}`} />
          <div className="flex justify-between text-sm">
            <span className={`font-medium ${isComplete ? "text-success" : "text-muted-foreground"}`}>
              {progress} / {target}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeLeft}
            </span>
          </div>
        </div>

        {isComplete && onComplete && (
          <Button 
            onClick={onComplete} 
            className="w-full bg-gradient-success hover:scale-105 transition-transform animate-bounce-subtle"
          >
            🎉 Claim Reward
          </Button>
        )}
      </div>
    </Card>
  );
};
