import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";
import { leaderboardService, LeaderboardEntry } from "../services/leaderboardService";

interface LeaderboardContextType {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number;
  updateLeaderboard: () => void;
  isLoading: boolean;
}

export const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useUser();
  const { isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch leaderboard from backend
      const leaderboardResponse = await leaderboardService.getLeaderboard(10);
      
      if (leaderboardResponse.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data.leaderboard);
      }

      // Fetch current user's rank if authenticated
      if (isAuthenticated) {
        const rankResponse = await leaderboardService.getUserRank();
        if (rankResponse.success && rankResponse.data) {
          setCurrentUserRank(rankResponse.data.rank);
        }
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Update leaderboard when component mounts and when user data changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Fetch leaderboard from backend
        const leaderboardResponse = await leaderboardService.getLeaderboard(10);
        
        if (leaderboardResponse.success && leaderboardResponse.data) {
          setLeaderboard(leaderboardResponse.data.leaderboard);
        } else {
          console.error('Failed to fetch leaderboard:', leaderboardResponse.errors);
          setLeaderboard([]);
        }

        // Fetch current user's rank if authenticated
        if (isAuthenticated) {
          const rankResponse = await leaderboardService.getUserRank();
          if (rankResponse.success && rankResponse.data) {
            setCurrentUserRank(rankResponse.data.rank);
          }
        } else {
          // For guest users, calculate rank based on points if we have leaderboard data
          setCurrentUserRank(1); // Default rank for guest users
        }
      } catch (error) {
        console.error('Error updating leaderboard:', error);
        setLeaderboard([]);
        setCurrentUserRank(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userData.points, isAuthenticated]);

  return (
    <LeaderboardContext.Provider value={{
      leaderboard,
      currentUserRank,
      updateLeaderboard,
      isLoading
    }}>
      {children}
    </LeaderboardContext.Provider>
  );
};