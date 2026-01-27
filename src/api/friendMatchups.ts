import { config } from '@/lib/config';
import { authRequest } from './client';

/**
 * User summary for friend matchup display
 */
export interface UserSummary {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

/**
 * Friend matchup status values
 */
export type FriendMatchupStatus =
  | 'pending_response'
  | 'active'
  | 'completed'
  | 'expired'
  | 'cancelled'
  | 'declined';

/**
 * Friend matchup visibility options
 */
export type FriendMatchupVisibility = 'friends' | 'public';

/**
 * Friend matchup data
 */
export interface FriendMatchup {
  id: number;
  conversationId: number;
  initiatorId: number;
  responderId: number;
  customPrompt: string | null;
  initiatorVideoUrl: string;
  responderVideoUrl: string | null;
  visibility: FriendMatchupVisibility;
  votingDurationHours: number;
  status: FriendMatchupStatus;
  responseDeadline: string;
  respondedAt: string | null;
  votingEndsAt: string | null;
  completedAt: string | null;
  winnerId: number | null;
  initiatorVotes: number;
  responderVotes: number;
  createdAt: string;
  updatedAt: string | null;
  initiator: UserSummary;
  responder: UserSummary;
  winner: UserSummary | null;
  currentUserVotedFor: number | null;
}

/**
 * Friend matchup feed item (for unified feed)
 */
export interface FriendMatchupFeedItem {
  id: number;
  customPrompt: string | null;
  initiatorVideoUrl: string;
  responderVideoUrl: string | null;
  visibility: FriendMatchupVisibility;
  votingDurationHours: number;
  status: FriendMatchupStatus;
  votingEndsAt: string | null;
  initiatorVotes: number;
  responderVotes: number;
  createdAt: string;
  initiator: UserSummary;
  responder: UserSummary;
  currentUserVotedFor: number | null;
}

/**
 * Create friend matchup request
 */
export interface CreateFriendMatchupRequest {
  conversationId: number;
  responderId: number;
  videoUrl: string;
  customPrompt?: string | null;
  visibility: FriendMatchupVisibility;
  votingDurationHours: 0 | 24 | 72 | 168;  // 0 = 1 minute (test mode)
}

/**
 * Respond to friend matchup request
 */
export interface RespondToMatchupRequest {
  videoUrl: string;
}

/**
 * Vote on friend matchup request
 */
export interface VoteOnMatchupRequest {
  votedForUserId: number;
}

/**
 * Friend matchup vote record
 */
export interface FriendMatchupVote {
  id: number;
  matchupId: number;
  userId: number;
  votedForUserId: number;
  votedAt: string;
}

export const friendMatchupsApi = {
  /**
   * Create a new friend matchup challenge
   */
  create: async (data: CreateFriendMatchupRequest): Promise<FriendMatchup> => {
    const url = `${config.apiBaseUrl}/api/v1/friend-matchups`;
    return authRequest<FriendMatchup>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  /**
   * Get a friend matchup by ID
   */
  get: async (id: number): Promise<FriendMatchup> => {
    const url = `${config.apiBaseUrl}/api/v1/friend-matchups/${id}`;
    return authRequest<FriendMatchup>(url);
  },

  /**
   * Respond to a friend matchup challenge
   */
  respond: async (
    id: number,
    data: RespondToMatchupRequest
  ): Promise<FriendMatchup> => {
    const url = `${config.apiBaseUrl}/api/v1/friend-matchups/${id}/respond`;
    return authRequest<FriendMatchup>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  /**
   * Vote on a friend matchup
   */
  vote: async (
    id: number,
    data: VoteOnMatchupRequest
  ): Promise<FriendMatchupVote> => {
    const url = `${config.apiBaseUrl}/api/v1/friend-matchups/${id}/vote`;
    return authRequest<FriendMatchupVote>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  /**
   * Cancel a friend matchup (before response only)
   */
  cancel: async (id: number): Promise<void> => {
    const url = `${config.apiBaseUrl}/api/v1/friend-matchups/${id}`;
    return authRequest<void>(url, {
      method: 'DELETE',
    });
  },

  /**
   * Decline a friend matchup challenge (responder only)
   */
  decline: async (id: number): Promise<void> => {
    const url = `${config.apiBaseUrl}/api/v1/friend-matchups/${id}/decline`;
    return authRequest<void>(url, {
      method: 'POST',
    });
  },
};
