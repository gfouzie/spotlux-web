import { config } from '@/lib/config';
import { authRequest } from './shared';
import { League } from '@/types/team';

/**
 * League creation data interface
 */
export interface CreateLeagueData {
  name: string;
  sport: string;
  city?: string | null;
  country?: string | null;
  abbreviation?: string | null;
  state?: string | null;
}

/**
 * League update data interface
 */
export interface UpdateLeagueData {
  name?: string;
  sport?: string;
  city?: string | null;
  country?: string | null;
  abbreviation?: string | null;
  state?: string | null;
}

/**
 * Query parameters for fetching leagues
 */
export interface GetLeaguesParams {
  sport?: string;
  country?: string;
  offset?: number;
  limit?: number;
  searchText?: string;
}

/**
 * API functions for league operations
 */
export const leaguesApi = {
  /**
   * Create a new league
   */
  createLeague: async (data: CreateLeagueData): Promise<League> => {
    return authRequest<League>(`${config.apiBaseUrl}/api/v1/leagues`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get a league by ID
   */
  getLeague: async (leagueId: number): Promise<League> => {
    return authRequest<League>(`${config.apiBaseUrl}/api/v1/leagues/${leagueId}`);
  },

  /**
   * Update a league
   */
  updateLeague: async (leagueId: number, data: UpdateLeagueData): Promise<League> => {
    return authRequest<League>(`${config.apiBaseUrl}/api/v1/leagues/${leagueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a league
   */
  deleteLeague: async (leagueId: number): Promise<void> => {
    return authRequest<void>(`${config.apiBaseUrl}/api/v1/leagues/${leagueId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get leagues with pagination and filtering
   */
  getLeagues: async (params?: GetLeaguesParams): Promise<League[]> => {
    const queryParams = new URLSearchParams();

    if (params?.sport) queryParams.append('sport', params.sport);
    if (params?.country) queryParams.append('country', params.country);
    if (params?.offset !== undefined)
      queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append('limit', params.limit.toString());
    if (params?.searchText) queryParams.append('searchText', params.searchText);

    const url = `${config.apiBaseUrl}/api/v1/leagues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<League[]>(url);
  },
};
