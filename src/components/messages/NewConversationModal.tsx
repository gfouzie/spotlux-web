'use client';

import { useState, useEffect, useCallback } from 'react';
import { friendshipsApi } from '@/api/friendships';
import { UserProfile } from '@/api/profile';
import Modal from '@/components/common/Modal';
import FriendSelectItem from './FriendSelectItem';

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

  const loadFriends = useCallback(async () => {
    try {
      setIsLoading(true);
      const friendsList = await friendshipsApi.getMyFriends(
        0,
        50,
        searchText || undefined
      );
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchText]);

  // Load friends
  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen, loadFriends]);

  const handleSelectFriend = (friendId: number) => {
    onSelectFriend(friendId);
    onClose();
    setSearchText('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Message" size="md">
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
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
            <FriendSelectItem
              key={friend.id}
              friend={friend}
              onSelect={handleSelectFriend}
            />
          ))
        )}
      </div>
    </Modal>
  );
};

export default NewConversationModal;
