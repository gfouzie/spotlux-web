'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import { FireFlame, MediaVideo, ChatBubble, Trophy } from 'iconoir-react';
import {
  PhoneMockup,
  fadeInUp,
  staggerContainer,
  slideInRight,
  float,
  viewportSettings,
} from './shared';

export default function HeroSection() {
  return (
    <section className="relative px-6 pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-col/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-accent-col/10 text-accent-col px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <FireFlame className="w-4 h-4" />
              <span>Where athletes actually hang out</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Your highlights.
              <br />
              <span className="text-accent-col">Your lifestyle.</span>
              <br />
              Your crew.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-text-col/70 mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Compete in head-to-head matchups, flex your daily grind, and build
              the highlight reel that shows who you really are.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  Join the squad
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  Sign in
                </Button>
              </Link>
            </motion.div>

            {/* Social proof hint */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex items-center gap-3 justify-center lg:justify-start text-text-col/50 text-sm"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-col/60 to-accent-col/30 border-2 border-surface-col"
                  />
                ))}
              </div>
              <span>Athletes are already competing</span>
            </motion.div>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            variants={slideInRight}
            className="relative flex justify-center lg:justify-end"
          >
            <PhoneMockup>
              {/* Placeholder for feed screenshot */}
              <div className="w-full h-full bg-gradient-to-b from-bg-col to-surface-col flex flex-col">
                {/* Fake feed items */}
                <div className="p-3 border-b border-border-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-accent-col/30" />
                    <div className="h-3 w-20 bg-text-col/20 rounded" />
                  </div>
                  <div className="aspect-[9/12] bg-gradient-to-br from-accent-col/20 to-accent-col/5 rounded-lg flex items-center justify-center">
                    <MediaVideo className="w-12 h-12 text-accent-col/40" />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-text-col/50">
                      <span>🔥</span>
                      <span>24</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-col/50">
                      <ChatBubble className="w-3 h-3" />
                      <span>8</span>
                    </div>
                  </div>
                </div>
              </div>
            </PhoneMockup>

            {/* Floating elements */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={float}
              className="absolute -left-4 top-1/4 bg-surface-col rounded-xl p-3 shadow-lg border border-border-col hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <FireFlame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-text-col/50">Streak</div>
                  <div className="font-bold text-lg">14 days</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="initial"
              animate="animate"
              variants={float}
              style={{ animationDelay: '1s' }}
              className="absolute -right-4 bottom-1/3 bg-surface-col rounded-xl p-3 shadow-lg border border-border-col hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-accent-col" />
                <span className="font-medium">You won!</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
