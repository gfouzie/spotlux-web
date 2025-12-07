import { config } from '@/lib/config';
import { apiRequest } from './shared';

/**
 * Availability response interface
 */
export interface AvailabilityResponse {
  available: boolean;
}

/**
 * Validation API service
 */
export const validationApi = {
  /**
   * Check if a username is available for registration
   */
  checkUsernameAvailability: async (
    username: string
  ): Promise<AvailabilityResponse> => {
    const params = new URLSearchParams({ username });
    return apiRequest<AvailabilityResponse>(
      `${config.apiBaseUrl}/api/v1/check-username?${params.toString()}`
    );
  },
};
