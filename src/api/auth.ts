import { config } from '@/lib/config';
import { apiRequest, authRequest } from './shared';

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

/**
 * API functions for authentication
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(`${config.apiBaseUrl}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<{ message: string }> => {
    return authRequest<{ message: string }>(
      `${config.apiBaseUrl}/api/v1/logout`,
      {
        method: 'POST',
      }
    );
  },

  /**
   * Refresh access token using refresh token
   */
  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(`${config.apiBaseUrl}/api/v1/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  },
};
