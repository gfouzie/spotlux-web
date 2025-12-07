'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { profileApi, type UserProfile } from '@/api/profile';
import { useAuth } from './AuthContext';

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await profileApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (isAuthenticated) {
      await fetchUserData();
    }
  }, [isAuthenticated, fetchUserData]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    } else if (!authLoading) {
      setUser(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchUserData]);

  const value: UserContextType = {
    user,
    isLoading,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const useUser = () => {
  const { user, isLoading, refreshUser } = useUserContext();
  return {
    user,
    isLoading,
    isSuperuser: user?.isSuperuser ?? false,
    refreshUser,
  };
};
