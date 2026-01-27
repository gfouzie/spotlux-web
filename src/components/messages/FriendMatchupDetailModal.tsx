'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { FriendMatchup, friendMatchupsApi } from '@/api/friendMatchups';
import { useUser } from '@/contexts/UserContext';
import { Trophy, Check } from 'iconoir-react';

interface FriendMatchupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchup: FriendMatchup;
}

/**
 * Modal showing full friend matchup details.
 * - If active: Full videos, voting UI, timer
 * - If completed (winner): Shows winner with final counts
 * - If completed (tie): Shows tie with final counts
 */
export default function FriendMatchupDetailModal({
  isOpen,
  onClose,
  matchup,
}: FriendMatchupDetailModalProps) {
  const { user } = useUser();
  const currentUserId = user?.id;
  const initiatorVideoRef = useRef<HTMLVideoElement>(null);
  const responderVideoRef = useRef<HTMLVideoElement>(null);

  const [isVoting, setIsVoting] = useState(false);
  const [votedFor, setVotedFor] = useState<number | null>(matchup.currentUserVotedFor);
  const [initiatorVotes, setInitiatorVotes] = useState(matchup.initiatorVotes);
  const [responderVotes, setResponderVotes] = useState(matchup.responderVotes);

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!matchup.votingEndsAt) return null;
    const endTime = new Date(matchup.votingEndsAt).getTime();
    const now = Date.now();
    const remaining = endTime - now;

    if (remaining <= 0) return 'Voting ended';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  // Play videos when modal is open
  useEffect(() => {
    if (isOpen && matchup.status === 'active') {
      initiatorVideoRef.current?.play().catch(console.error);
      responderVideoRef.current?.play().catch(console.error);
    }
  }, [isOpen, matchup.status]);

  const handleVote = async (votedForUserId: number) => {
    if (isVoting || votedFor !== null) return;

    // Check if user is a participant (can't vote on own matchup)
    if (currentUserId === matchup.initiatorId || currentUserId === matchup.responderId) {
      return;
    }

    setIsVoting(true);
    try {
      await friendMatchupsApi.vote(matchup.id, { votedForUserId });
      setVotedFor(votedForUserId);
      if (votedForUserId === matchup.initiatorId) {
        setInitiatorVotes((prev) => prev + 1);
      } else {
        setResponderVotes((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = initiatorVotes + responderVotes;
  const initiatorPercentage = totalVotes > 0 ? Math.round((initiatorVotes / totalVotes) * 100) : 50;
  const responderPercentage = totalVotes > 0 ? Math.round((responderVotes / totalVotes) * 100) : 50;

  const isParticipant =
    currentUserId === matchup.initiatorId || currentUserId === matchup.responderId;

  const renderActiveMatchup = () => (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-col" />
          <span className="font-semibold">1v1 Challenge</span>
        </div>
        <span className="text-sm text-text-col/60">{getTimeRemaining()}</span>
      </div>

      {/* Custom prompt */}
      {matchup.customPrompt && (
        <p className="text-sm text-center text-text-col mb-4">
          &quot;{matchup.customPrompt}&quot;
        </p>
      )}

      {/* Videos side by side */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Initiator */}
        <div className="relative">
          <video
            ref={initiatorVideoRef}
            src={matchup.initiatorVideoUrl}
            className="w-full aspect-[9/16] object-cover rounded-lg"
            loop
            muted
            playsInline
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
            <div className="flex items-center gap-2">
              {matchup.initiator.profileImageUrl ? (
                <img
                  src={matchup.initiator.profileImageUrl}
                  alt={matchup.initiator.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs">
                    {matchup.initiator.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-white text-sm font-medium truncate">
                {matchup.initiator.username}
              </span>
            </div>
          </div>
          {votedFor === matchup.initiatorId && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Responder */}
        <div className="relative">
          <video
            ref={responderVideoRef}
            src={matchup.responderVideoUrl || ''}
            className="w-full aspect-[9/16] object-cover rounded-lg"
            loop
            muted
            playsInline
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
            <div className="flex items-center gap-2">
              {matchup.responder.profileImageUrl ? (
                <img
                  src={matchup.responder.profileImageUrl}
                  alt={matchup.responder.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs">
                    {matchup.responder.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-white text-sm font-medium truncate">
                {matchup.responder.username}
              </span>
            </div>
          </div>
          {votedFor === matchup.responderId && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Vote counts */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold">{initiatorVotes}</p>
          <p className="text-xs text-text-col/60">({initiatorPercentage}%)</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{responderVotes}</p>
          <p className="text-xs text-text-col/60">({responderPercentage}%)</p>
        </div>
      </div>

      {/* Vote buttons */}
      {!isParticipant && votedFor === null && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleVote(matchup.initiatorId)}
            disabled={isVoting}
            className="py-3 bg-accent-col text-white rounded-lg font-medium hover:bg-accent-col/80 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Vote
          </button>
          <button
            onClick={() => handleVote(matchup.responderId)}
            disabled={isVoting}
            className="py-3 bg-accent-col text-white rounded-lg font-medium hover:bg-accent-col/80 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Vote
          </button>
        </div>
      )}

      {isParticipant && (
        <p className="text-center text-sm text-text-col/60">
          You cannot vote on your own matchup
        </p>
      )}

      {votedFor !== null && (
        <p className="text-center text-sm text-green-500">
          Thanks for voting!
        </p>
      )}
    </div>
  );

  const renderCompletedMatchup = () => {
    const winner = matchup.winner;
    const isTie = winner === null;

    return (
      <div className="p-4 text-center">
        {/* Trophy icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isTie ? 'bg-blue-500/20' : 'bg-yellow-500/20'
            }`}
          >
            <Trophy className={`w-8 h-8 ${isTie ? 'text-blue-500' : 'text-yellow-500'}`} />
          </div>
        </div>

        {/* Result */}
        {isTie ? (
          <h3 className="text-xl font-bold text-blue-400 mb-2">It&apos;s a Draw!</h3>
        ) : (
          <>
            <h3 className="text-xl font-bold text-yellow-500 mb-2">{winner?.username} Wins!</h3>
          </>
        )}

        {/* Custom prompt */}
        {matchup.customPrompt && (
          <p className="text-sm text-text-col/60 mb-4">
            &quot;{matchup.customPrompt}&quot;
          </p>
        )}

        {/* Final score */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="text-center">
            <p className="font-medium">{matchup.initiator.username}</p>
            <p className="text-2xl font-bold">{initiatorVotes}</p>
          </div>
          <span className="text-2xl text-text-col/40">vs</span>
          <div className="text-center">
            <p className="font-medium">{matchup.responder.username}</p>
            <p className="text-2xl font-bold">{responderVotes}</p>
          </div>
        </div>

        <p className="text-sm text-text-col/40">
          Videos have been deleted after voting ended
        </p>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="1v1 Challenge" size="md">
      {matchup.status === 'active' && renderActiveMatchup()}
      {matchup.status === 'completed' && renderCompletedMatchup()}
      {matchup.status === 'expired' && (
        <div className="p-4 text-center">
          <Trophy className="w-12 h-12 text-text-col/40 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-text-col/60 mb-2">Challenge Expired</h3>
          <p className="text-sm text-text-col/40">No response was received in time</p>
        </div>
      )}
      {matchup.status === 'cancelled' && (
        <div className="p-4 text-center">
          <Trophy className="w-12 h-12 text-text-col/40 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-text-col/60 mb-2">Challenge Cancelled</h3>
          <p className="text-sm text-text-col/40">This challenge was cancelled</p>
        </div>
      )}
    </Modal>
  );
}
