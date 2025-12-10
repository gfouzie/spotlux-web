'use client';

import { Friendship } from '@/api/friendships';
import Button from '@/components/common/Button';

interface ReceivedRequestsTabProps {
  requests: Friendship[];
  isLoading: boolean;
  onAccept: (friendshipId: number) => void;
  onReject: (friendshipId: number) => void;
}

const ReceivedRequestsTab = ({
  requests,
  isLoading,
  onAccept,
  onReject,
}: ReceivedRequestsTabProps) => {
  return (
    <div>
      {isLoading ? (
        <div className="text-center text-text-col">Loading requests...</div>
      ) : requests?.length === 0 ? (
        <div className="text-center text-text-col/50">
          No pending friend requests
        </div>
      ) : (
        <div className="space-y-2">
          {requests?.map((request) => (
            <div
              key={request.id}
              className="p-4 bg-bg-col/30 rounded border border-bg-col flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-text-col">
                  User ID: {request.requesterId}
                </div>
                <div className="text-sm text-text-col/60">
                  Sent {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onAccept(request.id)}>
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onReject(request.id)}
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
};

export default ReceivedRequestsTab;
