'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Settings, LogOut, ArrowLeft, ArrowRight } from 'iconoir-react';
import { navigationItems } from '@/constants/navigation';
import { superuserNavigationItems } from '@/constants/superuserNavigation';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = '' }: SidebarProps) => {
  const { isAuthenticated, logout } = useAuth();
  const { isSuperuser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  // Get collapsed state directly from localStorage (no state variable)
  const getIsCollapsed = () => {
    if (typeof window === 'undefined') return false;
    const savedState = localStorage.getItem('spotlux-sidebar-collapsed');
    return savedState !== null ? JSON.parse(savedState) : false;
  };

  const isCollapsed = getIsCollapsed();

  // Use a simple counter to force re-renders when localStorage changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshKey, setRefreshKey] = useState(0);

  // Save sidebar state to localStorage when it changes
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    localStorage.setItem('spotlux-sidebar-collapsed', JSON.stringify(newState));
    // Force re-render by updating refresh key
    setRefreshKey((prev) => prev + 1);
  };

  const logoSrc =
    theme === 'light' ? '/spotlux_logo_light.png' : '/spotlux_logo_dark.png';

  const iconSrc =
    theme === 'light' ? '/spotlux_icon_light.png' : '/spotlux_icon_dark.png';

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

  // Reusable navigation item component
  type NavItemType = {
    name: string;
    href: string;
    icon: React.ComponentType<{ width?: number; height?: number }>;
    children?: readonly NavItemType[];
  };

  const NavItem = ({ item }: { item: NavItemType }) => {
    const IconComponent = item.icon;
    const hasChildren = item.children && item.children?.length > 0;

    return (
      <div>
        <Link
          href={item.href}
          className={`flex items-center px-4 py-3 rounded-lg group ${
            isActive(item.href)
              ? 'border-l-4 border-accent-col bg-bg-col/30'
              : 'hover:bg-bg-col/50 hover:border-l-4 hover:border-accent-col/50'
          } ${!isCollapsed ? 'space-x-3' : 'justify-center'} text-text-col`}
          title={isCollapsed ? item.name : undefined}
        >
          <IconComponent width={24} height={24} />
          {!isCollapsed && <span className="font-medium">{item.name}</span>}
        </Link>

        {/* Render child items if they exist and sidebar is not collapsed */}
        {hasChildren && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map((child) => {
              const ChildIconComponent = child.icon;
              return (
                <Link
                  key={child.name}
                  href={child.href}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm ${
                    isActive(child.href)
                      ? 'bg-accent-col/20 text-accent-col'
                      : 'hover:bg-bg-col/30 text-text-col/80 hover:text-text-col'
                  }`}
                >
                  <ChildIconComponent width={20} height={20} />
                  <span className="ml-3">{child.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={`bg-bg-col/80 backdrop-blur-sm border-r border-text-col/20 h-screen flex flex-col transition-all duration-300 relative sticky top-0 ${
        isCollapsed ? 'w-24' : 'w-64'
      } ${className}`}
    >
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={handleToggleCollapse}
        className="cursor-pointer absolute -right-3 top-19 z-10 w-6 h-6 bg-bg-col border border-text-col/20 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:bg-accent-col hover:text-white cursor-pointer"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="text-text-col text-sm font-bold">
          {isCollapsed ? (
            <ArrowRight width={14} height={14} />
          ) : (
            <ArrowLeft width={14} height={14} />
          )}
        </span>
      </button>

      {/* Logo/Brand */}
      <div className="p-6 border-b border-text-col/20 flex items-center justify-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src={isCollapsed ? iconSrc : logoSrc}
            alt="Spotlux"
            width={isCollapsed ? 48 : 180}
            height={isCollapsed ? 48 : 45}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {isSuperuser &&
          superuserNavigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-text-col/20 space-y-2">
        <NavItem
          item={{ name: 'Settings', href: '/settings', icon: Settings }}
        />

        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center px-4 py-3 rounded-lg group cursor-pointer ${
            !isCollapsed ? 'space-x-3' : 'justify-center'
          } text-text-col hover:bg-bg-col/50 hover:border-l-4 hover:border-red-500/50`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut width={24} height={24} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
