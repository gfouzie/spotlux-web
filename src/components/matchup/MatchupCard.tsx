'use client';

import { useRef, useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { HighlightMatchup } from '@/types/matchup';
import { useMatchupVoting } from '@/hooks/useMatchupVoting';
import CommentModal from './CommentModal';
import MatchupVideoCard from './MatchupVideoCard';
import CircleButton from '@/components/common/CircleButton';

interface MatchupCardProps {
  matchup: HighlightMatchup;
  onVote?: (highlightId: number) => void;
}

type ActiveCard = 'A' | 'B';

/**
 * MatchupCard - Head-to-head highlight voting component with swipe interaction
 *
 * Features:
 * - Stacked cards (offset top-left/bottom-right)
 * - Auto-play switching between videos
 * - Click to bring card to front
 * - Swipe or arrow buttons to vote
 * - Comment modal after voting
 * TODO (Chunk 5): Fetch actual highlight video URLs
 * TODO (Chunk 7): Add view tracking
 */
export default function MatchupCard({ matchup, onVote }: MatchupCardProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard>('A');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [votedHighlight, setVotedHighlight] = useState<'A' | 'B' | null>(null);

  // Voting state management
  const { isVoting, voteError, castVote } = useMatchupVoting({ matchupId: matchup.id });

  // Auto-switch between videos when one ends
  useEffect(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;

    const handleAEnded = () => {
      setActiveCard('B');
      videoB?.play();
    };

    const handleBEnded = () => {
      setActiveCard('A');
      videoA?.play();
    };

    videoA?.addEventListener('ended', handleAEnded);
    videoB?.addEventListener('ended', handleBEnded);

    return () => {
      videoA?.removeEventListener('ended', handleAEnded);
      videoB?.removeEventListener('ended', handleBEnded);
    };
  }, []);

  // Play active card when it changes
  useEffect(() => {
    if (activeCard === 'A') {
      videoARef.current?.play();
      videoBRef.current?.pause();
    } else {
      videoBRef.current?.play();
      videoARef.current?.pause();
    }
  }, [activeCard]);

  const handleCardClick = (card: ActiveCard) => {
    setActiveCard(card);
  };

  const handleVote = (highlightId: number) => {
    const voted = highlightId === matchup.highlightAId ? 'A' : 'B';
    setVotedHighlight(voted);
    setShowCommentModal(true);
  };

  const handleCommentSubmit = async (comment: string) => {
    if (!votedHighlight) return;

    const highlightId = votedHighlight === 'A' ? matchup.highlightAId : matchup.highlightBId;
    await castVote(highlightId, comment);

    setShowCommentModal(false);
    setTimeout(() => {
      onVote?.(highlightId);
    }, 500);
  };

  const handleCommentSkip = async () => {
    if (!votedHighlight) return;

    const highlightId = votedHighlight === 'A' ? matchup.highlightAId : matchup.highlightBId;
    await castVote(highlightId);

    setShowCommentModal(false);
    setTimeout(() => {
      onVote?.(highlightId);
    }, 500);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    if (videoARef.current) videoARef.current.muted = newMutedState;
    if (videoBRef.current) videoBRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleVote(matchup.highlightBId),
    onSwipedRight: () => handleVote(matchup.highlightAId),
    trackMouse: true, // Enable mouse drag on desktop
    preventScrollOnSwipe: true,
  });

  return (
    <>
      <div className="relative bg-black w-full h-full flex flex-col" {...swipeHandlers}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-30">
          <div className="text-center">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
              Head 2 Head
            </p>
            <h2 className="text-white text-lg font-medium">
              {matchup.highlightA?.prompt?.name ||
               matchup.highlightB?.prompt?.name ||
               `Prompt #${matchup.promptId}`}
            </h2>
          </div>
        </div>

        {/* Stacked Cards Container */}
        <div className="flex-1 relative flex items-center justify-center p-8">
          {/* Card A (Top-Left) */}
          <MatchupVideoCard
            label="A"
            videoRef={videoARef}
            videoUrl={matchup.highlightA?.videoUrl}
            highlightId={matchup.highlightAId}
            isActive={activeCard === 'A'}
            isMuted={isMuted}
            onClick={() => handleCardClick('A')}
            position="top-left"
          />

          {/* Card B (Bottom-Right) */}
          <MatchupVideoCard
            label="B"
            videoRef={videoBRef}
            videoUrl={matchup.highlightB?.videoUrl}
            highlightId={matchup.highlightBId}
            isActive={activeCard === 'B'}
            isMuted={isMuted}
            onClick={() => handleCardClick('B')}
            position="bottom-right"
          />
        </div>

        {/* Arrow Controls (Desktop) */}
        <div className="hidden md:block">
          <CircleButton
            onClick={() => handleVote(matchup.highlightAId)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30"
            size="lg"
            variant="default"
            aria-label="Vote for Highlight A"
          >
            <NavArrowLeft className="w-6 h-6" strokeWidth={2.5} />
          </CircleButton>
          <CircleButton
            onClick={() => handleVote(matchup.highlightBId)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30"
            size="lg"
            variant="default"
            aria-label="Vote for Highlight B"
          >
            <NavArrowRight className="w-6 h-6" strokeWidth={2.5} />
          </CircleButton>
        </div>

        {/* Mute Toggle */}
        <CircleButton
          onClick={toggleMute}
          className="absolute top-20 left-4 z-30"
          size="md"
          variant="default"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          <span className="text-white text-sm">
            {isMuted ? '🔇' : '🔊'}
          </span>
        </CircleButton>

        {/* Swipe Hint (Mobile) */}
        <div className="md:hidden absolute bottom-8 left-0 right-0 text-center z-30 pointer-events-none">
          <div className="inline-block bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-white/80 text-xs font-medium">
              Swipe ← or → to vote
            </p>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        votedFor={votedHighlight || 'A'}
        onSubmit={handleCommentSubmit}
        onSkip={handleCommentSkip}
        isSubmitting={isVoting}
        error={voteError}
      />
    </>
  );
}
