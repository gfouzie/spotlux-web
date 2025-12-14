import { NavArrowUp, NavArrowDown, SoundOff, SoundHigh } from 'iconoir-react';

interface VideoControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  total: number;
  hasMore: boolean;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Video controls component
 *
 * Includes:
 * - Mute/unmute button (top-left)
 * - Video counter (top-right)
 * - Navigation arrows (top/bottom center)
 * - Click zones for desktop navigation
 */
export default function VideoControls({
  isMuted,
  onToggleMute,
  onNext,
  onPrevious,
  currentIndex,
  total,
  hasMore,
  isFirst,
  isLast,
}: VideoControlsProps) {
  return (
    <>
      {/* Mute/Unmute Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          type="button"
          onClick={onToggleMute}
          className="cursor-pointer p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <SoundOff className="w-5 h-5 text-white" />
          ) : (
            <SoundHigh className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Video Counter */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 rounded-full px-3 py-1">
        <span className="text-white text-sm">
          {currentIndex + 1} / {total}
          {hasMore && '+'}
        </span>
      </div>

      {/* Navigation Arrows */}
      {!isFirst && (
        <button
          type="button"
          onClick={onPrevious}
          className="cursor-pointer absolute left-1/2 top-20 -translate-x-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
          aria-label="Previous"
        >
          <NavArrowUp className="w-6 h-6 text-white" />
        </button>
      )}

      {!isLast && (
        <button
          type="button"
          onClick={onNext}
          className="cursor-pointer absolute left-1/2 bottom-24 -translate-x-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
          aria-label="Next"
        >
          <NavArrowDown className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Click zones for navigation (desktop) */}
      <div className="absolute inset-0 hidden md:flex flex-col">
        <div
          className="flex-1 cursor-pointer"
          onClick={onPrevious}
          style={{ visibility: isFirst ? 'hidden' : 'visible' }}
        />
        <div className="flex-1 cursor-pointer" onClick={onNext} />
      </div>
    </>
  );
}
