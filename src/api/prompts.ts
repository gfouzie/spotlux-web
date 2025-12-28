import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './client';

export interface Prompt {
  id: number;
  name: string;
  sport: string;
  description?: string;
  createdByUserId: number;
  createdAt: string;
  promptCategoryId?: number;
  promptCategoryName?: string;
  featuredStartDate?: string;
  featuredEndDate?: string;
}

export interface PromptCreate {
  name: string;
  sport: string;
  description?: string;
  promptCategoryId?: number;
  featuredStartDate?: string;
  featuredEndDate?: string;
}

export interface PromptUpdate {
  name?: string;
  sport?: string;
  description?: string;
  promptCategoryId?: number;
  featuredStartDate?: string;
  featuredEndDate?: string;
}

/**
 * Query parameters for fetching prompts
 */
export interface GetPromptsParams {
  sport?: string;
  offset?: number;
  limit?: number;
  searchText?: string;
}

export const promptsApi = {
  /**
   * Get prompts with pagination and filtering
   */
  async getPrompts(params?: GetPromptsParams): Promise<Prompt[]> {
    const queryParams = buildQueryParams({
      sport: params?.sport,
      offset: params?.offset,
      limit: params?.limit,
      searchText: params?.searchText,
    });

    const url = `${config.apiBaseUrl}/api/v1/prompts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<Prompt[]>(url, {
      cache: 'no-store',
    });
  },

  async createPrompt(prompt: PromptCreate): Promise<Prompt> {
    return authRequest<Prompt>(`${config.apiBaseUrl}/api/v1/prompts`, {
      method: 'POST',
      body: JSON.stringify(prompt),
    });
  },

  async updatePrompt(id: number, prompt: PromptUpdate): Promise<Prompt> {
    return authRequest<Prompt>(`${config.apiBaseUrl}/api/v1/prompts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(prompt),
    });
  },

  async deletePrompt(id: number): Promise<void> {
    await authRequest<void>(`${config.apiBaseUrl}/api/v1/prompts/${id}`, {
      method: 'DELETE',
    });
  },
};
