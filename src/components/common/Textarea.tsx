'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
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

        <textarea
          ref={ref}
          className={cn(
            // Base styles
            'w-full px-4 py-3 rounded-lg transition-all duration-200',
            'bg-bg-col border border-text-col/30',
            'text-text-col placeholder-text-col/50',
            'focus:outline-none focus:ring-2 focus:ring-accent-col focus:border-transparent',
            'resize-vertical',

            // Error state
            error && 'border-red-500 focus:ring-red-500',

            className
          )}
          {...props}
        />

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
