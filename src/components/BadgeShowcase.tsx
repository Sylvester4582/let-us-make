import { Card } from "@/components/ui/card";
import { Trophy, Star, Zap, Award, Crown, Target, Flame, Heart } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  icon: any;
  description: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const BadgeShowcase = () => {
  const badges: Badge[] = [
    {
      id: "1",
      name: "First Steps",
      icon: Star,
      description: "Complete your first activity",
      unlocked: true,
      rarity: "common",
    },
    {
      id: "2",
      name: "Streak Master",
      icon: Flame,
      description: "Maintain a 7-day streak",
      unlocked: true,
      rarity: "rare",
    },
    {
      id: "3",
      name: "Social Butterfly",
      icon: Heart,
      description: "Invite 5 friends",
      unlocked: false,
      rarity: "epic",
    },
    {
      id: "4",
      name: "Champion",
      icon: Trophy,
      description: "Reach Level 5",
      unlocked: false,
      rarity: "legendary",
    },
    {
      id: "5",
      name: "Quick Learner",
      icon: Zap,
      description: "Read 10 articles",
      unlocked: true,
      rarity: "common",
    },
    {
      id: "6",
      name: "Fitness Guru",
      icon: Target,
      description: "Complete 50 workouts",
      unlocked: false,
      rarity: "epic",
    },
    {
      id: "7",
      name: "Perfect Week",
      icon: Award,
      description: "Complete all daily challenges for a week",
      unlocked: false,
      rarity: "rare",
    },
    {
      id: "8",
      name: "Legend",
      icon: Crown,
      description: "Reach 5000 points",
      unlocked: false,
      rarity: "legendary",
    },
  ];

  const rarityColors = {
    common: "bg-muted text-muted-foreground",
    rare: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
    epic: "bg-gradient-to-br from-purple-500 to-pink-600 text-white",
    legendary: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white",
  };

  const rarityGlow = {
    common: "",
    rare: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    epic: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    legendary: "shadow-[0_0_30px_rgba(251,191,36,0.7)] animate-glow",
  };

  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-xl font-bold mb-4">Achievement Badges</h3>
      <div className="grid grid-cols-4 gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.id}
              className={`relative group cursor-pointer transition-all ${
                isUnlocked ? "animate-bounce-subtle" : "opacity-40 grayscale"
              }`}
            >
              <div
                className={`
                  ${rarityColors[badge.rarity]}
                  ${isUnlocked ? rarityGlow[badge.rarity] : ""}
                  p-4 rounded-xl aspect-square flex items-center justify-center
                  transition-transform hover:scale-110
                  ${isUnlocked ? "" : "bg-muted"}
                `}
              >
                <Icon className="w-8 h-8" />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
                  <p className="font-semibold text-sm mb-1">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs capitalize text-muted-foreground">{badge.rarity}</span>
                    {isUnlocked && (
                      <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
