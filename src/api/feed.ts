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
   * TODO: Backend needs to implement /api/v1/feed/matchups endpoint with joined data
   */
  getFeedMatchups: async (
    params?: GetFeedMatchupsParams
  ): Promise<HighlightMatchup[]> => {
    const queryParams = buildQueryParams({
      offset: params?.offset,
      limit: params?.limit,
      sport: params?.sport,
      include_highlights: true, // Request joined highlight data
    });

    // TODO: This endpoint needs to be implemented on the backend
    // For now, this will return empty array or error
    const url = `${config.apiBaseUrl}/api/v1/feed/matchups${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<HighlightMatchup[]>(url);
  },

  /**
   * Get mixed feed of highlights and matchups
   *
   * Returns a personalized feed combining highlights and matchups in FeedItem format.
   * TODO: For now, this only returns highlights until backend matchup endpoint is ready
   */
  getMixedFeed: async (params?: {
    offset?: number;
    limit?: number;
    sport?: string;
  }): Promise<FeedItem[]> => {
    // TODO: Once backend supports matchups endpoint, fetch and interleave both types
    // For now, just return highlights wrapped in FeedItem format
    const highlights = await feedApi.getFeedHighlights({
      offset: params?.offset,
      limit: params?.limit,
    });

    const feedItems: FeedItem[] = highlights.map((highlight) => ({
      type: 'highlight' as const,
      id: `highlight-${highlight.id}`,
      data: highlight,
    }));

    // TEMP: Add a mock matchup for testing (insert after 2nd item)
    // TODO: Remove this when backend /api/v1/feed/matchups is implemented
    if (params?.offset === 0 && highlights.length >= 2) {
      const mockMatchup: FeedItem = {
        type: 'matchup' as const,
        id: 'matchup-mock-1',
        data: {
          id: 999,
          promptId: 1,
          highlightAId: highlights[0].id,
          highlightBId: highlights[1].id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Use actual highlight data for the mock
          highlightA: {
            id: highlights[0].id,
            videoUrl: highlights[0].videoUrl,
            prompt: highlights[0].prompt,
            creator: highlights[0].creator,
          },
          highlightB: {
            id: highlights[1].id,
            videoUrl: highlights[1].videoUrl,
            prompt: highlights[1].prompt,
            creator: highlights[1].creator,
          },
        },
      };

      // Insert matchup after 2nd highlight
      feedItems.splice(2, 0, mockMatchup);
    }

    return feedItems;
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
};
