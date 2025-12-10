'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendshipsApi, type Friendship } from '@/api/friendships';
import { UserProfile } from '@/api/profile';
import Alert from '@/components/common/Alert';
import FriendsHeader from './FriendsHeader';
import FriendsTabNavigation from './FriendsTabNavigation';
import FriendsListTab from './FriendsListTab';
import ReceivedRequestsTab from './ReceivedRequestsTab';
import SentRequestsTab from './SentRequestsTab';

type TabType = 'friends' | 'received' | 'sent';

const FriendsPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const friends = await friendshipsApi.getMyFriends(0, 100);
      setFriends(friends);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadReceivedRequests = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const requests = await friendshipsApi.getReceivedRequests(0, 100);
      setReceivedRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadSentRequests = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const requests = await friendshipsApi.getSentRequests(0, 100);
      setSentRequests(requests);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load sent requests'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      switch (activeTab) {
        case 'friends':
          loadFriends();
          break;
        case 'received':
          loadReceivedRequests();
          break;
        case 'sent':
          loadSentRequests();
          break;
      }
    }
  }, [
    activeTab,
    isAuthenticated,
    loadFriends,
    loadReceivedRequests,
    loadSentRequests,
  ]);

  const handleAcceptRequest = async (friendshipId: number) => {
    if (!isAuthenticated) return;

    try {
      await friendshipsApi.acceptFriendRequest(friendshipId);
      await loadReceivedRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    if (!isAuthenticated) return;

    try {
      await friendshipsApi.rejectFriendRequest(friendshipId);
      await loadReceivedRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    }
  };

  const handleUnfriend = async (userId: number) => {
    if (!isAuthenticated) return;
    if (!confirm('Are you sure you want to unfriend this user?')) return;

    try {
      await friendshipsApi.unfriend(userId);
      await loadFriends();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unfriend user');
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FriendsHeader />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <FriendsTabNavigation
        activeTab={activeTab}
        friendsCount={friends?.length || 0}
        receivedRequestsCount={receivedRequests?.length || 0}
        sentRequestsCount={sentRequests?.length || 0}
        onTabChange={handleTabChange}
      />

      {activeTab === 'friends' && (
        <FriendsListTab
          friends={friends}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onUnfriend={handleUnfriend}
        />
      )}

      {activeTab === 'received' && (
        <ReceivedRequestsTab
          requests={receivedRequests}
          isLoading={isLoading}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}

      {activeTab === 'sent' && (
        <SentRequestsTab requests={sentRequests} isLoading={isLoading} />
      )}
    </div>
  );
};

export default FriendsPage;
