'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoggedInHeader from './LoggedInHeader';
import LoggedOutHeader from './LoggedOutHeader';

export default function Header() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header className="flex justify-between items-center p-6 lg:px-12 bg-bg-col text-text-col">
        <div className="w-[180px] h-[45px] bg-text-col/10 rounded animate-pulse"></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-8 bg-text-col/10 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-text-col/10 rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

  return isAuthenticated ? <LoggedInHeader /> : <LoggedOutHeader />;
}
