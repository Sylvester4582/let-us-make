import { createContext, useState, useEffect, ReactNode } from 'react';
import { challengesService, Challenge, ChallengeStats } from '@/services/challengesService';
import { toast } from 'sonner';

interface ChallengesContextType {
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  stats: ChallengeStats | null;
  isLoading: boolean;
  updateProgress: (challengeId: string, increment?: number) => Promise<boolean>;
  generatePersonalized: () => Promise<Challenge | null>;
  refreshChallenges: () => Promise<void>;
}

export const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

const DEFAULT_STATS: ChallengeStats = {
  total_challenges: 0,
  completed_challenges: 0,
  active_challenges: 0,
  expired_challenges: 0,
  total_rewards_earned: 0,
  completion_rate: '0'
};

export const ChallengesProvider = ({ children }: { children: ReactNode }) => {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadChallengesData = async () => {
    setIsLoading(true);
    try {
      const [active, completed, challengeStats] = await Promise.all([
        challengesService.getActiveChallenges(),
        challengesService.getCompletedChallenges(10),
        challengesService.getChallengeStats().catch(() => DEFAULT_STATS)
      ]);

      setActiveChallenges(active);
      setCompletedChallenges(completed);
      setStats(challengeStats);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (challengeId: string, increment = 1): Promise<boolean> => {
    try {
      const result = await challengesService.updateChallengeProgress(challengeId, increment);
      
      toast.success(result.message, {
        duration: 5000,
      });

      // Refresh challenges after update
      await loadChallengesData();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update progress';
      toast.error(errorMessage);
      return false;
    }
  };

  const generatePersonalized = async (): Promise<Challenge | null> => {
    try {
      const newChallenge = await challengesService.generatePersonalizedChallenge();
      toast.success('New personalized challenge created!', {
        description: newChallenge.title,
        duration: 5000,
      });

      // Refresh challenges after creating new one
      await loadChallengesData();
      return newChallenge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate challenge';
      toast.error(errorMessage);
      return null;
    }
  };

  const refreshChallenges = async () => {
    await loadChallengesData();
  };

  // Load data on mount
  useEffect(() => {
    loadChallengesData();
  }, []);

  return (
    <ChallengesContext.Provider
      value={{
        activeChallenges,
        completedChallenges,
        stats,
        isLoading,
        updateProgress,
        generatePersonalized,
        refreshChallenges
      }}
    >
      {children}
    </ChallengesContext.Provider>
  );
};