'use client';

import { useState, useEffect, useCallback } from 'react';
import { friendshipsApi } from '@/api/friendships';
import { UserProfile } from '@/api/profile';
import Modal from '@/components/common/Modal';
import FriendListItem from './FriendListItem';
import { Search, Xmark } from 'iconoir-react';

interface FriendsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  isOwnProfile?: boolean;
}

export default function FriendsListModal({
  isOpen,
  onClose,
  userId,
  isOwnProfile = false,
}: FriendsListModalProps) {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadAllFriends = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load friends with search
      const friendsList = isOwnProfile
        ? await friendshipsApi.getMyFriends(0, 100, debouncedSearch || undefined)
        : await friendshipsApi.getUserFriends(userId, 0, 100, debouncedSearch || undefined);

      setFriends(friendsList);
      setIsInitialLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, [isOwnProfile, userId, debouncedSearch]);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setDebouncedSearch('');
      setIsInitialLoad(true);
    }
  }, [isOpen]);

  // Load friends when debounced search changes or modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllFriends();
    }
  }, [isOpen, loadAllFriends]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Friends${friends?.length > 0 ? ` (${friends?.length})` : ''}`}
      size="lg"
    >
      {error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div>
          {/* Search Input - always show unless there's an error */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-col/60">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="w-full pl-10 pr-10 py-2 bg-card-col text-text-col border border-bg-col rounded-md focus:outline-none focus:ring-2 focus:ring-accent-col"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-text-col/60 hover:text-text-col"
                  aria-label="Clear search"
                >
                  <Xmark className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Loading State - only show on initial load */}
          {isLoading && isInitialLoad ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : friends.length === 0 ? (
            /* Empty State */
            <div className="text-center text-text-col/60 py-8 text-sm">
              {searchQuery
                ? `No friends found matching "${searchQuery}"`
                : isOwnProfile
                ? 'You have no friends yet'
                : 'No friends to show'}
            </div>
          ) : (
            /* Friends List */
            <div className="max-h-[500px] overflow-y-auto">
              {friends.map((friend) => (
                <FriendListItem key={friend.id} friend={friend} onClose={onClose} />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
