import { createContext, useState, useEffect, ReactNode } from "react";
import { authService, User } from "../services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; errors?: string[] }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; errors?: string[] }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateUserPoints: (newPoints: number, newLevel?: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const result = await authService.getProfile();
          if (result.success && result.user) {
            setUser(result.user);
          } else {
            // Invalid token, clear auth
            authService.logout();
            setUser(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          authService.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login({ email, password });
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        return { success: true };
      }
      
      return {
        success: false,
        errors: result.errors || [result.message || 'Login failed']
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Network error during login']
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.register({ username, email, password });
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        return { success: true };
      }
      
      return {
        success: false,
        errors: result.errors || [result.message || 'Registration failed']
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Network error during registration']
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (authService.isAuthenticated()) {
      try {
        const result = await authService.getProfile();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  const updateUserPoints = (newPoints: number, newLevel?: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        points: newPoints,
        level: newLevel || user.level
      };
      setUser(updatedUser);
      // Also update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
      updateUserPoints
    }}>
      {children}
    </AuthContext.Provider>
  );
};