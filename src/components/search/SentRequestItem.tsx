'use client';

import { memo } from 'react';
import { FriendshipWithAddressee } from '@/api/friendships';
import Button from '@/components/common/Button';
import { formatShortDate } from '@/lib/dateUtils';

interface SentRequestItemProps {
  request: FriendshipWithAddressee;
  onCancel: (friendshipId: number) => void;
}

function SentRequestItem({ request, onCancel }: SentRequestItemProps) {
  const { addressee } = request;

  // Handle case where addressee might not be loaded
  if (!addressee) {
    return null;
  }

  const fullName = [addressee.firstName, addressee.lastName]
    .filter(Boolean)
    .join(' ');
  const displayName = fullName || addressee.username;

  return (
    <div className="p-3 bg-bg-col/30 rounded border border-bg-col">
      <div className="flex items-center gap-3 mb-3">
        {addressee.photoUrl ? (
          <img
            src={addressee.photoUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-bg-col/50 flex items-center justify-center text-text-col/60">
            {addressee.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="font-medium text-text-col">{displayName}</div>
          <div className="text-sm text-text-col/60">@{addressee.username}</div>
          <div className="text-xs text-text-col/60 mt-1">
            Sent {formatShortDate(request.createdAt)}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onCancel(request.id)}
        className="w-full"
      >
        Cancel Request
      </Button>
    </div>
  );
}

export default memo(SentRequestItem);
