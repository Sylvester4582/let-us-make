import { useContext } from "react";
import { LeaderboardContext } from "../contexts/LeaderboardContext";

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};