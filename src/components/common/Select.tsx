'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium mb-2 text-text-col"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          className={cn(
            // Base styles
            'w-full px-4 py-3 rounded-lg transition-all duration-200',
            'bg-bg-col border border-text-col/30',
            'text-text-col',
            'focus:outline-none focus:ring-2 focus:ring-accent-col focus:border-transparent',
            'cursor-pointer',

            // Error state
            error && 'border-red-500 focus:ring-red-500',

            className
          )}
          {...props}
        >
          {options.map((option, index) => (
            <option key={`${option.value}-${index}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
