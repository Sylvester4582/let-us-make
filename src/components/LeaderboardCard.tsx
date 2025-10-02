import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
  avatarUrl?: string;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  isLoading?: boolean;
}

export const LeaderboardCard = ({ entries, currentUserRank, isLoading }: LeaderboardCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const { userData } = useUser();
  
  const currentUsername = isAuthenticated ? user?.username : userData.username;
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  };

  // Show top 5 entries
  const topEntries = entries.slice(0, 5);

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Leaderboard</h3>
        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          Your Rank: #{currentUserRank || "—"}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-3">
              <Skeleton className="w-8 h-8" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No leaderboard data available</p>
          <p className="text-sm text-muted-foreground mt-2">Be the first to earn points!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topEntries.map((entry) => {
            const isCurrentUser = entry.username === currentUsername;
            
            return (
              <div
                key={`${entry.rank}-${entry.username}`}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                  isCurrentUser
                    ? "bg-primary/10 border-2 border-primary animate-pulse-subtle" 
                    : "hover:bg-muted hover:scale-105"
                }`}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={`${
                    isCurrentUser
                      ? "bg-gradient-primary text-white" 
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  }`}>
                    {entry.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className={`font-medium ${
                    isCurrentUser ? "text-primary font-bold" : ""
                  }`}>
                    {entry.username}
                    {isCurrentUser && " (You)"}
                  </p>
                  <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                </div>

                <div className="text-right">
                  <p className={`font-bold ${
                    isCurrentUser ? "text-primary" : "text-foreground"
                  }`}>
                    {entry.points.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
