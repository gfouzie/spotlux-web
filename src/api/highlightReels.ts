import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './shared';

/**
 * Highlight reel interface
 * Uses camelCase (automatically converted from snake_case by API middleware)
 */
export interface HighlightReel {
  id: number;
  userId: number;
  name: string;
  sport: string;
  orderRanking: number;
  visibility: 'private' | 'public' | 'friends_only';
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Highlight reel creation request
 */
export interface HighlightReelCreateRequest {
  name: string;
  sport: string;
  visibility?: 'private' | 'public' | 'friends_only';
  thumbnailUrl?: string;
}

/**
 * Highlight reel update request
 */
export interface HighlightReelUpdateRequest {
  name?: string;
  sport?: string;
  orderRanking?: number;
  visibility?: 'private' | 'public' | 'friends_only';
  thumbnailUrl?: string | null;
}

/**
 * Query parameters for fetching highlight reels
 */
export interface GetHighlightReelsParams {
  offset?: number;
  limit?: number;
  userId?: number;
  sport?: string;
  visibility?: 'private' | 'public' | 'friends_only';
  searchText?: string;
}

export const highlightReelsApi = {
  /**
   * Get highlight reels with pagination and filtering
   */
  getHighlightReels: async (
    params?: GetHighlightReelsParams
  ): Promise<HighlightReel[]> => {
    const queryParams = buildQueryParams({
      offset: params?.offset,
      limit: params?.limit,
      user_id: params?.userId,
      sport: params?.sport,
      visibility: params?.visibility,
      searchText: params?.searchText,
    });

    const url = `${config.apiBaseUrl}/api/v1/highlight_reels${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<HighlightReel[]>(url);
  },

  /**
   * Get a specific highlight reel by ID
   */
  getHighlightReel: async (id: number): Promise<HighlightReel> => {
    return authRequest<HighlightReel>(
      `${config.apiBaseUrl}/api/v1/highlight_reels/${id}`
    );
  },

  /**
   * Create a new highlight reel
   */
  createHighlightReel: async (
    data: HighlightReelCreateRequest
  ): Promise<HighlightReel> => {
    return authRequest<HighlightReel>(
      `${config.apiBaseUrl}/api/v1/highlight_reels`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing highlight reel
   */
  updateHighlightReel: async (
    id: number,
    data: HighlightReelUpdateRequest
  ): Promise<HighlightReel> => {
    return authRequest<HighlightReel>(
      `${config.apiBaseUrl}/api/v1/highlight_reels/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a highlight reel
   */
  deleteHighlightReel: async (id: number): Promise<void> => {
    return authRequest<void>(
      `${config.apiBaseUrl}/api/v1/highlight_reels/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};
