import { config } from '@/lib/config';
import { apiRequest } from './client';

/**
 * API functions for countries operations
 */
export const countriesApi = {
  /**
   * Get all available countries as a dictionary.
   * Returns: { CANADA: "Canada", UNITED_STATES: "United States", ... }
   */
  getCountries: async (): Promise<Record<string, string>> => {
    return apiRequest<Record<string, string>>(
      `${config.apiBaseUrl}/api/v1/countries`
    );
  },
};
