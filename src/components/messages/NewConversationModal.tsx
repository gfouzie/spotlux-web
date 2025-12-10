'use client';

import { useState, useEffect } from 'react';
import { friendshipsApi } from '@/api/friendships';
import { UserProfile } from '@/api/profile';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFriend: (friendId: number) => void;
}

const NewConversationModal = ({
  isOpen,
  onClose,
  onSelectFriend,
}: NewConversationModalProps) => {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load friends
  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen, searchText]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const friendsList = await friendshipsApi.getMyFriends(0, 50, searchText || undefined);
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFriend = (friendId: number) => {
    onSelectFriend(friendId);
    onClose();
    setSearchText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card-col rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">New Message</h2>
          <button
            onClick={onClose}
            className="text-text-col/60 hover:text-text-col transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search friends..."
            className="w-full px-4 py-2 bg-bg-col rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-col"
          />
        </div>

        {/* Friends list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8 text-text-col/60">
              {searchText ? 'No friends found' : 'No friends yet'}
            </div>
          ) : (
            friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => handleSelectFriend(friend.id)}
                className="w-full p-3 bg-bg-col hover:bg-bg-col/50 rounded-lg transition-colors flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-accent-col/20 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {friend.firstName?.[0] || friend.username?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {friend.firstName && friend.lastName
                      ? `${friend.firstName} ${friend.lastName}`
                      : friend.username}
                  </p>
                  <p className="text-sm text-text-col/60 truncate">
                    @{friend.username}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
