import { config } from '@/lib/config';
import { authRequest, apiRequest } from './client';

/**
 * User sport interface
 * Uses camelCase (automatically converted from snake_case by API middleware)
 * Sports are automatically ordered by created_at (oldest first)
 */
export interface UserSport {
  userId: number;
  sport: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * User sport creation request
 */
export interface UserSportCreateRequest {
  sport: string;
}

export const userSportsApi = {
  /**
   * Get user sports for the authenticated user
   */
  getUserSports: async (): Promise<UserSport[]> => {
    return authRequest<UserSport[]>(`${config.apiBaseUrl}/api/v1/user/sports`);
  },

  /**
   * Get user sports for a specific user by username (public endpoint)
   */
  getUserSportsByUsername: async (username: string): Promise<UserSport[]> => {
    return apiRequest<UserSport[]>(
      `${config.apiBaseUrl}/api/v1/users/${username}/sports`
    );
  },

  /**
   * Add a sport to the authenticated user's profile
   */
  addUserSport: async (data: UserSportCreateRequest): Promise<UserSport> => {
    return authRequest<UserSport>(`${config.apiBaseUrl}/api/v1/user/sports`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove a sport from the authenticated user's profile
   */
  deleteUserSport: async (sport: string): Promise<void> => {
    return authRequest<void>(
      `${config.apiBaseUrl}/api/v1/user/sports/${sport}`,
      {
        method: 'DELETE',
      }
    );
  },
};
