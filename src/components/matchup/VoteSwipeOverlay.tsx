'use client';

import { Check } from 'iconoir-react';

interface VoteSwipeOverlayProps {
  direction: 'left' | 'right';
  opacity: number;
  username: string;
}

/**
 * VoteSwipeOverlay - Visual feedback during swipe voting
 *
 * Shows "VOTE FOR @username" with checkmark as user swipes.
 * Opacity increases as swipe threshold is approached.
 */
export default function VoteSwipeOverlay({
  direction,
  opacity,
  username,
}: VoteSwipeOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none z-20"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-accent-col flex items-center justify-center">
          <Check className="w-8 h-8 text-black" strokeWidth={3} />
        </div>
        <div className="text-center">
          <p className="text-white/80 text-sm uppercase tracking-wider">
            Vote for
          </p>
          <p className="text-white text-xl font-bold">@{username}</p>
        </div>
        <div className="mt-2">
          <p className="text-white/60 text-xs">
            {direction === 'left' ? '← Release to vote' : 'Release to vote →'}
          </p>
        </div>
      </div>
    </div>
  );
}
