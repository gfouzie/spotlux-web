'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { Settings, LogOut } from 'iconoir-react';
import { navigationItems } from '@/constants/navigation';

interface MobileNavProps {
  className?: string;
}

const MobileNav = ({ className = '' }: MobileNavProps) => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const logoSrc =
    theme === 'light' ? '/spotlux_logo_light.png' : '/spotlux_logo_dark.png';

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (href: string) => {
    // Exact match for home and profile
    if (href === '/' || href === '/profile') {
      return pathname === href;
    }
    // Prefix match for other routes
    return pathname.startsWith(href);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Top Header */}
      <div
        className={`bg-bg-col/80 backdrop-blur-sm border-b border-text-col/20 ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-1.5">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src={logoSrc}
              alt="Spotlux"
              width={100}
              height={24}
              className="object-contain"
              priority
            />
          </Link>

          {/* Settings and Logout */}
          <div className="flex items-center space-x-2">
            <Link
              href="/settings"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/settings')
                  ? 'bg-accent-col/20 text-accent-col'
                  : 'text-text-col hover:bg-bg-col/50'
              }`}
              title="Settings"
            >
              <Settings width={20} height={20} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer p-2 rounded-lg text-text-col hover:bg-red-500/20 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut width={20} height={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-col/80 backdrop-blur-sm border-t border-text-col/20 lg:hidden z-40">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors relative ${
                  isActive(item.href)
                    ? 'text-text-col'
                    : 'text-text-col hover:text-accent-col/70'
                }`}
              >
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-accent-col rounded-t-full" />
                )}
                <IconComponent width={24} height={24} />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNav;
