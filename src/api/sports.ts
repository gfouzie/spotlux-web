import { config } from '@/lib/config';
import { apiRequest } from './client';

/**
 * API functions for sports operations
 */
export const sportsApi = {
  /**
   * Get all available sports as a dictionary.
   * Returns: { SOCCER: "soccer", BASKETBALL: "basketball", ... }
   */
  getSports: async (): Promise<Record<string, string>> => {
    return apiRequest<Record<string, string>>(
      `${config.apiBaseUrl}/api/v1/sports`
    );
  },
};
