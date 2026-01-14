'use client';

import { memo } from 'react';
import { FriendshipWithRequester } from '@/api/friendships';
import Button from '@/components/common/Button';
import { formatShortDate } from '@/lib/dateUtils';

interface FriendRequestItemProps {
  request: FriendshipWithRequester;
  onAccept: (friendshipId: number) => void;
  onReject: (friendshipId: number) => void;
}

function FriendRequestItem({
  request,
  onAccept,
  onReject,
}: FriendRequestItemProps) {
  const { requester } = request;

  // Handle case where requester might not be loaded
  if (!requester) {
    return null;
  }

  const fullName = [requester.firstName, requester.lastName]
    .filter(Boolean)
    .join(' ');
  const displayName = fullName || requester.username;

  return (
    <div className="p-3 bg-bg-col/30 rounded border border-bg-col">
      <div className="flex items-center gap-3 mb-3">
        {requester.photoUrl ? (
          <img
            src={requester.photoUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-bg-col/50 flex items-center justify-center text-text-col/60">
            {requester.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="font-medium text-text-col">{displayName}</div>
          <div className="text-sm text-text-col/60">@{requester.username}</div>
          <div className="text-xs text-text-col/60 mt-1">
            {formatShortDate(request.createdAt)}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onAccept(request.id)}
          className="flex-1"
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onReject(request.id)}
          className="flex-1"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

export default memo(FriendRequestItem);
