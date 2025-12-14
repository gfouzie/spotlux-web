'use client';

import { useState, useEffect, useRef } from 'react';
import { useFeedData } from '@/hooks/useFeedData';
import { useOptimizedVideo } from '@/hooks/useOptimizedVideo';
import { useVideoNavigation } from '@/hooks/useVideoNavigation';
import VideoPlayer from './VideoPlayer';
import VideoControls from './VideoControls';
import VideoOverlay from './VideoOverlay';

export default function FeedPage() {
  const [isMuted, setIsMuted] = useState(false);
  const isTrackingView = useRef(false);

  // Feed data management
  const {
    highlights,
    isLoading,
    hasMore,
    error,
    currentIndex,
    setCurrentIndex,
    loadInitialHighlights,
    trackView,
  } = useFeedData();

  const currentHighlight = highlights?.[currentIndex];

  // Navigation
  const { goToNext, goToPrevious, isFirst, isLast } = useVideoNavigation({
    currentIndex,
    totalItems: highlights.length,
    onNavigate: setCurrentIndex,
  });

  // Simple video playback - no caching for now
  const { videoRef, isBuffering, progress } = useOptimizedVideo({
    videoUrl: currentHighlight?.videoUrl,
    onEnded: goToNext,
  });

  // Track view when highlight changes
  useEffect(() => {
    if (currentHighlight && !isTrackingView.current) {
      isTrackingView.current = true;
      trackView(currentHighlight.id).finally(() => {
        isTrackingView.current = false;
      });
    }
  }, [currentHighlight, trackView]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Loading state
  if (isLoading && highlights.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-col">Loading feed...</div>
      </div>
    );
  }

  // Error state
  if (error && highlights.length === 0) {
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
  if (!isLoading && highlights.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-text-col">
          <p className="mb-2">No highlights to show</p>
          <p className="text-sm text-text-col/60">
            Follow friends or wait for public content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black min-h-screen">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 z-10">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Video Container */}
      <div
        className="flex items-center justify-center"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        <div className="relative max-w-2xl w-full h-full">
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
            total={highlights.length}
            hasMore={hasMore}
            isFirst={isFirst}
            isLast={isLast}
          />

          {/* Video Overlay */}
          <VideoOverlay
            creator={currentHighlight?.creator}
            prompt={currentHighlight?.prompt}
          />

          {/* Loading indicator for infinite scroll */}
          {isLoading && highlights.length > 0 && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 z-10">
              <span className="text-white text-sm">Loading more...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
