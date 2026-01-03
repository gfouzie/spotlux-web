interface VideoControlsProps {
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  isFirst: boolean;
}

/**
 * Video controls component
 *
 * Includes:
 * - Click zones for desktop navigation
 * - Swipe/drag gestures for navigation (handled in FeedPage)
 *   - Mobile: Touch swipe up/down
 *   - Desktop: Mouse drag up/down
 */
export default function VideoControls({
  onNext,
  onPrevious,
  isFirst,
  currentIndex,
}: VideoControlsProps) {
  return (
    <>
      {/* Click zones for navigation (desktop) */}
      <div
        className="absolute inset-0 hidden md:flex flex-col"
        key={currentIndex}
      >
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
