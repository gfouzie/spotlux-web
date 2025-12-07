'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  friendshipsApi,
  type FriendshipStatusResponse,
} from '@/api/friendships';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

interface FriendButtonProps {
  userId: number;
  onStatusChange?: () => void;
}

export default function FriendButton({
  userId,
  onStatusChange,
}: FriendButtonProps) {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<FriendshipStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAutoAcceptMessage, setShowAutoAcceptMessage] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadFriendshipStatus();
    }
  }, [isAuthenticated, userId]);

  const loadFriendshipStatus = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const statusData = await friendshipsApi.getFriendshipStatus(userId);
      setStatus(statusData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load friendship status'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!isAuthenticated) return;

    try {
      setIsActionLoading(true);
      setError(null);
      const response = await friendshipsApi.sendFriendRequest({
        addresseeId: userId,
      });

      if (response.autoAccepted) {
        setShowAutoAcceptMessage(true);
        setTimeout(() => setShowAutoAcceptMessage(false), 3000);
      }

      await loadFriendshipStatus();
      onStatusChange?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send friend request'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!isAuthenticated || !status?.friendshipId) return;

    try {
      setIsActionLoading(true);
      setError(null);
      await friendshipsApi.acceptFriendRequest(status.friendshipId);
      await loadFriendshipStatus();
      onStatusChange?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to accept friend request'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!isAuthenticated || !status?.friendshipId) return;

    try {
      setIsActionLoading(true);
      setError(null);
      await friendshipsApi.rejectFriendRequest(status.friendshipId);
      await loadFriendshipStatus();
      onStatusChange?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to reject friend request'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!isAuthenticated) return;
    if (!confirm('Are you sure you want to unfriend this user?')) return;

    try {
      setIsActionLoading(true);
      setError(null);
      await friendshipsApi.unfriend(userId);
      await loadFriendshipStatus();
      onStatusChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unfriend user');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Button size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div>
      {error && (
        <Alert variant="error" className="mb-2 text-sm">
          {error}
        </Alert>
      )}

      {showAutoAcceptMessage && (
        <Alert variant="success" className="mb-2 text-sm">
          You're now friends! (Mutual request auto-accepted)
        </Alert>
      )}

      {status.status === 'none' && (
        <Button
          size="sm"
          onClick={handleSendRequest}
          isLoading={isActionLoading}
          disabled={isActionLoading}
        >
          Add Friend
        </Button>
      )}

      {status.status === 'pending' && status.isRequester && (
        <Button size="sm" variant="secondary" disabled>
          Request Sent
        </Button>
      )}

      {status.status === 'pending' && !status.isRequester && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAcceptRequest}
            isLoading={isActionLoading}
            disabled={isActionLoading}
          >
            Accept Request
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRejectRequest}
            disabled={isActionLoading}
          >
            Reject
          </Button>
        </div>
      )}

      {status.status === 'accepted' && (
        <Button
          size="sm"
          variant="secondary"
          onClick={handleUnfriend}
          isLoading={isActionLoading}
          disabled={isActionLoading}
        >
          Friends
        </Button>
      )}
    </div>
  );
}
