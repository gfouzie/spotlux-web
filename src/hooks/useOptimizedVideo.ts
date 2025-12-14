import { useEffect, useRef, useState } from 'react';
import { getVideo } from '@/lib/videoCache';

interface UseOptimizedVideoOptions {
  videoUrl?: string;
  onEnded?: () => void;
}

interface UseOptimizedVideoReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isBuffering: boolean;
  progress: number;
}

/**
 * Video playback hook with caching
 * - Caches videos using Cache API (max 5 videos, LRU eviction)
 * - Debounced buffering indicator (200ms delay)
 * - Automatic blob URL cleanup
 */
export function useOptimizedVideo({
  videoUrl,
  onEnded,
}: UseOptimizedVideoOptions): UseOptimizedVideoReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);

  // Load video with caching
  useEffect(() => {
    if (!videoUrl) {
      setVideoSrc(null);
      return;
    }

    let cancelled = false;

    // Load video from cache or network
    getVideo(videoUrl).then((src) => {
      if (!cancelled) {
        // Clean up old blob URL if it exists
        if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
          URL.revokeObjectURL(currentBlobUrlRef.current);
        }

        // Store new blob URL reference
        if (src.startsWith('blob:')) {
          currentBlobUrlRef.current = src;
        } else {
          currentBlobUrlRef.current = null;
        }

        setVideoSrc(src);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [videoUrl]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    // Simple event handlers
    const handleEnded = () => {
      if (onEnded) onEnded();
    };

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
    };

    const handleWaiting = () => {
      // Only show buffering after 200ms delay (prevents flashing)
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
      bufferingTimeoutRef.current = setTimeout(() => {
        setIsBuffering(true);
      }, 200);
    };

    const handlePlaying = () => {
      // Clear any pending buffering timeout
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
      setIsBuffering(false);
    };

    const handleCanPlay = () => {
      // Clear any pending buffering timeout
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
      setIsBuffering(false);
    };

    // Only set src if it's different (prevent unnecessary reloads)
    if (video.src !== videoSrc) {
      video.src = videoSrc;
    }

    // Add event listeners
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      // Clean up timeout
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoSrc, onEnded]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  return {
    videoRef,
    isBuffering,
    progress,
  };
}
