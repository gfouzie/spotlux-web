'use client';

import { motion } from 'framer-motion';
import { scaleIn } from './animations';

interface PhoneMockupProps {
  children: React.ReactNode;
  scale?: 'normal' | 'small';
  className?: string;
}

export default function PhoneMockup({
  children,
  scale = 'normal',
  className = '',
}: PhoneMockupProps) {
  const sizeClasses = scale === 'small' ? 'w-36 h-72' : 'w-56 h-[480px]';

  return (
    <motion.div
      variants={scaleIn}
      className={`${sizeClasses} bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl relative ${className}`}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-b-xl z-10" />
      {/* Screen */}
      <div className="relative w-full h-full bg-bg-col rounded-[2rem] overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}
