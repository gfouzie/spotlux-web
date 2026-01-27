'use client';

import { motion } from 'framer-motion';
import { scaleIn } from './animations';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradientClasses: string;
  iconColorClass: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  gradientClasses,
  iconColorClass,
}: FeatureCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-surface-col rounded-2xl p-6 border border-border-col hover:border-accent-col/30 transition-colors"
    >
      <div
        className={`w-12 h-12 bg-gradient-to-br ${gradientClasses} rounded-xl flex items-center justify-center mb-4 ${iconColorClass}`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-text-col/60">{description}</p>
    </motion.div>
  );
}
