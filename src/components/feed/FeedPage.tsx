'use client';

import { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useFeedData } from '@/hooks/useFeedData';
import { useBufferedVideos } from '@/hooks/useBufferedVideos';
import { useVideoNavigation } from '@/hooks/useVideoNavigation';
import { useHighlightReactions } from '@/hooks/useHighlightReactions';
import { EmojiId } from '@/api/reactions';
import VideoControls from './VideoControls';
import VideoOverlay from './VideoOverlay';
import ReactionPanel from './ReactionPanel';
import ReactionModal from './ReactionModal';
import MatchupCard from '@/components/matchup/MatchupCard';

export default function FeedPage() {
  const [isMuted, setIsMuted] = useState(false);
  const isTrackingView = useRef(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isReactionModalOpen, setIsReactionModalOpen] = useState(false);

  // Feed data management
  const {
    feedItems,
    isLoading,
    hasMore,
    error,
    currentIndex,
    setCurrentIndex,
    loadInitialHighlights,
    trackView,
  } = useFeedData();

  const currentItem = feedItems?.[currentIndex];

  // Navigation
  const { goToNext, goToPrevious, isFirst, isLast } = useVideoNavigation({
    currentIndex,
    totalItems: feedItems.length,
    onNavigate: setCurrentIndex,
  });

  // Buffered video management for smooth infinite scroll
  const { getVideoRef, isInBufferRange } = useBufferedVideos({
    currentIndex,
    feedItemsLength: feedItems.length,
    bufferRange: 1,
  });

  // Reactions for current highlight (only for highlight items, not matchups)
  const currentHighlightId =
    currentItem?.type === 'highlight' ? currentItem.data.id : null;
  const {
    reactions,
    isLoading: reactionsLoading,
    addReaction,
    removeReaction,
  } = useHighlightReactions(currentHighlightId);

  // Track view when item changes (only for highlights)
  // Note: Matchup highlights are auto-marked as viewed server-side when they appear in the feed
  useEffect(() => {
    if (!currentItem || isTrackingView.current) return;

    // Only track individual highlights (matchups are auto-tracked server-side)
    if (currentItem.type === 'highlight') {
      isTrackingView.current = true;
      trackView(currentItem.data.id).finally(() => {
        isTrackingView.current = false;
      });
    }
  }, [currentItem, trackView]);

  const toggleMute = () => {
    const currentVideoRef = getVideoRef(currentIndex);
    if (currentVideoRef.current) {
      currentVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Calculate available viewport height accounting for header and footer
  // Mobile: Header ~36px, Footer ~54px, Parent padding-bottom: 56px (pb-14)
  // Content should fit: viewport - header - footer = viewport - 90px
  // Parent's pb-14 creates space below us, so we don't need to account for it in our height
  const HEADER_HEIGHT = 36; // px
  const FOOTER_HEIGHT = 54; // px
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      if (typeof window === 'undefined') return 0;
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Full viewport minus header minus footer
        return window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
      }

      // Desktop: full viewport
      return window.innerHeight;
    };

    setContainerHeight(calculateHeight());

    const handleResize = () => {
      setContainerHeight(calculateHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const targetScrollY = -currentIndex * containerHeight;

  // Sync scroll position when currentIndex changes (without animation during drag)
  useEffect(() => {
    if (!isSnapping) {
      setScrollPosition(targetScrollY);
    }
  }, [currentIndex, targetScrollY, isSnapping]);

  // Reaction handlers
  const handleReact = async (emojiId: EmojiId) => {
    await addReaction(emojiId);
  };

  const handleRemoveReaction = async () => {
    await removeReaction();
  };

  // Swipe/drag handlers for infinite scroll navigation
  // Note: Feed handles vertical (up/down) swipes, matchups handle horizontal (left/right) swipes
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      // Update scroll position as user swipes (relative to current index position)
      const delta = eventData.deltaY;
      setScrollPosition(targetScrollY + delta);
    },
    onSwipedUp: () => {
      if (!isLast) {
        setIsSnapping(true);
        // Animate to next position first
        const nextTargetY = -(currentIndex + 1) * containerHeight;
        setScrollPosition(nextTargetY);
        // Update index after animation completes
        setTimeout(() => {
          goToNext();
          setIsSnapping(false);
        }, 300);
      } else if (!hasMore) {
        // On last item with no more content - show "all caught up" screen
        setIsSnapping(true);
        const nextTargetY = -(currentIndex + 1) * containerHeight;
        setScrollPosition(nextTargetY);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setIsSnapping(false);
        }, 300);
      } else {
        // Snap back to current position (still loading more content)
        setScrollPosition(targetScrollY);
      }
    },
    onSwipedDown: () => {
      if (!isFirst) {
        setIsSnapping(true);
        // Animate to previous position first
        const prevTargetY = -(currentIndex - 1) * containerHeight;
        setScrollPosition(prevTargetY);
        // Update index after animation completes
        setTimeout(() => {
          goToPrevious();
          setIsSnapping(false);
        }, 300);
      } else {
        // Snap back to current position
        setScrollPosition(targetScrollY);
      }
    },
    onSwiped: () => {
      // Snap back to current position if swipe didn't meet threshold
      setScrollPosition(targetScrollY);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 50,
  });

  // Loading state
  if (isLoading && feedItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-col">Loading feed...</div>
      </div>
    );
  }

  // Error state
  if (error && feedItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-text-col mb-4">{error}</p>
          <button
            type="button"
            onClick={loadInitialHighlights}
            className="cursor-pointer px-4 py-2 bg-accent-col text-white rounded-md hover:bg-accent-col/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no content at all
  if (!isLoading && feedItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-text-col">
          <p className="mb-2">No content to show</p>
          <p className="text-sm text-text-col/60">
            Follow friends or wait for public content
          </p>
        </div>
      </div>
    );
  }

  // Empty state - all caught up (viewed all available content)
  // Show when user has scrolled past the last item
  if (
    !isLoading &&
    feedItems.length > 0 &&
    !hasMore &&
    currentIndex >= feedItems.length
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center text-white px-6">
          <div className="text-6xl mb-4">✓</div>
          <p className="text-xl font-semibold mb-2">
            You&apos;re all caught up!
          </p>
          <p className="text-sm text-white/60 mb-6">
            Check back later for new content
          </p>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0); // Return to start
            }}
            className="cursor-pointer px-6 py-3 bg-accent-col text-white rounded-full hover:bg-accent-col/80"
          >
            Back to Top
          </button>
        </div>
      </div>
    );
  }

  // Handle matchup vote completion
  const handleMatchupVote = (highlightId: number) => {
    // Move to next item after voting
    goToNext();
  };

  // Render a single feed item at a specific index
  const renderFeedItemAtIndex = (index: number) => {
    const item = feedItems[index];
    if (!item) return null;

    const isCurrentItem = index === currentIndex;
    const inBuffer = isInBufferRange(index);

    // Render matchup
    if (item.type === 'matchup') {
      return (
        <div
          key={`feed-item-${index}`}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            top: `${index * containerHeight}px`,
            height: `${containerHeight}px`,
          }}
        >
          <div className="relative max-w-2xl w-full h-full">
            {inBuffer ? (
              <MatchupCard matchup={item.data} onVote={handleMatchupVote} />
            ) : (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <div className="text-white text-sm">Matchup</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Render highlight
    const highlight = item.data;
    const videoRef = getVideoRef(index);

    return (
      <div
        key={`feed-item-${index}`}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          top: `${index * containerHeight}px`,
          height: `${containerHeight}px`,
        }}
      >
        <div className="relative max-w-2xl w-full h-full">
          {/* Render video for items in buffer range */}
          {inBuffer && (
            <>
              {/* Video element with ref */}
              <video
                ref={videoRef}
                src={highlight.videoUrl}
                className="absolute inset-0 w-full h-full object-contain"
                autoPlay={isCurrentItem}
                muted={isMuted}
                playsInline
                loop
                preload="auto"
              />

              {/* Controls and overlay only for current item */}
              {isCurrentItem && (
                <>
                  <VideoControls
                    onNext={goToNext}
                    onPrevious={goToPrevious}
                    isFirst={isFirst}
                    currentIndex={currentIndex}
                  />

                  <VideoOverlay
                    creator={highlight.creator}
                    prompt={highlight.prompt}
                  />

                  <ReactionPanel
                    highlightId={highlight.id}
                    reactions={reactions}
                    isLoading={reactionsLoading}
                    onReact={handleReact}
                    onRemoveReaction={handleRemoveReaction}
                    onOpenModal={() => setIsReactionModalOpen(true)}
                  />
                </>
              )}
            </>
          )}

          {/* Placeholder for items outside buffer range */}
          {!inBuffer && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <div className="text-white text-sm">Loading...</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate which items to render (current + adjacent for smooth transitions)
  const itemsToRender = [];
  const renderRange = 2; // Render 2 items before and after current for smoother scrolling

  for (
    let i = Math.max(0, currentIndex - renderRange);
    i <= Math.min(feedItems.length - 1, currentIndex + renderRange);
    i++
  ) {
    itemsToRender.push(i);
  }

  return (
    <div
      className="relative bg-black overflow-hidden"
      style={{ height: `${containerHeight}px` }}
    >
      {/* Infinite Scroll Container */}
      <div {...swipeHandlers} className="relative w-full h-full">
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollPosition}px)`,
            transition: isSnapping ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {/* Render visible feed items */}
          {itemsToRender.map((index) => renderFeedItemAtIndex(index))}
        </div>

        {/* Loading indicator for infinite scroll */}
        {isLoading && feedItems.length > 0 && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 z-10">
            <span className="text-white text-sm">Loading more...</span>
          </div>
        )}
      </div>

      {/* Reaction Modal */}
      <ReactionModal
        isOpen={isReactionModalOpen}
        onClose={() => setIsReactionModalOpen(false)}
        reactions={reactions}
        onReact={handleReact}
        onRemoveReaction={handleRemoveReaction}
      />
    </div>
  );
}
