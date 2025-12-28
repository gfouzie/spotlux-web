import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './client';
import { Highlight } from './highlights';

/**
 * Query parameters for fetching feed highlights
 */
export interface GetFeedHighlightsParams {
  offset?: number;
  limit?: number;
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
