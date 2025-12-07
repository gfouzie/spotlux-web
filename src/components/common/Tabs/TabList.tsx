'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pills';
}

const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ variant = 'default', children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(
          'flex overflow-x-auto scrollbar-hide',
          variant === 'default'
            ? 'border-b border-bg-col/50'
            : 'gap-2 p-1 bg-bg-col/30 rounded-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabList.displayName = 'TabList';

export default TabList;
