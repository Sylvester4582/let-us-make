import { createContext, useState, ReactNode, useContext } from "react";
import { eventService, EventResponse, EventType } from '@/services/eventService';
import { AuthContext } from '@/contexts/AuthContext';
import { healthProfileService, HealthProfile as BackendHealthProfile } from '@/services/healthProfileService';

interface AuthUser {
  username?: string;
  points?: number;
  level?: number;
  streak?: number;
}

export interface HealthProfile {
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UserData {
  username: string;
  points: number;
  level: number;
  streak: number;
  levelTitle: string;
  healthProfile: HealthProfile;
}

interface UserContextType {
  userData: UserData;
  updatePoints: (points: number, eventType?: EventType) => Promise<EventResponse | null>;
  setUserData: (data: Partial<UserData>) => void;
  updateHealthProfile: (healthData: Partial<HealthProfile>) => Promise<void>;
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
  healthProfile: {
    age: 28,
    height: 170,
    weight: 68,
    gender: 'other'
  },
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
      // Ensure all required fields exist and add healthProfile if missing
      return {
        ...DEFAULT_USER_DATA,
        ...parsed,
        healthProfile: {
          ...DEFAULT_USER_DATA.healthProfile,
          ...(parsed.healthProfile || {})
        }
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
        healthProfile: userData.healthProfile, // Preserve existing health profile
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

  const updateHealthProfile = async (healthData: Partial<HealthProfile>) => {
    // Update local state immediately
    setUserDataState(prev => {
      const updated = {
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          ...healthData
        }
      };
      
      // Save to localStorage if not connected to backend
      if (!isBackendConnected) {
        saveUserData(updated);
      }
      
      return updated;
    });

    // If backend is connected, sync with server
    if (isBackendConnected) {
      try {
        const response = await healthProfileService.updateHealthProfile(healthData);
        if (response.success && response.data) {
          // Update local state with server response to ensure consistency
          setUserDataState(prev => ({
            ...prev,
            healthProfile: {
              age: response.data?.age,
              height: response.data?.height,
              weight: response.data?.weight,
              gender: response.data?.gender,
              dateOfBirth: response.data?.dateOfBirth
            }
          }));
        }
      } catch (error) {
        console.error('Failed to sync health profile with backend:', error);
        // Continue with local storage as fallback
      }
    }
  };

  return (
    <UserContext.Provider value={{
      userData,
      updatePoints,
      setUserData,
      updateHealthProfile,
      calculateLevel,
      resetUserData,
      syncWithAuth,
      logEvent
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};