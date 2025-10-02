import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
}

export const LeaderboardCard = ({ entries, currentUserRank }: LeaderboardCardProps) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Leaderboard</h3>
        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          Your Rank: #{currentUserRank || "—"}
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              entry.rank === currentUserRank 
                ? "bg-primary/10 border-2 border-primary" 
                : "hover:bg-muted"
            }`}
          >
            <div className="w-8 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>
            
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-primary text-white">
                {entry.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="font-medium">{entry.username}</p>
              <p className="text-xs text-muted-foreground">Level {entry.level}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-primary">{entry.points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
