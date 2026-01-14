'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HomeRefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
}

const HomeRefreshContext = createContext<HomeRefreshContextType | undefined>(
  undefined
);

export function HomeRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <HomeRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </HomeRefreshContext.Provider>
  );
}

export function useHomeRefresh() {
  const context = useContext(HomeRefreshContext);
  if (context === undefined) {
    throw new Error('useHomeRefresh must be used within a HomeRefreshProvider');
  }
  return context;
}
