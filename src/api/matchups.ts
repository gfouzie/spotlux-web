import { config } from '@/lib/config';
import { authRequest } from './shared';
import {
  HighlightMatchup,
  HighlightMatchupView,
  HighlightMatchupVote,
  HighlightMatchupResults,
  FeaturedPrompt,
} from '@/types/matchup';

/**
 * Query parameters for fetching matchups
 */
export interface GetMatchupsParams {
  promptId?: number;
  offset?: number;
  limit?: number;
}

/**
 * Vote creation data interface
 */
export interface CreateVoteData {
  votedForHighlightId: number;
  voteComment?: string | null;
}

/**
 * Matchup creation data interface (superuser only)
 */
export interface CreateMatchupData {
  promptId: number;
  highlightAId: number;
  highlightBId: number;
}

/**
 * API functions for highlight matchup operations
 */
export const matchupsApi = {
  /**
   * Get matchups with pagination and filtering
   */
  getMatchups: async (params?: GetMatchupsParams): Promise<HighlightMatchup[]> => {
    const queryParams = new URLSearchParams();

    if (params?.promptId !== undefined)
      queryParams.append('prompt_id', params.promptId.toString());
    if (params?.offset !== undefined)
      queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append('limit', params.limit.toString());

    const url = `${config.apiBaseUrl}/api/v1/highlight-matchups${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authRequest<HighlightMatchup[]>(url);
  },

  /**
   * Get the current featured prompt for a specific sport
   */
  getCurrentFeaturedPrompt: async (sport: string): Promise<FeaturedPrompt | null> => {
    const queryParams = new URLSearchParams({ sport });
    const url = `${config.apiBaseUrl}/api/v1/featured-prompts/current?${queryParams.toString()}`;
    return authRequest<FeaturedPrompt | null>(url);
  },

  /**
   * Mark a matchup as viewed (idempotent)
   */
  markMatchupAsViewed: async (matchupId: number): Promise<HighlightMatchupView> => {
    return authRequest<HighlightMatchupView>(
      `${config.apiBaseUrl}/api/v1/highlight-matchups/${matchupId}/view`,
      {
        method: 'POST',
      }
    );
  },

  /**
   * Vote on a matchup
   */
  voteOnMatchup: async (
    matchupId: number,
    data: CreateVoteData
  ): Promise<HighlightMatchupVote> => {
    return authRequest<HighlightMatchupVote>(
      `${config.apiBaseUrl}/api/v1/highlight-matchups/${matchupId}/vote`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Get voting results for a matchup
   */
  getMatchupResults: async (matchupId: number): Promise<HighlightMatchupResults> => {
    return authRequest<HighlightMatchupResults>(
      `${config.apiBaseUrl}/api/v1/highlight-matchups/${matchupId}/results`
    );
  },

  /**
   * Create a new matchup (superuser only)
   */
  createMatchup: async (data: CreateMatchupData): Promise<HighlightMatchup> => {
    return authRequest<HighlightMatchup>(`${config.apiBaseUrl}/api/v1/highlight-matchups`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a matchup (superuser only)
   */
  deleteMatchup: async (matchupId: number): Promise<void> => {
    return authRequest<void>(`${config.apiBaseUrl}/api/v1/highlight-matchups/${matchupId}`, {
      method: 'DELETE',
    });
  },
};
