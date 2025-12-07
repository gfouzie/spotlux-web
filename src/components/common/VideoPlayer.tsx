'use client';

import { useRef, useState, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, SoundOff, SoundHigh } from 'iconoir-react';

interface VideoPlayerProps extends Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  'onEnded' | 'onTimeUpdate'
> {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      src,
      poster,
      autoPlay = false,
      loop = false,
      muted = false,
      showControls = true,
      onEnded,
      onTimeUpdate,
      className,
      ...props
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(muted);
    const [showPlayButton, setShowPlayButton] = useState(!autoPlay);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // Set ref if provided
      if (typeof ref === 'function') {
        ref(video);
      } else if (ref) {
        ref.current = video;
      }

      const handlePlay = () => {
        setIsPlaying(true);
        setShowPlayButton(false);
      };

      const handlePause = () => {
        setIsPlaying(false);
        setShowPlayButton(true);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setShowPlayButton(true);
        onEnded?.();
      };

      const handleTimeUpdate = () => {
        if (onTimeUpdate) {
          onTimeUpdate(video.currentTime, video.duration);
        }
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }, [ref, onEnded, onTimeUpdate]);

    const togglePlay = () => {
      const video = videoRef.current;
      if (!video) return;

      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    };

    const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      video.muted = !video.muted;
      setIsMuted(!isMuted);
    };

    return (
      <div className={cn('relative w-full h-full bg-black group', className)}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          className="w-full h-full object-contain"
          onClick={togglePlay}
          {...props}
        />

        {showControls && (
          <>
            {/* Play/Pause Overlay Button */}
            {showPlayButton && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:opacity-100 cursor-pointer"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                <div className="bg-black/60 rounded-full p-4">
                  {isPlaying ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </div>
              </button>
            )}

            {/* Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-2">
                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="cursor-pointer p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

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
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
