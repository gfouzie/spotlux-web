import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './client';
import { UserProfile } from './profile';

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export interface RequesterInfo {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
}

export interface FriendshipWithRequester extends Friendship {
  requester: RequesterInfo;
}

export interface AddresseeInfo {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
}

export interface FriendshipWithAddressee extends Friendship {
  addressee: AddresseeInfo;
}

export interface FriendshipSendRequest {
  addresseeId: number;
}

export interface FriendshipSendResponse extends Friendship {
  autoAccepted: boolean;
}

export interface FriendshipStatusResponse {
  status: 'accepted' | 'pending' | 'none';
  isRequester: boolean;
  friendshipId?: number | null;
}

export const friendshipsApi = {
  // Send friend request
  async sendFriendRequest(
    request: FriendshipSendRequest
  ): Promise<FriendshipSendResponse> {
    return authRequest<FriendshipSendResponse>(
      `${config.apiBaseUrl}/api/v1/user/friends/requests`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  },

  // Get received friend requests
  async getReceivedRequests(
    offset: number = 0,
    limit: number = 20,
    searchText?: string
  ): Promise<FriendshipWithRequester[]> {
    const params = buildQueryParams({
      offset,
      limit,
      searchText,
    });

    return authRequest<FriendshipWithRequester[]>(
      `${config.apiBaseUrl}/api/v1/user/friends/requests/received?${params}`,
      {
        cache: 'no-store',
      }
    );
  },

  // Get sent friend requests
  async getSentRequests(
    offset: number = 0,
    limit: number = 20,
    searchText?: string
  ): Promise<FriendshipWithAddressee[]> {
    const params = buildQueryParams({
      offset,
      limit,
      searchText,
    });

    return authRequest<FriendshipWithAddressee[]>(
      `${config.apiBaseUrl}/api/v1/user/friends/requests/sent?${params}`,
      {
        cache: 'no-store',
      }
    );
  },

  // Cancel a sent friend request
  async cancelFriendRequest(friendshipId: number): Promise<void> {
    return authRequest<void>(
      `${config.apiBaseUrl}/api/v1/user/friends/requests/${friendshipId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Accept friend request
  async acceptFriendRequest(friendshipId: number): Promise<Friendship> {
    return authRequest<Friendship>(
      `${config.apiBaseUrl}/api/v1/user/friends/requests/${friendshipId}/accept`,
      {
        method: 'PATCH',
      }
    );
  },

  // Reject friend request
  async rejectFriendRequest(friendshipId: number): Promise<Friendship> {
    return authRequest<Friendship>(
      `${config.apiBaseUrl}/api/v1/user/friends/requests/${friendshipId}/reject`,
      {
        method: 'PATCH',
      }
    );
  },

  // Get my friends list
  async getMyFriends(
    offset: number = 0,
    limit: number = 20,
    searchText?: string
  ): Promise<UserProfile[]> {
    const params = buildQueryParams({
      offset,
      limit,
      searchText,
    });

    return authRequest<UserProfile[]>(
      `${config.apiBaseUrl}/api/v1/user/friends?${params}`,
      {
        cache: 'no-store',
      }
    );
  },

  // Unfriend a user
  async unfriend(userId: number): Promise<void> {
    await authRequest<void>(
      `${config.apiBaseUrl}/api/v1/user/friends/${userId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Get another user's friends list
  async getUserFriends(
    userId: number,
    offset: number = 0,
    limit: number = 20,
    searchText?: string
  ): Promise<UserProfile[]> {
    const params = buildQueryParams({
      offset,
      limit,
      searchText,
    });

    return authRequest<UserProfile[]>(
      `${config.apiBaseUrl}/api/v1/users/${userId}/friends?${params}`,
      {
        cache: 'no-store',
      }
    );
  },

  // Check friendship status with a user
  async getFriendshipStatus(userId: number): Promise<FriendshipStatusResponse> {
    return authRequest<FriendshipStatusResponse>(
      `${config.apiBaseUrl}/api/v1/users/${userId}/friendship-status`,
      {
        cache: 'no-store',
      }
    );
  },

  // Get mutual friends with a user
  async getMutualFriends(
    userId: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<UserProfile[]> {
    const params = buildQueryParams({
      offset,
      limit,
    });

    return authRequest<UserProfile[]>(
      `${config.apiBaseUrl}/api/v1/users/${userId}/mutual-friends?${params}`,
      {
        cache: 'no-store',
      }
    );
  },
};
