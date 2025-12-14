import { useEffect, useRef, useState, useCallback } from 'react';
import { getVideo, preloadVideo } from '@/lib/videoCache';

interface UseOptimizedVideoOptions {
  videoUrl?: string;
  onEnded?: () => void;
  shouldPreloadNext?: boolean;
  nextVideoUrl?: string;
}

interface UseOptimizedVideoReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isBuffering: boolean;
  progress: number;
}

/**
 * Custom hook for optimized video playback with caching and preloading
 *
 * Features:
 * - Browser caching (Cache API) for previously viewed videos
 * - Intelligent preloading of next video (at 50% or after 2 seconds)
 * - Buffering state management
 * - Progress tracking
 * - Automatic blob URL cleanup
 */
export function useOptimizedVideo({
  videoUrl,
  onEnded,
  shouldPreloadNext = true,
  nextVideoUrl,
}: UseOptimizedVideoOptions): UseOptimizedVideoReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [progress, setProgress] = useState(0);
  const hasTriggeredPreload = useRef(false);
  const blobUrlsRef = useRef<string[]>([]);

  // Preload next video callback
  const triggerNextVideoPreload = useCallback(() => {
    if (nextVideoUrl && shouldPreloadNext) {
      preloadVideo(nextVideoUrl).catch((err) => {
        console.error('Failed to preload next video:', err);
      });
    }
  }, [nextVideoUrl, shouldPreloadNext]);

  // Main video playback logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let isMounted = true;
    hasTriggeredPreload.current = false;
    setIsBuffering(true);

    const handleEnded = () => {
      if (onEnded) onEnded();
    };

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);

      // Trigger preload when video reaches 50% or after 2 seconds
      if (!hasTriggeredPreload.current && shouldPreloadNext) {
        const shouldPreload =
          currentProgress >= 50 || video.currentTime >= 2;
        if (shouldPreload) {
          hasTriggeredPreload.current = true;
          triggerNextVideoPreload();
        }
      }
    };

    const handleLoadedMetadata = () => {
      setIsBuffering(false);
      video.play().catch((err) => {
        console.error('Failed to autoplay:', err);
      });
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    // Load video from cache or network
    const loadVideo = async () => {
      try {
        const cachedVideoUrl = await getVideo(videoUrl);
        if (isMounted) {
          // Track blob URL for cleanup
          if (cachedVideoUrl.startsWith('blob:')) {
            blobUrlsRef.current.push(cachedVideoUrl);
          }
          video.src = cachedVideoUrl;
          video.load();
        }
      } catch (err) {
        console.error('Failed to load video:', err);
        if (isMounted) {
          // Fallback to direct URL
          video.src = videoUrl;
          video.load();
        }
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    loadVideo();

    return () => {
      isMounted = false;
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoUrl, onEnded, shouldPreloadNext, triggerNextVideoPreload]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  return {
    videoRef,
    isBuffering,
    progress,
  };
}
