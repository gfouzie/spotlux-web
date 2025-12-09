'use client';

import { forwardRef } from 'react';
import { NavArrowDown } from 'iconoir-react';
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

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              // Base styles matching SearchInput
              'w-full pl-4 pr-10 py-2 bg-component-col text-text-col border border-bg-col rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-accent-col',
              'cursor-pointer appearance-none',

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

          {/* Custom chevron icon positioned like SearchInput clear button */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-col/60 pointer-events-none">
            <NavArrowDown className="w-5 h-5" />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
