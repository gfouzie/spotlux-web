"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { userSportsApi, UserSport } from "@/api/userSports";

interface ProfileSportContextType {
  userSports: UserSport[];
  selectedSport: string | null;
  setSelectedSport: (sport: string) => void;
  isLoading: boolean;
  refreshSports: () => Promise<void>;
}

const ProfileSportContext = createContext<ProfileSportContextType | undefined>(undefined);

interface ProfileSportProviderProps {
  children: ReactNode;
}

export function ProfileSportProvider({ children }: ProfileSportProviderProps) {
  const [userSports, setUserSports] = useState<UserSport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSports = useCallback(async () => {
    try {
      setIsLoading(true);
      const sportsData = await userSportsApi.getUserSports();
      setUserSports(sportsData);

      // Set first sport as selected if available and nothing is selected
      if (sportsData?.length > 0 && !selectedSport) {
        setSelectedSport(sportsData[0].sport);
      } else if (sportsData?.length === 0) {
        setSelectedSport(null);
      } else if (selectedSport && !sportsData?.find(s => s.sport === selectedSport)) {
        // If current selected sport was removed, switch to first available
        setSelectedSport(sportsData[0]?.sport || null);
      }
    } catch (err) {
      console.error("Failed to load user sports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSport]);

  const refreshSports = useCallback(async () => {
    await loadSports();
  }, [loadSports]);

  useEffect(() => {
    loadSports();
  }, []);

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
    throw new Error("useProfileSport must be used within a ProfileSportProvider");
  }
  return context;
}
