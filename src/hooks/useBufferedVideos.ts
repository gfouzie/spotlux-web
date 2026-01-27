import { useRef, useEffect, useCallback } from 'react';

type VideoRef = React.MutableRefObject<HTMLVideoElement | null>;

interface UseBufferedVideosParams {
  currentIndex: number;
  bufferRange?: number;
}

interface UseBufferedVideosReturn {
  getVideoRef: (index: number) => VideoRef;
  isInBufferRange: (index: number) => boolean;
  playVideo: (index: number) => void;
  pauseVideo: (index: number) => void;
}

/**
 * Hook to manage multiple video refs for buffered infinite scroll
 *
 * Maintains refs for current video + adjacent videos within buffer range
 * to enable smooth transitions where you see actual video content sliding in.
 */
export function useBufferedVideos({
  currentIndex,
  bufferRange = 1,
}: UseBufferedVideosParams): UseBufferedVideosReturn {
  // Map of index -> video ref
  const videoRefsMap = useRef<Map<number, VideoRef>>(new Map());

  // Get or create video ref for a given index
  const getVideoRef = useCallback((index: number): VideoRef => {
    if (!videoRefsMap.current.has(index)) {
      videoRefsMap.current.set(index, { current: null });
    }
    return videoRefsMap.current.get(index)!;
  }, []);

  // Check if index is within buffer range of current
  const isInBufferRange = useCallback(
    (index: number): boolean => {
      return Math.abs(index - currentIndex) <= bufferRange;
    },
    [currentIndex, bufferRange]
  );

  // Play video at index
  const playVideo = useCallback((index: number) => {
    const ref = videoRefsMap.current.get(index);
    if (ref?.current) {
      ref.current.play().catch((err) => {
        console.log(`Video ${index} play prevented:`, err);
      });
    }
  }, []);

  // Pause video at index
  const pauseVideo = useCallback((index: number) => {
    const ref = videoRefsMap.current.get(index);
    if (ref?.current) {
      ref.current.pause();
    }
  }, []);

  // Clean up refs that are far from current index
  useEffect(() => {
    const cleanupRange = bufferRange + 2; // Keep a bit extra for smoother transitions

    videoRefsMap.current.forEach((_, index) => {
      if (Math.abs(index - currentIndex) > cleanupRange) {
        videoRefsMap.current.delete(index);
      }
    });
  }, [currentIndex, bufferRange]);

  // Pause all videos except current when currentIndex changes
  useEffect(() => {
    videoRefsMap.current.forEach((ref, index) => {
      if (index !== currentIndex && ref.current) {
        ref.current.pause();
      }
    });

    // Play current video
    playVideo(currentIndex);
  }, [currentIndex, playVideo]);

  return {
    getVideoRef,
    isInBufferRange,
    playVideo,
    pauseVideo,
  };
}
