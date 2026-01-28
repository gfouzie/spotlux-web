'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { LifestyleDailyAggregateFeedItem } from '@/api/lifestyle';
import LifestyleFeedPost from '@/components/lifestyle/LifestyleFeedPost';
import { formatDate } from '@/lib/dateUtils';
import { useReactions } from '@/hooks/useReactions';
import { useComments } from '@/hooks/useComments';
import { EmojiId } from '@/api/reactions';
import { trackLifestyleEngagement } from '@/api/engagement';
import ReactionPanel from './ReactionPanel';
import ReactionModal from './ReactionModal';
import CommentButton from './CommentButton';
import CommentModal from './CommentModal';

interface LifestyleItemProps {
  aggregate: LifestyleDailyAggregateFeedItem;
  isActive: boolean;
}

/**
 * Full-screen lifestyle aggregate item in unified feed
 * Displays user's daily posts in a horizontal carousel
 * Includes reactions and comments for the aggregate (whole day)
 */
export default function LifestyleItem({ aggregate, isActive }: LifestyleItemProps) {
  // Backend sends posts DESC (newest first), reverse for chronological display
  const postsChronological = [...aggregate.posts].reverse();
  const totalSlides = postsChronological.length;

  // Start at the last slide (most recent post)
  const [currentSlide, setCurrentSlide] = useState(totalSlides - 1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Engagement tracking state (using refs to avoid re-renders)
  const dwellStartTimeRef = useRef<number | null>(null);
  const totalDwellTimeRef = useRef<number>(0);
  const slidesViewedRef = useRef<Set<number>>(new Set());
  const hasTrackedRef = useRef<boolean>(false);

  // Modal states
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Reactions hook for aggregate (shared across all posts in the day)
  const {
    reactions,
    isLoading: reactionsLoading,
    addReaction,
    removeReaction,
  } = useReactions('lifestyle-aggregates', aggregate.id);

  // Comments hook for aggregate (shared across all posts in the day)
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
  } = useComments('lifestyle-aggregates', aggregate.id);

  // Track dwell time when item is active
  const recordDwellSession = useCallback(() => {
    if (dwellStartTimeRef.current !== null) {
      const sessionDuration = Date.now() - dwellStartTimeRef.current;
      totalDwellTimeRef.current += sessionDuration;
      dwellStartTimeRef.current = null;
    }
  }, []);

  // Send engagement data to backend
  const sendEngagementData = useCallback(() => {
    // Record any ongoing session
    recordDwellSession();

    // Only send if user spent at least 500ms and haven't sent already
    if (totalDwellTimeRef.current >= 500 && totalSlides > 0 && !hasTrackedRef.current) {
      trackLifestyleEngagement({
        aggregateId: aggregate.id,
        dwellTimeMs: totalDwellTimeRef.current,
        slidesViewed: slidesViewedRef.current.size,
        totalSlides: totalSlides,
      });
      hasTrackedRef.current = true;
    }
  }, [aggregate.id, totalSlides, recordDwellSession]);

  // Handle active state changes for dwell time tracking
  useEffect(() => {
    if (isActive) {
      // Start tracking dwell time
      dwellStartTimeRef.current = Date.now();
      // Mark current slide as viewed
      slidesViewedRef.current.add(currentSlide);
    } else {
      // Record the dwell session when deactivated
      recordDwellSession();
    }
  }, [isActive, currentSlide, recordDwellSession]);

  // Track slide views when user navigates carousel
  useEffect(() => {
    if (isActive) {
      slidesViewedRef.current.add(currentSlide);
    }
  }, [currentSlide, isActive]);

  // Send engagement data when component unmounts or aggregate changes
  useEffect(() => {
    return () => {
      sendEngagementData();
    };
  }, [sendEngagementData]);

  // Reset tracking state when aggregate changes
  useEffect(() => {
    totalDwellTimeRef.current = 0;
    dwellStartTimeRef.current = null;
    slidesViewedRef.current = new Set();
    hasTrackedRef.current = false;
  }, [aggregate.id]);

  // Scroll to the last slide on mount (only once to prevent jarring updates)
  useEffect(() => {
    if (hasScrolledRef.current || totalSlides === 0) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({
      left: slideWidth * (totalSlides - 1),
      behavior: 'auto',
    });

    hasScrolledRef.current = true;
  }, [totalSlides]);

  // Handle scroll to update current slide indicator
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = carousel.offsetWidth;
      const newSlide = Math.round(scrollLeft / slideWidth);
      setCurrentSlide(newSlide);
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigate to specific slide
  const goToSlide = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth',
    });
  };

  const handleReact = async (emojiId: EmojiId) => {
    await addReaction(emojiId);
  };

  const handleRemoveReaction = async () => {
    await removeReaction();
  };

  // Guard against empty posts (after all hooks to comply with Rules of Hooks)
  if (postsChronological.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted-col">No posts for this day</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-sec-col flex flex-col items-center justify-center p-4 relative">
      <div className="max-w-lg w-full">
        {/* User Header */}
        <div className="flex items-center gap-3 mb-6">
          {aggregate.profileImageUrl ? (
            <img
              src={aggregate.profileImageUrl}
              alt={aggregate.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-bg-col flex items-center justify-center">
              <span className="text-text-muted-col text-lg font-medium">
                {aggregate.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-lg text-text-col">{aggregate.username}</p>
            <p className="text-sm text-text-muted-col">
              {aggregate.overallStreak > 0 && (
                <span className="text-accent-col mr-2">🔥 {aggregate.overallStreak}</span>
              )}
              {formatDate(aggregate.dayDate)}
            </p>
          </div>
        </div>

        {/* Posts Carousel */}
        <div className="bg-bg-col rounded-2xl p-8 min-h-[400px] flex items-center overflow-hidden">
          {postsChronological.length === 1 ? (
            // Single post - no carousel
            <div className="w-full">
              <LifestyleFeedPost post={postsChronological[0]} isCarouselSlide={false} />
            </div>
          ) : (
            // Multiple posts - horizontal carousel
            <div className="w-full">
              <div
                ref={carouselRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {postsChronological.map((post) => (
                  <div
                    key={post.id}
                    className="flex-shrink-0 w-full snap-center px-2"
                  >
                    <LifestyleFeedPost post={post} isCarouselSlide />
                  </div>
                ))}
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-1.5 mt-6">
                {postsChronological.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                      index === currentSlide
                        ? 'bg-accent-col'
                        : 'bg-text-col/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side action panel (for reactions and comments on aggregate) */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-3">
        {/* Reactions */}
        <ReactionPanel
          highlightId={aggregate.id}
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
