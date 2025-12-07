'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  keepMounted?: boolean;
}

const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  (
    { isActive = false, keepMounted = false, children, className, ...props },
    ref
  ) => {
    // If not active and not keepMounted, don't render
    if (!isActive && !keepMounted) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        aria-hidden={!isActive}
        className={cn(
          'transition-opacity duration-200',
          isActive ? 'opacity-100' : 'opacity-0 hidden',
          keepMounted && !isActive && 'sr-only',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = 'TabPanel';

export default TabPanel;
