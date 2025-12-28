import { config } from '@/lib/config';
import { buildQueryParams } from '@/lib/utils';
import { authRequest } from './shared';

/**
 * Prompt category interface
 * Uses camelCase (automatically converted from snake_case by API middleware)
 */
export interface PromptCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Prompt category creation request
 */
export interface PromptCategoryCreateRequest {
  name: string;
}

/**
 * Prompt category update request
 */
export interface PromptCategoryUpdateRequest {
  name?: string;
}

/**
 * Query parameters for fetching prompt categories
 */
export interface GetPromptCategoriesParams {
  offset?: number;
  limit?: number;
  searchText?: string;
}

export const promptCategoriesApi = {
  /**
   * Get prompt categories with pagination and filtering
   */
  getPromptCategories: async (
    params?: GetPromptCategoriesParams
  ): Promise<PromptCategory[]> => {
    const queryParams = buildQueryParams({
      offset: params?.offset,
      limit: params?.limit,
      searchText: params?.searchText,
    });

    const url = `${config.apiBaseUrl}/api/v1/prompt_categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<PromptCategory[]>(url);
  },

  /**
   * Create a new prompt category (superuser only)
   */
  createPromptCategory: async (
    data: PromptCategoryCreateRequest
  ): Promise<PromptCategory> => {
    return authRequest<PromptCategory>(
      `${config.apiBaseUrl}/api/v1/prompt_categories`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing prompt category (superuser only)
   */
  updatePromptCategory: async (
    id: number,
    data: PromptCategoryUpdateRequest
  ): Promise<PromptCategory> => {
    return authRequest<PromptCategory>(
      `${config.apiBaseUrl}/api/v1/prompt_categories/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a prompt category (superuser only)
   */
  deletePromptCategory: async (id: number): Promise<void> => {
    return authRequest<void>(
      `${config.apiBaseUrl}/api/v1/prompt_categories/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};
