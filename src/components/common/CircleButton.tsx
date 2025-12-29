'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CircleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Size of the circular button
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Visual variant (affects background and hover states)
   */
  variant?: 'default' | 'accent' | 'muted';
  /**
   * Icon or content to display in the circle
   */
  children: React.ReactNode;
}

/**
 * CircleButton - Reusable circular button component
 *
 * Use this for:
 * - Icon buttons (mute, close, arrows, etc.)
 * - Number badges in circles
 * - Any circular clickable element
 *
 * @example
 * ```tsx
 * <CircleButton size="md" variant="default" aria-label="Mute">
 *   <VolumeHigh className="w-5 h-5" />
 * </CircleButton>
 * ```
 */
const CircleButton = forwardRef<HTMLButtonElement, CircleButtonProps>(
  (
    {
      size = 'md',
      variant = 'default',
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = cn(
      'inline-flex cursor-pointer items-center justify-center rounded-full',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50'
    );

    // Size variants
    const sizeStyles = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-10 h-10 p-2',
      lg: 'w-12 h-12 p-2.5',
    };

    // Variant styles
    const variantStyles = {
      default: cn(
        'bg-black/50 text-white',
        'hover:bg-black/70 focus:ring-white/50',
        'disabled:bg-black/30'
      ),
      accent: cn(
        'bg-accent-col text-white',
        'hover:bg-accent-col/80 focus:ring-accent-col',
        'disabled:bg-accent-col/50'
      ),
      muted: cn(
        'bg-white/10 text-white',
        'hover:bg-white/20 focus:ring-white/50',
        'disabled:bg-white/5'
      ),
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CircleButton.displayName = 'CircleButton';

export default CircleButton;
