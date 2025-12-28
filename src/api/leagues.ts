import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './client';
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
    const queryParams = buildQueryParams({
      sport: params?.sport,
      country: params?.country,
      offset: params?.offset,
      limit: params?.limit,
      searchText: params?.searchText,
    });

    const url = `${config.apiBaseUrl}/api/v1/leagues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<League[]>(url);
  },
};
