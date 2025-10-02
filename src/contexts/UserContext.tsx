import { createContext, useState, ReactNode, useContext } from "react";
import { eventService, EventResponse, EventType } from '@/services/eventService';
import { AuthContext } from '@/contexts/AuthContext';

interface AuthUser {
  username?: string;
  points?: number;
  level?: number;
  streak?: number;
}

export interface UserData {
  username: string;
  points: number;
  level: number;
  streak: number;
  levelTitle: string;
}

interface UserContextType {
  userData: UserData;
  updatePoints: (points: number, eventType?: EventType) => Promise<EventResponse | null>;
  setUserData: (data: Partial<UserData>) => void;
  calculateLevel: (points: number) => { level: number; levelTitle: string };
  resetUserData: () => void;
  syncWithAuth: (authUser: AuthUser | null) => void;
  logEvent: (eventType: EventType, metadata?: Record<string, string | number | boolean>) => Promise<EventResponse | null>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500]; // Points needed for each level
const LEVEL_TITLES = ["Beginner", "Explorer", "Advocate", "Champion", "Wellness Master"];

const DEFAULT_USER_DATA: UserData = {
  username: "You",
  points: 285,
  level: 3,
  streak: 7,
  levelTitle: "Advocate",
};

// Helper functions for localStorage
const saveUserData = (data: UserData) => {
  try {
    localStorage.setItem('youmatter_user_data', JSON.stringify(data));
  } catch (error) {
    console.warn('Could not save user data to localStorage:', error);
  }
};

const loadUserData = (): UserData => {
  try {
    const saved = localStorage.getItem('youmatter_user_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all required fields exist
      return {
        ...DEFAULT_USER_DATA,
        ...parsed,
      };
    }
  } catch (error) {
    console.warn('Could not load user data from localStorage:', error);
  }
  return DEFAULT_USER_DATA;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserDataState] = useState<UserData>(loadUserData);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  // Get AuthContext if available
  const authContext = useContext(AuthContext);

  const calculateLevel = (points: number) => {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return {
      level: Math.min(level, 5), // Cap at level 5
      levelTitle: LEVEL_TITLES[Math.min(level - 1, 4)] || "Wellness Master"
    };
  };

  const syncWithAuth = (authUser: AuthUser | null) => {
    if (authUser) {
      const { level, levelTitle } = calculateLevel(authUser.points || 0);
      const syncedData = {
        username: authUser.username || "You",
        points: authUser.points || 0,
        level,
        levelTitle,
        streak: authUser.streak || 0,
      };
      setUserDataState(syncedData);
      setIsBackendConnected(true);
    } else {
      setIsBackendConnected(false);
    }
  };

  const updatePoints = async (pointsToAdd: number, eventType?: EventType): Promise<EventResponse | null> => {
    if (isBackendConnected && eventType) {
      // If backend is connected and event type is provided, use the event service
      try {
        const response = await eventService.logEvent(eventType);
        if (response.success && response.data) {
          // Update local state with backend response
          setUserDataState(prev => {
            const newPoints = response.data!.totalPoints;
            const { level, levelTitle } = calculateLevel(newPoints);
            
            const updatedData = {
              ...prev,
              points: newPoints,
              level,
              levelTitle
            };
            
            saveUserData(updatedData);
            
            // Also update AuthContext if authenticated
            if (authContext && authContext.isAuthenticated) {
              authContext.updateUserPoints(newPoints, level);
            }
            
            return updatedData;
          });
          return response;
        } else {
          // Fallback to local update if backend fails
          updatePointsLocally(pointsToAdd);
          return null;
        }
      } catch (error) {
        console.error('Error updating points via backend:', error);
        updatePointsLocally(pointsToAdd);
        return null;
      }
    } else {
      // Fallback to local update
      updatePointsLocally(pointsToAdd);
      return null;
    }
  };

  const logEvent = async (eventType: EventType, metadata?: Record<string, string | number | boolean>): Promise<EventResponse | null> => {
    if (isBackendConnected) {
      try {
        const response = await eventService.logEvent(eventType, metadata);
        if (response.success && response.data) {
          // Update local state with backend response
          setUserDataState(prev => {
            const newPoints = response.data!.totalPoints;
            const { level, levelTitle } = calculateLevel(newPoints);
            
            const updatedData = {
              ...prev,
              points: newPoints,
              level,
              levelTitle
            };
            
            saveUserData(updatedData);
            
            // Also update AuthContext if authenticated
            if (authContext && authContext.isAuthenticated) {
              authContext.updateUserPoints(newPoints, level);
            }
            
            return updatedData;
          });
          return response;
        }
        return response;
      } catch (error) {
        console.error('Error logging event:', error);
        return null;
      }
    }
    return null;
  };

  const updatePointsLocally = (pointsToAdd: number) => {
    setUserDataState(prev => {
      const newPoints = prev.points + pointsToAdd;
      const { level, levelTitle } = calculateLevel(newPoints);
      
      const updatedData = {
        ...prev,
        points: newPoints,
        level,
        levelTitle
      };
      
      // Save to localStorage if not connected to backend
      if (!isBackendConnected) {
        saveUserData(updatedData);
      }
      
      return updatedData;
    });
  };

  const setUserData = (data: Partial<UserData>) => {
    setUserDataState(prev => {
      const updated = { ...prev, ...data };
      if (data.points !== undefined) {
        const { level, levelTitle } = calculateLevel(data.points);
        updated.level = level;
        updated.levelTitle = levelTitle;
      }
      
      // Save to localStorage if not connected to backend
      if (!isBackendConnected) {
        saveUserData(updated);
      }
      
      return updated;
    });
  };

  const resetUserData = () => {
    setUserDataState(DEFAULT_USER_DATA);
    if (!isBackendConnected) {
      saveUserData(DEFAULT_USER_DATA);
    }
  };

  return (
    <UserContext.Provider value={{
      userData,
      updatePoints,
      setUserData,
      calculateLevel,
      resetUserData,
      syncWithAuth,
      logEvent
    }}>
      {children}
    </UserContext.Provider>
  );
};