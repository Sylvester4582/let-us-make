import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Check } from "lucide-react";
import { useState } from "react";

interface DailyRewardCardProps {
  onClaim: (points: number) => void;
}

export const DailyRewardCard = ({ onClaim }: DailyRewardCardProps) => {
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    setClaimed(true);
    onClaim(50);
    setTimeout(() => setClaimed(false), 3000);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-accent/20 to-secondary/20 border-2 border-accent/50 shadow-card relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-xl animate-bounce-subtle">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Daily Reward</h3>
              <p className="text-sm text-muted-foreground">Claim your daily bonus!</p>
            </div>
          </div>
          {!claimed ? (
            <div className="px-4 py-2 bg-accent/20 rounded-full animate-pulse">
              <span className="text-2xl font-bold text-accent">+50</span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-success/20 rounded-full">
              <Check className="w-6 h-6 text-success" />
            </div>
          )}
        </div>

        <Button
          onClick={handleClaim}
          disabled={claimed}
          className={`w-full ${
            claimed
              ? "bg-muted text-muted-foreground"
              : "bg-gradient-to-r from-accent to-secondary hover:opacity-90 animate-pulse"
          }`}
        >
          {claimed ? "✓ Claimed!" : "🎁 Claim Now"}
        </Button>

        {!claimed && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Available for the next 12 hours
          </p>
        )}
      </div>
    </Card>
  );
};
