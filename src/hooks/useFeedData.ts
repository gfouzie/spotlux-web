import { useState, useEffect, useCallback } from 'react';
import { feedApi } from '@/api/feed';
import { matchupsApi } from '@/api/matchups';
import { FeedItem } from '@/types/feed';

const INITIAL_LOAD_COUNT = 10;
const LOAD_MORE_COUNT = 5;
const LOAD_MORE_THRESHOLD = 3;

interface UseFeedDataReturn {
  feedItems: FeedItem[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  loadInitialHighlights: () => Promise<void>;
  trackView: (highlightId: number) => Promise<void>;
  trackMatchupView: (matchupId: number) => Promise<void>;
}

/**
 * Custom hook for feed data management
 *
 * Features:
 * - Initial feed loading (highlights + matchups)
 * - Infinite scroll (automatic load more)
 * - View tracking
 * - Error handling
 *
 * Returns FeedItem[] which can contain both highlights and matchups.
 */
export function useFeedData(): UseFeedDataReturn {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial feed items
  const loadInitialHighlights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await feedApi.getMixedFeed({
        offset: 0,
        limit: INITIAL_LOAD_COUNT,
      });
      setFeedItems(data);
      setHasMore(data.length >= INITIAL_LOAD_COUNT);
    } catch (err) {
      console.error('Failed to load feed:', err);
      setError('Failed to load feed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more feed items when approaching end
  const loadMoreHighlights = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const data = await feedApi.getMixedFeed({
        offset: feedItems.length,
        limit: LOAD_MORE_COUNT,
      });

      if (data.length > 0) {
        setFeedItems((prev) => [...prev, ...data]);
        setHasMore(data.length >= LOAD_MORE_COUNT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more feed items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, feedItems.length]);

  // Track view for current highlight
  const trackView = useCallback(async (highlightId: number) => {
    try {
      await feedApi.trackHighlightView(highlightId);
      console.log(`Tracked view for highlight ${highlightId}`);
    } catch (err) {
      console.error('Failed to track highlight view:', err);
    }
  }, []);

  // Track view for current matchup
  const trackMatchupView = useCallback(async (matchupId: number) => {
    try {
      await matchupsApi.markMatchupAsViewed(matchupId);
      console.log(`Tracked view for matchup ${matchupId}`);
    } catch (err) {
      console.error('Failed to track matchup view:', err);
    }
  }, []);

  // Auto-load initial highlights on mount
  useEffect(() => {
    loadInitialHighlights();
  }, [loadInitialHighlights]);

  // Check if we need to load more (infinite scroll)
  useEffect(() => {
    if (hasMore && feedItems.length - currentIndex <= LOAD_MORE_THRESHOLD) {
      loadMoreHighlights();
    }
  }, [currentIndex, feedItems.length, hasMore, loadMoreHighlights]);


  return {
    feedItems,
    isLoading,
    hasMore,
    error,
    currentIndex,
    setCurrentIndex,
    loadInitialHighlights,
    trackView,
    trackMatchupView,
  };
}
