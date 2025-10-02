import React, { createContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

interface AdminContextType {
  isAdmin: boolean;
  adminToken: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken === 'admin-session-token') {
      setIsAdmin(true);
      setAdminToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await adminService.login(username, password);
      setIsAdmin(true);
      setAdminToken(data.token);
      localStorage.setItem('admin_token', data.token);
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminToken(null);
    localStorage.removeItem('admin_token');
  };

  const value = {
    isAdmin,
    adminToken,
    login,
    logout,
    loading,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};