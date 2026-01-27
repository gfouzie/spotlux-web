'use client';

import { motion } from 'framer-motion';
import { ChatBubble, Group, StatsUpSquare } from 'iconoir-react';
import {
  SocialFeature,
  fadeInUp,
  staggerContainer,
  viewportSettings,
} from './shared';

const socialFeatures = [
  {
    icon: '🔥',
    title: 'React',
    description: '8 emojis to show love (or shade)',
  },
  {
    icon: <ChatBubble className="w-5 h-5" />,
    title: 'Comment',
    description: 'Talk your talk on any clip',
  },
  {
    icon: <Group className="w-5 h-5" />,
    title: 'Connect',
    description: 'Find and follow teammates',
  },
  {
    icon: <StatsUpSquare className="w-5 h-5" />,
    title: 'Compete',
    description: "See who's climbing the ranks",
  },
];

export default function CommunitySection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 text-accent-col text-sm font-medium mb-4"
          >
            <Group className="w-5 h-5" />
            <span>COMMUNITY</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Better with your squad
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-text-col/60 text-lg max-w-2xl mx-auto"
          >
            Connect with teammates, react to highlights, drop comments, and
            build your athletic network. It&apos;s social media that actually
            gets it.
          </motion.p>
        </motion.div>

        {/* Social features grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {socialFeatures.map((feature) => (
            <SocialFeature
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
