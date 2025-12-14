import React from 'react';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
  isBuffering: boolean;
  className?: string;
}

/**
 * Video player component with buffering indicator
 *
 * Renders a video element with:
 * - Optimized settings (preload="none", playsInline, autoPlay, loop)
 * - Loading spinner when buffering
 */
export default function VideoPlayer({
  videoRef,
  isMuted,
  isBuffering,
  className = 'w-full h-full object-contain',
}: VideoPlayerProps) {
  return (
    <>
      {/* Video */}
      <video
        ref={videoRef}
        className={className}
        muted={isMuted}
        playsInline
        autoPlay
        loop
        preload="none"
      />

      {/* Video Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
