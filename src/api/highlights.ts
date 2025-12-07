import { config } from '@/lib/config';
import { authRequest } from './shared';

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
  promptName?: string;
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
}

/**
 * Highlight update request
 */
export interface HighlightUpdateRequest {
  videoUrl?: string;
  orderIndex?: number;
  promptId?: number;
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
    const queryParams = new URLSearchParams();

    if (params?.highlightReelId)
      queryParams.append(
        'highlight_reel_id',
        params.highlightReelId.toString()
      );
    if (params?.promptId)
      queryParams.append('prompt_id', params.promptId.toString());
    if (params?.offset !== undefined)
      queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append('limit', params.limit.toString());
    if (params?.searchText) queryParams.append('searchText', params.searchText);

    const url = `${config.apiBaseUrl}/api/v1/highlights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<Highlight[]>(url);
  },

  /**
   * Get all highlights for a specific reel (legacy method for backwards compatibility)
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
