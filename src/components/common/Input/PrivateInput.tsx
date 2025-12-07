'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeClosed } from 'iconoir-react';
import Input, { type InputProps } from './index';

interface PrivateInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean;
}

const PrivateInput = forwardRef<HTMLInputElement, PrivateInputProps>(
  ({ showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleButton = showPasswordToggle ? (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-text-col/60 hover:text-text-col transition-colors cursor-pointer"
      >
        {showPassword ? (
          <EyeClosed width={20} height={20} />
        ) : (
          <Eye width={20} height={20} />
        )}
      </button>
    ) : undefined;

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={toggleButton}
        {...props}
      />
    );
  }
);

PrivateInput.displayName = 'PrivateInput';

export default PrivateInput;
