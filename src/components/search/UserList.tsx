'use client';

import { User } from '@/api/user';
import UserListItem from './UserListItem';

interface UserListProps {
  users: User[];
  currentUserId: number;
  isLoading: boolean;
  emptyMessage?: string;
  onStatusChange?: () => void;
}

export default function UserList({
  users,
  currentUserId,
  isLoading,
  emptyMessage = 'No users found',
  onStatusChange,
}: UserListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (users?.length === 0) {
    return (
      <div className="text-center py-12 text-text-col/50">{emptyMessage}</div>
    );
  }

  return (
    <div className="space-y-2">
      {users?.map((user) => (
        <UserListItem
          key={user.id}
          user={user}
          isOwnProfile={user.id === currentUserId}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
