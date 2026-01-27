'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { HighlightMatchup } from '@/types/matchup';
import { FriendMatchupFeedItem } from '@/api/friendMatchups';
import { useMatchupVoting } from '@/hooks/useMatchupVoting';
import { friendMatchupsApi } from '@/api/friendMatchups';
import MatchupUserTabs from './MatchupUserTabs';
import VoteSwipeOverlay from './VoteSwipeOverlay';
import VoteConfirmationSheet from './VoteConfirmationSheet';
import CircleButton from '@/components/common/CircleButton';

interface UserData {
  id: number;
  username: string;
  profileImageUrl: string | null;
}

interface UnifiedMatchupViewProps {
  // For ELO matchups
  matchup?: HighlightMatchup;
  // For friend matchups
  friendMatchup?: FriendMatchupFeedItem;
  isActive: boolean;
  onVote?: (votedForId: number) => void;
}

/**
 * UnifiedMatchupView - Single-video tab-based matchup UI
 *
 * Unified component for both ELO highlight matchups and friend 1v1 matchups.
 * Features:
 * - Tab row with VS separator for side selection
 * - Single video display (9:16 aspect ratio)
 * - Swipe-based voting with visual feedback
 * - Desktop arrow button fallback
 * - Post-vote comment modal
 */
export default function UnifiedMatchupView({
  matchup,
  friendMatchup,
  isActive,
  onVote,
}: UnifiedMatchupViewProps) {
  // Refs for both videos (buffered)
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  // State
  const [selectedSide, setSelectedSide] = useState<'a' | 'b'>('a');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingVoteSide, setPendingVoteSide] = useState<'a' | 'b' | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVotingFriend, setIsVotingFriend] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  // Extract user data from either matchup type
  const isEloMatchup = !!matchup;
  const isFriendMatchup = !!friendMatchup;

  // Get user data for both sides
  const userA: UserData = isEloMatchup
    ? {
        id: matchup.highlightA?.creator?.id ?? matchup.highlightAId,
        username: matchup.highlightA?.creator?.username ?? 'User A',
        profileImageUrl: matchup.highlightA?.creator?.profileImageUrl ?? null,
      }
    : {
        id: friendMatchup!.initiator.id,
        username: friendMatchup!.initiator.username,
        profileImageUrl: friendMatchup!.initiator.profileImageUrl,
      };

  const userB: UserData = isEloMatchup
    ? {
        id: matchup.highlightB?.creator?.id ?? matchup.highlightBId,
        username: matchup.highlightB?.creator?.username ?? 'User B',
        profileImageUrl: matchup.highlightB?.creator?.profileImageUrl ?? null,
      }
    : {
        id: friendMatchup!.responder.id,
        username: friendMatchup!.responder.username,
        profileImageUrl: friendMatchup!.responder.profileImageUrl,
      };

  // Video URLs
  const videoUrlA = isEloMatchup
    ? matchup.highlightA?.videoUrl
    : friendMatchup!.initiatorVideoUrl;

  const videoUrlB = isEloMatchup
    ? matchup.highlightB?.videoUrl
    : friendMatchup!.responderVideoUrl;

  // Prompt name (for header)
  const promptName = isEloMatchup
    ? matchup.highlightA?.prompt?.name || matchup.highlightB?.prompt?.name
    : friendMatchup!.customPrompt;

  // Check if already voted (for friend matchups)
  const alreadyVoted = isFriendMatchup && friendMatchup!.currentUserVotedFor !== null;

  // ELO matchup voting hook
  const eloVoting = useMatchupVoting({
    promptId: matchup?.promptId ?? 0,
    highlightAId: matchup?.highlightAId ?? 0,
    highlightBId: matchup?.highlightBId ?? 0,
  });

  // Play/pause videos based on isActive and selectedSide
  useEffect(() => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    if (!isActive) {
      videoA?.pause();
      videoB?.pause();
      return;
    }

    if (selectedSide === 'a') {
      videoB?.pause();
      videoA?.play().catch(() => {});
    } else {
      videoA?.pause();
      videoB?.play().catch(() => {});
    }
  }, [isActive, selectedSide]);

  // Handle vote submission
  const handleVote = useCallback(
    (side: 'a' | 'b') => {
      if (hasVoted || alreadyVoted) return;

      setPendingVoteSide(side);
      setShowConfirmation(true);
    },
    [hasVoted, alreadyVoted]
  );

  // Submit vote with optional comment
  const handleConfirmVote = async (comment: string) => {
    if (!pendingVoteSide) return;

    const votedForUser = pendingVoteSide === 'a' ? userA : userB;

    try {
      if (isEloMatchup) {
        const highlightId =
          pendingVoteSide === 'a' ? matchup!.highlightAId : matchup!.highlightBId;
        await eloVoting.castVote(highlightId, comment);
      } else {
        setIsVotingFriend(true);
        await friendMatchupsApi.vote(friendMatchup!.id, {
          votedForUserId: votedForUser.id,
        });
      }

      setHasVoted(true);
      setShowConfirmation(false);
      setPendingVoteSide(null);

      // Notify parent
      setTimeout(() => {
        onVote?.(votedForUser.id);
      }, 500);
    } catch (error) {
      console.error('Vote error:', error);
      setVoteError('Failed to submit vote. Please try again.');
    } finally {
      setIsVotingFriend(false);
    }
  };

  // Cancel vote
  const handleCancelVote = () => {
    setShowConfirmation(false);
    setPendingVoteSide(null);
    setVoteError(null);
  };

  // Touch/Mouse event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (hasVoted || alreadyVoted) return;
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || hasVoted || alreadyVoted) return;

    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
      e.preventDefault();
      setDragOffset(deltaX);

      // Preview side switch during drag (show video of user being voted for)
      // Swipe left → voting for A (left user), show A's video
      // Swipe right → voting for B (right user), show B's video
      if (deltaX < -30 && selectedSide !== 'a') {
        setSelectedSide('a');
      } else if (deltaX > 30 && selectedSide !== 'b') {
        setSelectedSide('b');
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    // Vote threshold: 100px
    // Swipe left = vote for left user (A), swipe right = vote for right user (B)
    // "Swipe toward" paradigm - swipe toward the user you want to vote for
    if (Math.abs(dragOffset) > 100) {
      const voteSide = dragOffset < 0 ? 'a' : 'b';
      handleVote(voteSide);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  // Mouse drag handlers (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (hasVoted || alreadyVoted) return;
    setStartX(e.clientX);
    setStartY(e.clientY);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || hasVoted || alreadyVoted) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
      setDragOffset(deltaX);

      // Preview side switch during drag (show video of user being voted for)
      if (deltaX < -30 && selectedSide !== 'a') {
        setSelectedSide('a');
      } else if (deltaX > 30 && selectedSide !== 'b') {
        setSelectedSide('b');
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    // Swipe left = vote for left user (A), swipe right = vote for right user (B)
    if (Math.abs(dragOffset) > 100) {
      const voteSide = dragOffset < 0 ? 'a' : 'b';
      handleVote(voteSide);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setDragOffset(0);
      setIsDragging(false);
    }
  };

  // Get current user for overlay (matches swipe-toward paradigm)
  // Swipe left → vote for left user (A), swipe right → vote for right user (B)
  const overlayUser = dragOffset < 0 ? userA : userB;
  const overlayOpacity = Math.min(Math.abs(dragOffset) / 100, 1);

  // Pending vote user (for confirmation modal)
  const pendingVoteUser = pendingVoteSide === 'a' ? userA : userB;

  return (
    <>
      <div className="relative bg-black w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-30">
          <div className="text-center">
            <span className="text-accent-col text-lg font-bold">
              {isFriendMatchup ? '1v1 Challenge' : promptName || 'Matchup'}
            </span>
            {promptName && isFriendMatchup && (
              <span className="text-white/60 text-sm ml-2">• {promptName}</span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-16 pb-20">
          {/* User Tabs */}
          <MatchupUserTabs
            userA={userA}
            userB={userB}
            selectedSide={selectedSide}
            onSelectSide={setSelectedSide}
          />

          {/* Video Container */}
          <div
            className="flex-1 relative mx-4 mb-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: dragOffset !== 0 ? `translateX(${dragOffset * 0.1}px) rotate(${dragOffset * -0.02}deg)` : undefined,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            {/* Border with accent color */}
            <div
              className={`absolute inset-0 rounded-xl border-3 ${
                selectedSide === 'a' ? 'border-accent-col' : 'border-accent-col'
              }`}
            />

            {/* Video A (hidden when B selected) */}
            <video
              ref={videoRefA}
              src={videoUrlA}
              className={`absolute inset-0 w-full h-full object-cover rounded-xl ${
                selectedSide === 'a' ? 'block' : 'hidden'
              }`}
              playsInline
              loop
              preload="auto"
            />

            {/* Video B (hidden when A selected) */}
            <video
              ref={videoRefB}
              src={videoUrlB || ''}
              className={`absolute inset-0 w-full h-full object-cover rounded-xl ${
                selectedSide === 'b' ? 'block' : 'hidden'
              }`}
              playsInline
              loop
              preload="auto"
            />

            {/* Swipe Overlay */}
            {dragOffset !== 0 && (
              <VoteSwipeOverlay
                direction={dragOffset < 0 ? 'left' : 'right'}
                opacity={overlayOpacity}
                username={overlayUser.username}
              />
            )}

            {/* Already Voted Indicator */}
            {(hasVoted || alreadyVoted) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-10">
                <div className="bg-accent-col/90 px-6 py-3 rounded-full">
                  <p className="text-black font-medium">Vote Submitted</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Controls (Desktop) */}
        {!hasVoted && !alreadyVoted && (
          <div className="hidden md:block">
            <CircleButton
              onClick={() => handleVote('a')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30"
              size="lg"
              variant="default"
              aria-label={`Vote for ${userA.username}`}
            >
              <NavArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            </CircleButton>
            <CircleButton
              onClick={() => handleVote('b')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30"
              size="lg"
              variant="default"
              aria-label={`Vote for ${userB.username}`}
            >
              <NavArrowRight className="w-6 h-6" strokeWidth={2.5} />
            </CircleButton>
          </div>
        )}

        {/* Swipe Hint (Mobile) */}
        {!hasVoted && !alreadyVoted && (
          <div className="md:hidden absolute bottom-8 left-0 right-0 text-center z-30 pointer-events-none">
            <div className="inline-block bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-white/80 text-xs font-medium">
                Swipe left for @{userA.username} | Swipe right for @{userB.username}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Vote Confirmation Modal */}
      <VoteConfirmationSheet
        isOpen={showConfirmation}
        username={pendingVoteUser.username}
        profileImageUrl={pendingVoteUser.profileImageUrl}
        onSubmit={handleConfirmVote}
        onCancel={handleCancelVote}
        isSubmitting={eloVoting.isVoting || isVotingFriend}
        error={eloVoting.voteError || voteError}
      />
    </>
  );
}
