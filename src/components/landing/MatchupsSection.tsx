'use client';

import { motion } from 'framer-motion';
import { Medal1st, MediaVideo } from 'iconoir-react';
import {
  PhoneMockup,
  CheckListItem,
  fadeInUp,
  staggerContainer,
  slideInLeft,
  pulse,
  viewportSettings,
} from './shared';

export default function MatchupsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Matchup mockup */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            variants={slideInLeft}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Two phones showing matchup */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                className="flex gap-4"
              >
                <PhoneMockup scale="small">
                  <div className="w-full h-full bg-gradient-to-b from-bg-col to-surface-col flex flex-col items-center justify-center p-4">
                    <div className="aspect-[9/14] w-full bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-lg flex items-center justify-center mb-2">
                      <MediaVideo className="w-8 h-8 text-red-500/40" />
                    </div>
                    <div className="text-xs text-text-col/50">Player A</div>
                  </div>
                </PhoneMockup>
                <PhoneMockup scale="small">
                  <div className="w-full h-full bg-gradient-to-b from-bg-col to-surface-col flex flex-col items-center justify-center p-4">
                    <div className="aspect-[9/14] w-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg flex items-center justify-center mb-2">
                      <MediaVideo className="w-8 h-8 text-blue-500/40" />
                    </div>
                    <div className="text-xs text-text-col/50">Player B</div>
                  </div>
                </PhoneMockup>
              </motion.div>

              {/* VS badge */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={pulse}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-col text-white font-bold px-4 py-2 rounded-full shadow-lg"
              >
                VS
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 text-accent-col text-sm font-medium mb-4"
            >
              <Medal1st className="w-5 h-5" />
              <span>MATCHUPS</span>
            </motion.div>
            <motion.h3
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Settle the debate
            </motion.h3>
            <motion.p
              variants={fadeInUp}
              className="text-text-col/70 text-lg mb-6"
            >
              No more arguing about who had the better play. Upload your
              highlights, get matched with similar clips, and let the community
              decide. Your ELO rating tracks your wins.
            </motion.p>
            <motion.ul variants={staggerContainer} className="space-y-3">
              <CheckListItem>Fair matchups based on skill rating</CheckListItem>
              <CheckListItem>React with fire, laugh, or cry</CheckListItem>
              <CheckListItem>Climb the leaderboard</CheckListItem>
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
