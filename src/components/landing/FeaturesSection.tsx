'use client';

import { motion } from 'framer-motion';
import { Trophy, Calendar, MediaVideo } from 'iconoir-react';
import {
  FeatureCard,
  fadeInUp,
  staggerContainer,
  viewportSettings,
} from './shared';

const features = [
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Go head-to-head',
    description:
      "Put your clips up against friends. Community votes decide who takes the W. May the best highlight win.",
    gradientClasses: 'from-yellow-500/20 to-orange-500/20',
    iconColorClass: 'text-yellow-500',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Track your grind',
    description:
      "Log your wake-ups, workouts, and everything in between. Build streaks. Show the world you're putting in work.",
    gradientClasses: 'from-green-500/20 to-emerald-500/20',
    iconColorClass: 'text-green-500',
  },
  {
    icon: <MediaVideo className="w-6 h-6" />,
    title: 'Build your reel',
    description:
      'Your best moments, organized. Create highlight reels that actually show what you can do on the field.',
    gradientClasses: 'from-blue-500/20 to-cyan-500/20',
    iconColorClass: 'text-blue-500',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-surface-col/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Not your typical sports app
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-text-col/60 text-lg max-w-2xl mx-auto"
          >
            We built what we actually wanted to use. No cringe. No clutter. Just
            the stuff that matters.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradientClasses={feature.gradientClasses}
              iconColorClass={feature.iconColorClass}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
