'use client';

import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import './input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, icon, rightIcon, className, type = 'text', ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full min-w-0">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-xs lg:text-sm font-medium mb-1.5 lg:mb-2 text-text-col"
          >
            {label}
          </label>
        )}

        <div className="relative w-full min-w-0">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-col/60">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            autoComplete="off"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              // Base styles
              'spotlux-input', // ← Component-specific class for autofill styles
              'w-full px-3 py-2 lg:px-4 lg:py-3 rounded-lg transition-all duration-200',
              'bg-bg-col border border-text-col/30',
              'text-sm lg:text-base text-text-col placeholder-text-col/50',
              'focus:outline-none focus:ring-2 focus:ring-accent-col focus:border-transparent',

              // Icon padding
              icon && 'pl-10',

              // Right icon padding
              rightIcon && 'pr-12',

              // Error state
              error && 'border-red-500 focus:ring-red-500',

              // Focus state
              isFocused && 'bg-text-col/15',

              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
