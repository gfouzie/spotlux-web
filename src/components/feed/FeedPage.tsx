'use client';

import { useState, useEffect, useRef } from 'react';
import { useFeedData } from '@/hooks/useFeedData';
import { useOptimizedVideo } from '@/hooks/useOptimizedVideo';
import { useVideoNavigation } from '@/hooks/useVideoNavigation';
import VideoPlayer from './VideoPlayer';
import VideoControls from './VideoControls';
import VideoOverlay from './VideoOverlay';
import MatchupCard from '@/components/matchup/MatchupCard';

export default function FeedPage() {
  const [isMuted, setIsMuted] = useState(false);
  const isTrackingView = useRef(false);

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
    trackMatchupView,
  } = useFeedData();

  const currentItem = feedItems?.[currentIndex];
  const currentHighlight =
    currentItem?.type === 'highlight' ? currentItem.data : null;

  // Navigation
  const { goToNext, goToPrevious, isFirst, isLast } = useVideoNavigation({
    currentIndex,
    totalItems: feedItems.length,
    onNavigate: setCurrentIndex,
  });

  // Simple video playback - no caching for now
  const { videoRef, isBuffering, progress } = useOptimizedVideo({
    videoUrl: currentHighlight?.videoUrl,
    onEnded: goToNext,
  });

  // Track view when item changes (highlight or matchup)
  useEffect(() => {
    if (!currentItem || isTrackingView.current) return;

    isTrackingView.current = true;

    if (currentItem.type === 'highlight') {
      trackView(currentItem.data.id).finally(() => {
        isTrackingView.current = false;
      });
    } else if (currentItem.type === 'matchup') {
      trackMatchupView(currentItem.data.id).finally(() => {
        isTrackingView.current = false;
      });
    }
  }, [currentItem, trackView, trackMatchupView]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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

  // Empty state
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

  // Handle matchup vote completion
  const handleMatchupVote = (highlightId: number) => {
    console.log(`User voted for highlight ${highlightId} in matchup`);
    // Move to next item after voting
    goToNext();
  };

  // Render current feed item (highlight or matchup)
  const renderFeedItem = () => {
    if (!currentItem) return null;

    // Render matchup
    if (currentItem.type === 'matchup') {
      return (
        <MatchupCard matchup={currentItem.data} onVote={handleMatchupVote} />
      );
    }

    // Render highlight
    return (
      <>
        {/* Video Player */}
        <VideoPlayer
          videoRef={videoRef}
          isMuted={isMuted}
          isBuffering={isBuffering}
        />

        {/* Video Controls */}
        <VideoControls
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onNext={goToNext}
          onPrevious={goToPrevious}
          currentIndex={currentIndex}
          total={feedItems.length}
          hasMore={hasMore}
          isFirst={isFirst}
          isLast={isLast}
        />

        {/* Video Overlay */}
        <VideoOverlay
          creator={currentHighlight?.creator}
          prompt={currentHighlight?.prompt}
        />
      </>
    );
  };

  return (
    <div className="relative bg-black min-h-screen">
      {/* Progress Bar (only for highlights) */}
      {currentItem?.type === 'highlight' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 z-10">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Feed Item Container */}
      <div
        className="flex items-center justify-center"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        <div className="relative max-w-2xl w-full h-full">
          {renderFeedItem()}

          {/* Loading indicator for infinite scroll */}
          {isLoading && feedItems.length > 0 && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 z-10">
              <span className="text-white text-sm">Loading more...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
