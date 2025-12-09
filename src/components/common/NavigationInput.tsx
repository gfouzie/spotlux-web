'use client';

import React from 'react';
import { NavArrowRight } from 'iconoir-react';

interface NavigationInputProps {
  label: string;
  value?: string;
  placeholder: string;
  onClick: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * A pseudo-input that looks like a regular input but navigates to another screen on click.
 * Used for multi-step selection flows (e.g., selecting a league, team, or position).
 */
const NavigationInput: React.FC<NavigationInputProps> = ({
  label,
  value,
  placeholder,
  onClick,
  error,
  required = false,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text-col mb-2">
        {label} {required && '*'}
      </label>
      <div
        onClick={disabled ? undefined : onClick}
        className={`w-full px-4 py-3 rounded-lg bg-bg-col border border-text-col/30 text-text-col transition-colors flex items-center justify-between ${
          disabled
            ? 'opacity-60 cursor-not-allowed'
            : 'cursor-pointer hover:bg-bg-col/80'
        }`}
      >
        <span className={value ? 'text-text-col' : 'text-text-col/50'}>
          {value || placeholder}
        </span>
        <NavArrowRight className="w-5 h-5 text-text-col/60" />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default NavigationInput;
