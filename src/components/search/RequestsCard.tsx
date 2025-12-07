'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendshipsApi, type Friendship } from '@/api/friendships';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export default function RequestsCard() {
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [isAuthenticated]);

  const loadRequests = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const requests = await friendshipsApi.getReceivedRequests(0, 100);
      setRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (friendshipId: number) => {
    if (!isAuthenticated) return;

    try {
      await friendshipsApi.acceptFriendRequest(friendshipId);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
    }
  };

  const handleReject = async (friendshipId: number) => {
    if (!isAuthenticated) return;

    try {
      await friendshipsApi.rejectFriendRequest(friendshipId);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    }
  };

  return (
    <div className="bg-component-col rounded border border-bg-col p-4">
      <h3 className="text-lg font-semibold text-text-col mb-4">
        Friend Requests
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
            <div
              key={request.id}
              className="p-3 bg-bg-col/30 rounded border border-bg-col"
            >
              <div className="mb-3">
                <div className="font-medium text-text-col">
                  User ID: {request.requesterId}
                </div>
                <div className="text-xs text-text-col/60 mt-1">
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(request.id)}
                  className="flex-1"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleReject(request.id)}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
