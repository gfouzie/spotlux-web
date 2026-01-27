import { config } from '@/lib/config';
import { authRequest } from './client';
import { ContentType, CONTENT_TYPE_PATHS } from './contentTypes';

// Re-export for convenience
export type { ContentType } from './contentTypes';

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
 * Complete reaction data for any content
 */
export interface ContentReactions {
  contentType: string;
  contentId: number;
  reactions: ReactionSummary[];
  userReaction: EmojiId | null;
  totalCount: number;
}

/**
 * Content reaction from API
 */
export interface ContentReaction {
  id: number;
  contentType: string;
  contentId: number;
  userId: number;
  emoji: EmojiId;
  createdAt: string;
  updatedAt: string | null;
}

// Backwards compatibility aliases
export type HighlightReactions = ContentReactions;
export type HighlightReaction = ContentReaction;

/**
 * API client for content reactions (highlights, lifestyle posts, etc.)
 */
export const reactionsApi = {
  /**
   * Get aggregated reaction data for any content
   */
  async getReactions(
    contentType: ContentType,
    contentId: number
  ): Promise<ContentReactions> {
    const path = CONTENT_TYPE_PATHS[contentType];
    const url = `${config.apiBaseUrl}/api/v1/${path}/${contentId}/reactions`;
    return authRequest<ContentReactions>(url);
  },

  /**
   * Add or update a reaction on any content (UPSERT)
   * If user already has a reaction, it will be updated with the new emoji
   */
  async addReaction(
    contentType: ContentType,
    contentId: number,
    emojiId: EmojiId
  ): Promise<ContentReaction> {
    const path = CONTENT_TYPE_PATHS[contentType];
    const url = `${config.apiBaseUrl}/api/v1/${path}/${contentId}/reactions`;
    return authRequest<ContentReaction>(url, {
      method: 'POST',
      body: JSON.stringify({ emoji: emojiId }),
    });
  },

  /**
   * Remove user's reaction from any content
   */
  async removeReaction(
    contentType: ContentType,
    contentId: number
  ): Promise<void> {
    const path = CONTENT_TYPE_PATHS[contentType];
    const url = `${config.apiBaseUrl}/api/v1/${path}/${contentId}/reactions`;
    await authRequest<void>(url, {
      method: 'DELETE',
    });
  },
};
