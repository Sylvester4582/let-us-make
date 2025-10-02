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
    <Card className="p-6 shadow-card hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
          {reward} pts
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
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
          className="w-full bg-gradient-success"
        >
          Claim Reward
        </Button>
      )}
    </Card>
  );
};
