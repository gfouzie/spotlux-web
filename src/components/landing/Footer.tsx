'use client';

import { motion } from 'framer-motion';
import { fadeIn, viewportSettings } from './shared';

export default function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      variants={fadeIn}
      className="py-8 px-6 border-t border-border-col"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-bold text-xl">
          Spot<span className="text-accent-col">lux</span>
        </div>
        <div className="text-text-col/50 text-sm">
          &copy; {new Date().getFullYear()} Spotlux. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
}
