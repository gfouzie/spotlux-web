'use client';

import { cn } from '@/lib/utils';
import { Xmark } from 'iconoir-react';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const Alert = ({
  variant = 'info',
  children,
  className,
  onClose,
}: AlertProps) => {
  const variantStyles = {
    error: 'bg-red-500/10 border-red-500 text-red-500',
    success: 'bg-green-500/10 border-green-500 text-green-500',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-500',
    info: 'bg-blue-500/10 border-blue-500 text-blue-500',
  };

  return (
    <div
      className={cn(
        'p-4 rounded border relative',
        variantStyles[variant],
        className
      )}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-2 right-2 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label="Close alert"
        >
          <Xmark className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
