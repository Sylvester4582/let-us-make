import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface DailyRewardCardProps {
  onClaim: (points: number) => void;
}

const DAILY_REWARD_KEY = 'youmatter_daily_reward';

const getTodayKey = () => {
  return new Date().toDateString();
};

const hasClaimedToday = () => {
  try {
    const saved = localStorage.getItem(DAILY_REWARD_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return data.date === getTodayKey();
    }
  } catch (error) {
    console.warn('Could not check daily reward status:', error);
  }
  return false;
};

const markAsClaimedToday = () => {
  try {
    localStorage.setItem(DAILY_REWARD_KEY, JSON.stringify({
      date: getTodayKey(),
      claimed: true
    }));
  } catch (error) {
    console.warn('Could not save daily reward status:', error);
  }
};

export const DailyRewardCard = ({ onClaim }: DailyRewardCardProps) => {
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    setClaimed(hasClaimedToday());
  }, []);

  const handleClaim = () => {
    setClaimed(true);
    markAsClaimedToday();
    onClaim(50);
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
          {claimed ? "✓ Claimed Today!" : "🎁 Claim Now"}
        </Button>

        {!claimed && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Available once per day
          </p>
        )}
        
        {claimed && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Come back tomorrow for another reward!
          </p>
        )}
      </div>
    </Card>
  );
};
