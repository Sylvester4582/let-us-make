import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";

/**
 * Component to sync authentication state with user context
 * This ensures that when a user logs in, their data is synced
 */
export const UserSync = () => {
  const { user, isAuthenticated } = useAuth();
  const { syncWithAuth } = useUser();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Sync auth user data to UserContext
      syncWithAuth({
        username: user.username,
        points: user.points,
        level: user.level,
        streak: user.streak
      });
    } else {
      syncWithAuth(null);
    }
  }, [user, isAuthenticated, syncWithAuth]);

  return null; // This component doesn't render anything
};

export default UserSync;