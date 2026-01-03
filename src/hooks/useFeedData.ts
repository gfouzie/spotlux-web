import { useState, useEffect, useCallback, useRef } from 'react';
import { feedApi } from '@/api/feed';
import { FeedItem } from '@/types/feed';

// Optimized for cost efficiency - load videos just-in-time
const INITIAL_LOAD_COUNT = 3; // Just enough to start swiping (2 highlights + 1 matchup)
const LOAD_MORE_COUNT = 1; // Prefetch one video at a time
const LOAD_MORE_THRESHOLD = 1; // Load when reaching the last video (aggressive prefetch)

interface UseFeedDataReturn {
  feedItems: FeedItem[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  loadInitialHighlights: () => Promise<void>;
  trackView: (highlightId: number) => Promise<void>;
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

  // Cursor state for pagination
  // Format: "highlight_id|matchup_pair" (e.g., "39|31:33")
  // This is a composite opaque token that encodes pagination state for BOTH highlights and matchups
  // - highlight_id: Last highlight ID seen (int)
  // - matchup_pair: Last matchup seen as "id_a:id_b" (sorted)
  // The cursor is parsed in feed.ts and sent to backend as separate highlight_cursor and matchup_cursor
  const [cursor, setCursor] = useState<string | null>(null);

  // Ref to prevent duplicate initial loads in React StrictMode
  const hasInitialized = useRef(false);

  // Load initial feed items
  const loadInitialHighlights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedApi.getMixedFeed({
        limit: INITIAL_LOAD_COUNT,
      });
      setFeedItems(response.items);
      setHasMore(response.hasMore);
      setCursor(response.nextCursor);
    } catch (err) {
      console.error('Failed to load feed:', err);
      setError('Failed to load feed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more feed items when approaching end
  const loadMoreHighlights = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await feedApi.getMixedFeed({
        limit: LOAD_MORE_COUNT,
        cursor: cursor || undefined,
      });

      if (response.items.length > 0) {
        setFeedItems((prev) => [...prev, ...response.items]);
        setHasMore(response.hasMore);
        setCursor(response.nextCursor);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more feed items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, cursor]);

  // Track view for current highlight
  const trackView = useCallback(async (highlightId: number) => {
    try {
      await feedApi.trackHighlightView(highlightId);
    } catch (err) {
      console.error('Failed to track highlight view:', err);
    }
  }, []);

  // Auto-load initial highlights on mount (only once)
  useEffect(() => {
    // Prevent duplicate loads in React StrictMode
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    loadInitialHighlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Check if we need to load more (infinite scroll)
  useEffect(() => {
    // Don't trigger load more on initial mount (when feedItems is empty)
    if (feedItems.length === 0) return;

    const remainingItems = feedItems.length - currentIndex;

    if (hasMore && !isLoading && remainingItems <= LOAD_MORE_THRESHOLD) {
      loadMoreHighlights();
    }
  }, [currentIndex, feedItems.length, hasMore, isLoading, loadMoreHighlights]);

  return {
    feedItems,
    isLoading,
    hasMore,
    error,
    currentIndex,
    setCurrentIndex,
    loadInitialHighlights,
    trackView,
  };
}
