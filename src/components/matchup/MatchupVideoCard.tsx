'use client';

import { RefObject } from 'react';

interface MatchupVideoCardProps {
  /**
   * Card identifier (A or B)
   */
  label: 'A' | 'B';
  /**
   * Video element ref for playback control
   */
  videoRef: RefObject<HTMLVideoElement | null>;
  /**
   * Video URL to display
   */
  videoUrl?: string;
  /**
   * Highlight ID for loading state display
   */
  highlightId: number;
  /**
   * Whether this card is currently active
   */
  isActive: boolean;
  /**
   * Whether video should be muted
   */
  isMuted: boolean;
  /**
   * Click handler to activate this card
   */
  onClick: () => void;
  /**
   * CSS positioning (top-left or bottom-right)
   */
  position: 'top-left' | 'bottom-right';
}

/**
 * MatchupVideoCard - Individual video card in the head-to-head matchup
 *
 * Displays a single highlight video with loading state, active styling, and click interaction.
 */
export default function MatchupVideoCard({
  label,
  videoRef,
  videoUrl,
  highlightId,
  isActive,
  isMuted,
  onClick,
  position,
}: MatchupVideoCardProps) {
  const positionStyles = position === 'top-left'
    ? { top: '8%', left: '8%' }
    : { bottom: '8%', right: '8%' };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer absolute w-[65%] h-[75%] rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
        isActive
          ? 'z-20 scale-105 ring-4 ring-accent-col/50'
          : 'z-10 scale-100 opacity-90'
      }`}
      style={positionStyles}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted={isMuted}
          playsInline
          preload="metadata"
        />
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-white/60 text-sm">Loading Highlight {label}...</p>
              <p className="text-white/40 text-xs">ID: {highlightId}</p>
            </div>
          </div>
          <video
            ref={videoRef}
            className="w-full h-full object-cover opacity-0"
            muted={isMuted}
            playsInline
            preload="metadata"
          />
        </>
      )}

      {/* Card Label */}
      <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full z-10">
        <span className="text-white text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
