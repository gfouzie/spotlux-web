'use client';

import { useState } from 'react';
import { MessageWithSender } from '@/api/conversations';
import { FriendMatchup, friendMatchupsApi } from '@/api/friendMatchups';
import { formatDistanceToNow } from 'date-fns';
import { Trophy, Play } from 'iconoir-react';
import RespondToMatchupModal from './RespondToMatchupModal';
import FriendMatchupDetailModal from './FriendMatchupDetailModal';

interface FriendMatchupMessageBubbleProps {
  message: MessageWithSender;
  currentUserId: number;
  onMatchupUpdated?: () => void;
}

/**
 * Renders friend matchup messages based on type and status.
 * - Invite (pending): Shows challenge with "Respond" button for responder
 * - Invite (active): Shows "Matchup is live!" with view link
 * - Invite (expired/cancelled): Shows expiration message
 * - Confirmed: Shows system message about matchup starting
 * - Result: Shows winner announcement or tie
 */
export default function FriendMatchupMessageBubble({
  message,
  currentUserId,
  onMatchupUpdated,
}: FriendMatchupMessageBubbleProps) {
  const isSent = message.senderId === currentUserId;
  const matchup = message.friendMatchup;
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleDecline = async () => {
    if (!matchup || isDeclining) return;

    setIsDeclining(true);
    try {
      await friendMatchupsApi.decline(matchup.id);
      // WebSocket will handle the UI update
    } catch (error) {
      console.error('Failed to decline matchup:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  // Format timestamp
  const timestamp = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  // Check if current user is the responder
  const isResponder = matchup?.responderId === currentUserId;

  // Render based on message type
  const renderContent = () => {
    if (!matchup) {
      // Fallback for messages without matchup data
      return (
        <div className="px-4 py-3 bg-card-col border border-text-col/10 rounded-2xl">
          <p className="text-sm text-text-col/60">{message.content}</p>
        </div>
      );
    }

    switch (message.messageType) {
      case 'friend_matchup_invite':
        return renderInviteMessage(matchup);
      case 'friend_matchup_confirmed':
        return renderConfirmedMessage(matchup);
      case 'friend_matchup_result':
        return renderResultMessage(matchup);
      default:
        return (
          <div className="px-4 py-3 bg-card-col border border-text-col/10 rounded-2xl">
            <p className="text-sm">{message.content}</p>
          </div>
        );
    }
  };

  const renderInviteMessage = (matchup: FriendMatchup) => {
    const status = matchup.status;

    if (status === 'pending_response') {
      return (
        <div className="bg-gradient-to-br from-accent-col/20 to-accent-col/5 border border-accent-col/30 rounded-2xl p-4 max-w-[280px]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-accent-col" />
            <span className="font-semibold text-accent-col">1v1 Challenge</span>
          </div>

          {/* Prompt if custom */}
          {matchup.customPrompt && (
            <p className="text-sm text-text-col mb-3">&quot;{matchup.customPrompt}&quot;</p>
          )}

          {/* Video Preview */}
          <div className="relative mb-3 rounded-lg overflow-hidden bg-black aspect-video">
            <video
              src={matchup.initiatorVideoUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Duration info */}
          <p className="text-xs text-text-col/60 mb-3">
            {matchup.votingDurationHours === 24 && '1 day voting period'}
            {matchup.votingDurationHours === 72 && '3 day voting period'}
            {matchup.votingDurationHours === 168 && '1 week voting period'}
          </p>

          {/* Response buttons for responder */}
          {isResponder && (
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                disabled={isDeclining}
                className="flex-1 py-2 bg-text-col/10 text-text-col rounded-lg font-medium hover:bg-text-col/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeclining ? 'Declining...' : 'Decline'}
              </button>
              <button
                onClick={() => setShowRespondModal(true)}
                className="flex-1 py-2 bg-accent-col text-white rounded-lg font-medium hover:bg-accent-col/80 transition-colors cursor-pointer"
              >
                Accept Challenge
              </button>
            </div>
          )}
        </div>
      );
    }

    if (status === 'active') {
      // Calculate time remaining
      let timeRemaining = '';
      if (matchup.votingEndsAt) {
        const now = new Date();
        const endsAt = new Date(matchup.votingEndsAt);
        const hoursLeft = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60)));
        if (hoursLeft < 1) {
          timeRemaining = 'Closing soon';
        } else if (hoursLeft < 24) {
          timeRemaining = `Closing in ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}`;
        } else {
          const daysLeft = Math.floor(hoursLeft / 24);
          timeRemaining = `Closing in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
        }
      }

      return (
        <div
          onClick={() => setShowDetailModal(true)}
          className="bg-gradient-to-br from-accent-col/20 to-accent-col/5 border border-accent-col/30 rounded-2xl p-4 max-w-[280px] cursor-pointer hover:border-accent-col/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-accent-col" />
            <span className="font-semibold text-accent-col">Matchup is Live</span>
          </div>
          {matchup.customPrompt && (
            <p className="text-sm text-text-col mb-2">&quot;{matchup.customPrompt}&quot;</p>
          )}
          <p className="text-xs text-text-col/60">{timeRemaining}</p>
        </div>
      );
    }

    if (status === 'expired') {
      return (
        <div className="bg-card-col border border-text-col/10 rounded-2xl p-4 max-w-[280px] opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-text-col/40" />
            <span className="font-semibold text-text-col/60">Challenge Expired</span>
          </div>
          <p className="text-sm text-text-col/40">No response received in time</p>
        </div>
      );
    }

    if (status === 'cancelled') {
      return (
        <div className="bg-card-col border border-text-col/10 rounded-2xl p-4 max-w-[280px] opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-text-col/40" />
            <span className="font-semibold text-text-col/60">Challenge Cancelled</span>
          </div>
        </div>
      );
    }

    if (status === 'declined') {
      return (
        <div className="bg-card-col border border-text-col/10 rounded-2xl p-4 max-w-[280px] opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-text-col/40" />
            <span className="font-semibold text-text-col/60">Challenge Declined</span>
          </div>
          <p className="text-sm text-text-col/40">This challenge was declined</p>
        </div>
      );
    }

    if (status === 'completed') {
      return (
        <div
          onClick={() => setShowDetailModal(true)}
          className="bg-card-col border border-text-col/10 rounded-2xl p-4 max-w-[280px] cursor-pointer hover:border-text-col/20 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-text-col/60" />
            <span className="font-semibold text-text-col/60">Matchup Completed</span>
          </div>
          <p className="text-xs text-text-col/40">Tap to see results</p>
        </div>
      );
    }

    return null;
  };

  const renderConfirmedMessage = (_matchup: FriendMatchup) => {
    // Don't render - the active matchup card already shows the status
    return null;
  };

  const renderResultMessage = (matchup: FriendMatchup) => {
    // Don't render for declined matchups - the invite message already shows the declined state
    if (matchup.status === 'declined') {
      return null;
    }

    // This is a system message with results
    return (
      <div
        onClick={() => setShowDetailModal(true)}
        className="bg-card-col border border-text-col/10 rounded-2xl p-4 max-w-[280px] cursor-pointer hover:border-text-col/20 transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-accent-col" />
          <span className="font-semibold text-text-col">Matchup Complete</span>
        </div>
        <p className="text-sm text-text-col/60">{message.content}</p>
        <p className="text-xs text-text-col/40 mt-2">Tap to see results</p>
      </div>
    );
  };

  // System messages (confirmed, result) are centered
  const isSystemMessage =
    message.messageType === 'friend_matchup_confirmed' ||
    message.messageType === 'friend_matchup_result';

  return (
    <>
      <div
        className={`flex gap-2 mb-3 ${
          isSystemMessage ? 'justify-center' : isSent ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* Avatar (only for received non-system messages) */}
        {!isSent && !isSystemMessage && (
          <div className="flex-shrink-0 self-end mb-1">
            <div className="w-8 h-8 rounded-full bg-accent-col/20 flex items-center justify-center text-sm font-medium">
              {message.sender?.firstName?.[0] ||
                message.sender?.username?.[0] ||
                'U'}
            </div>
          </div>
        )}

        {/* Message content */}
        <div
          className={`flex flex-col ${
            isSystemMessage ? 'items-center' : isSent ? 'items-end' : 'items-start'
          }`}
        >
          {/* Sender name (only for received non-system messages) */}
          {!isSent && !isSystemMessage && (
            <div className="text-xs text-text-col/60 mb-1 px-3">
              {message.sender?.firstName && message.sender?.lastName
                ? `${message.sender.firstName} ${message.sender.lastName}`
                : message.sender?.username || 'Unknown'}
            </div>
          )}

          {/* Matchup content */}
          {renderContent()}

          {/* Message metadata */}
          <div className="flex items-center gap-2 text-[10px] text-text-col/40 mt-0.5 px-3">
            <span>{timestamp}</span>
          </div>
        </div>
      </div>

      {/* Respond Modal */}
      {matchup && (
        <RespondToMatchupModal
          isOpen={showRespondModal}
          onClose={() => setShowRespondModal(false)}
          matchup={matchup}
          onResponded={() => {
            setShowRespondModal(false);
            onMatchupUpdated?.();
          }}
        />
      )}

      {/* Detail Modal */}
      {matchup && (
        <FriendMatchupDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          matchup={matchup}
        />
      )}
    </>
  );
}
