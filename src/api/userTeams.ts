import { config } from '@/lib/config';
import { authRequest } from './shared';
import type {
  UserTeam,
  UserTeamFull,
  UserTeamCreate,
  UserTeamUpdate,
} from '@/types/team';

/**
 * API functions for user team operations
 */
export const userTeamsApi = {
  /**
   * Get all teams for the current authenticated user with basic info (IDs only)
   */
  getUserTeams: async (): Promise<UserTeam[]> => {
    return authRequest<UserTeam[]>(`${config.apiBaseUrl}/api/v1/user/teams`);
  },

  /**
   * Get all teams for the current authenticated user with full team, league, and position objects.
   * Returns teams grouped by sport (sorted by created_at of first team, oldest first),
   * with teams within each sport sorted by year_joined (newest first).
   */
  getUserTeamsFull: async (): Promise<Record<string, UserTeamFull[]>> => {
    return authRequest<Record<string, UserTeamFull[]>>(
      `${config.apiBaseUrl}/api/v1/user/teams/full`
    );
  },

  /**
   * Get all teams for a specific user by user ID with basic info (IDs only)
   */
  getUserTeamsByUserId: async (userId: number): Promise<UserTeam[]> => {
    return authRequest<UserTeam[]>(
      `${config.apiBaseUrl}/api/v1/users/${userId}/teams`
    );
  },

  /**
   * Get all teams for a specific user by user ID with full team, league, and position objects.
   * Returns teams grouped by sport (sorted by created_at of first team, oldest first),
   * with teams within each sport sorted by year_joined (newest first).
   */
  getUserTeamsByUserIdFull: async (
    userId: number
  ): Promise<Record<string, UserTeamFull[]>> => {
    return authRequest<Record<string, UserTeamFull[]>>(
      `${config.apiBaseUrl}/api/v1/users/${userId}/teams/full`
    );
  },

  /**
   * Get a specific user team by ID
   */
  getUserTeam: async (userTeamId: number): Promise<UserTeam> => {
    return authRequest<UserTeam>(
      `${config.apiBaseUrl}/api/v1/user/teams/${userTeamId}`
    );
  },

  /**
   * Create a new user team for the current user
   */
  createUserTeam: async (teamData: UserTeamCreate): Promise<UserTeam> => {
    return authRequest<UserTeam>(`${config.apiBaseUrl}/api/v1/user/teams`, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  },

  /**
   * Update an existing user team
   */
  updateUserTeam: async (
    userTeamId: number,
    teamData: UserTeamUpdate
  ): Promise<UserTeam> => {
    return authRequest<UserTeam>(
      `${config.apiBaseUrl}/api/v1/user/teams/${userTeamId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(teamData),
      }
    );
  },

  /**
   * Delete a user team
   */
  deleteUserTeam: async (userTeamId: number): Promise<void> => {
    return authRequest<void>(
      `${config.apiBaseUrl}/api/v1/user/teams/${userTeamId}`,
      {
        method: 'DELETE',
      }
    );
  },
};
