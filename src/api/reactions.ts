import { config } from '@/lib/config';
import { authRequest } from './client';

/**
 * Valid emoji IDs (same as backend)
 */
export const EMOJI_IDS = [
  'fire',
  'hundred',
  'shocked',
  'anguished',
  'laughing',
  'crying',
  'angry',
  'cold',
] as const;

/**
 * Emoji ID type
 */
export type EmojiId = (typeof EMOJI_IDS)[number];

/**
 * Map of emoji IDs to Unicode emojis for display
 */
export const EMOJI_MAP: Record<EmojiId, string> = {
  fire: '🔥',
  hundred: '💯',
  shocked: '😱',
  anguished: '😧',
  laughing: '😂',
  crying: '😭',
  angry: '😤',
  cold: '🥶',
};

/**
 * Reaction summary with count and user reaction status
 */
export interface ReactionSummary {
  emoji: EmojiId;
  count: number;
  userReacted: boolean;
}

/**
 * Complete reaction data for a highlight
 */
export interface HighlightReactions {
  highlightId: number;
  reactions: ReactionSummary[];
  userReaction: EmojiId | null;
  totalCount: number;
}

/**
 * Highlight reaction from API
 */
export interface HighlightReaction {
  id: number;
  highlightId: number;
  userId: number;
  emoji: EmojiId;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * API client for highlight reactions
 */
export const reactionsApi = {
  /**
   * Get aggregated reaction data for a highlight
   */
  async getReactions(highlightId: number): Promise<HighlightReactions> {
    const url = `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/reactions`;
    return authRequest<HighlightReactions>(url);
  },

  /**
   * Add or update a reaction on a highlight (UPSERT)
   * If user already has a reaction, it will be updated with the new emoji
   */
  async addReaction(
    highlightId: number,
    emojiId: EmojiId
  ): Promise<HighlightReaction> {
    const url = `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/reactions`;
    return authRequest<HighlightReaction>(url, {
      method: 'POST',
      body: JSON.stringify({ emoji: emojiId }),
    });
  },

  /**
   * Remove user's reaction from a highlight
   */
  async removeReaction(highlightId: number): Promise<void> {
    const url = `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/reactions`;
    await authRequest<void>(url, {
      method: 'DELETE',
    });
  },
};
