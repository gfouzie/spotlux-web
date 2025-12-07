import { config } from '@/lib/config';
import { authRequest } from './shared';
import { Team } from '@/types/team';

/**
 * Team creation data interface
 * Uses camelCase (automatically converted to snake_case by API middleware)
 */
export interface CreateTeamData {
  name: string;
  sport: string;
  leagueId?: number | null;
  level?: string | null;
}

/**
 * Team update data interface
 * Uses camelCase (automatically converted to snake_case by API middleware)
 */
export interface UpdateTeamData {
  name?: string;
  sport?: string;
  leagueId?: number | null;
  level?: string | null;
  profileImageUrl?: string | null;
}

/**
 * Query parameters for fetching teams
 */
export interface GetTeamsParams {
  sport?: string;
  country?: string;
  offset?: number;
  limit?: number;
  leagueId?: number;
  searchText?: string;
}

/**
 * Response from paginated teams endpoint
 * Note: Backend currently returns just an array, but this documents the expected structure
 */
export interface GetTeamsResponse {
  /** Array of teams matching the query */
  teams: Team[];
  /** Total number of teams returned in this response */
  count: number;
  /** Offset used for this query */
  offset: number;
  /** Limit used for this query */
  limit: number;
  /** Whether more teams are available */
  hasMore: boolean;
}

/**
 * API functions for team operations
 */
export const teamsApi = {
  /**
   * Create a new team
   */
  createTeam: async (data: CreateTeamData): Promise<Team> => {
    return authRequest<Team>(`${config.apiBaseUrl}/api/v1/teams`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get a team by ID
   */
  getTeam: async (teamId: number): Promise<Team> => {
    return authRequest<Team>(`${config.apiBaseUrl}/api/v1/teams/${teamId}`);
  },

  /**
   * Update a team
   */
  updateTeam: async (teamId: number, data: UpdateTeamData): Promise<Team> => {
    return authRequest<Team>(`${config.apiBaseUrl}/api/v1/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a team
   */
  deleteTeam: async (teamId: number): Promise<void> => {
    return authRequest<void>(`${config.apiBaseUrl}/api/v1/teams/${teamId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get teams with pagination and filtering
   */
  getTeams: async (params?: GetTeamsParams): Promise<Team[]> => {
    const queryParams = new URLSearchParams();

    if (params?.sport) queryParams.append('sport', params.sport);
    if (params?.country) queryParams.append('country', params.country);
    if (params?.offset !== undefined)
      queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append('limit', params.limit.toString());
    if (params?.leagueId)
      queryParams.append('league_id', params.leagueId.toString());
    if (params?.searchText) queryParams.append('searchText', params.searchText);

    const url = `${config.apiBaseUrl}/api/v1/teams${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<Team[]>(url);
  },
};
