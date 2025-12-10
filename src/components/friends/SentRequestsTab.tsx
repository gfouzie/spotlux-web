'use client';

import { Friendship } from '@/api/friendships';

interface SentRequestsTabProps {
  requests: Friendship[];
  isLoading: boolean;
}

const SentRequestsTab = ({ requests, isLoading }: SentRequestsTabProps) => {
  return (
    <div>
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
                  Sent {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-text-col/60">Pending</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentRequestsTab;
