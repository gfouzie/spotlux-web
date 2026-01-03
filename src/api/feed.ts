import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './client';
import { Highlight } from './highlights';
import { HighlightMatchup } from '@/types/matchup';
import { FeedItem } from '@/types/feed';

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
   * Get mixed feed of highlights and matchups with cursor-based pagination
   *
   * Returns a personalized feed combining highlights and matchups in FeedItem format.
   * Backend coordinates to ensure no duplicates - each highlight appears once.
   * Interleaves matchups every 3 items (highlights at positions 0,1,3,4,6,7... matchups at 2,5,8...)
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
    // Parse unified cursor into separate cursors for backend
    let highlightCursor: number | undefined;
    let matchupCursor: string | undefined;

    if (params?.cursor) {
      const parts = params.cursor.split('|');
      if (parts.length === 2) {
        highlightCursor = parts[0] !== 'none' ? parseInt(parts[0]) : undefined;
        matchupCursor = parts[1] !== 'none' ? parts[1] : undefined;
      }
    }

    const queryParams = buildQueryParams({
      limit: params?.limit,
      highlight_cursor: highlightCursor,
      matchup_cursor: matchupCursor,
      sport: params?.sport,
    });

    const url = `${config.apiBaseUrl}/api/v1/feed${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await authRequest<{
      items: Array<{
        type: 'highlight' | 'matchup';
        highlight: Highlight | null;
        matchup: HighlightMatchup | null;
      }>;
      nextCursor: string | null;
      hasMore: boolean;
    }>(url);

    // Backend handles interleaving - just convert format
    const feedItems: FeedItem[] = response.items.map((item) => {
      if (item.type === 'highlight' && item.highlight) {
        return {
          type: 'highlight' as const,
          id: `highlight-${item.highlight.id}`,
          data: item.highlight,
        };
      } else if (item.type === 'matchup' && item.matchup) {
        return {
          type: 'matchup' as const,
          id: `matchup-${item.matchup.id}`,
          data: item.matchup,
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
   * Track that the user has viewed a highlight
   *
   * This is idempotent - calling it multiple times for the same highlight
   * will not create duplicate view records.
   */
  trackHighlightView: async (highlightId: number): Promise<void> => {
    return authRequest<void>(
      `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/view`,
      {
        method: 'POST',
      }
    );
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
