'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import { fadeInUp, staggerContainer, viewportSettings } from './shared';

export default function CTASection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-accent-col/10 via-surface-col to-surface-col">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportSettings}
        variants={staggerContainer}
        className="max-w-3xl mx-auto text-center"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold mb-4"
        >
          Ready to join?
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-text-col/60 text-lg mb-8"
        >
          Stop lurking. Start competing. Your highlights deserve an audience.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <Link href="/register">
            <Button variant="primary" size="lg" className="px-12">
              Create your profile
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
