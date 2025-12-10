'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/api/profile';

interface FriendListItemProps {
  friend: UserProfile;
  onClose: () => void;
}

function FriendListItem({ friend, onClose }: FriendListItemProps) {
  const fullName = [friend.firstName, friend.lastName]
    .filter(Boolean)
    .join(' ');
  const initials = [friend.firstName?.[0], friend.lastName?.[0]]
    .filter(Boolean)
    .join('');

  return (
    <Link
      href={`/profile/${friend.username}`}
      onClick={onClose}
      className="flex items-center space-x-3 py-3 px-2 border-b border-bg-col/50 hover:bg-bg-col/30 transition-colors last:border-b-0"
    >
      <div className="relative w-10 h-10 rounded-full bg-bg-col/50 overflow-hidden flex-shrink-0">
        {friend.profileImageUrl ? (
          <Image
            src={friend.profileImageUrl}
            alt={`${friend.username}'s profile`}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent-col/20">
            <span className="text-sm font-semibold text-text-col">
              {initials || friend.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-col font-medium text-sm truncate">{fullName}</p>
        <p className="text-text-col/60 text-xs truncate">
          @{friend.username}
        </p>
      </div>
    </Link>
  );
}

export default memo(FriendListItem);
