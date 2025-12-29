import { Highlight } from '@/api/highlights';
import { HighlightMatchup } from './matchup';

/**
 * Feed item type discriminator
 */
export type FeedItemType = 'highlight' | 'matchup';

/**
 * Base feed item interface
 */
export interface BaseFeedItem {
  type: FeedItemType;
  id: string; // Composite ID for uniqueness (e.g., "highlight-123" or "matchup-456")
}

/**
 * Highlight feed item
 */
export interface HighlightFeedItem extends BaseFeedItem {
  type: 'highlight';
  data: Highlight;
}

/**
 * Matchup feed item
 */
export interface MatchupFeedItem extends BaseFeedItem {
  type: 'matchup';
  data: HighlightMatchup;
}

/**
 * Union type for all feed items
 */
export type FeedItem = HighlightFeedItem | MatchupFeedItem;
