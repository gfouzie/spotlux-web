'use client';

import { motion } from 'framer-motion';
import { scaleIn } from './animations';

interface SocialFeatureProps {
  icon: React.ReactNode | string;
  title: string;
  description: string;
}

export default function SocialFeature({
  icon,
  title,
  description,
}: SocialFeatureProps) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="text-center p-6 rounded-xl bg-surface-col/50 border border-border-col"
    >
      <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-2xl">
        {typeof icon === 'string' ? (
          icon
        ) : (
          <span className="text-accent-col">{icon}</span>
        )}
      </div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-text-col/50 text-sm">{description}</p>
    </motion.div>
  );
}
