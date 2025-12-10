'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { userApi, type User } from '@/api/user';
import { friendshipsApi } from '@/api/friendships';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import SearchInput from '@/components/search/SearchInput';
import UserList from '@/components/search/UserList';
import Pagination from '@/components/search/Pagination';
import RequestsCard from '@/components/search/RequestsCard';
import SentRequestsCard from '@/components/search/SentRequestsCard';
import Alert from '@/components/common/Alert';

type TabType = 'all' | 'friends';

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [itemsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const users = await userApi.getUsers({
        offset: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
      });
      setUsers(users);
      // We can only determine if there are more pages by checking if we got a full page
      if (users.length < itemsPerPage) {
        setTotalCount((page - 1) * itemsPerPage + users.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, page, itemsPerPage, debouncedSearch]);

  const loadFriends = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const friends = await friendshipsApi.getMyFriends(
        (page - 1) * itemsPerPage,
        itemsPerPage
      );
      setUsers(friends);
      // We can only determine if there are more pages by checking if we got a full page
      if (friends.length < itemsPerPage) {
        setTotalCount((page - 1) * itemsPerPage + friends.length);
        setFriendsCount((page - 1) * itemsPerPage + friends.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, page, itemsPerPage]);

  // Load friends count on mount
  useEffect(() => {
    const loadFriendsCount = async () => {
      if (!isAuthenticated) return;
      try {
        // We fetch first page to estimate the count
        const friends = await friendshipsApi.getMyFriends(0, 20);
        // If we got a full page, there might be more, otherwise this is the count
        setFriendsCount(friends.length);
      } catch (err) {
        console.error('Failed to load friends count:', err);
      }
    };

    loadFriendsCount();
  }, [isAuthenticated]);

  // Load users when search or page changes
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'all') {
        loadUsers();
      } else {
        loadFriends();
      }
    }
  }, [
    isAuthenticated,
    debouncedSearch,
    page,
    activeTab,
    loadUsers,
    loadFriends,
  ]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleStatusChange = async () => {
    // Reload the current list when friendship status changes
    if (activeTab === 'all') {
      loadUsers();
    } else {
      loadFriends();
    }

    // Also reload friends count to keep it accurate
    if (isAuthenticated) {
      try {
        // Note: Backend no longer returns totalCount
        // We fetch first page to estimate the count
        const friends = await friendshipsApi.getMyFriends(0, 20);
        setFriendsCount(friends.length);
      } catch (err) {
        console.error('Failed to reload friends count:', err);
      }
    }

    // Trigger refresh for request cards
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery('');
    setDebouncedSearch('');
  };

  const getEmptyMessage = () => {
    if (activeTab === 'friends') {
      return 'You have no friends yet';
    }
    if (debouncedSearch) {
      return 'No users found matching your search';
    }
    return 'People you might know';
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-text-col mb-6">Find People</h1>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Center - Search & Users (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search Input (only show on "all" tab) */}
              {activeTab === 'all' && (
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onDebouncedChange={setDebouncedSearch}
                />
              )}

              {/* Tabs */}
              <div className="flex gap-4 border-b border-bg-col">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`cursor-pointer pb-2 px-4 ${
                    activeTab === 'all'
                      ? 'border-b-2 border-accent-col text-text-col'
                      : 'text-text-col/60 hover:text-text-col'
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => handleTabChange('friends')}
                  className={`cursor-pointer pb-2 px-4 ${
                    activeTab === 'friends'
                      ? 'border-b-2 border-accent-col text-text-col'
                      : 'text-text-col/60 hover:text-text-col'
                  }`}
                >
                  Friends ({friendsCount})
                </button>
              </div>

              {/* User List */}
              <div className="bg-card-col rounded-lg p-6">
                <UserList
                  users={users}
                  currentUserId={currentUser?.id || 0}
                  isLoading={isLoading}
                  emptyMessage={getEmptyMessage()}
                  onStatusChange={handleStatusChange}
                />
              </div>

              {/* Pagination */}
              {!isLoading && totalCount > 0 && (
                <Pagination
                  currentPage={page}
                  totalCount={totalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                />
              )}
            </div>

            {/* Right Sidebar - Friend Requests (1/3 width on large screens) */}
            <div className="lg:col-span-1 space-y-4">
              <RequestsCard
                refreshTrigger={refreshTrigger}
                onStatusChange={handleStatusChange}
              />
              <SentRequestsCard
                refreshTrigger={refreshTrigger}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
