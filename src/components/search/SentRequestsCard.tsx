'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  friendshipsApi,
  type FriendshipWithAddressee,
} from '@/api/friendships';
import Alert from '@/components/common/Alert';
import SentRequestItem from './SentRequestItem';

interface SentRequestsCardProps {
  refreshTrigger?: number;
  onStatusChange?: () => void;
}

export default function SentRequestsCard({ refreshTrigger, onStatusChange }: SentRequestsCardProps) {
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<FriendshipWithAddressee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const requests = await friendshipsApi.getSentRequests(0, 100);
      setRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests, refreshTrigger]);

  const handleCancel = useCallback(
    async (friendshipId: number) => {
      if (!isAuthenticated) return;

      try {
        await friendshipsApi.cancelFriendRequest(friendshipId);
        await loadRequests();
        // Notify parent to refresh user list
        if (onStatusChange) {
          onStatusChange();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel request');
      }
    },
    [isAuthenticated, loadRequests, onStatusChange]
  );

  return (
    <div className="bg-card-col rounded-lg p-6">
      <h3 className="mb-4">
        Sent Requests
      </h3>

      {error && (
        <Alert variant="error" className="mb-4 text-sm">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : requests?.length === 0 ? (
        <div className="text-center py-8 text-text-col/50 text-sm">
          No pending requests
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {requests?.map((request) => (
            <SentRequestItem
              key={request.id}
              request={request}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
