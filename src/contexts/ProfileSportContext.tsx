'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { userSportsApi, UserSport } from '@/api/userSports';
import { useUser } from '@/contexts/UserContext';

interface ProfileSportContextType {
  userSports: UserSport[];
  selectedSport: string | null;
  setSelectedSport: (sport: string) => void;
  isLoading: boolean;
  refreshSports: () => Promise<void>;
}

const ProfileSportContext = createContext<ProfileSportContextType | undefined>(
  undefined
);

interface ProfileSportProviderProps {
  children: ReactNode;
}

const SESSION_STORAGE_KEY = 'spotlux-selected-sport';

export function ProfileSportProvider({ children }: ProfileSportProviderProps) {
  const { user } = useUser();
  const [userSports, setUserSports] = useState<UserSport[]>([]);
  const [selectedSport, setSelectedSportState] = useState<string | null>(() => {
    // Initialize from session storage
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(SESSION_STORAGE_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper to update both state and session storage
  const setSelectedSport = useCallback((sport: string) => {
    setSelectedSportState(sport);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sport);
    }
  }, []);

  const loadSports = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const sportsData = await userSportsApi.getUserSports();
      setUserSports(sportsData);

      // Set first sport as selected if available and nothing is selected
      if (sportsData?.length > 0 && !selectedSport) {
        setSelectedSport(sportsData[0].sport);
      } else if (sportsData?.length === 0) {
        // Clear selection when no sports
        setSelectedSportState(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } else if (
        selectedSport &&
        !sportsData?.find((s) => s.sport === selectedSport)
      ) {
        // If current selected sport was removed, switch to first available
        if (sportsData[0]?.sport) {
          setSelectedSport(sportsData[0].sport);
        } else {
          setSelectedSportState(null);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user sports:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedSport, setSelectedSport]);

  const refreshSports = useCallback(async () => {
    await loadSports();
  }, [loadSports]);

  useEffect(() => {
    loadSports();
  }, [loadSports]);

  return (
    <ProfileSportContext.Provider
      value={{
        userSports,
        selectedSport,
        setSelectedSport,
        isLoading,
        refreshSports,
      }}
    >
      {children}
    </ProfileSportContext.Provider>
  );
}

export function useProfileSport() {
  const context = useContext(ProfileSportContext);
  if (context === undefined) {
    throw new Error(
      'useProfileSport must be used within a ProfileSportProvider'
    );
  }
  return context;
}
