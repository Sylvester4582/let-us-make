import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useUser } from "../hooks/useUser";
import { aiService, UserProfile, PredictiveChallenge, PersonalizedRecommendation, ActivityLog } from "../services/aiService";

interface AIContextType {
  userProfile: UserProfile | null;
  predictiveChallenges: PredictiveChallenge[];
  personalizedRecommendations: PersonalizedRecommendation[];
  motivationalMessage: string;
  isLoading: boolean;
  refreshAIData: () => Promise<void>;
  logActivity: (activity: ActivityLog) => void;
}

export const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [predictiveChallenges, setPredictiveChallenges] = useState<PredictiveChallenge[]>([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([]);

  // Load activity history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('activityHistory');
    if (stored) {
      const parsed = JSON.parse(stored) as ActivityLog[];
      setActivityHistory(parsed.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    }
  }, []);

  // Save activity history to localStorage
  useEffect(() => {
    localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
  }, [activityHistory]);

  const logActivity = useCallback((activity: ActivityLog) => {
    setActivityHistory(prev => [...prev, activity]);
  }, []);

  const refreshAIData = useCallback(async () => {
    if (!userData) return;
    
    setIsLoading(true);
    try {
      // Analyze user profile
      const profile = await aiService.analyzeUserProfile(userData);
      setUserProfile(profile);

      // Generate predictive challenges
      const challenges = await aiService.generatePredictiveChallenges(profile, activityHistory);
      setPredictiveChallenges(challenges);

      // Get personalized recommendations
      const currentContext = {
        streak: userData.streak,
        recentActivities: activityHistory.slice(-5).map(a => a.type),
        timeOfDay: new Date().toLocaleTimeString(),
      };
      const recommendations = await aiService.getPersonalizedRecommendations(profile, currentContext);
      setPersonalizedRecommendations(recommendations);

      // Generate motivational message
      const currentStats = {
        level: userData.level,
        streak: userData.streak,
        recentProgress: activityHistory.length > 0 ? 'active' : 'getting started'
      };
      const message = await aiService.generateMotivationalMessage(profile, currentStats);
      setMotivationalMessage(message);

    } catch (error) {
      console.error('Error refreshing AI data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData, activityHistory]);

  // Initial load and refresh on major changes
  useEffect(() => {
    if (userData && !userProfile) {
      refreshAIData();
    }
  }, [userData, userProfile, refreshAIData]);

  return (
    <AIContext.Provider value={{
      userProfile,
      predictiveChallenges,
      personalizedRecommendations,
      motivationalMessage,
      isLoading,
      refreshAIData,
      logActivity
    }}>
      {children}
    </AIContext.Provider>
  );
};