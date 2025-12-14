'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Highlight } from '@/api/highlights';
import {
  Xmark,
  NavArrowLeft,
  NavArrowRight,
  SoundOff,
  SoundHigh,
} from 'iconoir-react';
interface StoryViewerProps {
  highlights: Highlight[];
  initialIndex?: number;
  onClose: () => void;
  reelName: string;
}

export default function StoryViewer({
  highlights,
  initialIndex = 0,
  onClose,
  reelName,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentHighlight = highlights?.[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === highlights?.length - 1;

  // Navigation handlers
  const goToNext = useCallback(() => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [isLast, onClose]);

  const goToPrevious = useCallback(() => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [isFirst]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, onClose, isFirst]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        // Swipe threshold
        if (diff > 0) {
          // Swiped left - next
          goToNext();
        } else {
          // Swiped right - previous
          goToPrevious();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToNext, goToPrevious]);

  // Video playback and progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      goToNext();
    };

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const handleLoadedMetadata = () => {
      video.play().catch((err) => {
        console.error('Failed to autoplay:', err);
      });
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Reset and play when video changes
    video.load();

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentIndex, goToNext]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {highlights?.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width:
                  index < currentIndex
                    ? '100%'
                    : index === currentIndex
                      ? `${progress}%`
                      : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-semibold">{reelName}</h2>
          <span className="text-white/60 text-sm">
            {currentIndex + 1}/{highlights?.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="cursor-pointer p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <SoundOff className="w-5 h-5 text-white" />
            ) : (
              <SoundHigh className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <Xmark className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          src={currentHighlight?.videoUrl}
          className="max-w-full max-h-full object-contain"
          muted={isMuted}
          playsInline
          autoPlay
        />
      </div>

      {/* Navigation Arrows */}
      {!isFirst && (
        <button
          type="button"
          onClick={goToPrevious}
          className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label="Previous clip"
        >
          <NavArrowLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {!isLast && (
        <button
          type="button"
          onClick={goToNext}
          className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label="Next clip"
        >
          <NavArrowRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Prompt Overlay */}
      {currentHighlight?.prompt?.name && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-white/60 mb-1">Prompt</p>
            <p className="text-lg text-white font-medium">
              {currentHighlight.prompt.name}
            </p>
          </div>
        </div>
      )}

      {/* Click zones for navigation (desktop) */}
      <div className="absolute inset-0 hidden md:flex">
        <div
          className="flex-1 cursor-pointer"
          onClick={goToPrevious}
          style={{ visibility: isFirst ? 'hidden' : 'visible' }}
        />
        <div className="flex-1 cursor-pointer" onClick={goToNext} />
      </div>
    </div>
  );
}
