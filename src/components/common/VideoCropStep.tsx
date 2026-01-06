'use client';

import { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface VideoCropStepProps {
  videoFile: File;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // Default 9/16 for vertical video
  maxDuration?: number; // Maximum clip duration in seconds (default 15)
}

/**
 * Self-contained video cropper component for trimming and cropping videos
 * - Zoom and pan controls
 * - Timeline trimming to select subsections (up to 15s)
 * - Video preview with auto-play
 */
export default function VideoCropStep({
  videoFile,
  onCropComplete,
  onCancel,
  aspectRatio = 9 / 16,
  maxDuration = 15,
}: VideoCropStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Trim selection (start and end in seconds)
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(maxDuration);
  const [isProcessing, setIsProcessing] = useState(false);

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });

  // Range slider drag state
  const [dragging, setDragging] = useState<'start' | 'end' | 'range' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValues, setDragStartValues] = useState({ start: 0, end: 0 });

  // Create object URL for video file
  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  // Initialize when video metadata loads and auto-play
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const handleLoadedMetadata = () => {
      const videoDuration = video.duration;
      setDuration(videoDuration);
      setTrimEnd(Math.min(videoDuration, maxDuration));

      // Auto-play the video (muted for autoplay policy)
      video.muted = true;
      video.play().catch(() => {
        // Silently ignore autoplay errors
      });
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [videoSrc, maxDuration]);

  // Update current time as video plays and loop within trim bounds
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Loop within trim bounds
      if (time >= trimEnd || time < trimStart) {
        video.currentTime = trimStart;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [trimStart, trimEnd]);

  // Pan handlers for video
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStartPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStartPos.x,
      y: e.clientY - panStartPos.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsPanning(true);
    setPanStartPos({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - panStartPos.x,
      y: touch.clientY - panStartPos.y,
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Range slider handlers
  const handleRangeMouseDown = (e: React.MouseEvent, type: 'start' | 'end' | 'range') => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(type);
    setDragStartX(e.clientX);
    setDragStartValues({ start: trimStart, end: trimEnd });
  };

  const handleRangeTouchStart = (e: React.TouchEvent, type: 'start' | 'end' | 'range') => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    setDragging(type);
    setDragStartX(touch.clientX);
    setDragStartValues({ start: trimStart, end: trimEnd });
  };

  useEffect(() => {
    if (!dragging) return;

    const updateDrag = (clientX: number) => {
      if (!rangeRef.current || duration === 0) return;

      const rect = rangeRef.current.getBoundingClientRect();
      const deltaX = clientX - dragStartX;
      const deltaTime = (deltaX / rect.width) * duration;

      if (dragging === 'start') {
        const newStart = Math.max(0, Math.min(dragStartValues.start + deltaTime, trimEnd - 0.5));
        setTrimStart(newStart);
        if (videoRef.current) {
          videoRef.current.currentTime = newStart;
        }
      } else if (dragging === 'end') {
        const maxEnd = Math.min(duration, trimStart + maxDuration);
        const newEnd = Math.max(trimStart + 0.5, Math.min(dragStartValues.end + deltaTime, maxEnd));
        setTrimEnd(newEnd);
      } else if (dragging === 'range') {
        const rangeDuration = dragStartValues.end - dragStartValues.start;
        let newStart = dragStartValues.start + deltaTime;
        let newEnd = dragStartValues.end + deltaTime;

        // Clamp to bounds
        if (newStart < 0) {
          newStart = 0;
          newEnd = rangeDuration;
        }
        if (newEnd > duration) {
          newEnd = duration;
          newStart = duration - rangeDuration;
        }

        setTrimStart(newStart);
        setTrimEnd(newEnd);
        if (videoRef.current) {
          videoRef.current.currentTime = newStart;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateDrag(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      updateDrag(touch.clientX);
    };

    const handleEnd = () => {
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, dragStartX, dragStartValues, trimStart, trimEnd, duration, maxDuration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!videoRef.current) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await cropAndTrimVideo(
        videoRef.current,
        trimStart,
        trimEnd,
        zoom,
        pan,
        aspectRatio
      );
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const trimDuration = trimEnd - trimStart;

  // Calculate slider positions as percentages
  const startPercent = duration > 0 ? (trimStart / duration) * 100 : 0;
  const endPercent = duration > 0 ? (trimEnd / duration) * 100 : 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <p className="text-text-col/60 text-sm">
          Adjust the frame to fit your content
        </p>
      </div>

      {/* Video Preview with crop frame */}
      <div className="relative w-full aspect-[9/16] max-h-[250px] mx-auto rounded-lg overflow-hidden border-2 border-accent-col">
        <div
          className="absolute inset-0 flex items-center justify-center cursor-move bg-black"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              className="max-w-none max-h-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              playsInline
              muted
              loop
              preload="auto"
            />
          )}

          {/* Overlay hint */}
          <div className="absolute top-2 left-0 right-0 text-center pointer-events-none">
            <span className="text-white/70 text-xs bg-black/50 px-2 py-1 rounded">
              Drag to position
            </span>
          </div>
        </div>
      </div>

      {/* Zoom Slider */}
      <div>
        <label className="block text-text-col text-sm mb-2">
          Zoom ({zoom.toFixed(1)}x)
        </label>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-2 bg-component-col rounded-lg appearance-none cursor-pointer accent-accent-col"
        />
      </div>

      {/* Trim Controls */}
      <div className="space-y-3">
        <p className="text-text-col text-sm text-center">
          Select up to {maxDuration}s segment
        </p>

        {/* Range Slider */}
        <div
          ref={rangeRef}
          className="relative h-8 bg-component-col rounded-full select-none mx-2"
        >
          {/* Selected range highlight - draggable to move entire selection */}
          <div
            className="absolute top-0 bottom-0 bg-accent-col/40 rounded-full cursor-grab active:cursor-grabbing"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
            onMouseDown={(e) => handleRangeMouseDown(e, 'range')}
            onTouchStart={(e) => handleRangeTouchStart(e, 'range')}
          />

          {/* Start handle (circle) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-accent-col rounded-full cursor-ew-resize shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
            style={{
              left: `calc(${startPercent}% - 12px)`,
            }}
            onMouseDown={(e) => handleRangeMouseDown(e, 'start')}
            onTouchStart={(e) => handleRangeTouchStart(e, 'start')}
          >
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>

          {/* End handle (circle) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-accent-col rounded-full cursor-ew-resize shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
            style={{
              left: `calc(${endPercent}% - 12px)`,
            }}
            onMouseDown={(e) => handleRangeMouseDown(e, 'end')}
            onTouchStart={(e) => handleRangeTouchStart(e, 'end')}
          >
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>

        {/* Time display */}
        <p className="text-text-col/60 text-sm text-center">
          {formatTime(trimStart)} - {formatTime(trimEnd)}
        </p>

        {/* Warning if duration exceeds max */}
        {trimDuration > maxDuration && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-500 text-center">
              Selected duration ({trimDuration.toFixed(1)}s) exceeds maximum ({maxDuration}s)
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isProcessing || trimDuration > maxDuration}
          isLoading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

/**
 * Crops and trims a video to specified parameters
 */
async function cropAndTrimVideo(
  videoElement: HTMLVideoElement,
  startTime: number,
  endTime: number,
  zoom: number,
  pan: { x: number; y: number },
  aspectRatio: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // Set canvas size based on aspect ratio
    const targetWidth = 720;
    const targetHeight = Math.round(targetWidth / aspectRatio);
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const chunks: Blob[] = [];
    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 2500000, // 2.5 Mbps
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    // Start recording
    mediaRecorder.start();

    // Set video to start time
    videoElement.currentTime = startTime;

    const drawFrame = () => {
      if (!videoElement.paused && videoElement.currentTime < endTime) {
        // Calculate source dimensions based on zoom
        const sourceWidth = videoElement.videoWidth / zoom;
        const sourceHeight = videoElement.videoHeight / zoom;

        // Calculate source position (centered, adjusted for pan)
        const sourceX = (videoElement.videoWidth - sourceWidth) / 2 - (pan.x / zoom);
        const sourceY = (videoElement.videoHeight - sourceHeight) / 2 - (pan.y / zoom);

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw video frame
        ctx.drawImage(
          videoElement,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        requestAnimationFrame(drawFrame);
      } else {
        // Stop recording
        mediaRecorder.stop();
        videoElement.pause();
      }
    };

    // Start playback and drawing
    videoElement.play().then(() => {
      drawFrame();
    }).catch(reject);
  });
}
