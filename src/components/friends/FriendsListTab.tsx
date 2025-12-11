'use client';

import { UserProfile } from '@/api/profile';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Link from 'next/link';
import Image from 'next/image';

interface FriendsListTabProps {
  friends: UserProfile[];
  searchQuery: string;
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onSearchChange: (query: string) => void;
  onUnfriend: (userId: number) => void;
  onLoadMore: () => void;
}

const FriendsListTab = ({
  friends,
  searchQuery,
  isLoading,
  hasMore,
  isLoadingMore,
  onSearchChange,
  onUnfriend,
  onLoadMore,
}: FriendsListTabProps) => {

  return (
    <div>
      <Input
        placeholder="Search friends..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-4"
      />

      {isLoading ? (
        <div className="text-center text-text-col">Loading friends...</div>
      ) : friends?.length === 0 ? (
        <div className="text-center text-text-col/50">
          {searchQuery
            ? 'No friends found matching your search'
            : 'You have no friends yet'}
        </div>
      ) : (
        <div className="space-y-2">
          {friends?.map((friend) => (
            <div
              key={friend.id}
              className="p-4 bg-bg-col/30 rounded border border-bg-col hover:bg-bg-col/50 flex justify-between items-center"
            >
              <Link
                href={`/profile/${friend.username}`}
                className="flex items-center gap-3 flex-1"
              >
                <div className="relative w-12 h-12 rounded-full bg-bg-col overflow-hidden">
                  {friend.profileImageUrl ? (
                    <Image
                      src={friend.profileImageUrl}
                      alt={`${friend.username}'s profile`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-col/40">
                      {friend.firstName?.charAt(0) || friend.username.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-text-col">
                    {friend.firstName} {friend.lastName}
                  </div>
                  <div className="text-sm text-text-col/60">
                    @{friend.username}
                  </div>
                </div>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onUnfriend(friend.id)}
              >
                Unfriend
              </Button>
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

export default FriendsListTab;
