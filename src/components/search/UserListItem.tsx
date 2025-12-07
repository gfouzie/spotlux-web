'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/api/user';
import FriendButton from '@/components/friends/FriendButton';

interface UserListItemProps {
  user: User;
  isOwnProfile: boolean;
  onStatusChange?: () => void;
}

export default function UserListItem({
  user,
  isOwnProfile,
  onStatusChange,
}: UserListItemProps) {
  return (
    <div className="p-4 bg-bg-col/30 rounded border border-bg-col hover:bg-bg-col/50 transition-colors flex justify-between items-center">
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-3 flex-1"
      >
        <div className="relative w-12 h-12 rounded-full bg-bg-col overflow-hidden flex-shrink-0">
          {user.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt={`${user.username}'s profile`}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-col/40">
              {user.firstName?.charAt(0) || user.username.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-text-col">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-text-col/60">@{user.username}</div>
        </div>
      </Link>
      {!isOwnProfile && (
        <FriendButton userId={user.id} onStatusChange={onStatusChange} />
      )}
    </div>
  );
}
