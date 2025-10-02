import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Check if user is logged in and is the admin
  const isAdminUser = user?.email === 'admin@youmatter.com';
  
  if (!user) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdminUser) {
    // User is logged in but not admin, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is admin, allow access
  return <>{children}</>;
};

export default AdminRoute;