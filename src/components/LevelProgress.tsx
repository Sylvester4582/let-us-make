import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Trophy, Sparkles } from "lucide-react";

interface LevelProgressProps {
  level: number;
  currentPoints: number;
  pointsToNextLevel: number;
  levelTitle: string;
}

const LEVEL_TITLES = ["Beginner", "Explorer", "Advocate", "Champion", "Wellness Master"];

export const LevelProgress = ({ level, currentPoints, pointsToNextLevel, levelTitle }: LevelProgressProps) => {
  const progress = (currentPoints / pointsToNextLevel) * 100;
  const isMaxLevel = level >= 5;

  return (
    <Card className="bg-gradient-hero text-white shadow-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Level {level}</h3>
            <p className="text-sm opacity-90">{levelTitle}</p>
          </div>
        </div>
        {isMaxLevel && (
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Max Level</span>
          </div>
        )}
      </div>

      {!isMaxLevel ? (
        <>
          <Progress value={progress} className="h-3 mb-2 bg-white/20" />
          <div className="flex justify-between text-sm">
            <span className="opacity-90">{currentPoints} points</span>
            <span className="opacity-90">{pointsToNextLevel - currentPoints} to Level {level + 1}</span>
          </div>
          <p className="text-xs opacity-75 mt-2">Next: {LEVEL_TITLES[level] || "Master"}</p>
        </>
      ) : (
        <div className="text-center py-2">
          <p className="text-sm opacity-90">🎉 You've reached the highest level!</p>
        </div>
      )}
    </Card>
  );
};
