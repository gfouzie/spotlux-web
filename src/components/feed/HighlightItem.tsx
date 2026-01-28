'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Highlight } from '@/api/highlights';
import { useHighlightReactions } from '@/hooks/useHighlightReactions';
import { useHighlightComments } from '@/hooks/useHighlightComments';
import { EmojiId } from '@/api/reactions';
import { trackEngagement } from '@/api/engagement';
import ReactionPanel from './ReactionPanel';
import ReactionModal from './ReactionModal';
import CommentButton from './CommentButton';
import CommentModal from './CommentModal';
import VideoOverlay from './VideoOverlay';
import { SoundOff, SoundHigh } from 'iconoir-react';
import CircleButton from '@/components/common/CircleButton';

interface HighlightItemProps {
  highlight: Highlight;
  isActive: boolean;
}

/**
 * Individual highlight item in unified feed
 *
 * Features:
 * - Full video playback with mute control
 * - Emoji reactions (top 3 + modal for all 8)
 * - Comments system
 * - Creator profile overlay
 */
export default function HighlightItem({ highlight, isActive }: HighlightItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Watch time tracking state
  const watchStartTimeRef = useRef<number | null>(null);
  const totalWatchTimeRef = useRef<number>(0);
  const videoDurationRef = useRef<number>(0);
  const hasTrackedRef = useRef<boolean>(false);
  const lastTrackedHighlightIdRef = useRef<number | null>(null);

  // Reactions hook
  const {
    reactions,
    isLoading: reactionsLoading,
    addReaction,
    removeReaction,
  } = useHighlightReactions(highlight.id);

  // Comments hook
  const {
    comments,
    totalCount: commentCount,
    isLoading: commentsLoading,
    hasMore: hasMoreComments,
    addComment,
    deleteComment,
    likeComment,
    unlikeComment,
    loadMore: loadMoreComments,
  } = useHighlightComments(highlight.id);

  // Track watch time when video is playing
  const recordWatchSession = useCallback(() => {
    if (watchStartTimeRef.current !== null) {
      const sessionDuration = Date.now() - watchStartTimeRef.current;
      totalWatchTimeRef.current += sessionDuration;
      watchStartTimeRef.current = null;
    }
  }, []);

  // Send engagement data to backend
  const sendEngagementData = useCallback(() => {
    // Record any ongoing session
    recordWatchSession();

    // Guard: prevent double-send for same highlight (race condition protection)
    if (lastTrackedHighlightIdRef.current === highlight.id) {
      return;
    }

    // Only send if user watched for at least 500ms and haven't sent already
    // Note: if video failed to load, we still track dwell time (videoDuration = 1 as placeholder)
    const hasValidDuration = videoDurationRef.current > 0 || videoError;

    if (totalWatchTimeRef.current >= 500 && hasValidDuration && !hasTrackedRef.current) {
      trackEngagement({
        highlightId: highlight.id,
        watchDurationMs: totalWatchTimeRef.current,
        videoDurationMs: videoDurationRef.current || 1, // Use 1ms placeholder if video failed
      });
      hasTrackedRef.current = true;
      lastTrackedHighlightIdRef.current = highlight.id;
    }
  }, [highlight.id, recordWatchSession, videoError]);

  // Handle video playback based on isActive prop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(console.error);
      // Start tracking watch time
      watchStartTimeRef.current = Date.now();
    } else {
      video.pause();
      // Record the watch session when paused
      recordWatchSession();
    }
  }, [isActive, highlight.id, recordWatchSession]);

  // Capture video duration when metadata loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      videoDurationRef.current = Math.round(video.duration * 1000);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Also check if already loaded (for cached videos)
    if (video.duration && !isNaN(video.duration)) {
      videoDurationRef.current = Math.round(video.duration * 1000);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [highlight.id]); // Re-run when highlight changes to attach listener to new video

  // Send engagement data when component unmounts or highlight changes
  useEffect(() => {
    return () => {
      sendEngagementData();
    };
  }, [sendEngagementData]);

  // Reset tracking state when highlight changes
  useEffect(() => {
    totalWatchTimeRef.current = 0;
    watchStartTimeRef.current = null;
    videoDurationRef.current = 0;
    hasTrackedRef.current = false;
    setVideoError(false);
  }, [highlight.id]);

  // Handle video load errors
  const handleVideoError = useCallback(() => {
    console.error(`Video failed to load for highlight ${highlight.id}`);
    setVideoError(true);
    // Still track dwell time even if video fails
    watchStartTimeRef.current = Date.now();
  }, [highlight.id]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleReact = async (emojiId: EmojiId) => {
    await addReaction(emojiId);
  };

  const handleRemoveReaction = async () => {
    await removeReaction();
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={highlight.videoUrl}
        className="w-full h-full object-cover"
        muted={isMuted}
        loop
        playsInline
        onError={handleVideoError}
      />

      {/* Creator overlay at bottom */}
      <VideoOverlay
        creator={highlight.creator}
        prompt={highlight.prompt}
      />

      {/* Mute button (top right) */}
      <div className="absolute top-4 right-4 z-20">
        <CircleButton
          size="md"
          variant="default"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <SoundOff className="w-6 h-6" strokeWidth={2} />
          ) : (
            <SoundHigh className="w-6 h-6" strokeWidth={2} />
          )}
        </CircleButton>
      </div>

      {/* Right side action panel */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-3">
        {/* Reactions */}
        <ReactionPanel
          highlightId={highlight.id}
          reactions={reactions}
          isLoading={reactionsLoading}
          onReact={handleReact}
          onRemoveReaction={handleRemoveReaction}
          onOpenModal={() => setShowReactionModal(true)}
        />

        {/* Comments button */}
        <CommentButton
          commentCount={commentCount}
          onClick={() => setShowCommentModal(true)}
          isLoading={commentsLoading}
        />
      </div>

      {/* Reaction Modal */}
      <ReactionModal
        isOpen={showReactionModal}
        onClose={() => setShowReactionModal(false)}
        reactions={reactions}
        onReact={handleReact}
        onRemoveReaction={handleRemoveReaction}
      />

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        comments={comments}
        totalCount={commentCount}
        isLoading={commentsLoading}
        hasMore={hasMoreComments}
        onAddComment={addComment}
        onDeleteComment={deleteComment}
        onLikeComment={likeComment}
        onUnlikeComment={unlikeComment}
        onLoadMore={loadMoreComments}
      />
    </div>
  );
}
