import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './client';
import { Highlight } from './highlights';
import { HighlightMatchup } from '@/types/matchup';
import { FeedItem } from '@/types/feed';
import { LifestyleDailyAggregateFeedItem } from './lifestyle';
import { FriendMatchupFeedItem } from './friendMatchups';

/**
 * Query parameters for fetching feed highlights
 */
export interface GetFeedHighlightsParams {
  offset?: number;
  limit?: number;
}

/**
 * Query parameters for fetching feed matchups
 */
export interface GetFeedMatchupsParams {
  offset?: number;
  limit?: number;
  sport?: string;
}

export const feedApi = {
  /**
   * Get personalized feed of highlights
   *
   * Returns highlights from public reels and friends-only reels from accepted friends.
   * Excludes user's own highlights and previously viewed highlights.
   */
  getFeedHighlights: async (
    params?: GetFeedHighlightsParams
  ): Promise<Highlight[]> => {
    const queryParams = buildQueryParams({
      offset: params?.offset,
      limit: params?.limit,
    });

    const url = `${config.apiBaseUrl}/api/v1/feed/highlights${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<Highlight[]>(url);
  },

  /**
   * Get matchups for feed with joined highlight data
   *
   * Returns matchups with full highlight objects (including videoUrl) for rendering.
   * Excludes matchups the user has already voted on.
   */
  getFeedMatchups: async (
    params?: GetFeedMatchupsParams
  ): Promise<HighlightMatchup[]> => {
    const queryParams = buildQueryParams({
      offset: params?.offset,
      limit: params?.limit,
      sport: params?.sport,
    });

    const url = `${config.apiBaseUrl}/api/v1/feed/matchups${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<HighlightMatchup[]>(url);
  },

  /**
   * Get unified feed with highlights, matchups, and lifestyle posts
   *
   * Returns a personalized feed with dynamic diversity scoring.
   * Backend uses intelligent scoring to mix content types naturally.
   * Server-side view tracking prevents duplicate content across pagination.
   * Uses cursor-based pagination to permanently exclude viewed content.
   */
  getMixedFeed: async (params?: {
    limit?: number;
    cursor?: string;
    sport?: string;
  }): Promise<{
    items: FeedItem[];
    nextCursor: string | null;
    hasMore: boolean;
  }> => {
    const queryParams = buildQueryParams({
      limit: params?.limit,
      cursor: params?.cursor,
      sport: params?.sport,
    });

    const url = `${config.apiBaseUrl}/api/v1/feed${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await authRequest<{
      items: Array<{
        type: 'highlight' | 'matchup' | 'lifestyle' | 'friend_matchup';
        highlight: Highlight | null;
        matchup: HighlightMatchup | null;
        lifestyle: LifestyleDailyAggregateFeedItem | null;
        friendMatchup: FriendMatchupFeedItem | null;
      }>;
      nextCursor: string | null;
      hasMore: boolean;
    }>(url);

    // Backend handles diversity scoring - just convert format
    const feedItems: FeedItem[] = response.items.map((item) => {
      if (item.type === 'highlight' && item.highlight) {
        return {
          type: 'highlight' as const,
          id: `highlight-${item.highlight.id}`,
          data: item.highlight,
        };
      } else if (item.type === 'matchup' && item.matchup) {
        // Transient matchups (not in DB) have id=0, use highlight IDs for uniqueness
        const matchupId = item.matchup.id === 0
          ? `${item.matchup.highlightAId}_${item.matchup.highlightBId}`
          : item.matchup.id.toString();

        return {
          type: 'matchup' as const,
          id: `matchup-${matchupId}`,
          data: item.matchup,
        };
      } else if (item.type === 'lifestyle' && item.lifestyle) {
        return {
          type: 'lifestyle' as const,
          id: `lifestyle-${item.lifestyle.id}`,
          data: item.lifestyle,
        };
      } else if (item.type === 'friend_matchup' && item.friendMatchup) {
        return {
          type: 'friend_matchup' as const,
          id: `friend_matchup-${item.friendMatchup.id}`,
          data: item.friendMatchup,
        };
      }
      throw new Error('Invalid feed item received from backend');
    });

    return {
      items: feedItems,
      nextCursor: response.nextCursor,
      hasMore: response.hasMore,
    };
  },

  /**
   * Reset all feed history for the current user (DEV TOOL)
   *
   * Clears viewed highlights, voted matchups, and viewed matchups.
   * Allows re-testing the feed without uploading new content.
   */
  resetFeedHistory: async (): Promise<void> => {
    return authRequest<void>(`${config.apiBaseUrl}/api/v1/feed/reset`, {
      method: 'DELETE',
    });
  },
};
