import { config } from '@/lib/config';
import { authRequest } from './client';

/**
 * User profile interface
 * Uses camelCase (automatically converted from snake_case by API middleware)
 */
export interface UserProfile {
  id: number;
  accountId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  height: number | null;
  weight: number | null;
  hometownCity: string | null;
  hometownState: string | null;
  hometownCountry: string | null;
  profileImageUrl: string;
  tierId: number | null;
  isSuperuser: boolean;
}

/**
 * Profile update request interface
 * Uses camelCase (automatically converted to snake_case by API middleware)
 */
export interface ProfileUpdateRequest {
  firstName?: string | null;
  lastName?: string | null;
  birthday?: string | null;
  height?: number | null;
  weight?: number | null;
  hometownCity?: string | null;
  hometownState?: string | null;
  hometownCountry?: string | null;
  profileImageUrl?: string | null;
}

export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    return authRequest<UserProfile>(`${config.apiBaseUrl}/api/v1/user/me/`);
  },

  async updateProfile(
    updateData: ProfileUpdateRequest
  ): Promise<{ message: string }> {
    return authRequest<{ message: string }>(
      `${config.apiBaseUrl}/api/v1/user/me`,
      {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }
    );
  },
};
