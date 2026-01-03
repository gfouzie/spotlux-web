import { useState, useCallback } from 'react';
import { matchupsApi } from '@/api/matchups';
import { ApiError } from '@/api/client';

interface UseMatchupVotingParams {
  promptId: number;
  highlightAId: number;
  highlightBId: number;
}

interface UseMatchupVotingReturn {
  isVoting: boolean;
  hasVoted: boolean;
  votedFor: number | null;
  voteError: string | null;
  castVote: (highlightId: number, comment?: string) => Promise<void>;
}

/**
 * Hook for managing matchup voting state and API interactions
 *
 * For transient matchups (generated on-demand), sends the full matchup details
 * to the backend which will find or create the HighlightMatchup record.
 *
 * Handles:
 * - Casting votes with optional comments
 * - Loading and error states
 * - Vote persistence (local state)
 */
export function useMatchupVoting({
  promptId,
  highlightAId,
  highlightBId,
}: UseMatchupVotingParams): UseMatchupVotingReturn {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const castVote = useCallback(
    async (highlightId: number, comment?: string) => {
      setIsVoting(true);
      setVoteError(null);

      try {
        await matchupsApi.voteOnMatchup({
          promptId,
          highlightAId,
          highlightBId,
          votedForHighlightId: highlightId,
          voteComment: comment || null,
        });

        setHasVoted(true);
        setVotedFor(highlightId);
      } catch (error) {
        if (error instanceof ApiError) {
          setVoteError(error.message);
        } else {
          setVoteError('Failed to submit vote. Please try again.');
        }
        console.error('Vote error:', error);
      } finally {
        setIsVoting(false);
      }
    },
    [promptId, highlightAId, highlightBId]
  );

  return {
    isVoting,
    hasVoted,
    votedFor,
    voteError,
    castVote,
  };
}
