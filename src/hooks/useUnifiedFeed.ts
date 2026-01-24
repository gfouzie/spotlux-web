import { useState, useEffect, useCallback, useRef } from 'react';
import { feedApi } from '@/api/feed';
import { FeedItem } from '@/types/feed';

// Optimized for cost efficiency - load items just-in-time
const INITIAL_LOAD_COUNT = 5; // Start with 5 mixed items
const LOAD_MORE_COUNT = 3; // Load 3 items at a time
const LOAD_MORE_THRESHOLD = 2; // Load when 2 items remaining

interface UseUnifiedFeedReturn {
  items: FeedItem[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for unified feed data management
 *
 * Features:
 * - Unified feed with highlights, matchups, and lifestyle posts
 * - Dynamic diversity scoring (no fixed pattern)
 * - Server-side view tracking (automatic)
 * - Cursor-based pagination
 * - Infinite scroll support
 *
 * Returns FeedItem[] which can contain highlights, matchups, or lifestyle posts.
 */
export function useUnifiedFeed(): UseUnifiedFeedReturn {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);

  // Ref to prevent duplicate initial loads in React StrictMode
  const hasInitialized = useRef(false);

  // Load initial feed items
  const loadInitialFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[useUnifiedFeed] Loading initial feed...');
      const response = await feedApi.getMixedFeed({
        limit: INITIAL_LOAD_COUNT,
      });
      console.log('[useUnifiedFeed] Received response:', response);
      console.log('[useUnifiedFeed] Items count:', response.items.length);
      setItems(response.items);
      setHasMore(response.hasMore);
      setCursor(response.nextCursor);
    } catch (err) {
      console.error('Failed to load feed:', err);
      setError('Failed to load feed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more feed items for infinite scroll
  const loadMore = useCallback(async () => {
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
        setItems((prev) => [...prev, ...response.items]);
        setHasMore(response.hasMore);
        setCursor(response.nextCursor);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more feed items:', err);
      setError('Failed to load more items');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, cursor]);

  // Refresh feed from the beginning
  const refresh = useCallback(async () => {
    setCursor(null);
    setHasMore(true);
    await loadInitialFeed();
  }, [loadInitialFeed]);

  // Auto-load initial feed on mount (only once)
  useEffect(() => {
    // Prevent duplicate loads in React StrictMode
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    loadInitialFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}
