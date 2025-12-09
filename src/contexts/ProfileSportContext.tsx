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
  username?: string; // Optional: if provided, fetches sports for this user instead of current user
}

const SESSION_STORAGE_KEY = 'spotlux-selected-sport';

export function ProfileSportProvider({ children, username }: ProfileSportProviderProps) {
  const { user } = useUser();
  const [userSports, setUserSports] = useState<UserSport[]>([]);

  // For own profile: use session storage persistence
  // For viewing others: use local state only (resets on navigation)
  const isViewingOwnProfile = !username;

  const [selectedSport, setSelectedSportState] = useState<string | null>(() => {
    // Only initialize from session storage when viewing own profile
    if (isViewingOwnProfile && typeof window !== 'undefined') {
      return sessionStorage.getItem(SESSION_STORAGE_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper to update state and conditionally update session storage
  const setSelectedSport = useCallback((sport: string) => {
    setSelectedSportState(sport);
    // Only persist to session storage when viewing own profile
    if (isViewingOwnProfile && typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sport);
    }
  }, [isViewingOwnProfile]);

  const loadSports = useCallback(async () => {
    // If viewing someone else's profile (username provided), always fetch
    // If viewing own profile (no username), require authenticated user
    if (!username && !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Fetch sports for the specified user or current authenticated user
      const sportsData = username
        ? await userSportsApi.getUserSportsByUsername(username)
        : await userSportsApi.getUserSports();
      setUserSports(sportsData);

      if (username) {
        // Viewing someone else's profile: reset to first sport only on initial load
        if (sportsData?.length > 0 && !selectedSport) {
          setSelectedSportState(sportsData[0].sport);
        } else if (sportsData?.length === 0) {
          setSelectedSportState(null);
        }
      } else {
        // Viewing own profile: use session storage logic
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
      }
    } catch (err) {
      console.error('Failed to load user sports:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, username, setSelectedSport]);

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
