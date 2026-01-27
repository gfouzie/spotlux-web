'use client';

import { motion } from 'framer-motion';
import { FireFlame } from 'iconoir-react';
import {
  PhoneMockup,
  CheckListItem,
  fadeInUp,
  staggerContainer,
  slideInRight,
  viewportSettings,
} from './shared';

export default function LifestyleSection() {
  return (
    <section className="py-20 px-6 bg-surface-col/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy (reversed on desktop) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            variants={staggerContainer}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 text-green-500 text-sm font-medium mb-4"
            >
              <FireFlame className="w-5 h-5" />
              <span>LIFESTYLE</span>
            </motion.div>
            <motion.h3
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Show the grind
            </motion.h3>
            <motion.p
              variants={fadeInUp}
              className="text-text-col/70 text-lg mb-6"
            >
              Talent is one thing. Dedication is another. Track your daily
              routine - when you wake up, what you eat, how you train. Build
              streaks that prove you&apos;re committed.
            </motion.p>
            <motion.ul variants={staggerContainer} className="space-y-3">
              <CheckListItem accentColor="green-500">
                Daily prompts for wake time, meals, training
              </CheckListItem>
              <CheckListItem accentColor="green-500">
                Build streaks and earn credibility
              </CheckListItem>
              <CheckListItem accentColor="green-500">
                Share or keep private - your choice
              </CheckListItem>
            </motion.ul>
          </motion.div>

          {/* Right: Lifestyle mockup */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            variants={slideInRight}
            className="relative flex justify-center order-1 lg:order-2"
          >
            <PhoneMockup>
              <div className="w-full h-full bg-gradient-to-b from-bg-col to-surface-col p-4">
                {/* Fake lifestyle feed */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={viewportSettings}
                    className="bg-surface-col rounded-xl p-3 border border-border-col"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⏰</span>
                      <span className="text-sm font-medium">Wake Up Time</span>
                    </div>
                    <div className="text-2xl font-bold">6:30 AM</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={viewportSettings}
                    className="bg-surface-col rounded-xl p-3 border border-border-col"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🏋️</span>
                      <span className="text-sm font-medium">
                        Morning Workout
                      </span>
                    </div>
                    <div className="text-sm text-text-col/70">
                      Leg day at the gym
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    viewport={viewportSettings}
                    className="bg-surface-col rounded-xl p-3 border border-border-col"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🥗</span>
                      <span className="text-sm font-medium">Breakfast</span>
                    </div>
                    <div className="aspect-video bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg" />
                  </motion.div>
                </div>

                {/* Streak indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  viewport={viewportSettings}
                  className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FireFlame className="w-5 h-5" />
                      <span className="font-medium">14 day streak!</span>
                    </div>
                    <span className="text-white/70 text-sm">Keep it up</span>
                  </div>
                </motion.div>
              </div>
            </PhoneMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
