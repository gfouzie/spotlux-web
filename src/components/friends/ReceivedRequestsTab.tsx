'use client';

import { Friendship } from '@/api/friendships';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

interface ReceivedRequestsTabProps {
  requests: Friendship[];
  searchQuery: string;
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onSearchChange: (query: string) => void;
  onAccept: (friendshipId: number) => void;
  onReject: (friendshipId: number) => void;
  onLoadMore: () => void;
}

const ReceivedRequestsTab = ({
  requests,
  searchQuery,
  isLoading,
  hasMore,
  isLoadingMore,
  onSearchChange,
  onAccept,
  onReject,
  onLoadMore,
}: ReceivedRequestsTabProps) => {
  return (
    <div>
      <Input
        placeholder="Search received requests..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-4"
      />

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

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                variant="secondary"
                size="md"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceivedRequestsTab;
