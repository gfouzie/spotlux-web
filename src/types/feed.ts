import { Highlight } from '@/api/highlights';
import { HighlightMatchup } from './matchup';
import { LifestyleDailyAggregateFeedItem } from '@/api/lifestyle';

/**
 * Feed item type discriminator
 */
export type FeedItemType = 'highlight' | 'matchup' | 'lifestyle';

/**
 * Base feed item interface
 */
export interface BaseFeedItem {
  type: FeedItemType;
  id: string; // Composite ID for uniqueness (e.g., "highlight-123", "matchup-456", or "lifestyle-789")
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
 * Lifestyle feed item
 */
export interface LifestyleFeedItem extends BaseFeedItem {
  type: 'lifestyle';
  data: LifestyleDailyAggregateFeedItem;
}

/**
 * Union type for all feed items
 */
export type FeedItem = HighlightFeedItem | MatchupFeedItem | LifestyleFeedItem;
