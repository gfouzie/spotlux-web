'use client';

import { Friendship } from '@/api/friendships';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { formatShortDate } from '@/lib/dateUtils';

interface SentRequestsTabProps {
  requests: Friendship[];
  searchQuery: string;
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onSearchChange: (query: string) => void;
  onLoadMore: () => void;
}

const SentRequestsTab = ({
  requests,
  searchQuery,
  isLoading,
  hasMore,
  isLoadingMore,
  onSearchChange,
  onLoadMore,
}: SentRequestsTabProps) => {
  return (
    <div>
      <Input
        placeholder="Search sent requests..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-4"
      />

      {isLoading ? (
        <div className="text-center text-text-col">
          Loading sent requests...
        </div>
      ) : requests?.length === 0 ? (
        <div className="text-center text-text-col/50">
          No pending sent requests
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
                  User ID: {request.addresseeId}
                </div>
                <div className="text-sm text-text-col/60">
                  Sent {formatShortDate(request.createdAt)}
                </div>
              </div>
              <div className="text-sm text-text-col/60">Pending</div>
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

export default SentRequestsTab;
