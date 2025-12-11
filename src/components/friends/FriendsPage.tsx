'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

interface PaginationState {
  offset: number;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const FriendsPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendsPagination, setFriendsPagination] = useState<PaginationState>({
    offset: 0,
    hasMore: false,
    isLoadingMore: false,
  });
  const [receivedPagination, setReceivedPagination] = useState<PaginationState>(
    {
      offset: 0,
      hasMore: false,
      isLoadingMore: false,
    }
  );
  const [sentPagination, setSentPagination] = useState<PaginationState>({
    offset: 0,
    hasMore: false,
    isLoadingMore: false,
  });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadFriends = useCallback(
    async (reset = true) => {
      if (!isAuthenticated) return;

      const limit = 20;
      const offset = reset ? 0 : friendsPagination.offset;

      try {
        if (reset) {
          setIsLoading(true);
        } else {
          setFriendsPagination((prev) => ({ ...prev, isLoadingMore: true }));
        }
        setError(null);

        const results = await friendshipsApi.getMyFriends(
          offset,
          limit,
          searchQuery || undefined
        );

        setFriends((prev) => (reset ? results : [...prev, ...results]));
        setFriendsPagination({
          offset: offset + results.length,
          hasMore: results.length === limit,
          isLoadingMore: false,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load friends');
        setFriendsPagination((prev) => ({ ...prev, isLoadingMore: false }));
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, friendsPagination.offset, searchQuery]
  );

  const loadReceivedRequests = useCallback(
    async (reset = true) => {
      if (!isAuthenticated) return;

      const limit = 20;
      const offset = reset ? 0 : receivedPagination.offset;

      try {
        if (reset) {
          setIsLoading(true);
        } else {
          setReceivedPagination((prev) => ({ ...prev, isLoadingMore: true }));
        }
        setError(null);

        const results = await friendshipsApi.getReceivedRequests(
          offset,
          limit,
          searchQuery || undefined
        );

        setReceivedRequests((prev) =>
          reset ? results : [...prev, ...results]
        );
        setReceivedPagination({
          offset: offset + results.length,
          hasMore: results.length === limit,
          isLoadingMore: false,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load requests'
        );
        setReceivedPagination((prev) => ({ ...prev, isLoadingMore: false }));
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, receivedPagination.offset, searchQuery]
  );

  const loadSentRequests = useCallback(
    async (reset = true) => {
      if (!isAuthenticated) return;

      const limit = 20;
      const offset = reset ? 0 : sentPagination.offset;

      try {
        if (reset) {
          setIsLoading(true);
        } else {
          setSentPagination((prev) => ({ ...prev, isLoadingMore: true }));
        }
        setError(null);

        const results = await friendshipsApi.getSentRequests(
          offset,
          limit,
          searchQuery || undefined
        );

        setSentRequests((prev) => (reset ? results : [...prev, ...results]));
        setSentPagination({
          offset: offset + results.length,
          hasMore: results.length === limit,
          isLoadingMore: false,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load sent requests'
        );
        setSentPagination((prev) => ({ ...prev, isLoadingMore: false }));
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, sentPagination.offset, searchQuery]
  );

  // Load data when tab changes
  useEffect(() => {
    if (isAuthenticated) {
      switch (activeTab) {
        case 'friends':
          loadFriends(true);
          break;
        case 'received':
          loadReceivedRequests(true);
          break;
        case 'sent':
          loadSentRequests(true);
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated]);

  // Debounced search effect
  useEffect(() => {
    if (!isAuthenticated) return;

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      switch (activeTab) {
        case 'friends':
          loadFriends(true);
          break;
        case 'received':
          loadReceivedRequests(true);
          break;
        case 'sent':
          loadSentRequests(true);
          break;
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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

  const handleLoadMoreFriends = () => {
    if (!friendsPagination.isLoadingMore && friendsPagination.hasMore) {
      loadFriends(false);
    }
  };

  const handleLoadMoreReceived = () => {
    if (!receivedPagination.isLoadingMore && receivedPagination.hasMore) {
      loadReceivedRequests(false);
    }
  };

  const handleLoadMoreSent = () => {
    if (!sentPagination.isLoadingMore && sentPagination.hasMore) {
      loadSentRequests(false);
    }
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
          hasMore={friendsPagination.hasMore}
          isLoadingMore={friendsPagination.isLoadingMore}
          onSearchChange={setSearchQuery}
          onUnfriend={handleUnfriend}
          onLoadMore={handleLoadMoreFriends}
        />
      )}

      {activeTab === 'received' && (
        <ReceivedRequestsTab
          requests={receivedRequests}
          searchQuery={searchQuery}
          isLoading={isLoading}
          hasMore={receivedPagination.hasMore}
          isLoadingMore={receivedPagination.isLoadingMore}
          onSearchChange={setSearchQuery}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          onLoadMore={handleLoadMoreReceived}
        />
      )}

      {activeTab === 'sent' && (
        <SentRequestsTab
          requests={sentRequests}
          searchQuery={searchQuery}
          isLoading={isLoading}
          hasMore={sentPagination.hasMore}
          isLoadingMore={sentPagination.isLoadingMore}
          onSearchChange={setSearchQuery}
          onLoadMore={handleLoadMoreSent}
        />
      )}
    </div>
  );
};

export default FriendsPage;
