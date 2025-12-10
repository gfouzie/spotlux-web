'use client';

import { UserProfile } from '@/api/profile';

interface FriendSelectItemProps {
  friend: UserProfile;
  onSelect: (friendId: number) => void;
}

const FriendSelectItem = ({ friend, onSelect }: FriendSelectItemProps) => {
  const displayName =
    friend.firstName && friend.lastName
      ? `${friend.firstName} ${friend.lastName}`
      : friend.username;

  const initial = friend.firstName?.[0] || friend.username?.[0] || 'U';

  return (
    <button
      onClick={() => onSelect(friend.id)}
      className="cursor-pointer w-full p-3 bg-bg-col hover:bg-bg-col/50 rounded-lg transition-colors flex items-center gap-3 text-left"
    >
      <div className="w-10 h-10 rounded-full bg-accent-col/20 flex items-center justify-center text-sm font-medium flex-shrink-0">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{displayName}</p>
        <p className="text-sm text-text-col/60 truncate">@{friend.username}</p>
      </div>
    </button>
  );
};

export default FriendSelectItem;
