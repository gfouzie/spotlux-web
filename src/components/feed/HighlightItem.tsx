'use client';

import { useState, useRef, useEffect } from 'react';
import { Highlight } from '@/api/highlights';
import { useHighlightReactions } from '@/hooks/useHighlightReactions';
import { useHighlightComments } from '@/hooks/useHighlightComments';
import { EmojiId } from '@/api/reactions';
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

  // Handle video playback based on isActive prop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isActive]);

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
