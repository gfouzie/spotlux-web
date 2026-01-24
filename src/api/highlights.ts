import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './client';

/**
 * Minimal prompt data (nested in Highlight)
 */
export interface PromptMinimal {
  id: number;
  name: string;
}

/**
 * Minimal creator data (nested in Highlight from feed)
 */
export interface HighlightCreator {
  username: string;
  profileImageUrl?: string;
}

/**
 * Highlight visibility options
 */
export type HighlightVisibility = 'public' | 'friends_only' | 'private';

/**
 * Highlight interface
 * Uses camelCase (automatically converted from snake_case by API middleware)
 */
export interface Highlight {
  id: number;
  highlightReelId: number;
  videoUrl: string;
  orderIndex: number;
  promptId?: number;
  visibility: HighlightVisibility;
  prompt?: PromptMinimal;
  creator?: HighlightCreator;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Highlight creation request
 */
export interface HighlightCreateRequest {
  highlightReelId: number;
  videoUrl: string;
  promptId?: number;
  visibility: HighlightVisibility; // Required - user must explicitly choose visibility
}

/**
 * Highlight update request
 */
export interface HighlightUpdateRequest {
  videoUrl?: string;
  orderIndex?: number;
  promptId?: number;
  visibility?: HighlightVisibility;
}

/**
 * Highlight reorder item
 */
export interface HighlightReorderItem {
  highlightId: number;
  orderIndex: number;
}

/**
 * Bulk reorder request
 */
export interface HighlightBulkReorderRequest {
  highlightReelId: number;
  reorders: HighlightReorderItem[];
}

/**
 * Query parameters for fetching highlights
 */
export interface GetHighlightsParams {
  highlightReelId?: number;
  promptId?: number;
  offset?: number;
  limit?: number;
  searchText?: string;
}

export const highlightsApi = {
  /**
   * Get highlights with pagination and filtering
   */
  getHighlights: async (params?: GetHighlightsParams): Promise<Highlight[]> => {
    const queryParams = buildQueryParams({
      highlight_reel_id: params?.highlightReelId,
      prompt_id: params?.promptId,
      offset: params?.offset,
      limit: params?.limit,
      searchText: params?.searchText,
    });

    const url = `${config.apiBaseUrl}/api/v1/highlights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<Highlight[]>(url);
  },

  /**
   * Get all highlights for a specific reel
   */
  getHighlightsByReel: async (
    reelId: number,
    offset: number = 0,
    limit: number = 100
  ): Promise<Highlight[]> => {
    return highlightsApi.getHighlights({
      highlightReelId: reelId,
      offset,
      limit,
    });
  },

  /**
   * Get a specific highlight by ID
   */
  getHighlight: async (id: number): Promise<Highlight> => {
    return authRequest<Highlight>(
      `${config.apiBaseUrl}/api/v1/highlights/${id}`
    );
  },

  /**
   * Create a new highlight
   */
  createHighlight: async (data: HighlightCreateRequest): Promise<Highlight> => {
    return authRequest<Highlight>(`${config.apiBaseUrl}/api/v1/highlights`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing highlight
   */
  updateHighlight: async (
    id: number,
    data: HighlightUpdateRequest
  ): Promise<Highlight> => {
    return authRequest<Highlight>(
      `${config.apiBaseUrl}/api/v1/highlights/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a highlight
   */
  deleteHighlight: async (id: number): Promise<void> => {
    return authRequest<void>(`${config.apiBaseUrl}/api/v1/highlights/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Bulk reorder highlights in a reel
   */
  bulkReorderHighlights: async (
    data: HighlightBulkReorderRequest
  ): Promise<void> => {
    return authRequest<void>(`${config.apiBaseUrl}/api/v1/highlights/reorder`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
