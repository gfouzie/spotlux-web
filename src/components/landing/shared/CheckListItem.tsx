'use client';

import { motion } from 'framer-motion';
import { fadeInUp } from './animations';

interface CheckListItemProps {
  children: React.ReactNode;
  accentColor?: string;
}

export default function CheckListItem({
  children,
  accentColor = 'accent-col',
}: CheckListItemProps) {
  const bgColorClass =
    accentColor === 'green-500' ? 'bg-green-500/20' : 'bg-accent-col/20';
  const textColorClass =
    accentColor === 'green-500' ? 'text-green-500' : 'text-accent-col';

  return (
    <motion.li variants={fadeInUp} className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full ${bgColorClass} flex items-center justify-center flex-shrink-0`}
      >
        <span className={`${textColorClass} text-sm`}>✓</span>
      </div>
      <span className="text-text-col/70">{children}</span>
    </motion.li>
  );
}
