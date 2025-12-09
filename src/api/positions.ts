import { config } from '@/lib/config';
import { authRequest } from './shared';
import { Position } from '@/types/team';

/**
 * Position creation data interface
 */
export interface CreatePositionData {
  sport: string;
  name: string;
  abbreviation?: string | null;
}

/**
 * Position update data interface
 */
export interface UpdatePositionData {
  sport?: string;
  name?: string;
  abbreviation?: string | null;
}

/**
 * Query parameters for fetching positions
 */
export interface GetPositionsParams {
  sport?: string;
  offset?: number;
  limit?: number;
  searchText?: string;
}

/**
 * API functions for position operations
 */
export const positionsApi = {
  /**
   * Create a new position
   */
  createPosition: async (data: CreatePositionData): Promise<Position> => {
    return authRequest<Position>(`${config.apiBaseUrl}/api/v1/positions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get a position by ID
   */
  getPosition: async (positionId: number): Promise<Position> => {
    return authRequest<Position>(`${config.apiBaseUrl}/api/v1/positions/${positionId}`);
  },

  /**
   * Update a position
   */
  updatePosition: async (positionId: number, data: UpdatePositionData): Promise<Position> => {
    return authRequest<Position>(`${config.apiBaseUrl}/api/v1/positions/${positionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a position
   */
  deletePosition: async (positionId: number): Promise<void> => {
    return authRequest<void>(`${config.apiBaseUrl}/api/v1/positions/${positionId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get positions with pagination and filtering
   */
  getPositions: async (params?: GetPositionsParams): Promise<Position[]> => {
    const queryParams = new URLSearchParams();

    if (params?.sport) queryParams.append('sport', params.sport);
    if (params?.offset !== undefined)
      queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append('limit', params.limit.toString());
    if (params?.searchText) queryParams.append('searchText', params.searchText);

    const url = `${config.apiBaseUrl}/api/v1/positions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<Position[]>(url);
  },
};
