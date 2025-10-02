import { createContext, useState, ReactNode, useContext } from "react";
import { eventService, EventResponse, EventType } from '@/services/eventService';
import { pointsService } from '@/services/pointsService';
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
  // Fitness-related data
  targetWeight?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoalType?: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  preferredExerciseTypes?: string[]; // Exercise types as strings for simpler storage
  availableTimePerDay?: number; // minutes per day
  workoutDaysPerWeek?: number;
  hasCompletedFitnessSetup?: boolean;
  fitnessGoalCreatedAt?: string;
  fitnessGoalUpdatedAt?: string;
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
  getFitnessGoalFromProfile: () => object | null; // Returns UserFitnessGoal or null
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
    gender: 'other',
    // Fitness defaults
    fitnessLevel: 'beginner',
    fitnessGoalType: 'general_fitness',
    preferredExerciseTypes: [],
    availableTimePerDay: 30,
    workoutDaysPerWeek: 3,
    hasCompletedFitnessSetup: false
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
    console.log('=== UPDATE POINTS DEBUG ===');
    console.log('Points to add:', pointsToAdd);
    console.log('Event type:', eventType);
    console.log('Backend connected:', isBackendConnected);
    
    // Always update locally first for immediate UI feedback
    updatePointsLocally(pointsToAdd);
    
    // Also try to save to database via points service
    try {
      console.log('Attempting database sync...');
      const dbResponse = await pointsService.addPoints(pointsToAdd);
      console.log('Database response:', dbResponse);
      
      if (dbResponse.success && dbResponse.data) {
        // Update state with database response to ensure consistency
        setUserDataState(prev => {
          const updatedData = {
            ...prev,
            points: dbResponse.data!.totalPoints,
            level: dbResponse.data!.level,
            levelTitle: calculateLevel(dbResponse.data!.totalPoints).levelTitle
          };
          
          saveUserData(updatedData);
          
          // Also update AuthContext if authenticated
          if (authContext && authContext.isAuthenticated) {
            authContext.updateUserPoints(dbResponse.data!.totalPoints, dbResponse.data!.level);
          }
          
          return updatedData;
        });
        console.log('=== END UPDATE POINTS DEBUG (Database Success) ===');
      } else {
        console.log('Database sync failed:', dbResponse.message);
        console.log('=== END UPDATE POINTS DEBUG (Database Failed, Local Kept) ===');
      }
    } catch (error) {
      console.error('Database sync error:', error);
      console.log('=== END UPDATE POINTS DEBUG (Database Error, Local Kept) ===');
    }
    
    // For backward compatibility, still try event service if eventType provided
    if (isBackendConnected && eventType) {
      try {
        console.log('Also attempting event service sync...');
        const eventResponse = await eventService.logEvent(eventType);
        console.log('Event service response:', eventResponse);
        return eventResponse;
      } catch (error) {
        console.error('Event service error:', error);
      }
    }
    
    return null;
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
    console.log('=== LOCAL POINTS UPDATE ===');
    console.log('Adding points locally:', pointsToAdd);
    console.log('Current points:', userData.points);
    
    setUserDataState(prev => {
      const newPoints = prev.points + pointsToAdd;
      const { level, levelTitle } = calculateLevel(newPoints);
      
      const updatedData = {
        ...prev,
        points: newPoints,
        level,
        levelTitle
      };
      
      console.log('New points:', newPoints);
      console.log('Updated data:', updatedData);
      
      // Save to localStorage if not connected to backend
      if (!isBackendConnected) {
        console.log('Saving to localStorage (backend not connected)');
        saveUserData(updatedData);
      } else {
        console.log('Not saving to localStorage (backend connected)');
      }
      
      console.log('=== END LOCAL POINTS UPDATE ===');
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

  const getFitnessGoalFromProfile = () => {
    const hp = userData.healthProfile;
    
    if (!hp.hasCompletedFitnessSetup || !hp.weight) {
      return null;
    }

    // Calculate BMI if height is available
    const currentBMI = hp.height && hp.weight 
      ? hp.weight / Math.pow(hp.height / 100, 2) 
      : 0;

    return {
      id: `profile-goal-${userData.username}`,
      type: hp.fitnessGoalType || 'general_fitness',
      currentWeight: hp.weight,
      targetWeight: hp.targetWeight,
      currentBMI,
      targetBMI: hp.targetWeight && hp.height 
        ? hp.targetWeight / Math.pow(hp.height / 100, 2) 
        : currentBMI,
      preferredExerciseTypes: hp.preferredExerciseTypes || [],
      fitnessLevel: hp.fitnessLevel || 'beginner',
      availableTime: hp.availableTimePerDay || 30,
      daysPerWeek: hp.workoutDaysPerWeek || 3,
      createdAt: hp.fitnessGoalCreatedAt ? new Date(hp.fitnessGoalCreatedAt) : new Date(),
      updatedAt: hp.fitnessGoalUpdatedAt ? new Date(hp.fitnessGoalUpdatedAt) : new Date()
    };
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
      logEvent,
      getFitnessGoalFromProfile
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