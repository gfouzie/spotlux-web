import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { apiRequest, authRequest } from './client';
import { type LoginResponse } from './auth';

/**
 * User registration data interface
 * Uses camelCase (automatically converted to snake_case by API middleware)
 */
export interface RegisterUserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  birthday: string; // ISO date string (YYYY-MM-DD)
}

/**
 * User visibility options
 */
export type UserVisibility = 'public' | 'private';

/**
 * User response interface
 * Uses camelCase (automatically converted from snake_case by API middleware)
 */
export interface User {
  id: number;
  accountId: number;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string;
  profileImageUrl: string | null;
  visibility: UserVisibility;
  birthday: string | null;
  height: number | null;
  weight: number | null;
  hometownCity?: string | null;
  hometownState?: string | null;
  hometownCountry?: string | null;
  tierId: number | null;
  isSuperuser: boolean;
}

/**
 * Limited user info for private profiles when viewer is not a friend
 */
export interface UserReadLimited {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  visibility: 'private';
}

/**
 * Query parameters for fetching users
 */
export interface GetUsersParams {
  offset?: number;
  limit?: number;
  search?: string;
}

/**
 * API functions for user operations
 */
export const userApi = {
  /**
   * Register a new user and return auth tokens (public endpoint)
   */
  register: async (userData: RegisterUserData): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(`${config.apiBaseUrl}/api/v1/user`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Register and auto-login user (public endpoint)
   * Now just an alias for register since signup returns tokens directly
   */
  registerAndLogin: async (
    userData: RegisterUserData
  ): Promise<LoginResponse> => {
    return userApi.register(userData);
  },

  /**
   * Get available user roles (public endpoint)
   */
  getRoles: async (): Promise<{
    roles: Record<number, string>;
    defaultRole: number;
  }> => {
    return apiRequest(`${config.apiBaseUrl}/api/v1/roles`);
  },

  /**
   * Get user by username (authenticated endpoint - returns full or limited profile based on visibility)
   */
  getUserByUsername: async (username: string): Promise<User | UserReadLimited> => {
    return authRequest<User | UserReadLimited>(
      `${config.apiBaseUrl}/api/v1/user/${username}`
    );
  },

  /**
   * Get list of users with pagination and optional search (authenticated)
   */
  getUsers: async (params?: GetUsersParams): Promise<User[]> => {
    const queryParams = buildQueryParams({
      offset: params?.offset,
      limit: params?.limit,
      search: params?.search,
    });

    const url = `${config.apiBaseUrl}/api/v1/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<User[]>(url);
  },
};
